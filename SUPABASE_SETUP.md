# Supabase Setup Guide

This guide will help you set up Supabase for the Task Tracker application.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in with your GitHub account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `task-tracker` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
6. Click "Create new project"
7. Wait for the project to be created (this takes a few minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-ref.supabase.co`)
   - **anon public** key (the long JWT token)

## Step 3: Set Up Environment Variables

1. In your `task-tracker` directory, create a file called `.env.local`
2. Add the following content (replace with your actual values):

```env
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Never commit the `.env.local` file to git. It's already in `.gitignore`.

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `database/schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- `users` table (extends Supabase auth)
- `tasks` table (for storing user tasks)
- `task_completions` table (for tracking daily completions)
- Row Level Security (RLS) policies for data protection
- Indexes for better performance
- Triggers for automatic timestamp updates

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add your development URL: `http://localhost:3000`
3. Under **Redirect URLs**, add:
   - `http://localhost:3000` (for development)
   - Your Vercel deployment URL (for production)

## Step 6: Test the Connection

1. Start your React development server: `npm start`
2. Open the browser console (F12)
3. You should see no Supabase connection errors
4. The app should be able to connect to your database

## Step 7: Deploy Environment Variables to Vercel

1. Go to your Vercel dashboard
2. Select your `task-tracker` project
3. Go to **Settings** → **Environment Variables**
4. Add the same environment variables:
   - `REACT_APP_SUPABASE_URL` = your project URL
   - `REACT_APP_SUPABASE_ANON_KEY` = your anon key
5. Redeploy your application

## Database Schema Overview

### Tables:
- **users**: User profiles (extends Supabase auth.users)
- **tasks**: User tasks with type (H/M/S), week association
- **task_completions**: Daily completion tracking

### Security:
- Row Level Security (RLS) ensures users only see their own data
- All tables have proper policies for CRUD operations
- Automatic user profile creation on signup

### Features:
- Automatic timestamp updates
- Unique constraints to prevent duplicate completions
- Optimized indexes for performance
- Cascade deletes for data consistency

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Check that your environment variables are correct
2. **"Row Level Security policy violation"**: Make sure RLS policies are set up correctly
3. **"Table doesn't exist"**: Run the schema.sql file in Supabase SQL Editor
4. **Environment variables not loading**: Restart your development server after adding `.env.local`

### Useful Supabase Features:

- **Table Editor**: View and edit data directly in the dashboard
- **SQL Editor**: Run custom queries and view logs
- **Auth**: Monitor user signups and sessions
- **Logs**: Debug API calls and errors

## Next Steps

After completing this setup:
1. Test user registration and login
2. Create sample tasks
3. Test task completion tracking
4. Verify data persistence across sessions 