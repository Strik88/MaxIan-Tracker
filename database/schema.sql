-- Task Tracker Database Schema
-- This file contains the SQL commands to set up the database structure in Supabase

-- Enable Row Level Security (RLS) for all tables
-- This ensures users can only access their own data

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(1) CHECK (type IN ('H', 'M', 'S')) NOT NULL, -- H=Hard Line, M=Main Line, S=Soft Line
  week_start_date DATE NOT NULL, -- Monday of the week this task is for
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task completions table
CREATE TABLE public.task_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  completion_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, completion_date) -- Prevent duplicate entries for same task/date
);

-- Indexes for better performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_week_start_date ON public.tasks(week_start_date);
CREATE INDEX idx_tasks_type ON public.tasks(type);
CREATE INDEX idx_task_completions_task_id ON public.task_completions(task_id);
CREATE INDEX idx_task_completions_date ON public.task_completions(completion_date);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Task completions policies
CREATE POLICY "Users can view own task completions" ON public.task_completions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_completions.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own task completions" ON public.task_completions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_completions.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own task completions" ON public.task_completions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_completions.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own task completions" ON public.task_completions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_completions.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_completions_updated_at BEFORE UPDATE ON public.task_completions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 