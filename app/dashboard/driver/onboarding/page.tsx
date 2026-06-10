import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import VerificationClient from "@/components/VerificationClient";

interface Driver {
  id: string;
  full_name: string;
  verification_status: string;
  verification_photo_url: string | null;
  verification_submitted_at: string | null;
}

async function getDriver(userId: string): Promise<Driver | null> {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT * FROM drivers WHERE clerk_user_id = ${userId} LIMIT 1`;
    return rows[0] as Driver | null;
  } catch {
    return null;
  }
}

export default async function VerificationPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const driver = await getDriver(userId);

  if (!driver) {
    redirect("/dashboard/driver");
  }

  // If already approved, redirect to dashboard
  if (driver.verification_status === "approved") {
    redirect("/dashboard/driver");
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-1">
          Verification
        </p>
        <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight">
          Before your first job.
        </h1>
      </div>

      <div className="bg-white border border-[#E8E8E8] rounded-2xl px-5 py-6 space-y-5">
        <p className="text-[#888888] text-sm">
          We need to verify your identity before you can accept jobs.
        </p>

        {driver.verification_status === "rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-red-700 text-sm font-semibold mb-4">Verification rejected. Please try again.</p>
            <VerificationClient photoType="verification" label="Take Photo Again" />
          </div>
        )}

        {driver.verification_status === "pending" && driver.verification_photo_url && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
              <p className="text-yellow-700 text-sm font-semibold">Photo submitted. Awaiting review.</p>
            </div>
            <img src={driver.verification_photo_url} alt="Verification" className="w-full rounded-lg" />
            <p className="text-[#888888] text-xs text-center">
              Submitted on {driver.verification_submitted_at ? new Date(driver.verification_submitted_at).toLocaleDateString() : "pending"}
            </p>
          </div>
        )}

        {driver.verification_status === "pending" && !driver.verification_photo_url && (
          <VerificationClient photoType="verification" label="Take Verification Photo" />
        )}

        {!driver.verification_photo_url && driver.verification_status !== "rejected" && driver.verification_status !== "pending" && (
          <VerificationClient photoType="verification" label="Take Verification Photo" />
        )}
      </div>
    </div>
  );
}
