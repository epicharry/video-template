/*
  # Create Initial Schema for Video Streaming Platform

  ## Overview
  This migration creates the core database structure for a YouTube-like video streaming platform with user management, video uploads, subscriptions, and engagement features.

  ## New Tables
  
  ### 1. `profiles`
  User profile information extending Supabase auth.users
  - `id` (uuid, primary key) - References auth.users(id)
  - `username` (text, unique) - User's display name
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update timestamp

  ### 2. `videos`
  Video content and metadata
  - `id` (uuid, primary key) - Video identifier
  - `user_id` (uuid, foreign key) - Video owner reference
  - `title` (text) - Video title
  - `description` (text) - Video description
  - `slug` (text, unique) - URL-friendly identifier
  - `video_url` (text) - Video file URL
  - `hls_url` (text) - HLS streaming URL
  - `thumbnail_url` (text) - Video thumbnail URL
  - `duration` (integer) - Video duration in seconds
  - `views` (integer) - View count
  - `created_at` (timestamptz) - Upload timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `subscriptions`
  User-to-user subscription relationships
  - `id` (uuid, primary key) - Subscription identifier
  - `subscriber_id` (uuid, foreign key) - User who subscribed
  - `channel_id` (uuid, foreign key) - User being subscribed to
  - `created_at` (timestamptz) - Subscription timestamp

  ### 4. `video_likes`
  Video likes from users
  - `id` (uuid, primary key) - Like identifier
  - `user_id` (uuid, foreign key) - User who liked
  - `video_id` (uuid, foreign key) - Liked video
  - `created_at` (timestamptz) - Like timestamp

  ### 5. `watch_later`
  Videos saved for later viewing
  - `id` (uuid, primary key) - Save identifier
  - `user_id` (uuid, foreign key) - User who saved
  - `video_id` (uuid, foreign key) - Saved video
  - `created_at` (timestamptz) - Save timestamp

  ### 6. `watch_history`
  User video viewing history
  - `id` (uuid, primary key) - History entry identifier
  - `user_id` (uuid, foreign key) - Viewer
  - `video_id` (uuid, foreign key) - Viewed video
  - `watched_at` (timestamptz) - View timestamp
  - `updated_at` (timestamptz) - Last updated timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Profiles: Users can read all profiles, update only their own
  - Videos: Public read access, authenticated users can create, owners can update/delete
  - Subscriptions: Users can manage their own subscriptions, read subscription counts
  - Likes/Watch Later/History: Users can only access and modify their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
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

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  channel_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(subscriber_id, channel_id),
  CHECK (subscriber_id != channel_id)
);

-- Create video_likes table
CREATE TABLE IF NOT EXISTS video_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Create watch_later table
CREATE TABLE IF NOT EXISTS watch_later (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Create watch_history table
CREATE TABLE IF NOT EXISTS watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  watched_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_later ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Videos Policies
CREATE POLICY "Videos are viewable by everyone"
  ON videos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own videos"
  ON videos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Subscriptions Policies
CREATE POLICY "Users can view all subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = subscriber_id);

-- Video Likes Policies
CREATE POLICY "Users can view all likes"
  ON video_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own likes"
  ON video_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON video_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Watch Later Policies
CREATE POLICY "Users can view own watch later"
  ON watch_later FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own watch later"
  ON watch_later FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watch later"
  ON watch_later FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Watch History Policies
CREATE POLICY "Users can view own history"
  ON watch_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON watch_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history"
  ON watch_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON watch_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_slug ON videos(slug);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber ON subscriptions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_channel ON subscriptions(channel_id);
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
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
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
