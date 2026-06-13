import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

const repairs = [];
const errors = [];

async function log(step, message) {
  console.log(`[${step}] ${message}`);
  repairs.push({ step, message, status: 'ok' });
}

async function logError(step, message, error) {
  console.error(`[${step}] ERROR: ${message}`);
  console.error(`        ${error.message}`);
  errors.push({ step, message, error: error.message });
}

async function repairSchema() {
  console.log("=== HEAT SCORE SCHEMA REPAIR ===\n");

  // ========== STEP 1: Add engagement_score column to b2b_leads ==========
  try {
    await sql`
      ALTER TABLE b2b_leads 
      ADD COLUMN IF NOT EXISTS engagement_score INT DEFAULT 0
    `;
    await log("1.1", "Added b2b_leads.engagement_score column (DEFAULT 0)");
  } catch (e) {
    await logError("1.1", "Failed to add engagement_score column", e);
    return errors;
  }

  // ========== STEP 2: Add last_engagement_at column to b2b_leads ==========
  try {
    await sql`
      ALTER TABLE b2b_leads 
      ADD COLUMN IF NOT EXISTS last_engagement_at TIMESTAMPTZ DEFAULT NULL
    `;
    await log("1.2", "Added b2b_leads.last_engagement_at column");
  } catch (e) {
    await logError("1.2", "Failed to add last_engagement_at column", e);
    return errors;
  }

  // ========== STEP 3: Create b2b_email_events table ==========
  try {
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
    await log("2.1", "Created b2b_email_events table");
  } catch (e) {
    await logError("2.1", "Failed to create b2b_email_events table", e);
    return errors;
  }

  // ========== STEP 4: Create b2b_email_link_clicks table ==========
  try {
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
    await log("2.2", "Created b2b_email_link_clicks table");
  } catch (e) {
    await logError("2.2", "Failed to create b2b_email_link_clicks table", e);
    return errors;
  }

  // ========== STEP 5: Create b2b_heat_score_history table ==========
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS b2b_heat_score_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        lead_id UUID REFERENCES b2b_leads(id) ON DELETE CASCADE,
        heat_score INT NOT NULL,
        engagement_score INT,
        qualification_score INT,
        intent_score INT,
        recorded_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await log("2.3", "Created b2b_heat_score_history table");
  } catch (e) {
    await logError("2.3", "Failed to create b2b_heat_score_history table", e);
    return errors;
  }

  // ========== STEP 6: Create indexes for performance ==========
  try {
    await sql`CREATE INDEX IF NOT EXISTS idx_b2b_email_events_lead ON b2b_email_events(lead_id)`;
    await log("3.1", "Created idx_b2b_email_events_lead index");
  } catch (e) {
    await logError("3.1", "Failed to create email events lead index", e);
    return errors;
  }

  try {
    await sql`CREATE INDEX IF NOT EXISTS idx_b2b_email_events_outreach ON b2b_email_events(outreach_id)`;
    await log("3.2", "Created idx_b2b_email_events_outreach index");
  } catch (e) {
    await logError("3.2", "Failed to create email events outreach index", e);
    return errors;
  }

  try {
    await sql`CREATE INDEX IF NOT EXISTS idx_b2b_email_events_type ON b2b_email_events(event_type)`;
    await log("3.3", "Created idx_b2b_email_events_type index");
  } catch (e) {
    await logError("3.3", "Failed to create email events type index", e);
    return errors;
  }

  try {
    await sql`CREATE INDEX IF NOT EXISTS idx_b2b_email_events_timestamp ON b2b_email_events(timestamp DESC)`;
    await log("3.4", "Created idx_b2b_email_events_timestamp index");
  } catch (e) {
    await logError("3.4", "Failed to create email events timestamp index", e);
    return errors;
  }

  try {
    await sql`CREATE INDEX IF NOT EXISTS idx_b2b_email_link_clicks_lead ON b2b_email_link_clicks(lead_id)`;
    await log("3.5", "Created idx_b2b_email_link_clicks_lead index");
  } catch (e) {
    await logError("3.5", "Failed to create email link clicks lead index", e);
    return errors;
  }

  try {
    await sql`CREATE INDEX IF NOT EXISTS idx_b2b_heat_score_history_lead ON b2b_heat_score_history(lead_id)`;
    await log("3.6", "Created idx_b2b_heat_score_history_lead index");
  } catch (e) {
    await logError("3.6", "Failed to create heat score history lead index", e);
    return errors;
  }

  try {
    await sql`CREATE INDEX IF NOT EXISTS idx_b2b_heat_score_history_recorded ON b2b_heat_score_history(recorded_at DESC)`;
    await log("3.7", "Created idx_b2b_heat_score_history_recorded index");
  } catch (e) {
    await logError("3.7", "Failed to create heat score history recorded index", e);
    return errors;
  }

  // ========== STEP 7: Verify all new objects exist ==========
  console.log("\n=== VERIFICATION ===\n");

  try {
    const engagementCol = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'b2b_leads' AND column_name = 'engagement_score'
    `;
    if (engagementCol.length > 0) {
      await log("4.1", "✓ b2b_leads.engagement_score EXISTS");
    } else {
      await logError("4.1", "b2b_leads.engagement_score NOT FOUND", new Error("Column not created"));
      return errors;
    }
  } catch (e) {
    await logError("4.1", "Failed to verify engagement_score column", e);
    return errors;
  }

  try {
    const lastEngagementCol = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'b2b_leads' AND column_name = 'last_engagement_at'
    `;
    if (lastEngagementCol.length > 0) {
      await log("4.2", "✓ b2b_leads.last_engagement_at EXISTS");
    } else {
      await logError("4.2", "b2b_leads.last_engagement_at NOT FOUND", new Error("Column not created"));
      return errors;
    }
  } catch (e) {
    await logError("4.2", "Failed to verify last_engagement_at column", e);
    return errors;
  }

  try {
    const emailEventsTable = await sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'b2b_email_events'
    `;
    if (emailEventsTable.length > 0) {
      await log("4.3", "✓ b2b_email_events TABLE EXISTS");
    } else {
      await logError("4.3", "b2b_email_events TABLE NOT FOUND", new Error("Table not created"));
      return errors;
    }
  } catch (e) {
    await logError("4.3", "Failed to verify b2b_email_events table", e);
    return errors;
  }

  try {
    const emailLinksTable = await sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'b2b_email_link_clicks'
    `;
    if (emailLinksTable.length > 0) {
      await log("4.4", "✓ b2b_email_link_clicks TABLE EXISTS");
    } else {
      await logError("4.4", "b2b_email_link_clicks TABLE NOT FOUND", new Error("Table not created"));
      return errors;
    }
  } catch (e) {
    await logError("4.4", "Failed to verify b2b_email_link_clicks table", e);
    return errors;
  }

  try {
    const heatHistoryTable = await sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'b2b_heat_score_history'
    `;
    if (heatHistoryTable.length > 0) {
      await log("4.5", "✓ b2b_heat_score_history TABLE EXISTS");
    } else {
      await logError("4.5", "b2b_heat_score_history TABLE NOT FOUND", new Error("Table not created"));
      return errors;
    }
  } catch (e) {
    await logError("4.5", "Failed to verify b2b_heat_score_history table", e);
    return errors;
  }

  // ========== STEP 8: Verify indexes ==========
  try {
    const indexes = await sql`
      SELECT indexname FROM pg_indexes 
      WHERE tablename IN ('b2b_email_events', 'b2b_email_link_clicks', 'b2b_heat_score_history')
    `;
    await log("4.6", `✓ ${indexes.length} indexes created`);
  } catch (e) {
    await logError("4.6", "Failed to verify indexes", e);
    return errors;
  }

  console.log("\n=== ALL REPAIRS SUCCESSFUL ===");
  return null;
}

const errors_result = await repairSchema();
if (errors_result) {
  console.log("\n❌ FAILED AT STEP:", errors_result[0].step);
  process.exit(1);
}
process.exit(0);
