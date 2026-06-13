import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { ensureB2BSchema } from "@/lib/b2b-schema";
import { runFullPipeline } from "@/lib/four-layer-pipeline";
import type { RawBusinessDiscovery } from "@/lib/four-layer-pipeline";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

interface GooglePlacesResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  website?: string;
  formatted_phone_number?: string;
  reviews?: Array<{
    rating: number;
    text: string;
    author_name: string;
    time: number;
  }>;
}

async function searchPostcodeRadius(
  postcode: string,
  searchTerms: string[],
  apiKey: string,
  radiusMiles: number = 0.5
): Promise<GooglePlacesResult[]> {
  const results: Map<string, GooglePlacesResult> = new Map();

  for (let radius = radiusMiles; radius <= 10; radius += 1.5) {
    for (const term of searchTerms) {
      try {
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          `${term} near ${postcode} UK`
        )}&key=${apiKey}&language=en&region=gb`;

        const searchRes = await fetch(searchUrl);
        const searchData = (await searchRes.json()) as {
          results?: Array<{ place_id: string; name: string }>;
        };

        if (!searchData.results) continue;

        for (const result of searchData.results.slice(0, 5)) {
          if (results.has(result.place_id)) continue;

          try {
            const detailRes = await fetch(
              `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=name,formatted_address,website,formatted_phone_number,rating,user_ratings_total,reviews&key=${apiKey}&language=en`
            );
            const detail = (await detailRes.json()) as { result?: GooglePlacesResult };

            if (detail.result) {
              results.set(result.place_id, detail.result);
            }
          } catch (e) {
            // Skip failed details
          }

          await new Promise((r) => setTimeout(r, 100));
        }
      } catch (e) {
        // Skip failed search
      }
    }
  }

  return Array.from(results.values());
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureB2BSchema();
  const sql = neon(process.env.DATABASE_URL!);

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  const jobs = (await sql`
    SELECT * FROM postcode_discovery_jobs WHERE id = ${jobId}
  `) as Array<any>;

  if (jobs.length === 0) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json(jobs[0]);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureB2BSchema();
  const sql = neon(process.env.DATABASE_URL!);

  const body = await request.json() as {
    postcodes?: string[];
    businessType?: string;
    minScore?: number;
  };

  const postcodes = body.postcodes || [];
  const businessType = body.businessType || "care_home";
  const minScore = body.minScore || 40;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_MAPS_API_KEY not configured" },
      { status: 500 }
    );
  }

  if (postcodes.length === 0) {
    return NextResponse.json(
      { error: "No postcodes provided" },
      { status: 400 }
    );
  }

  // Create job record
  const jobRecord = (await sql`
    INSERT INTO postcode_discovery_jobs (
      created_by, status, total_postcodes, postcode_data
    ) VALUES (
      ${email}, 'running', ${postcodes.length},
      ${JSON.stringify({ postcodes, businessType })}
    ) RETURNING id
  `) as Array<{ id: string }>;

  const jobId = jobRecord[0].id;

  // Run discovery asynchronously
  runDiscoveryJob(jobId, postcodes, businessType, minScore, apiKey, sql);

  return NextResponse.json({ jobId, status: "running" });
}

async function runDiscoveryJob(
  jobId: string,
  postcodes: string[],
  businessType: string,
  minScore: number,
  apiKey: string,
  sql: any
) {
  try {
    const searchTerms = [
      "care home",
      "nursing home",
      "domiciliary care",
      "home care",
      "assisted living",
    ];

    let totalDiscovered = 0;
    let totalQualified = 0;
    let totalPromoted = 0;
    const allResults: any[] = [];

    for (let i = 0; i < postcodes.length; i++) {
      const postcode = postcodes[i];

      try {
        const results = await searchPostcodeRadius(
          postcode,
          searchTerms,
          apiKey
        );

        for (const result of results) {
          const business: RawBusinessDiscovery = {
            placeId: result.place_id,
            name: result.name,
            address: result.formatted_address || "",
            postcode,
            category: businessType,
            source: "operator_search",
            reviews: result.reviews?.map((r) => ({
              rating: r.rating,
              text: r.text,
              author: r.author_name,
              time: r.time,
            })),
            website: result.website,
            phone: result.formatted_phone_number,
            rating: result.rating,
            reviewCount: result.user_ratings_total,
            rawData: result,
          };

          // Run four-layer pipeline (discover → enrich → qualify → promote)
          const pipelineResult = await runFullPipeline(sql, business);

          if (pipelineResult.discovered) totalDiscovered++;
          if (pipelineResult.qualified) totalQualified++;
          if (pipelineResult.promoted) totalPromoted++;

          allResults.push({
            name: result.name,
            address: result.formatted_address,
            discovered: pipelineResult.discovered,
            qualified: pipelineResult.qualified,
            promoted: pipelineResult.promoted,
          });
        }
      } catch (e) {
        console.error(`Error processing postcode ${postcode}:`, e);
      }

      // Update progress
      try {
        await sql`
          UPDATE postcode_discovery_jobs
          SET processed_postcodes = ${i + 1},
              discoveries_found = ${totalDiscovered},
              leads_created = ${totalPromoted}
          WHERE id = ${jobId}
        `;
      } catch (e) {
        console.error("Error updating job progress:", e);
      }
    }

    // Mark job complete
    await sql`
      UPDATE postcode_discovery_jobs
      SET status = 'completed', completed_at = NOW(),
          results = ${JSON.stringify({
            total_discovered: totalDiscovered,
            total_qualified: totalQualified,
            total_promoted: totalPromoted,
            details: allResults,
          })}
      WHERE id = ${jobId}
    `;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Discovery job ${jobId} failed:`, errorMsg);

    try {
      await sql`
        UPDATE postcode_discovery_jobs
        SET status = 'failed', error_message = ${errorMsg}, completed_at = NOW()
        WHERE id = ${jobId}
      `;
    } catch (e) {
      console.error("Error updating job failure:", e);
    }
  }
}
