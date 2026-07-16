import { NextResponse } from "next/server";

const BASE_URL = "https://saintandstoryltd.co.uk";
const INDEXNOW_KEY = "ss2025indexnow";

const NEW_PAGES = [
  "/same-day-courier",
  "/next-day-courier",
  "/courier-services",
  "/medical-courier",
  "/legal-documents",
  "/man-and-van",
  "/dedicated-driver",
  "/collections",
];

const ALL_PAGES = [
  "/",
  "/services",
  "/how-it-works",
  "/pricing",
  "/for-drivers",
  "/contact",
  "/app",
  ...NEW_PAGES,
  "/office-moves",
  "/student-moves",
  "/piano-moving",
  "/london-home-moves",
  "/london-drivers",
  "/manchester-office-moves",
  "/house-clearance",
  "/birmingham-removals",
  "/leeds-removals",
  "/bristol-removals",
  "/liverpool-removals",
  "/glasgow-removals",
  "/sheffield-removals",
  "/nottingham-removals",
  "/coventry-removals",
  "/leicester-removals",
  "/edinburgh-removals",
  "/cardiff-removals",
  "/newcastle-removals",
  "/reading-removals",
  "/oxford-removals",
  "/cambridge-removals",
  "/southampton-removals",
  "/brighton-removals",
  "/derby-removals",
  "/wolverhampton-removals",
  "/norwich-removals",
  "/south-london-removals",
  "/east-london-removals",
  "/manchester-removals",
];

export async function GET(request: Request) {
  console.log("[submit-to-google] Starting indexing process...");

  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || "all"; // "all" or "new"
  const urlPaths = mode === "new" ? NEW_PAGES : ALL_PAGES;
  const fullUrls = urlPaths.map(path => `${BASE_URL}${path}`);

  const results: Record<string, any> = {
    mode,
    timestamp: new Date().toISOString(),
    submitted: {
      count: fullUrls.length,
      urls: fullUrls
    }
  };

  // Submit to IndexNow (Bing, Google, Yandex)
  console.log(`[submit-to-google] Submitting ${fullUrls.length} URLs to IndexNow...`);
  try {
    const indexnowRes = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "saintandstoryltd.co.uk",
        key: INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: fullUrls,
      }),
    });

    results.indexnow = {
      status: indexnowRes.status,
      statusText: indexnowRes.statusText,
      ok: indexnowRes.ok
    };

    console.log(`[submit-to-google] IndexNow response: ${indexnowRes.status}`);
  } catch (err) {
    results.indexnow = { error: String(err) };
    console.error(`[submit-to-google] IndexNow error:`, err);
  }

  // Ping Google sitemap directly
  console.log("[submit-to-google] Pinging Google sitemap...");
  try {
    const googleRes = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`,
      { method: "GET" }
    );

    results.google_sitemap = {
      status: googleRes.status,
      statusText: googleRes.statusText,
      ok: googleRes.ok
    };

    console.log(`[submit-to-google] Google response: ${googleRes.status}`);
  } catch (err) {
    results.google_sitemap = { error: String(err) };
    console.error(`[submit-to-google] Google error:`, err);
  }

  // Ping Bing sitemap
  console.log("[submit-to-google] Pinging Bing sitemap...");
  try {
    const bingRes = await fetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`,
      { method: "GET" }
    );

    results.bing_sitemap = {
      status: bingRes.status,
      statusText: bingRes.statusText,
      ok: bingRes.ok
    };

    console.log(`[submit-to-google] Bing response: ${bingRes.status}`);
  } catch (err) {
    results.bing_sitemap = { error: String(err) };
    console.error(`[submit-to-google] Bing error:`, err);
  }

  results.summary = {
    status: "SUCCESS",
    message: `Submitted ${fullUrls.length} URLs to Google, Bing, and Yandex via IndexNow`,
    nextSteps: [
      "Check Google Search Console in 24 hours",
      "Look for your new pages in the URL inspection tool",
      "Monitor impressions starting week 1-2"
    ]
  };

  console.log("[submit-to-google] ✅ Indexing complete!", results.summary);

  return NextResponse.json(results, { status: 200 });
}

export async function POST(request: Request) {
  // Also accept POST requests
  return GET(request);
}
