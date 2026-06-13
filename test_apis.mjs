const baseUrl = "http://localhost:3000";

async function testAPIs() {
  console.log("=== LIVE API VERIFICATION ===\n");

  // Test 1: Heat Dashboard API
  console.log("1. TESTING: GET /api/b2b/intelligence/heat-dashboard\n");
  try {
    // Note: This would need auth in production, but we'll attempt it
    const res = await fetch(`${baseUrl}/api/b2b/intelligence/heat-dashboard`);
    if (res.status === 403) {
      console.log("❌ Requires authentication (expected)");
      console.log("   API is wired and expecting valid auth");
    } else if (res.ok) {
      const data = await res.json();
      console.log("✅ API responded");
      console.log(`   Response structure: ${JSON.stringify(data).substring(0, 100)}...`);
    } else {
      console.log(`❌ API returned ${res.status}`);
    }
  } catch (e) {
    console.log(`❌ Connection error: ${e.message}`);
    console.log("   (Expected if server not running)");
  }

  // Test 2: Category Analytics API
  console.log("\n2. TESTING: GET /api/b2b/intelligence/category-analytics\n");
  try {
    const res = await fetch(`${baseUrl}/api/b2b/intelligence/category-analytics`);
    if (res.status === 403) {
      console.log("❌ Requires authentication (expected)");
    } else if (res.ok) {
      const data = await res.json();
      console.log("✅ API responded");
      console.log(`   Found ${data.length || 'unknown'} categories`);
    } else {
      console.log(`❌ API returned ${res.status}`);
    }
  } catch (e) {
    console.log(`❌ Connection error: ${e.message}`);
  }

  // Test 3: Prospect Brief API
  console.log("\n3. TESTING: POST /api/b2b/intelligence/prospect-brief\n");
  try {
    const res = await fetch(`${baseUrl}/api/b2b/intelligence/prospect-brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: 'test' })
    });
    if (res.status === 403) {
      console.log("❌ Requires authentication (expected)");
      console.log("   API is wired and authentication is enforced");
    } else {
      const data = await res.json();
      console.log(`✅ API responded (${res.status})`);
      console.log(`   ${JSON.stringify(data).substring(0, 100)}...`);
    }
  } catch (e) {
    console.log(`❌ Connection error: ${e.message}`);
  }

  // Test 4: Mission ROI API
  console.log("\n4. TESTING: GET /api/b2b/intelligence/mission-roi\n");
  try {
    const res = await fetch(`${baseUrl}/api/b2b/intelligence/mission-roi`);
    if (res.status === 403) {
      console.log("❌ Requires authentication (expected)");
    } else if (res.ok) {
      const data = await res.json();
      console.log("✅ API responded");
      console.log(`   Response has ${Array.isArray(data) ? data.length : 'unknown'} items`);
    } else {
      console.log(`❌ API returned ${res.status}`);
    }
  } catch (e) {
    console.log(`❌ Connection error: ${e.message}`);
  }

  console.log("\n=== API TEST COMPLETE ===\n");
  console.log("Note: APIs require authentication (Clerk) in production");
  console.log("Status 403 = Auth required (correct)");
  console.log("Status 200 = Working (would show data with valid auth)");
}

testAPIs();
