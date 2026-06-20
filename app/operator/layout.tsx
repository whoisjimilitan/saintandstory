import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OperatorNav } from "./components/OperatorNav";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
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
  const user = await currentUser();

  if (!userId) {
    redirect("/sign-in");
  }

  const userEmail = user?.emailAddresses[0]?.emailAddress;
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
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
