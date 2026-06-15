-- Migration: Add outcome result tracking to b2b_leads

-- Add outcome_case_id to link to outcome case
ALTER TABLE b2b_leads
ADD COLUMN IF NOT EXISTS outcome_case_id UUID;

-- Add result tracking flags
ALTER TABLE b2b_leads
ADD COLUMN IF NOT EXISTS conversation_started BOOLEAN DEFAULT FALSE;

ALTER TABLE b2b_leads
ADD COLUMN IF NOT EXISTS meeting_booked BOOLEAN DEFAULT FALSE;

ALTER TABLE b2b_leads
ADD COLUMN IF NOT EXISTS job_created BOOLEAN DEFAULT FALSE;

ALTER TABLE b2b_leads
ADD COLUMN IF NOT EXISTS recurring_work BOOLEAN DEFAULT FALSE;

-- Create index for pattern generation query
CREATE INDEX IF NOT EXISTS idx_b2b_leads_logistics_fit_score_results
  ON b2b_leads(logistics_fit_score, conversation_started, meeting_booked, job_created, recurring_work);
