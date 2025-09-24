/*
  # Initial Task Tracker Database Schema

  1. New Tables
    - `profiles` - User profiles (extends Supabase auth.users)
    - `habits` - User habits/tasks with type (hardline/mainline), icon, and sort order
    - `habit_logs` - Daily completion tracking for habits
    - `scopes` - Weekly planning and goal setting
    - `metascripts` - Self-reflection and mindset tracking sessions
    - `weekly_reviews` - Weekly review and planning data

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Foreign key constraints for data integrity

  3. Features
    - Automatic timestamp updates
    - Unique constraints to prevent duplicate entries
    - Optimized indexes for performance
    - Cascade deletes for data consistency
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits table (replaces tasks table with enhanced functionality)
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  kind TEXT CHECK (kind IN ('hardline', 'mainline')),
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit logs table (daily completion tracking)
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('checked', 'missed', 'not_checked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, habit_id, date)
);

-- Scopes table (weekly planning and goals)
CREATE TABLE IF NOT EXISTS scopes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  apex_vision TEXT,
  apex_resonance INTEGER,
  quarterly_goals TEXT[],
  week_priorities TEXT[],
  time_blocks JSONB,
  daily_focus JSONB,
  daily_energy INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Metascripts table (self-reflection sessions)
CREATE TABLE IF NOT EXISTS metascripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  scan1 TEXT,
  scan2 TEXT,
  scan3 TEXT,
  heart_shift TEXT,
  head_shift_options TEXT,
  head_shift_resonant TEXT,
  hat_shift_identity TEXT,
  hat_shift_wisdom TEXT,
  integration_action TEXT,
  integration_embodiment TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly reviews table
CREATE TABLE IF NOT EXISTS weekly_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week INTEGER NOT NULL,
  year INTEGER NOT NULL,
  resonance INTEGER,
  fields JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week, year)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habits_sort_order ON habits(user_id, sort_order);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE metascripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO public USING (user_id = auth.uid());
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO public WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO public USING (user_id = auth.uid());

-- RLS Policies for habits
CREATE POLICY "habits_select_own" ON habits FOR SELECT TO public USING (user_id = auth.uid());
CREATE POLICY "habits_insert_own" ON habits FOR INSERT TO public WITH CHECK (user_id = auth.uid());
CREATE POLICY "habits_update_own" ON habits FOR UPDATE TO public USING (user_id = auth.uid());
CREATE POLICY "habits_delete_own" ON habits FOR DELETE TO public USING (user_id = auth.uid());

-- RLS Policies for habit_logs
CREATE POLICY "habit_logs_select_own" ON habit_logs FOR SELECT TO public USING (user_id = auth.uid());
CREATE POLICY "habit_logs_insert_own" ON habit_logs FOR INSERT TO public WITH CHECK (user_id = auth.uid());
CREATE POLICY "habit_logs_update_own" ON habit_logs FOR UPDATE TO public USING (user_id = auth.uid());
CREATE POLICY "habit_logs_delete_own" ON habit_logs FOR DELETE TO public USING (user_id = auth.uid());

-- RLS Policies for scopes
CREATE POLICY "scopes_select_own" ON scopes FOR SELECT TO public USING (user_id = auth.uid());
CREATE POLICY "scopes_insert_own" ON scopes FOR INSERT TO public WITH CHECK (user_id = auth.uid());
CREATE POLICY "scopes_update_own" ON scopes FOR UPDATE TO public USING (user_id = auth.uid());
CREATE POLICY "scopes_delete_own" ON scopes FOR DELETE TO public USING (user_id = auth.uid());

-- RLS Policies for metascripts
CREATE POLICY "metascripts_select_own" ON metascripts FOR SELECT TO public USING (user_id = auth.uid());
CREATE POLICY "metascripts_insert_own" ON metascripts FOR INSERT TO public WITH CHECK (user_id = auth.uid());
CREATE POLICY "metascripts_update_own" ON metascripts FOR UPDATE TO public USING (user_id = auth.uid());
CREATE POLICY "metascripts_delete_own" ON metascripts FOR DELETE TO public USING (user_id = auth.uid());

-- RLS Policies for weekly_reviews
CREATE POLICY "weekly_reviews_select_own" ON weekly_reviews FOR SELECT TO public USING (user_id = auth.uid());
CREATE POLICY "weekly_reviews_insert_own" ON weekly_reviews FOR INSERT TO public WITH CHECK (user_id = auth.uid());
CREATE POLICY "weekly_reviews_update_own" ON weekly_reviews FOR UPDATE TO public USING (user_id = auth.uid());
CREATE POLICY "weekly_reviews_delete_own" ON weekly_reviews FOR DELETE TO public USING (user_id = auth.uid());