import { OperatorJourneyNav } from "./components/OperatorJourneyNav";

export const metadata = {
  title: "Operator — Saint & Story",
  description: "B2B operator platform for prospect discovery and outreach",
};

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white min-h-screen">
      {/* Journey Navigation */}
      <OperatorJourneyNav />

      {/* Main Content */}
      <main className="pt-20 pb-16 bg-white">
        <div className="mx-auto px-8" style={{ maxWidth: "1200px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
