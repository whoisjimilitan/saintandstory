import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// --- 1️⃣ Verify Schema ---
async function verifySchema() {
  const columns = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'b2b_leads'
      AND column_name IN ('lead_state', 'transitioned_at');
  `;

  const colNames = columns.map((c: any) => c.column_name);
  if (!colNames.includes("lead_state") || !colNames.includes("transitioned_at")) {
    throw new Error(
      "[SCHEMA ERROR] Missing required columns: lead_state or transitioned_at. Run migration scripts before starting app."
    );
  }

  console.log("[SCHEMA CHECK] lead_state and transitioned_at columns exist ✅");
}

// --- 2️⃣ One-Time Data Reconciliation ---
async function reconcileExistingLeads() {
  const updated = await sql`
    UPDATE b2b_leads
    SET lead_state = 'new',
        transitioned_at = COALESCE(transitioned_at, NOW())
    WHERE lead_state IS NULL
       OR lead_state NOT IN ('new','recognized','engaged','self_confirmed')
    RETURNING id;
  `;

  console.log(`[RECONCILE] Updated lead_state for ${updated.length} lead(s) ✅`);
}

// --- 3️⃣ Verify Lead-State Transitions Table ---
async function verifyTransitionsTable() {
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_name = 'lead_state_transitions';
  `;

  if (!tables.length) {
    throw new Error("[SCHEMA ERROR] lead_state_transitions table missing. Migration required.");
  }

  console.log("[TRANSITIONS TABLE] lead_state_transitions exists ✅");
}

// --- 4️⃣ Sample verification: check actual data ---
async function verifySampleData() {
  const sample = await sql`
    SELECT id, business_name, lead_state, transitioned_at
    FROM b2b_leads
    LIMIT 3;
  `;

  console.log("[SAMPLE DATA]", sample.length > 0 ? sample : "No leads yet");
}

// --- 5️⃣ Run all steps ---
async function runMigration() {
  try {
    console.log("=== STARTING LEAD_STATE MIGRATION & VERIFICATION ===\n");

    await verifySchema();
    await reconcileExistingLeads();
    await verifyTransitionsTable();
    await verifySampleData();

    console.log("\n=== LEAD_STATE MIGRATION & VERIFICATION COMPLETE ✅ ===");
  } catch (error: any) {
    console.error("\n[MIGRATION ERROR]", error.message);
    process.exit(1);
  }
}

runMigration();
