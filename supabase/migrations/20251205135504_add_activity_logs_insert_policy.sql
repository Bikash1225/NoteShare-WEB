/*
  # Add INSERT policy for activity_logs

  1. Changes
    - Add INSERT policy to allow admins to create activity logs
    
  2. Security
    - Only authenticated users with admin role can insert activity logs
*/

CREATE POLICY "Admins can create activity logs"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
