"use client";

import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";

export default function IntelligenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-white text-[#0D0D0D]">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Navigation />

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
