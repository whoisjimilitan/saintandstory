import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function createQALeads() {
  console.log("=== PHASE 1: CREATE 5 QA LEADS ===\n");

  const qaLeads = [
    {
      business_name: "QA Test - Opens Only",
      email: "qa-lead-1-open@gmail.com",
      business_category: "dental-practices",
      city: "London",
      pain_point: "Staffing challenges",
      phone: "020-0001-0001",
      test_scenario: "open_only"
    },
    {
      business_name: "QA Test - Open Click",
      email: "qa-lead-2-click@gmail.com",
      business_category: "event-organisers",
      city: "Manchester",
      pain_point: "Transportation logistics",
      phone: "020-0002-0002",
      test_scenario: "open_click"
    },
    {
      business_name: "QA Test - Full Engagement",
      email: "qa-lead-3-reply@gmail.com",
      business_category: "estate-agents",
      city: "Birmingham",
      pain_point: "Lead generation",
      phone: "020-0003-0003",
      test_scenario: "open_click_reply"
    },
    {
      business_name: "QA Test - No Engagement",
      email: "qa-lead-4-silent@gmail.com",
      business_category: "legal",
      city: "Leeds",
      pain_point: "Client acquisition",
      phone: "020-0004-0004",
      test_scenario: "silent"
    },
    {
      business_name: "QA Test - Multiple Opens",
      email: "qa-lead-5-multiple@gmail.com",
      business_category: "pharmacies",
      city: "Bristol",
      pain_point: "Delivery logistics",
      phone: "020-0005-0005",
      test_scenario: "multiple_opens"
    }
  ];

  console.log("QA Tagging Strategy:\n");
  console.log("• Email addresses: qa-lead-N-* pattern for easy identification");
  console.log("• Business names: 'QA Test - *' prefix for clear identification");
  console.log("• Notes field: JSON with environment, exclusion flags, and scenario");
  console.log("• Source: 'qa_system_test' for filtering\n");

  let created = 0;
  const results = [];

  for (const lead of qaLeads) {
    try {
      // Create notes field with QA tagging
      const qaMetadata = {
        environment: "qa",
        source: "system_test",
        exclude_from_learning: true,
        exclude_from_roi: true,
        exclude_from_conversion_metrics: true,
        exclude_from_category_analytics: true,
        exclude_from_discovery_learning: true,
        test_scenario: lead.test_scenario,
        created_at: new Date().toISOString()
      };

      const notes = `[QA TEST] ${lead.test_scenario.toUpperCase()} - ${JSON.stringify(qaMetadata)}`;

      const result = await sql`
        INSERT INTO b2b_leads (
          business_name,
          email,
          business_category,
          city,
          pain_point,
          phone,
          status,
          source,
          notes,
          created_at,
          updated_at
        ) VALUES (
          ${lead.business_name},
          ${lead.email},
          ${lead.business_category},
          ${lead.city},
          ${lead.pain_point},
          ${lead.phone},
          'new',
          'qa_system_test',
          ${notes},
          NOW(),
          NOW()
        )
        RETURNING id, business_name, email
      `;

      created++;
      results.push({
        id: result[0].id,
        name: result[0].business_name,
        email: result[0].email,
        scenario: lead.test_scenario
      });

      console.log(`✓ Created: ${lead.business_name}`);
      console.log(`  ID: ${result[0].id}`);
      console.log(`  Email: ${lead.email}`);
      console.log(`  Scenario: ${lead.test_scenario}\n`);

    } catch (e) {
      console.error(`✗ Failed to create ${lead.business_name}: ${e.message}\n`);
    }
  }

  console.log(`\n=== QA LEADS CREATED ===\n`);
  console.log(`Total created: ${created}/5\n`);

  if (created === 5) {
    console.log("QA Lead IDs (for reference):\n");
    results.forEach((r, i) => {
      console.log(`Lead ${i + 1}: ${r.id}`);
      console.log(`  Name: ${r.name}`);
      console.log(`  Email: ${r.email}`);
      console.log(`  Scenario: ${r.scenario}\n`);
    });

    // Save IDs to a file for later reference
    console.log("\nNext Steps:");
    console.log("1. Send recognition emails to these QA leads");
    console.log("2. Simulate engagement events");
    console.log("3. Verify complete signal chain");
    console.log("4. Document results in QA_VALIDATION_PROTOCOL.md");
  }

  return results;
}

createQALeads().catch(err => {
  console.error("FATAL ERROR:", err.message);
  process.exit(1);
});
