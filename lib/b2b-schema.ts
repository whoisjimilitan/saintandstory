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

  await sql`CREATE INDEX IF NOT EXISTS idx_b2b_leads_status ON b2b_leads(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_b2b_leads_created ON b2b_leads(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_b2b_outreach_lead ON b2b_outreach(lead_id)`;
}
