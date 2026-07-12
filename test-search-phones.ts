import { GooglePlacesProvider } from "@/lib/discover/providers/google-places";

async function test() {
  const apiKey = "AIzaSyBzlExTET4Sx-Cu5lAz3Ji_AM8UIo6mLkc";
  const provider = new GooglePlacesProvider(apiKey);

  console.log("Search for 'accountants'...");
  const result = await provider.search({ keyword: "accountants", limit: 5 });

  console.log(`Results: ${result.businesses.length}`);
  if (result.businesses.length > 0) {
    console.log("\nFirst result fields:");
    const b = result.businesses[0];
    console.log(`  Name: ${b.businessName}`);
    console.log(`  Address: ${b.address}`);
    console.log(`  Telephone: ${b.telephone}`);
    console.log(`  Phone: ${(b as any).phone}`);
    console.log(`  All fields:`, Object.keys(b).sort());
  }
}

test().catch(console.error);
