/*
  # Allow admins to update user profiles

  1. Changes
    - Add new UPDATE policy for admins to update any profile
    - This allows admins to promote/demote other users
    
  2. Security
    - Only users with is_admin=true can update other profiles
    - Regular users can still only update their own profiles
*/

CREATE POLICY "Admins can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
