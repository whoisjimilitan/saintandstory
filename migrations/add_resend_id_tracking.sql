-- Migration: Add Resend email ID tracking to campaign tables

-- Add resend_email_id to phase3_campaign if not exists
ALTER TABLE phase3_campaign
ADD COLUMN IF NOT EXISTS resend_email_id TEXT;

-- Add campaign_id to b2b_outreach if not exists
ALTER TABLE b2b_outreach
ADD COLUMN IF NOT EXISTS campaign_id UUID;

-- Create b2b_campaign_sends table for comprehensive send tracking
CREATE TABLE IF NOT EXISTS b2b_campaign_sends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL,
  lead_id UUID NOT NULL,
  email TEXT NOT NULL,
  resend_email_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_b2b_campaign_sends_resend_id
  ON b2b_campaign_sends(resend_email_id);

CREATE INDEX IF NOT EXISTS idx_b2b_campaign_sends_lead
  ON b2b_campaign_sends(lead_id);

CREATE INDEX IF NOT EXISTS idx_b2b_campaign_sends_campaign
  ON b2b_campaign_sends(campaign_id);

-- Migrate existing phase3_campaign data to b2b_campaign_sends
INSERT INTO b2b_campaign_sends (campaign_id, lead_id, email, resend_email_id, sent_at, status)
SELECT
  gen_random_uuid(),
  lead_id,
  email,
  resend_email_id,
  sent_at,
  CASE WHEN status = 'sent' THEN 'delivered' ELSE status END
FROM phase3_campaign
WHERE status = 'sent'
  AND (SELECT COUNT(*) FROM b2b_campaign_sends WHERE lead_id = phase3_campaign.lead_id) = 0
ON CONFLICT (resend_email_id) DO NOTHING;
