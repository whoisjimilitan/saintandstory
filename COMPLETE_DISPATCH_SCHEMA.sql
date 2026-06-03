-- COMPLETE DISPATCH PLATFORM SCHEMA
-- Reconstructed from actual application code usage
-- Generated after analyzing all queries, routes, and dashboards

-- TABLE: drivers
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE,
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  vehicle_type TEXT,
  area TEXT,
  days_preference TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  profile_live BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drivers_last_seen_at ON drivers(last_seen_at);
CREATE INDEX idx_drivers_profile_live ON drivers(profile_live);

-- TABLE: driver_availability
CREATE TABLE IF NOT EXISTS driver_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(driver_id, available_date)
);

CREATE INDEX idx_driver_availability_available_date ON driver_availability(available_date);

-- TABLE: jobs
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  tracking_token TEXT UNIQUE NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  service_type TEXT,
  postcode_from TEXT,
  postcode_to TEXT,
  distance_miles INTEGER,
  large_items JSONB,
  timeframe TEXT,
  help_loading TEXT,
  duration TEXT,
  driver_id UUID REFERENCES drivers(id),
  status TEXT DEFAULT 'new',
  job_date DATE,
  price NUMERIC(10,2),
  notes TEXT,
  lead_id UUID,
  offered_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  in_progress_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  pickup_lat NUMERIC,
  pickup_lng NUMERIC,
  driver_lat NUMERIC,
  driver_lng NUMERIC,
  driver_eta_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_driver_id_status ON jobs(driver_id, status);
CREATE INDEX idx_jobs_customer_email ON jobs(customer_email);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_jobs_updated_at ON jobs(updated_at);

-- TABLE: ratings
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID UNIQUE REFERENCES jobs(id),
  driver_id UUID REFERENCES drivers(id),
  score INTEGER CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ratings_driver_id ON ratings(driver_id);

-- TABLE: earnings
CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id),
  job_id UUID REFERENCES jobs(id),
  amount NUMERIC(10,2),
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_earnings_driver_id_status ON earnings(driver_id, status);
CREATE INDEX idx_earnings_created_at ON earnings(created_at);

-- TABLE: driver_location_history
CREATE TABLE IF NOT EXISTS driver_location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  driver_clerk_id TEXT,
  lat NUMERIC,
  lng NUMERIC,
  accuracy NUMERIC,
  eta_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_driver_location_history_job_id ON driver_location_history(job_id);
CREATE INDEX idx_driver_location_history_created_at ON driver_location_history(created_at);

-- Add CHECK constraint for ratings (optional - Prisma doesn't enforce but database will)
ALTER TABLE ratings ADD CONSTRAINT check_ratings_score
  CHECK (score >= 1 AND score <= 5)
  ON CONFLICT DO NOTHING;
