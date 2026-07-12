async function testDiscover() {
  const apiKey = "AIzaSyBzlExTET4Sx-Cu5lAz3Ji_AM8UIo6mLkc";

  console.log("=== DISCOVER PAGE SIMULATION ===\n");

  // Test 1: Postcode search
  console.log("Test 1: Postcode search (M4 4AG)");
  const postcodeResult = await fetch(
    "http://localhost:3000/api/b2b/discover?postcode=M4%204AG&limit=1000",
    { headers: { "Cookie": "test=true" } }
  );
  const postcodeData = await postcodeResult.json();
  console.log(`  Results: ${postcodeData.results?.length || 0}`);
  if (postcodeData.results?.length > 0) {
    console.log(`  First: ${postcodeData.results[0].businessName}`);
  }

  // Test 2: Keyword search
  console.log("\nTest 2: Keyword search (solicitors)");
  const keywordResult = await fetch(
    "http://localhost:3000/api/b2b/discover?keyword=solicitors&limit=1000",
    { headers: { "Cookie": "test=true" } }
  );
  const keywordData = await keywordResult.json();
  console.log(`  Results: ${keywordData.results?.length || 0}`);
  if (keywordData.results?.length > 0) {
    console.log(`  First: ${keywordData.results[0].businessName}`);
  }
}

testDiscover().catch(console.error);
