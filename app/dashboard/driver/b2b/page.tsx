import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import Link from "next/link";

async function getDriverDiscoveryMetrics(driverId: string) {
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
    console.error("[B2B Discovery] Error fetching metrics:", error);
    return null;
  }
}

export default async function B2BDiscoveryDashboard() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) redirect("/sign-in");

  const userEmail = user?.emailAddresses[0]?.emailAddress;

  if (!process.env.DATABASE_URL || !userEmail) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-[#888888]">Unable to load B2B discovery dashboard</p>
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
        driver = await getDriverDiscoveryMetrics(driverData[0].id);
      } catch (metricsError) {
        console.error("[B2B Discovery] Error fetching metrics:", metricsError);
        driver = null;
      }
    }
  } catch (error) {
    console.error("[B2B Discovery] Error finding driver:", error);
  }

  if (!driver) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-sans font-black text-3xl text-[#0D0D0D] mb-4">B2B Lead Discovery</h1>
        <p className="text-[#888888] mb-6">You're not registered for B2B lead discovery yet.</p>
        <Link
          href="/driver-discovery/signup"
          className="inline-block bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
          Sign up for lead discovery →
        </Link>
        <p className="text-sm text-[#888888] mt-6">
          Discover B2B prospects in your area, send recognition emails, and earn standing orders.
        </p>
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
        <Link href="/dashboard/driver" className="text-sm text-[#0D0D0D] hover:text-[#888888] mb-4 inline-block">
          ← Back to job dispatch
        </Link>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">B2B Lead Discovery</p>
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
          Prospects in your area are auto-discovered. Recognition emails are sent for businesses matching your coverage radius and showing operational challenges.
        </p>
      </div>
    </div>
  );
}
