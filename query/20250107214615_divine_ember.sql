/*
  # Initial Schema Setup for CoFounder Connect

  1. New Tables
    - `users`: Store user profiles
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `user_type` (text, enum: founder/developer)
      - `background` (text, optional)
      - `expertise` (text, optional)
      - `github_username` (text, optional)
      - `linkedin_url` (text, optional)
      - `created_at` (timestamptz)
    
    - `startup_ideas`: Store startup project ideas
      - `id` (uuid, primary key)
      - `founder_id` (uuid, references users)
      - `title` (text)
      - `description` (text)
      - `required_skills` (text[])
      - `compensation_type` (text, enum)
      - `equity_percentage` (numeric, optional)
      - `monetary_compensation` (numeric, optional)
      - `has_nda` (boolean)
      - `created_at` (timestamptz)
    
    - `nda_agreements`: Track NDA acceptances
      - `id` (uuid, primary key)
      - `idea_id` (uuid, references startup_ideas)
      - `developer_id` (uuid, references users)
      - `accepted_at` (timestamptz)
    
    - `applications`: Track developer applications to ideas
      - `id` (uuid, primary key)
      - `idea_id` (uuid, references startup_ideas)
      - `developer_id` (uuid, references users)
      - `note` (text, optional)
      - `status` (text, enum)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Create Users table first since other tables depend on it
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('founder', 'developer')),
  background text,
  expertise text,
  github_username text,
  linkedin_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Create Startup Ideas table
CREATE TABLE startup_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id uuid REFERENCES users(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  required_skills text[] NOT NULL,
  compensation_type text NOT NULL CHECK (compensation_type IN ('equity', 'monetary', 'both')),
  equity_percentage numeric,
  monetary_compensation numeric,
  has_nda boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE startup_ideas ENABLE ROW LEVEL SECURITY;

-- Create NDA Agreements table
CREATE TABLE nda_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid REFERENCES startup_ideas(id) NOT NULL,
  developer_id uuid REFERENCES users(id) NOT NULL,
  accepted_at timestamptz DEFAULT now(),
  UNIQUE(idea_id, developer_id)
);

ALTER TABLE nda_agreements ENABLE ROW LEVEL SECURITY;

-- Create Applications table
CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid REFERENCES startup_ideas(id) NOT NULL,
  developer_id uuid REFERENCES users(id) NOT NULL,
  note text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(idea_id, developer_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Add policies for startup_ideas
CREATE POLICY "Anyone can view non-NDA ideas"
  ON startup_ideas
  FOR SELECT
  USING (NOT has_nda OR auth.uid() IN (
    SELECT developer_id FROM nda_agreements WHERE idea_id = startup_ideas.id
  ));

CREATE POLICY "Founders can manage their ideas"
  ON startup_ideas
  FOR ALL
  USING (auth.uid() = founder_id);

-- Add policies for nda_agreements
CREATE POLICY "Users can view their NDA agreements"
  ON nda_agreements
  FOR SELECT
  USING (auth.uid() = developer_id);

CREATE POLICY "Developers can create NDA agreements"
  ON nda_agreements
  FOR INSERT
  WITH CHECK (auth.uid() = developer_id);

-- Add policies for applications
CREATE POLICY "Developers can view their applications"
  ON applications
  FOR SELECT
  USING (auth.uid() = developer_id);

CREATE POLICY "Developers can create applications"
  ON applications
  FOR INSERT
  WITH CHECK (auth.uid() = developer_id);

CREATE POLICY "Founders can view applications for their ideas"
  ON applications
  FOR SELECT
  USING (auth.uid() IN (
    SELECT founder_id FROM startup_ideas WHERE id = applications.idea_id
  ));