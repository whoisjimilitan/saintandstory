import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";

async function getDriverMetrics(driverId: string) {
  if (!process.env.DATABASE_URL) return null;

  const sql = neon(process.env.DATABASE_URL);

  try {
    const result = await sql`
      SELECT
        d.id,
        d.name,
        d.email,
        d.postcode,
        d.latitude,
        d.longitude,
        d.radius_miles,
        d.vehicle_type,
        d.available_days,
        d.created_at,
        COUNT(DISTINCT bl.id) as leads_discovered,
        COUNT(DISTINCT CASE WHEN bl.email_sent_at IS NOT NULL THEN bl.id END) as emails_sent,
        COUNT(DISTINCT so.id) as standing_orders_created,
        COUNT(DISTINCT j.id) as jobs_generated,
        COALESCE(SUM(so.price), 0) as revenue_estimate
      FROM drivers d
      LEFT JOIN b2b_leads bl ON bl.driver_id = d.id
      LEFT JOIN b2b_standing_orders so ON so.lead_id = bl.id
      LEFT JOIN jobs j ON j.lead_id = bl.id
      WHERE d.id = ${driverId}
      GROUP BY d.id, d.name, d.email, d.postcode, d.latitude, d.longitude, d.radius_miles, d.vehicle_type, d.available_days, d.created_at
    `;

    return result[0];
  } catch (error) {
    console.error("[Driver Dashboard] Error fetching metrics:", error);
    return null;
  }
}

export default async function DriverDashboard() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) redirect("/sign-in");

  const userEmail = user?.emailAddresses[0]?.emailAddress;

  // If DATABASE_URL not set, render empty state instead of crashing
  if (!process.env.DATABASE_URL) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-sans font-black text-3xl text-[#0D0D0D] mb-4">Driver Dashboard</h1>
        <p className="text-[#888888] mb-6">Database connection not configured. Contact support.</p>
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-sans font-black text-3xl text-[#0D0D0D] mb-4">Driver Dashboard</h1>
        <p className="text-[#888888] mb-6">Unable to determine your email. Please sign in again.</p>
      </div>
    );
  }

  const sql = neon(process.env.DATABASE_URL);

  let driver: any = null;
  try {
    const driverData = await sql`
      SELECT id FROM drivers WHERE email = ${userEmail} LIMIT 1
    `;
    if (driverData.length > 0) {
      try {
        driver = await getDriverMetrics(driverData[0].id);
      } catch (metricsError) {
        console.error("[Driver Dashboard] Error fetching metrics:", metricsError);
        // Return null - will show "not registered" fallback
        driver = null;
      }
    }
  } catch (error) {
    console.error("[Driver Dashboard] Error finding driver:", error);
    // If DB query fails, show error state instead of crashing
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-sans font-black text-3xl text-[#0D0D0D] mb-4">Driver Dashboard</h1>
        <p className="text-[#888888] mb-6">Unable to load driver data. Please try again later.</p>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-sans font-black text-3xl text-[#0D0D0D] mb-4">Driver Dashboard</h1>
        <p className="text-[#888888] mb-6">You're not registered as a driver yet.</p>
        <a
          href="/drivers/signup"
          className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
          Sign up as driver →
        </a>
      </div>
    );
  }

  const conversionRate =
    driver.emails_sent > 0
      ? Math.round((driver.standing_orders_created / driver.emails_sent) * 100)
      : 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">Driver</p>
        <h1 className="font-sans font-black text-3xl text-[#0D0D0D]">{driver.name}</h1>
      </div>

      <div className="mb-8 border border-[#E8E8E8] rounded-xl p-6">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">Coverage Area</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[#888888] mb-1">Postcode</p>
            <p className="text-lg font-bold text-[#0D0D0D]">{driver.postcode}</p>
          </div>
          <div>
            <p className="text-sm text-[#888888] mb-1">Service Radius</p>
            <p className="text-lg font-bold text-[#0D0D0D]">{driver.radius_miles} miles</p>
          </div>
          {driver.vehicle_type && (
            <div>
              <p className="text-sm text-[#888888] mb-1">Vehicle</p>
              <p className="text-lg font-bold text-[#0D0D0D]">{driver.vehicle_type}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="border border-[#E8E8E8] rounded-xl p-4">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.1em] mb-2">Leads Discovered</p>
          <p className="text-3xl font-black text-[#0D0D0D]">{driver.leads_discovered}</p>
          <p className="text-xs text-[#AAAAAA] mt-1">in your radius</p>
        </div>

        <div className="border border-[#E8E8E8] rounded-xl p-4">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.1em] mb-2">Emails Sent</p>
          <p className="text-3xl font-black text-[#0D0D0D]">{driver.emails_sent}</p>
          <p className="text-xs text-[#AAAAAA] mt-1">recognition outreach</p>
        </div>

        <div className="border border-[#E8E8E8] rounded-xl p-4">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.1em] mb-2">Conversion</p>
          <p className="text-3xl font-black text-[#0D0D0D]">{conversionRate}%</p>
          <p className="text-xs text-[#AAAAAA] mt-1">email to order</p>
        </div>

        <div className="border border-[#E8E8E8] rounded-xl p-4">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.1em] mb-2">Standing Orders</p>
          <p className="text-3xl font-black text-[#0D0D0D]">{driver.standing_orders_created}</p>
          <p className="text-xs text-[#AAAAAA] mt-1">active agreements</p>
        </div>

        <div className="border border-[#E8E8E8] rounded-xl p-4">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.1em] mb-2">Jobs Generated</p>
          <p className="text-3xl font-black text-[#0D0D0D]">{driver.jobs_generated}</p>
          <p className="text-xs text-[#AAAAAA] mt-1">completed/scheduled</p>
        </div>

        <div className="border border-[#E8E8E8] rounded-xl p-4">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.1em] mb-2">Revenue Est.</p>
          <p className="text-3xl font-black text-[#0D0D0D]">£{Math.round(driver.revenue_estimate)}</p>
          <p className="text-xs text-[#AAAAAA] mt-1">from standing orders</p>
        </div>
      </div>

      <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl p-6">
        <p className="text-sm text-[#0D0D0D] mb-4">
          New leads in your area are discovered automatically. Emails are sent to prospects matching your coverage radius.
        </p>
        <a
          href="/dashboard/driver/settings"
          className="inline-block text-sm font-semibold text-[#0D0D0D] hover:text-[#0D0D0D] border border-[#0D0D0D] px-4 py-2 rounded-full transition-colors"
        >
          Update coverage settings →
        </a>
      </div>
    </div>
  );
}
