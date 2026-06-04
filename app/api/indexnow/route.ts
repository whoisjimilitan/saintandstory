import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

const BASE_URL = "https://saintandstoryltd.co.uk";
const INDEXNOW_KEY = "ss2025indexnow";
const ADMIN_EMAILS = ["whoisjimi.today@gmail.com", "oye.van@outlook.com"];
const ADMIN_USER_IDS = ["user_3EVExeiSBmgdhAWGzMEb8GMVc62"];

const ALL_URLS = [
  "/",
  "/services",
  "/how-it-works",
  "/pricing",
  "/for-drivers",
  "/contact",
  "/app",
  "/office-moves",
  "/student-moves",
  "/piano-moving",
  "/london-home-moves",
  "/london-drivers",
  "/manchester-office-moves",
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

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email) && !ADMIN_USER_IDS.includes(userId ?? "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const urls = ALL_URLS.map((path) => `${BASE_URL}${path}`);
  const results: Record<string, unknown> = {};

  // Ping Bing IndexNow
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
  } catch (err) {
    results.bing = { error: String(err) };
  }

  // Ping Google sitemap
  try {
    const googleRes = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`,
      { method: "GET" }
    );
    results.google = { status: googleRes.status, ok: googleRes.ok };
  } catch (err) {
    results.google = { error: String(err) };
  }

  console.log("[indexnow] Submitted", urls.length, "URLs:", results);
  return NextResponse.json({ submitted: urls.length, urls, results });
}
