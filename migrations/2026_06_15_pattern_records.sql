-- Migration: Create pattern_records table for Pattern Intelligence

CREATE TABLE IF NOT EXISTS pattern_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Pattern identification
  pattern_id TEXT NOT NULL UNIQUE,

  -- Pattern components (from Outcome Case)
  blocked_outcome TEXT NOT NULL,
  operational_cause TEXT NOT NULL,
  logistics_friction TEXT NOT NULL,

  -- Case counts
  eligible_cases INTEGER DEFAULT 0,

  -- Conversion metrics
  conversation_count INTEGER DEFAULT 0,
  meeting_count INTEGER DEFAULT 0,
  job_count INTEGER DEFAULT 0,
  recurring_count INTEGER DEFAULT 0,

  -- Calculated rates (0-100)
  conversation_rate NUMERIC(5, 2) DEFAULT 0,
  meeting_rate NUMERIC(5, 2) DEFAULT 0,
  job_rate NUMERIC(5, 2) DEFAULT 0,
  recurring_rate NUMERIC(5, 2) DEFAULT 0,

  -- Timestamps
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_pattern_records_blocked_outcome
  ON pattern_records(blocked_outcome);

CREATE INDEX IF NOT EXISTS idx_pattern_records_operational_cause
  ON pattern_records(operational_cause);

CREATE INDEX IF NOT EXISTS idx_pattern_records_logistics_friction
  ON pattern_records(logistics_friction);

CREATE INDEX IF NOT EXISTS idx_pattern_records_job_rate
  ON pattern_records(job_rate DESC);

CREATE INDEX IF NOT EXISTS idx_pattern_records_conversation_rate
  ON pattern_records(conversation_rate DESC);

CREATE INDEX IF NOT EXISTS idx_pattern_records_last_updated
  ON pattern_records(last_updated DESC);
