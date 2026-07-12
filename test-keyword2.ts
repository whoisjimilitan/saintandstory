import { GooglePlacesProvider } from "@/lib/discover/providers/google-places";

async function test() {
  const apiKey = "AIzaSyBzlExTET4Sx-Cu5lAz3Ji_AM8UIo6mLkc";
  const provider = new GooglePlacesProvider(apiKey);
  
  console.log("Testing keyword search for 'accountants'...");
  const result = await provider.search({ keyword: "accountants", limit: 5 });
  
  console.log(`Results: ${result.businesses.length}`);
  if (result.businesses.length > 0) {
    result.businesses.slice(0, 3).forEach((b, i) => {
      console.log(`  ${i + 1}. ${b.businessName} - ${b.address}`);
    });
  }
}

test().catch(console.error);
