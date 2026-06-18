"use client";

import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { ContextPanel } from "./components/ContextPanel";

interface SelectedProspect {
  id: string;
  businessName: string;
  businessCategory: string;
  email: string;
  phone?: string;
  status: string;
  leadState?: string;
  conversationEvents: Array<{
    id: string;
    type: string;
    direction: string;
    subject?: string;
    body?: string;
    createdAt: string;
  }>;
}

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  const [selectedProspect, setSelectedProspect] = useState<SelectedProspect | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* SIDEBAR */}
      <Sidebar />

      <div className="flex flex-col flex-1">
        {/* TOP BAR */}
        <TopBar />

        {/* MAIN GRID: WORKSPACE + CONTEXT PANEL */}
        <div className="flex flex-1 overflow-hidden gap-px bg-[#1C1C1C]">
          {/* WORKSPACE (Main Content) */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>

          {/* CONTEXT PANEL (Right Side) */}
          <ContextPanel
            prospect={selectedProspect}
            onProspectSelect={setSelectedProspect}
            refreshTrigger={refreshTrigger}
            onRefresh={triggerRefresh}
          />
        </div>
      </div>
    </div>
  );
}
