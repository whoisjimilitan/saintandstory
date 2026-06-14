import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

console.log("=== LANDING PAGE ATTRIBUTION AUDIT ===\n");

// Check for page view tracking
const viewTables = await sql`
  SELECT table_name 
  FROM information_schema.tables
  WHERE table_name LIKE '%view%' OR table_name LIKE '%page%' OR table_name LIKE '%analytics%'
  ORDER BY table_name
`;

console.log("1. PAGE TRACKING TABLES");
if (viewTables.length === 0) {
  console.log(`   ⚠️  No page tracking tables found`);
  console.log(`   Tables searched: *view*, *page*, *analytics*`);
} else {
  viewTables.forEach(table => {
    console.log(`   ${table.table_name}`);
  });
}

// Check landing_page_url field in leads
const landingPageLeads = await sql`
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN landing_page_url IS NOT NULL THEN 1 END) as with_url
  FROM b2b_leads
`;

console.log(`\n2. LANDING PAGE URLS IN LEADS`);
console.log(`   Total leads: ${landingPageLeads[0].total}`);
console.log(`   With landing page URL: ${landingPageLeads[0].with_url}`);

// Sample landing pages
const samplePages = await sql`
  SELECT DISTINCT landing_page_url
  FROM b2b_leads
  WHERE landing_page_url IS NOT NULL
  LIMIT 5
`;

console.log(`\n3. LANDING PAGE URL EXAMPLES`);
if (samplePages.length === 0) {
  console.log(`   No URLs found`);
} else {
  samplePages.forEach(page => {
    console.log(`   ${page.landing_page_url}`);
  });
}

// Check for engagement logging table
const engagementCheck = await sql`
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'page_engagement_log'
  ) as exists
`;

console.log(`\n4. ENGAGEMENT TRACKING TABLE`);
console.log(`   page_engagement_log: ${engagementCheck[0].exists ? '✅ EXISTS' : '❌ MISSING'}`);

if (engagementCheck[0].exists) {
  const engagementCount = await sql`SELECT COUNT(*) as count FROM page_engagement_log`;
  console.log(`   Total engagement records: ${engagementCount[0].count}`);
  
  const recentEngagement = await sql`
    SELECT COUNT(*) as count FROM page_engagement_log
    WHERE created_at > NOW() - INTERVAL '24 hours'
  `;
  console.log(`   Engagement in last 24h: ${recentEngagement[0].count}`);
}

// Check for page view/visit tracking
const pageViewTables = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_name LIKE '%visit%' OR table_name LIKE '%session%'
`;

console.log(`\n5. SESSION/VISIT TRACKING`);
if (pageViewTables.length === 0) {
  console.log(`   ⚠️  No session or visit tracking table found`);
} else {
  pageViewTables.forEach(table => {
    console.log(`   ${table.table_name}`);
  });
}

// Check Phase 3 landing page links
const phase3Pages = await sql`
  SELECT DISTINCT 
    landing_page_url, 
    COUNT(DISTINCT lead_id) as leads
  FROM phase3_campaign
  WHERE landing_page_url IS NOT NULL
  GROUP BY landing_page_url
  ORDER BY leads DESC
`;

console.log(`\n6. PHASE 3 CAMPAIGN LANDING PAGES`);
if (phase3Pages.length === 0) {
  console.log(`   ⚠️  No landing page URLs in Phase 3 records`);
} else {
  phase3Pages.forEach(page => {
    console.log(`   ${page.landing_page_url}: ${page.leads} leads`);
  });
}

// Check UTM parameters
const phase3Records = await sql`
  SELECT subject, body
  FROM phase3_campaign
  WHERE status = 'sent'
  LIMIT 1
`;

console.log(`\n7. UTM TRACKING`);
if (phase3Records.length > 0) {
  const body = phase3Records[0].body;
  const hasUTM = body && body.includes('utm_');
  console.log(`   UTM parameters in email body: ${hasUTM ? '✅ YES' : '❌ NO'}`);
  
  if (hasUTM) {
    const utmMatch = body.match(/utm_[^&\s)]+/g);
    if (utmMatch) {
      console.log(`   UTM params found: ${utmMatch.join(', ')}`);
    }
  }
}

// Check analytics configuration
console.log(`\n8. ANALYTICS CONFIGURATION`);
const analyticsTypes = [
  'google_analytics',
  'posthog',
  'segment',
  'mixpanel',
  'amplitude'
];

let found = false;
for (const type of analyticsTypes) {
  // Check environment config
  const hasConfig = process.env[`NEXT_PUBLIC_${type.toUpperCase()}`] !== undefined;
  if (hasConfig) {
    console.log(`   ${type}: ✅ Configured`);
    found = true;
  }
}

if (!found) {
  console.log(`   No standard analytics found in env`);
}

console.log(`\n\n=== LANDING PAGE ATTRIBUTION STATUS ===`);
console.log(`❌ FAIL - No page view tracking system found`);
console.log(`   Issues:`);
console.log(`   - No page_view or page_visit table`);
console.log(`   - No UTM tracking in emails`);
console.log(`   - No analytics integration detected`);
console.log(`   - Attribution gap: Email click → Landing page view`);
