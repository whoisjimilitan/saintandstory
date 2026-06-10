import { neon } from "@neondatabase/serverless";

export async function ensureB2BSchema() {
  if (!process.env.DATABASE_URL) return;
  const sql = neon(process.env.DATABASE_URL);

  await sql`
    CREATE TABLE IF NOT EXISTS b2b_leads (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      business_name TEXT NOT NULL,
      business_category TEXT,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      website TEXT,
      city TEXT,
      postcode TEXT,
      google_place_id TEXT,
      pain_point TEXT,
      pain_point_review TEXT,
      review_rating DECIMAL(2,1),
      source TEXT DEFAULT 'discovery', -- discovery, inbound, manual
      status TEXT DEFAULT 'new', -- new, contacted, warm, closed, dead
      notes TEXT,
      niche TEXT,
      landing_page_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS b2b_outreach (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      lead_id UUID REFERENCES b2b_leads(id) ON DELETE CASCADE,
      subject TEXT,
      body TEXT,
      sent_at TIMESTAMPTZ,
      follow_up_1_at TIMESTAMPTZ,
      follow_up_2_at TIMESTAMPTZ,
      replied BOOLEAN DEFAULT FALSE,
      replied_at TIMESTAMPTZ,
      email_type TEXT DEFAULT 'initial',
      resend_message_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS b2b_standing_orders (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      lead_id UUID REFERENCES b2b_leads(id),
      business_name TEXT NOT NULL,
      contact_name TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      pickup_address TEXT,
      pickup_postcode TEXT,
      delivery_address TEXT,
      delivery_postcode TEXT,
      service_type TEXT,
      frequency TEXT DEFAULT 'weekly', -- daily, weekly, fortnightly, monthly
      day_of_week INTEGER, -- 0=Mon 6=Sun for weekly
      preferred_time TEXT,
      price DECIMAL(10,2),
      notes TEXT,
      active BOOLEAN DEFAULT TRUE,
      last_generated_at TIMESTAMPTZ,
      next_scheduled_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Add evidence and observations columns (new for learning engine)
  await sql`
    ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS business_evidence JSONB DEFAULT NULL
  `;
  await sql`
    ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS human_observations JSONB DEFAULT NULL
  `;
  await sql`
    ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS business_timeline JSONB DEFAULT NULL
  `;

  // Add state machine columns (workflow state tracking)
  await sql`
    ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS lead_state TEXT DEFAULT 'new' CHECK (lead_state IN ('new', 'recognized', 'engaged', 'self_confirmed'))
  `;
  await sql`
    ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS transitioned_at TIMESTAMPTZ DEFAULT NULL
  `;

  // Create lead_state_transitions table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS lead_state_transitions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      lead_id UUID REFERENCES b2b_leads(id) ON DELETE CASCADE,
      from_state TEXT NOT NULL,
      to_state TEXT NOT NULL,
      trigger_event TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Add B2B discovery columns to existing drivers table
  // (drivers table already exists from job dispatch system)
  // Add new columns for B2B discovery if they don't exist
  await sql`
    ALTER TABLE drivers ADD COLUMN IF NOT EXISTS postcode VARCHAR(20) DEFAULT NULL
  `;
  await sql`
    ALTER TABLE drivers ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8) DEFAULT NULL
  `;
  await sql`
    ALTER TABLE drivers ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8) DEFAULT NULL
  `;
  await sql`
    ALTER TABLE drivers ADD COLUMN IF NOT EXISTS radius_miles INT DEFAULT 10
  `;
  await sql`
    ALTER TABLE drivers ADD COLUMN IF NOT EXISTS available_days TEXT[] DEFAULT NULL
  `;

  // Add driver-related columns to b2b_leads
  await sql`
    ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL
  `;
  await sql`
    ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8) DEFAULT NULL
  `;
  await sql`
    ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8) DEFAULT NULL
  `;
  await sql`
    ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ DEFAULT NULL
  `;

  // Enable PostGIS for geospatial queries
  await sql`CREATE EXTENSION IF NOT EXISTS postgis`;
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;

  // Indexes for performance
  await sql`CREATE INDEX IF NOT EXISTS idx_b2b_leads_status ON b2b_leads(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_b2b_leads_lead_state ON b2b_leads(lead_state)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_b2b_leads_created ON b2b_leads(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_b2b_leads_driver ON b2b_leads(driver_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_b2b_outreach_lead ON b2b_outreach(lead_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_lead_state_transitions_lead ON lead_state_transitions(lead_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_drivers_postcode ON drivers(postcode)`;
}
