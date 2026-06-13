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
  await sql`
    ALTER TABLE drivers ADD COLUMN IF NOT EXISTS b2b_opt_in BOOLEAN DEFAULT false
  `;
  // Add last_seen_at for admin dashboard activity tracking (required by admin/page.tsx)
  await sql`
    ALTER TABLE drivers ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NULL
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
  await sql`
    ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS lead_tier TEXT CHECK (lead_tier IN ('A', 'B', 'C', 'D')) DEFAULT NULL
  `;

  // Create index on lead_tier for efficient outreach filtering
  await sql`
    CREATE INDEX IF NOT EXISTS idx_b2b_leads_tier ON b2b_leads(lead_tier)
  `;

  // Phase 3: Four-Layer Pipeline Architecture
  // Layer 1: Raw Discoveries (persisted, never discarded)
  await sql`
    CREATE TABLE IF NOT EXISTS discovered_businesses (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      google_place_id TEXT UNIQUE,
      business_name TEXT NOT NULL,
      address TEXT,
      postcode TEXT,
      city TEXT,
      region TEXT,
      category TEXT,
      website TEXT,
      phone TEXT,
      email TEXT,
      source TEXT DEFAULT 'discovery', -- discovery, operator_search, csv_upload, research_mission, ai_research
      source_id TEXT, -- reference to postcode_discovery_job, research_mission, etc.
      mission_id UUID REFERENCES research_missions(id) ON DELETE SET NULL,
      discovered_at TIMESTAMPTZ DEFAULT NOW(),
      raw_data JSONB -- full Google Places response
    )
  `;

  // Layer 2: Enriched Businesses (intelligence extracted)
  await sql`
    CREATE TABLE IF NOT EXISTS enriched_businesses (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      discovered_business_id UUID REFERENCES discovered_businesses(id) ON DELETE CASCADE,
      google_place_id TEXT REFERENCES discovered_businesses(google_place_id),
      website TEXT,
      phone TEXT,
      email TEXT,
      review_count INT,
      average_rating DECIMAL(3,2),
      review_summary JSONB, -- { pain_points: [], themes: [], sentiment: [] }
      digital_signals JSONB, -- { has_website, has_contact_form, has_booking, website_quality: score }
      transport_signals JSONB, -- { keywords_found: [], relevance_score: 0-100 }
      ai_observations TEXT, -- Claude-generated insights
      enriched_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Layer 3: Qualified Businesses (scored, ranked, promotion-ready)
  await sql`
    CREATE TABLE IF NOT EXISTS qualified_businesses (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      enriched_business_id UUID REFERENCES enriched_businesses(id) ON DELETE CASCADE,
      discovered_business_id UUID REFERENCES discovered_businesses(id) ON DELETE CASCADE,
      google_place_id TEXT,
      opportunity_score DECIMAL(5,2) NOT NULL,
      score_breakdown JSONB NOT NULL, -- { business_type: 25, maturity: 10, ... }
      confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
      qualification_reason TEXT,
      estimated_monthly_value DECIMAL(10,2),
      qualified_at TIMESTAMPTZ DEFAULT NOW(),
      promoted_to_lead_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Layer 3.5: Lead Promotion Status (tracks when/why qualified became lead)
  await sql`
    CREATE TABLE IF NOT EXISTS lead_promotions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      qualified_business_id UUID REFERENCES qualified_businesses(id) ON DELETE CASCADE,
      lead_id UUID REFERENCES b2b_leads(id) ON DELETE CASCADE,
      promoted_at TIMESTAMPTZ DEFAULT NOW(),
      promotion_reason TEXT,
      promoted_by TEXT
    )
  `;

  // Update b2b_leads to reference the new architecture
  await sql`
    ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS qualified_business_id UUID REFERENCES qualified_businesses(id)
  `;
  await sql`
    ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS discovered_business_id UUID REFERENCES discovered_businesses(id)
  `;
  await sql`
    ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS promoted_from_qualified_at TIMESTAMPTZ
  `;

  // Discovery configuration (operator-controlled parameters)
  await sql`
    CREATE TABLE IF NOT EXISTS discovery_config (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      mode TEXT NOT NULL, -- 'national', 'regional', 'operator'
      niche TEXT NOT NULL,
      locations TEXT[] NOT NULL, -- cities or postcodes
      enabled BOOLEAN DEFAULT TRUE,
      priority INT DEFAULT 50,
      min_score DECIMAL(5,2) DEFAULT 40, -- minimum opportunity score to create lead
      created_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Operator-initiated discovery jobs (postcode uploads)
  await sql`
    CREATE TABLE IF NOT EXISTS postcode_discovery_jobs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      created_by TEXT NOT NULL,
      status TEXT DEFAULT 'pending', -- pending, running, completed, failed
      total_postcodes INT,
      processed_postcodes INT DEFAULT 0,
      discoveries_found INT DEFAULT 0,
      leads_created INT DEFAULT 0,
      postcode_data JSONB, -- { postcodes: [], business_type: string, notes: string }
      results JSONB DEFAULT NULL,
      error_message TEXT DEFAULT NULL,
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Phase 4: Research Missions (operator-defined discovery tasks)
  await sql`
    CREATE TABLE IF NOT EXISTS research_missions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      mission_type TEXT NOT NULL, -- geography, sector, postcode, custom, ai_research
      prompt TEXT, -- natural language instruction for AI missions
      discovery_strategy JSONB, -- { search_terms: [], locations: [], filters: {} }
      source TEXT DEFAULT 'operator', -- operator, ai_agent, system
      status TEXT DEFAULT 'pending', -- pending, running, completed, failed, archived
      created_by TEXT,
      discoveries_found INT DEFAULT 0,
      businesses_qualified INT DEFAULT 0,
      leads_created INT DEFAULT 0,
      results_summary JSONB,
      error_message TEXT,
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Discovery sources tracking (where businesses came from)
  await sql`
    CREATE TABLE IF NOT EXISTS discovery_sources (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      source_type TEXT NOT NULL, -- google_places, postcode_search, csv_upload, research_agent, claude_research, operator_manual, etc.
      source_name TEXT,
      description TEXT,
      enabled BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Opportunity signals (events that increase lead score)
  await sql`
    CREATE TABLE IF NOT EXISTS opportunity_signals (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      discovered_business_id UUID REFERENCES discovered_businesses(id) ON DELETE CASCADE,
      signal_type TEXT NOT NULL, -- new_branch, hiring_campaign, funding, expansion, new_location, staff_growth, transport_complaint, shift_workforce
      signal_description TEXT,
      score_impact INT DEFAULT 5, -- points to add to opportunity score
      detected_at TIMESTAMPTZ DEFAULT NOW(),
      source TEXT, -- how was this detected (mission, ai_analysis, operator_input, public_data)
      metadata JSONB, -- signal-specific details
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // PHASE 4: Minimal Schema Addition
  // Outreach Eligibility — only field that cannot be derived
  await sql`
    ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS outreach_eligible BOOLEAN DEFAULT FALSE
  `;

  // LEARNING LOOP: Capture outcomes for continuous improvement
  await sql`
    CREATE TABLE IF NOT EXISTS b2b_learning_outcomes (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      qualified_business_id UUID REFERENCES qualified_businesses(id) ON DELETE CASCADE,
      lead_id UUID REFERENCES b2b_leads(id) ON DELETE CASCADE,
      outcome_type TEXT NOT NULL, -- converted, replied, engaged, ignored, disqualified
      outcome_value INT DEFAULT 1, -- 1 for positive (converted, replied), 0 for neutral (ignored), -1 for negative (unsubscribed)
      business_category TEXT,
      opportunity_score_at_outcome DECIMAL(5, 2),
      days_to_outcome INT,
      engagement_signals JSONB, -- email opens, clicks, etc.
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // PHASE 5: Email Engagement Tracking
  // Track opens, clicks, bounces, complaints from Resend webhooks
  await sql`
    CREATE TABLE IF NOT EXISTS b2b_email_events (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      outreach_id UUID REFERENCES b2b_outreach(id) ON DELETE CASCADE,
      lead_id UUID REFERENCES b2b_leads(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL, -- opened, clicked, bounced, complained, delivered
      timestamp TIMESTAMPTZ NOT NULL,
      metadata JSONB, -- {"ip": "...", "user_agent": "...", "link_url": "...", "link_text": "..."}
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Track which links were clicked in emails
  await sql`
    CREATE TABLE IF NOT EXISTS b2b_email_link_clicks (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      event_id UUID REFERENCES b2b_email_events(id) ON DELETE CASCADE,
      lead_id UUID REFERENCES b2b_leads(id) ON DELETE CASCADE,
      link_url TEXT,
      link_text TEXT,
      clicked_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Engagement score snapshot (denormalized for performance)
  await sql`
    ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS engagement_score INT DEFAULT 0
  `;
  await sql`
    ALTER TABLE b2b_leads ADD COLUMN IF NOT EXISTS last_engagement_at TIMESTAMPTZ
  `;

  // Enable PostGIS for geospatial queries
  await sql`CREATE EXTENSION IF NOT EXISTS postgis`;
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;

  // Indexes for performance
  // b2b_leads
  await sql`CREATE INDEX IF NOT EXISTS idx_b2b_leads_status ON b2b_leads(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_b2b_leads_lead_state ON b2b_leads(lead_state)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_b2b_leads_created ON b2b_leads(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_b2b_leads_driver ON b2b_leads(driver_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_b2b_leads_qualified_business ON b2b_leads(qualified_business_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_b2b_outreach_lead ON b2b_outreach(lead_id)`;

  // Four-layer pipeline and research missions
  await sql`CREATE INDEX IF NOT EXISTS idx_discovered_businesses_place_id ON discovered_businesses(google_place_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_discovered_businesses_postcode ON discovered_businesses(postcode)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_discovered_businesses_mission ON discovered_businesses(mission_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_discovered_businesses_source ON discovered_businesses(source)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_discovered_businesses_created ON discovered_businesses(discovered_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_enriched_businesses_discovered ON enriched_businesses(discovered_business_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_enriched_businesses_google_place ON enriched_businesses(google_place_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_qualified_businesses_score ON qualified_businesses(opportunity_score DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_qualified_businesses_promoted ON qualified_businesses(promoted_to_lead_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_lead_promotions_qualified ON lead_promotions(qualified_business_id)`;

  // Config & jobs
  await sql`CREATE INDEX IF NOT EXISTS idx_discovery_config_niche ON discovery_config(niche)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_postcode_discovery_status ON postcode_discovery_jobs(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_postcode_discovery_created ON postcode_discovery_jobs(created_at DESC)`;

  // Research missions
  await sql`CREATE INDEX IF NOT EXISTS idx_research_missions_status ON research_missions(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_research_missions_type ON research_missions(mission_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_research_missions_created ON research_missions(created_at DESC)`;

  // Opportunity signals
  await sql`CREATE INDEX IF NOT EXISTS idx_opportunity_signals_business ON opportunity_signals(discovered_business_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_opportunity_signals_type ON opportunity_signals(signal_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_opportunity_signals_detected ON opportunity_signals(detected_at DESC)`;

  // Discovery sources
  await sql`CREATE INDEX IF NOT EXISTS idx_discovery_sources_type ON discovery_sources(source_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_discovery_sources_enabled ON discovery_sources(enabled)`;

  // Other
  await sql`CREATE INDEX IF NOT EXISTS idx_lead_state_transitions_lead ON lead_state_transitions(lead_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_drivers_postcode ON drivers(postcode)`;
}
