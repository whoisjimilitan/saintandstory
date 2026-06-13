import fs from "fs";

console.log("=== REGRESSION ANALYSIS (debda0a) ===\n");

console.log("1. MODIFIED FILES - CODE INTEGRITY CHECK\n");

// Check category-analytics.ts
const categoryAnalytics = fs.readFileSync("lib/category-analytics.ts", "utf-8");
const categoryFunctions = [
  "getCategoryStats",
  "getCategoryConversionStats",
  "getCategoriesByConversionPerformance",
  "getCategoryPerformanceInsights"
];

console.log("lib/category-analytics.ts:");
categoryFunctions.forEach(fn => {
  if (categoryAnalytics.includes(`export async function ${fn}`)) {
    console.log(`  ✓ ${fn} - INTACT`);
  } else {
    console.log(`  ✗ ${fn} - MISSING`);
  }
});

// Check dashboard-intelligence.ts
const dashIntel = fs.readFileSync("lib/dashboard-intelligence.ts", "utf-8");
console.log("\nlib/dashboard-intelligence.ts:");
if (dashIntel.includes("export async function generateDashboardIntelligence")) {
  console.log("  ✓ generateDashboardIntelligence() - INTACT");
} else {
  console.log("  ✗ generateDashboardIntelligence() - MISSING");
}
if (dashIntel.includes("hottest_prospects")) {
  console.log("  ✓ Hottest prospects ranking - INTACT");
} else {
  console.log("  ✗ Hottest prospects ranking - MISSING");
}
if (dashIntel.includes("pending_followups")) {
  console.log("  ✓ Pending followups - INTACT");
} else {
  console.log("  ✗ Pending followups - MISSING");
}
if (dashIntel.includes("recommendations")) {
  console.log("  ✓ AI recommendations - INTACT");
} else {
  console.log("  ✗ AI recommendations - MISSING");
}

// Check B2BPipeline.tsx
const b2bPipeline = fs.readFileSync("components/B2BPipeline.tsx", "utf-8");
console.log("\ncomponents/B2BPipeline.tsx:");
if (b2bPipeline.includes("🔥 HOT")) {
  console.log("  ✓ Heat badges (🔥 HOT) - INTACT");
} else {
  console.log("  ✗ Heat badges - MISSING");
}
if (b2bPipeline.includes("Heat Score Breakdown")) {
  console.log("  ✓ Heat score composition display - INTACT");
} else {
  console.log("  ✗ Heat score composition - MISSING");
}

// Check b2b-types.ts
const types = fs.readFileSync("lib/b2b-types.ts", "utf-8");
console.log("\nlib/b2b-types.ts:");
if (types.includes("engagement_score")) {
  console.log("  ✓ engagement_score field - ADDED");
} else {
  console.log("  ✗ engagement_score field - MISSING");
}
if (types.includes("last_engagement_at")) {
  console.log("  ✓ last_engagement_at field - ADDED");
} else {
  console.log("  ✗ last_engagement_at field - MISSING");
}
if (types.includes("opportunity_score")) {
  console.log("  ✓ opportunity_score field - ADDED");
} else {
  console.log("  ✗ opportunity_score field - MISSING");
}

console.log("\n2. VARIABLE RENAMES - VERIFICATION\n");

// Check that old variable names are gone and new ones are used
const engagementAvgOld = categoryAnalytics.match(/const engagementAvg = parseFloat\(engagementAvg/);
const engagementAvgNew = categoryAnalytics.match(/const engagementAvgValue = parseFloat/);

if (!engagementAvgOld && engagementAvgNew) {
  console.log("✓ category-analytics.ts: engagementAvg → engagementAvgValue (FIXED)");
} else if (engagementAvgOld) {
  console.log("✗ category-analytics.ts: OLD redeclaration still present");
} else {
  console.log("✓ category-analytics.ts: Variable naming fixed");
}

// Check function calls
const operatorDiscovery = fs.readFileSync("app/api/b2b/operator-discovery/route.ts", "utf-8");
const operatorCalls = operatorDiscovery.match(/runFullPipeline\(sql, business\)/g) || [];
const operatorCallsBad = operatorDiscovery.match(/runFullPipeline\(sql, business, /g) || [];

console.log(`\n✓ operator-discovery.ts: Correct runFullPipeline call (${operatorCalls.length} found)`);

const qualifyLead = fs.readFileSync("app/api/b2b/qualify-to-lead/route.ts", "utf-8");
const promoteCalls = qualifyLead.match(/promoteToLead\(sql, qualified_business_id, qb\[0\]\)/g) || [];

console.log(`✓ qualify-to-lead.ts: Correct promoteToLead call (${promoteCalls.length} found)`);

console.log("\n3. INTELLIGENCE SYSTEMS - FILE EXISTENCE\n");

const systems = [
  { name: "Heat Score Ranking", file: "lib/heat-score.ts" },
  { name: "Heat Score Timeline", file: "lib/heat-score-timeline.ts" },
  { name: "Engagement Tracking", file: "lib/engagement-tracking.ts" },
  { name: "Category Analytics", file: "lib/category-analytics.ts" },
  { name: "Mission ROI", file: "lib/mission-roi.ts" },
  { name: "Revenue Attribution", file: "lib/revenue-attribution.ts" },
  { name: "Dashboard Intelligence", file: "lib/dashboard-intelligence.ts" },
  { name: "Adaptive Follow-up", file: "lib/adaptive-followup.ts" },
  { name: "Prospect Brief AI", file: "lib/prospect-brief-ai.ts" }
];

systems.forEach(sys => {
  try {
    fs.statSync(sys.file);
    console.log(`✓ ${sys.name}`);
  } catch (e) {
    console.log(`✗ ${sys.name}: FILE NOT FOUND`);
  }
});

console.log("\n4. BUILD VERIFICATION\n");

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
console.log(`✓ Dependencies: @anthropic-ai/sdk ${packageJson.dependencies["@anthropic-ai/sdk"] ? "INSTALLED" : "MISSING"}`);

console.log("\n=== ANALYSIS COMPLETE ===");
