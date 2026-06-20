import { OperatorNav } from "./components/OperatorNav";

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
