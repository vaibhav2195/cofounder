/*
  # Add INSERT policy for users table
  
  Allows users to create their own profile during signup
*/

CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);