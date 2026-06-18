"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardView } from "./views/DashboardView";
import { DiscoverView } from "./views/DiscoverView";
import { ProspectsView } from "./views/ProspectsView";
import { InboxView } from "./views/InboxView";
import { AddLeadView } from "./views/AddLeadView";
import { ImportView } from "./views/ImportView";
import { LeadsView } from "./views/LeadsView";
import { SettingsView } from "./views/SettingsView";
import { LearningView } from "./views/LearningView";
import { ResponsesView } from "./views/ResponsesView";

export default function B2BPage() {
  const searchParams = useSearchParams();
  const [module, setModule] = useState("dashboard");

  useEffect(() => {
    const m = searchParams.get("module") || "dashboard";
    setModule(m);
  }, [searchParams]);

  const renderModule = () => {
    switch (module) {
      case "add-lead":
        return <AddLeadView />;
      case "import":
        return <ImportView />;
      case "responses":
        return <ResponsesView />;
      case "leads":
        return <LeadsView />;
      case "settings":
        return <SettingsView />;
      case "learning":
        return <LearningView />;
      case "discover":
        return <DiscoverView />;
      case "prospects":
        return <ProspectsView />;
      case "inbox":
        return <InboxView />;
      case "dashboard":
      default:
        return <DashboardView />;
    }
  };

  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      {renderModule()}
    </Suspense>
  );
}
