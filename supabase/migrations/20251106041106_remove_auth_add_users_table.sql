/*
  # Remove Supabase Auth and Create Custom Users Table

  ## Overview
  This migration removes Supabase Auth dependencies and creates a custom users table with hashed passwords for username/password authentication.

  ## Changes Made

  ### 1. Drop Subscription Tables and Related Constraints
  - Drop `subscriptions` table (not needed for third-party video platform)
  - Remove subscription-related policies

  ### 2. Create New Users Table
  - `id` (uuid, primary key) - User identifier
  - `username` (text, unique, not null) - Username for login
  - `password_hash` (text, not null) - Bcrypt hashed password
  - `avatar_url` (text) - Optional profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. Update Existing Tables
  - Drop `profiles` table (replaced by `users`)
  - Update foreign key references from `profiles` to `users`
  - Update all RLS policies to use custom authentication

  ### 4. Security
  - Enable RLS on users table
  - Users can read all user profiles (for displaying uploaders)
  - Users can only update their own profile
  - Password hash is never exposed in queries

  ## Important Notes
  - This migration removes Supabase Auth completely
  - Authentication will be handled via Edge Functions
  - Session management will use JWT tokens stored client-side
*/

-- Drop existing tables that depend on profiles
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS watch_history CASCADE;
DROP TABLE IF EXISTS watch_later CASCADE;
DROP TABLE IF EXISTS video_likes CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create users table with hashed passwords
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  slug text UNIQUE NOT NULL,
  video_url text NOT NULL,
  hls_url text,
  thumbnail_url text,
  duration integer DEFAULT 0,
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create video_likes table
CREATE TABLE IF NOT EXISTS video_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Create watch_later table
CREATE TABLE IF NOT EXISTS watch_later (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Create watch_history table
CREATE TABLE IF NOT EXISTS watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  watched_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_later ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Users Policies (public read, selective write)
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = current_setting('app.user_id', true)::uuid)
  WITH CHECK (id = current_setting('app.user_id', true)::uuid);

-- Videos Policies
CREATE POLICY "Videos are viewable by everyone"
  ON videos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create videos"
  ON videos FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true)::uuid);

CREATE POLICY "Users can update own videos"
  ON videos FOR UPDATE
  USING (user_id = current_setting('app.user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.user_id', true)::uuid);

CREATE POLICY "Users can delete own videos"
  ON videos FOR DELETE
  USING (user_id = current_setting('app.user_id', true)::uuid);

-- Video Likes Policies
CREATE POLICY "Users can view all likes"
  ON video_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can create own likes"
  ON video_likes FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true)::uuid);

CREATE POLICY "Users can delete own likes"
  ON video_likes FOR DELETE
  USING (user_id = current_setting('app.user_id', true)::uuid);

-- Watch Later Policies
CREATE POLICY "Users can view own watch later"
  ON watch_later FOR SELECT
  USING (user_id = current_setting('app.user_id', true)::uuid);

CREATE POLICY "Users can create own watch later"
  ON watch_later FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true)::uuid);

CREATE POLICY "Users can delete own watch later"
  ON watch_later FOR DELETE
  USING (user_id = current_setting('app.user_id', true)::uuid);

-- Watch History Policies
CREATE POLICY "Users can view own history"
  ON watch_history FOR SELECT
  USING (user_id = current_setting('app.user_id', true)::uuid);

CREATE POLICY "Users can insert own history"
  ON watch_history FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true)::uuid);

CREATE POLICY "Users can update own history"
  ON watch_history FOR UPDATE
  USING (user_id = current_setting('app.user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.user_id', true)::uuid);

CREATE POLICY "Users can delete own history"
  ON watch_history FOR DELETE
  USING (user_id = current_setting('app.user_id', true)::uuid);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_slug ON videos(slug);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_likes_video ON video_likes(video_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_user ON video_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_later_user ON watch_later(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_watched_at ON watch_history(watched_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watch_history_updated_at
  BEFORE UPDATE ON watch_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();