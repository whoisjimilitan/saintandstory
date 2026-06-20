import { OperatorSidebar } from "./components/OperatorSidebar";

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
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <OperatorSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white">
        {children}
      </main>
    </div>
  );
}
