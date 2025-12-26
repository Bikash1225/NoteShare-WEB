/*
  # Add message column to activity_logs

  1. Changes
    - Add message column to activity_logs table to store formatted log messages
    
  2. Notes
    - Column is required (NOT NULL) for new entries
    - Existing entries will not have messages (if any exist)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activity_logs' AND column_name = 'message'
  ) THEN
    ALTER TABLE activity_logs ADD COLUMN message text NOT NULL DEFAULT '';
  END IF;
END $$;
