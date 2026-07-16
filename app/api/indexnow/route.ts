import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

const BASE_URL = "https://saintandstoryltd.co.uk";
const INDEXNOW_KEY = "ss2025indexnow";
const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];
const ADMIN_USER_IDS = ["user_3EVExeiSBmgdhAWGzMEb8GMVc62"];

const ALL_URLS = [
  "/",
  "/services",
  "/how-it-works",
  "/pricing",
  "/for-drivers",
  "/contact",
  "/app",
  // NEW HIGH-PRIORITY COURIER PAGES
  "/same-day-courier",
  "/next-day-courier",
  "/courier-services",
  "/medical-courier",
  "/legal-documents",
  "/man-and-van",
  "/dedicated-driver",
  "/collections",
  // REMOVAL SERVICE PAGES
  "/office-moves",
  "/student-moves",
  "/piano-moving",
  "/london-home-moves",
  "/london-drivers",
  "/manchester-office-moves",
  "/house-clearance",
  // CITY PAGES
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

async function submitToIndexNow(urlPaths: string[]) {
  const results: Record<string, unknown> = {};
  const urls = urlPaths.map((path) => `${BASE_URL}${path}`);

  console.log(`[indexnow] Submitting ${urls.length} URLs to IndexNow and Google...`);

  // Submit to Bing IndexNow (which also notifies Google and Yandex)
  try {
    const bingRes = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "saintandstoryltd.co.uk",
        key: INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
    results.bing = { status: bingRes.status, ok: bingRes.ok };
    console.log(`[indexnow] Bing/IndexNow response: ${bingRes.status}`);
  } catch (err) {
    results.bing = { error: String(err) };
    console.error(`[indexnow] Bing error:`, err);
  }

  // Submit sitemap to Google directly
  try {
    const googleRes = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`,
      { method: "GET" }
    );
    results.google = { status: googleRes.status, ok: googleRes.ok };
    console.log(`[indexnow] Google sitemap response: ${googleRes.status}`);
  } catch (err) {
    results.google = { error: String(err) };
    console.error(`[indexnow] Google error:`, err);
  }

  console.log("[indexnow] Complete. Results:", results);
  return { submitted: urls.length, urls, results };
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email) && !ADMIN_USER_IDS.includes(userId ?? "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Check URL params for custom paths
  const url = new URL(request.url);
  const customPaths = url.searchParams.get("paths");
  const urlPaths = customPaths ? customPaths.split(",") : ALL_URLS;

  const result = await submitToIndexNow(urlPaths);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email) && !ADMIN_USER_IDS.includes(userId ?? "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const urlPaths = body.paths || ALL_URLS;

  const result = await submitToIndexNow(urlPaths);
  return NextResponse.json(result);
}
