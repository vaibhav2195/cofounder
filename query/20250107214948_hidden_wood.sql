/*
  # Fix user insert policy
  
  1. Changes
    - Drop existing insert policy
    - Recreate insert policy with correct permissions
*/

DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);