import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";

async function getDriverId(clerkUserId: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT id FROM drivers WHERE clerk_user_id = ${clerkUserId} LIMIT 1`;
  return (rows[0]?.id as string) ?? null;
}

async function getAvailableDates(driverId: string): Promise<string[]> {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT available_date::TEXT FROM driver_availability
    WHERE driver_id = ${driverId}
      AND available_date >= CURRENT_DATE
    ORDER BY available_date
  `;
  return rows.map((r) => r.available_date as string);
}

export default async function AvailabilityPage() {
  const { userId } = await auth();
  if (!userId || !process.env.DATABASE_URL) return null;

  const driverId = await getDriverId(userId);
  const dates = driverId ? await getAvailableDates(driverId) : [];

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-1">Availability</p>
      <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-2">
        When are y<span className="font-display italic font-normal">o</span>u free?
      </h1>
      <p className="text-[#888888] text-sm mb-8">Tap a date to mark yourself available. Our customers get your profile on those days.</p>

      {driverId ? (
        <AvailabilityCalendar driverId={driverId} initialDates={dates} />
      ) : (
        <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-6 text-center">
          <p className="text-[#888888] text-sm">No driver profile linked to this account.</p>
        </div>
      )}
    </div>
  );
}
