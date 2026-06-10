import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import Link from "next/link";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

interface Driver {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  verification_status: string;
  verification_photo_url: string | null;
  verification_submitted_at: string | null;
  verification_approved_at: string | null;
  profile_live: boolean;
}

async function getUnverifiedDrivers(): Promise<Driver[]> {
  if (!process.env.DATABASE_URL) return [];
  const sql = neon(process.env.DATABASE_URL);

  try {
    const result = await sql`
      SELECT id, full_name, email, phone, vehicle_type, verification_status,
             verification_photo_url, verification_submitted_at, verification_approved_at, profile_live
      FROM drivers
      WHERE verification_status IN ('pending', 'rejected')
      ORDER BY verification_submitted_at DESC NULLS LAST
      LIMIT 100
    `;
    return result as Driver[];
  } catch (error) {
    console.error("[Admin] getUnverifiedDrivers error:", error);
    return [];
  }
}

async function approveDriver(driverId: string) {
  if (!process.env.DATABASE_URL) return;
  const sql = neon(process.env.DATABASE_URL);

  try {
    await sql`
      UPDATE drivers
      SET verification_status = 'approved',
          verification_approved_at = NOW()
      WHERE id = ${driverId}
    `;
  } catch (error) {
    console.error("[Admin] approveDriver error:", error);
  }
}

async function rejectDriver(driverId: string, notes: string) {
  if (!process.env.DATABASE_URL) return;
  const sql = neon(process.env.DATABASE_URL);

  try {
    await sql`
      UPDATE drivers
      SET verification_status = 'rejected',
          verification_notes = ${notes}
      WHERE id = ${driverId}
    `;
  } catch (error) {
    console.error("[Admin] rejectDriver error:", error);
  }
}

export default async function DriverVerificationPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) redirect("/sign-in");

  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) redirect("/dashboard/driver");

  const drivers = await getUnverifiedDrivers();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-1">
            Admin
          </p>
          <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight">
            Driver Verification.
          </h1>
        </div>
        <Link
          href="/dashboard/admin"
          className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.15em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full"
        >
          ← Back
        </Link>
      </div>

      {drivers.length === 0 ? (
        <div className="bg-white border border-[#E8E8E8] rounded-2xl px-5 py-8 text-center">
          <p className="text-[#888888] text-sm">All drivers verified ✓</p>
        </div>
      ) : (
        <div className="space-y-4">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-white border border-[#E8E8E8] rounded-2xl px-5 py-5"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="font-sans font-bold text-[#0D0D0D] text-base">
                    {driver.full_name}
                  </h3>
                  <p className="text-[#888888] text-xs mt-1">{driver.email}</p>
                  <p className="text-[#888888] text-xs">
                    {driver.vehicle_type} • {driver.phone}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.1em] ${
                        driver.verification_status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {driver.verification_status === "pending"
                        ? "Pending"
                        : "Rejected"}
                    </span>
                    {driver.verification_submitted_at && (
                      <span className="text-[#888888] text-[10px]">
                        {new Date(driver.verification_submitted_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {driver.verification_photo_url && (
                  <img
                    src={driver.verification_photo_url}
                    alt="Verification"
                    className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                  />
                )}
              </div>

              {/* Action buttons */}
              <form className="flex gap-3 pt-4 border-t border-[#E8E8E8]">
                <button
                  formAction={async () => {
                    "use server";
                    await approveDriver(driver.id);
                    redirect("/dashboard/admin/drivers");
                  }}
                  className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  Approve ✓
                </button>
                <button
                  formAction={async () => {
                    "use server";
                    await rejectDriver(driver.id, "Photo not clear. Please resubmit.");
                    redirect("/dashboard/admin/drivers");
                  }}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  Reject ✗
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
