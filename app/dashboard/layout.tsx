import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      <DashboardNav />
      <main className="flex-1 md:ml-56 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
