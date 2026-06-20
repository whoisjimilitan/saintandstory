import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OperatorNav } from "./components/OperatorNav";

const ALLOWED_USERS = [
  "user_3EVExeiSBmgdhAWGzMEb8GMVc62",
  // Add more operator user IDs as needed
];

export const metadata = {
  title: "Operator — Saint & Story",
  description: "B2B operator platform for prospect discovery and outreach",
};

export default async function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!ALLOWED_USERS.includes(userId)) {
    redirect("/sign-in");
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Navigation */}
      <OperatorNav />

      {/* Main Content */}
      <main className="pt-20 pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
