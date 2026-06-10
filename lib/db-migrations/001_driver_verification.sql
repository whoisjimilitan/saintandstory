-- Phase 1: Driver Verification System
-- Adds verification and photo tracking to drivers table

ALTER TABLE drivers ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS verification_approved_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS verification_photo_url TEXT DEFAULT NULL;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS verification_notes TEXT DEFAULT NULL;

-- Phase 1: Job Proof-of-Service
-- Adds photo tracking to jobs table

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pickup_photo_url TEXT DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pickup_photo_taken_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS delivery_photo_url TEXT DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS delivery_photo_taken_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_completion_verified BOOLEAN DEFAULT FALSE;

-- Indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_drivers_verification_status ON drivers(verification_status);
CREATE INDEX IF NOT EXISTS idx_jobs_photos ON jobs(pickup_photo_url, delivery_photo_url);
