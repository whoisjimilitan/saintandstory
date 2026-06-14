import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

console.log("=== CAMPAIGN DELIVERY AUDIT ===\n");

// Phase 3 campaign records
const phase3Records = await sql`
  SELECT 
    COUNT(*) as total,
    COUNT(DISTINCT lead_id) as unique_leads,
    COUNT(DISTINCT email) as unique_emails,
    SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent_success,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as sent_failed
  FROM phase3_campaign
`;

console.log("1. PHASE 3 CAMPAIGN SUMMARY");
console.log(`   Total records: ${phase3Records[0].total}`);
console.log(`   Unique leads targeted: ${phase3Records[0].unique_leads}`);
console.log(`   Unique emails: ${phase3Records[0].unique_emails}`);
console.log(`   Send success: ${phase3Records[0].sent_success}`);
console.log(`   Send failed: ${phase3Records[0].sent_failed}`);

// Check for duplicates
console.log(`\n2. DUPLICATE DETECTION`);

const duplicates = await sql`
  SELECT 
    lead_id, email, COUNT(*) as count
  FROM phase3_campaign
  WHERE status = 'sent'
  GROUP BY lead_id, email
  HAVING COUNT(*) > 1
  ORDER BY count DESC
`;

if (duplicates.length === 0) {
  console.log(`   ✅ No duplicate sends detected`);
} else {
  console.log(`   ⚠️  ${duplicates.length} leads sent multiple times:`);
  duplicates.forEach(dup => {
    console.log(`      ${dup.email}: sent ${dup.count} times`);
  });
}

// Campaign timing
console.log(`\n3. CAMPAIGN TIMELINE`);

const timeline = await sql`
  SELECT 
    MIN(created_at) as first_send,
    MAX(created_at) as last_send,
    COUNT(*) as total_sends
  FROM phase3_campaign
  WHERE status = 'sent'
`;

if (timeline.length > 0 && timeline[0].first_send) {
  console.log(`   First send: ${new Date(timeline[0].first_send).toISOString()}`);
  console.log(`   Last send: ${new Date(timeline[0].last_send).toISOString()}`);
  const duration = (new Date(timeline[0].last_send) - new Date(timeline[0].first_send)) / 1000;
  console.log(`   Duration: ${Math.round(duration)} seconds`);
  console.log(`   Sends: ${timeline[0].total_sends}`);
}

// Bounce/failure analysis
console.log(`\n4. DELIVERY HEALTH`);

const failures = await sql`
  SELECT 
    error, 
    COUNT(*) as count
  FROM phase3_campaign
  WHERE status = 'failed'
  GROUP BY error
`;

if (failures.length === 0) {
  console.log(`   ✅ No delivery failures`);
} else {
  console.log(`   ⚠️  Failures detected:`);
  failures.forEach(f => {
    console.log(`      ${f.error}: ${f.count}`);
  });
}

// Resend email IDs
console.log(`\n5. RESEND INTEGRATION`);

const emailIds = await sql`
  SELECT COUNT(*) as count FROM phase3_campaign
  WHERE resend_email_id IS NOT NULL
`;

console.log(`   Emails with Resend ID: ${emailIds[0].count}/${phase3Records[0].sent_success}`);

// Email tracking
console.log(`\n6. EMAIL TRACKING`);

const emailTracking = await sql`
  SELECT 
    business_name, email, status, resend_email_id
  FROM phase3_campaign
  ORDER BY created_at DESC
  LIMIT 10
`;

console.log(`   Last 10 records:`);
emailTracking.forEach((record, i) => {
  console.log(`   ${i + 1}. ${record.business_name}`);
  console.log(`      Email: ${record.email}`);
  console.log(`      Status: ${record.status}`);
  console.log(`      Resend ID: ${record.resend_email_id ? '✅' : '❌'}`);
});

// Total campaign vs target
console.log(`\n7. COVERAGE`);
const allLeads = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
const targetedLeads = phase3Records[0].unique_leads;
const coverage = Math.round((targetedLeads / allLeads[0].count) * 100);

console.log(`   Total leads in system: ${allLeads[0].count}`);
console.log(`   Phase 3 targeted: ${targetedLeads}`);
console.log(`   Coverage: ${coverage}%`);

console.log(`\n\n=== CAMPAIGN DELIVERY STATUS ===`);

if (phase3Records[0].sent_success > 0) {
  console.log(`✅ PASS - Campaign successfully sent`);
  console.log(`   ${phase3Records[0].sent_success} emails delivered`);
  console.log(`   ${phase3Records[0].sent_failed === 0 ? '0 failures' : phase3Records[0].sent_failed + ' failures'}`);
} else {
  console.log(`❌ FAIL - Campaign not found or not sent`);
}
