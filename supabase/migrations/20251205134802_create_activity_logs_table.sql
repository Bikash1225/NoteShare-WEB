/*
  # Create Activity Logs Table

  1. New Tables
    - `activity_logs`
      - `id` (uuid, primary key) - unique identifier for each log entry
      - `action_type` (text) - type of action (document_created, admin_promoted)
      - `actor_email` (text) - email of user performing the action
      - `actor_name` (text) - name of user performing the action
      - `target_email` (text) - email of user being affected (for promotions)
      - `target_name` (text) - name of user being affected (for promotions)
      - `document_name` (text) - name of document (for document creation)
      - `message` (text) - formatted log message
      - `created_at` (timestamptz) - when the action occurred

  2. Security
    - Enable RLS on `activity_logs` table
    - Add policy for admins to read all logs
*/

CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  actor_email text NOT NULL,
  actor_name text NOT NULL,
  target_email text,
  target_name text,
  document_name text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all activity logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );