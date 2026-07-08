import { NextRequest, NextResponse } from "next/server";
import * as dns from "dns";
import { promisify } from "util";

const resolveMx = promisify(dns.resolveMx);

export async function GET(request: NextRequest) {
  try {
    const domain = request.nextUrl.searchParams.get("domain");

    if (!domain) {
      return NextResponse.json({ error: "Domain required" }, { status: 400 });
    }

    try {
      const records = await resolveMx(domain);
      const hasMX = records && records.length > 0;

      return NextResponse.json({ hasMX, recordCount: records?.length || 0 });
    } catch (err) {
      return NextResponse.json({ hasMX: false, error: "MX lookup failed" }, { status: 200 });
    }
  } catch (error) {
    console.error("[CHECK-MX] Error:", error);
    return NextResponse.json(
      { error: "Server error", hasMX: false },
      { status: 500 }
    );
  }
}
