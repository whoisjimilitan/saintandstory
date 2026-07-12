async function test() {
  const apiKey = "AIzaSyBzlExTET4Sx-Cu5lAz3Ji_AM8UIo6mLkc";
  
  const response = await fetch(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=53.4807593,-2.2426305&radius=5000&type=establishment&key=" + apiKey
  );
  
  const data = await response.json();
  console.log("First result:");
  console.log(JSON.stringify(data.results[0], null, 2));
}

test().catch(console.error);
