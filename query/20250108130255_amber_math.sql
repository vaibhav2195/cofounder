/*
  # Update Applications Table and Policies

  1. Changes
    - Add CASCADE on delete for applications when startup idea is deleted
    - Update RLS policies for better access control
    - Add policy for founders to update application status

  2. Security
    - Maintain RLS on applications table
    - Add specific policy for status updates
*/

-- Update foreign key constraint to cascade delete
ALTER TABLE applications 
DROP CONSTRAINT IF EXISTS applications_idea_id_fkey,
ADD CONSTRAINT applications_idea_id_fkey 
  FOREIGN KEY (idea_id) 
  REFERENCES startup_ideas(id) 
  ON DELETE CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "Developers can view their applications" ON applications;
DROP POLICY IF EXISTS "Developers can create applications" ON applications;
DROP POLICY IF EXISTS "Founders can view applications for their ideas" ON applications;

-- Recreate policies with updated permissions
CREATE POLICY "Developers can view their applications"
  ON applications
  FOR SELECT
  USING (auth.uid() = developer_id);

CREATE POLICY "Developers can create applications"
  ON applications
  FOR INSERT
  WITH CHECK (
    auth.uid() = developer_id AND
    status = 'pending'
  );

CREATE POLICY "Founders can view applications for their ideas"
  ON applications
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT founder_id 
      FROM startup_ideas 
      WHERE id = applications.idea_id
    )
  );

-- Add policy for founders to update application status
CREATE POLICY "Founders can update application status"
  ON applications
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT founder_id 
      FROM startup_ideas 
      WHERE id = applications.idea_id
    )
  )
  WITH CHECK (
    status IN ('approved', 'rejected') AND
    auth.uid() IN (
      SELECT founder_id 
      FROM startup_ideas 
      WHERE id = applications.idea_id
    )
  );