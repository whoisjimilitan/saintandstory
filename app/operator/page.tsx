"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface WorkflowCard {
  name: string;
  description: string;
  href: string;
  icon?: string;
}

const WORKFLOWS: WorkflowCard[] = [
  {
    name: "Discover Prospects",
    description: "Find companies by location or industry",
    href: "/operator/discover",
  },
  {
    name: "Enrich Companies",
    description: "Complete missing business information",
    href: "/operator/enrich",
  },
  {
    name: "Generate Outreach",
    description: "Create personalised email campaigns",
    href: "/operator/outreach",
  },
  {
    name: "Pipeline",
    description: "Review qualified prospects",
    href: "/operator/pipeline",
  },
  {
    name: "Responses",
    description: "Manage replies and follow-ups",
    href: "/operator/responses",
  },
];

interface ActivityStats {
  prospectsDiscovered: number;
  companiesEnriched: number;
  emailsGenerated: number;
  repliesReceived: number;
}

export default function OperatorHome() {
  const [stats, setStats] = useState<ActivityStats>({
    prospectsDiscovered: 0,
    companiesEnriched: 0,
    emailsGenerated: 0,
    repliesReceived: 0,
  });

  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) {
      setGreeting("Good afternoon");
    } else if (hour >= 18) {
      setGreeting("Good evening");
    }

    // TODO: Fetch real stats from API when backend is ready
    // For now, these are placeholder values
    setStats({
      prospectsDiscovered: 0,
      companiesEnriched: 0,
      emailsGenerated: 0,
      repliesReceived: 0,
    });
  }, []);

  return (
    <div className="px-12 py-10 max-w-5xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-sans font-black text-[#0D0D0D] text-4xl tracking-tight mb-1">
          Operator
        </h1>
        <p className="text-sm text-[#888888]">
          {greeting}, Jim
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E8E8E8] mb-12"></div>

      {/* Start a Workflow Section */}
      <div className="mb-16">
        <h2 className="text-xs font-semibold text-[#888888] uppercase tracking-[0.15em] mb-8">
          Start a workflow
        </h2>

        {/* Workflow Cards Grid */}
        <div className="grid gap-4">
          {WORKFLOWS.map((workflow) => (
            <Link
              key={workflow.href}
              href={workflow.href}
              className="group px-6 py-4 border border-[#E8E8E8] rounded-lg hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-[#0D0D0D] group-hover:text-[#0D0D0D]">
                    {workflow.name}
                  </p>
                  <p className="text-sm text-[#888888] mt-1">
                    {workflow.description}
                  </p>
                </div>
                <div className="ml-4 text-[#C9C9C9] group-hover:text-[#888888] transition-colors">
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E8E8E8] mb-12"></div>

      {/* Today's Activity Section */}
      <div>
        <h2 className="text-xs font-semibold text-[#888888] uppercase tracking-[0.15em] mb-6">
          Today's activity
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <p className="text-sm text-[#0D0D0D]">
              • Prospects discovered
            </p>
            <p className="text-sm font-medium text-[#0D0D0D]">
              {stats.prospectsDiscovered}
            </p>
          </div>
          <div className="flex items-center justify-between py-2">
            <p className="text-sm text-[#0D0D0D]">
              • Companies enriched
            </p>
            <p className="text-sm font-medium text-[#0D0D0D]">
              {stats.companiesEnriched}
            </p>
          </div>
          <div className="flex items-center justify-between py-2">
            <p className="text-sm text-[#0D0D0D]">
              • Emails generated
            </p>
            <p className="text-sm font-medium text-[#0D0D0D]">
              {stats.emailsGenerated}
            </p>
          </div>
          <div className="flex items-center justify-between py-2">
            <p className="text-sm text-[#0D0D0D]">
              • Replies received
            </p>
            <p className="text-sm font-medium text-[#0D0D0D]">
              {stats.repliesReceived}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
