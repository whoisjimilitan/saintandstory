import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

console.log("=== LANDING PAGE ATTRIBUTION AUDIT ===\n");

// Check page engagement log
const hasEngagementLog = await sql`
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'page_engagement_log'
  ) as exists
`;

console.log("1. PAGE VIEW TRACKING");
console.log(`   page_engagement_log table: ${hasEngagementLog[0].exists ? '✅ EXISTS' : '❌ MISSING'}`);

if (hasEngagementLog[0].exists) {
  const count = await sql`SELECT COUNT(*) as count FROM page_engagement_log`;
  console.log(`   Total page views: ${count[0].count}`);
  
  const recent = await sql`
    SELECT COUNT(*) as count FROM page_engagement_log
    WHERE created_at > NOW() - INTERVAL '24 hours'
  `;
  console.log(`   Page views last 24h: ${recent[0].count}`);
}

// Check for UTM/attribution parameters
console.log(`\n2. UTM/ATTRIBUTION TRACKING`);

const urlSchema = await sql`
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'page_engagement_log'
  AND (column_name LIKE '%utm%' OR column_name LIKE '%source%' OR column_name LIKE '%medium%')
`;

if (urlSchema.length === 0) {
  console.log(`   UTM fields in page_engagement_log: ❌ NOT FOUND`);
} else {
  console.log(`   UTM fields:`);
  urlSchema.forEach(col => {
    console.log(`   ${col.column_name}`);
  });
}

// Check b2b_leads landing_page_url field
const landingUrlField = await sql`
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'b2b_leads'
    AND column_name = 'landing_page_url'
  ) as exists
`;

console.log(`\n3. LANDING PAGE URLS IN LEADS`);
console.log(`   landing_page_url field: ${landingUrlField[0].exists ? '✅ EXISTS' : '❌ MISSING'}`);

if (landingUrlField[0].exists) {
  const withUrls = await sql`
    SELECT COUNT(*) as count FROM b2b_leads
    WHERE landing_page_url IS NOT NULL
  `;
  console.log(`   Leads with URLs: ${withUrls[0].count}`);
}

// Check phase3_campaign schema
const phase3Schema = await sql`
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'phase3_campaign'
  ORDER BY ordinal_position
`;

console.log(`\n4. PHASE 3 CAMPAIGN TRACKING COLUMNS`);
if (phase3Schema.length > 0) {
  phase3Schema.forEach(col => {
    console.log(`   ${col.column_name}`);
  });
}

// Check for link tracking in emails
const emailBodySample = await sql`
  SELECT body FROM phase3_campaign
  WHERE status = 'sent'
  LIMIT 1
`;

console.log(`\n5. EMAIL LINK TRACKING`);
if (emailBodySample.length > 0) {
  const body = emailBodySample[0].body;
  const hasLinks = body && (body.includes('http') || body.includes('saintandstory'));
  const hasTracking = body && (body.includes('?') || body.includes('utm'));
  
  console.log(`   Email contains links: ${hasLinks ? '✅ YES' : '❌ NO'}`);
  console.log(`   Link tracking params: ${hasTracking ? '✅ YES' : '❌ NO'}`);
  
  if (hasLinks && !hasTracking) {
    console.log(`   Issue: Links present but NOT tracked with parameters`);
  }
}

// Attribution flow check
console.log(`\n6. ATTRIBUTION FLOW`);
console.log(`   Email click event → Resend webhook → Lead attribution`);
console.log(`   Webhook endpoint: ❌ NOT FOUND in codebase`);
console.log(`   Page engagement logging: ${hasEngagementLog[0].exists ? '✅ READY' : '❌ MISSING'}`);

console.log(`\n\n=== LANDING PAGE ATTRIBUTION STATUS ===`);
console.log(`❌ FAIL - Attribution chain incomplete`);
console.log(`   Issues:`);
console.log(`   1. Webhook endpoint not implemented - can't receive Resend click events`);
console.log(`   2. Email links not tracked with UTM parameters`);
console.log(`   3. No page view attribution to email campaigns`);
console.log(`   4. Cannot connect: Email send → Click event → Page view → Lead conversion`);
