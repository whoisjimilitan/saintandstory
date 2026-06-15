-- Migration: Add pattern verification to pattern_records

-- Add verification fields
ALTER TABLE pattern_records
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS verified_by_operator UUID,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS merged_into_pattern_id TEXT;

-- Add index for unverified patterns (review queue)
CREATE INDEX IF NOT EXISTS idx_pattern_records_unverified
  ON pattern_records(status)
  WHERE status = 'unverified';

-- Add index for verified patterns (learning queue)
CREATE INDEX IF NOT EXISTS idx_pattern_records_verified
  ON pattern_records(status)
  WHERE status = 'verified';

-- Create verification audit log
CREATE TABLE IF NOT EXISTS pattern_verification_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_id TEXT NOT NULL,
  action TEXT NOT NULL,
  operator_id UUID,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  FOREIGN KEY (pattern_id) REFERENCES pattern_records(pattern_id)
);

CREATE INDEX IF NOT EXISTS idx_pattern_verification_log_pattern
  ON pattern_verification_log(pattern_id);

CREATE INDEX IF NOT EXISTS idx_pattern_verification_log_action
  ON pattern_verification_log(action);
