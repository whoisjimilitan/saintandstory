import { GooglePlacesProvider } from "@/lib/discover/providers/google-places";

async function test() {
  const apiKey = "AIzaSyBzlExTET4Sx-Cu5lAz3Ji_AM8UIo6mLkc";
  const provider = new GooglePlacesProvider(apiKey);
  
  console.log("Testing postcode search for M4 4AG...");
  const result = await provider.search({ postcode: "M4 4AG", limit: 10 });
  
  console.log(`Status: ${result.error ? "ERROR" : "OK"}`);
  console.log(`Results: ${result.businesses.length}`);
  console.log(`Time: ${result.processingTimeMs}ms`);
  
  if (result.businesses.length > 0) {
    console.log("\nFirst 3 results:");
    result.businesses.slice(0, 3).forEach((b, i) => {
      console.log(`  ${i + 1}. ${b.businessName} (${b.address})`);
    });
  }
}

test().catch(console.error);
