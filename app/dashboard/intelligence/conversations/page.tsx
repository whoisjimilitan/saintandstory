"use client";

import Link from "next/link";
import { useIntelligence } from "../hooks/useIntelligence";
import {
  MetadataLabel,
  Section,
  EntityCard,
  StatusPill,
  EmptyState,
} from "../components";

export default function ConversationsPage() {
  const { data: conversations, loading } = useIntelligence({
    resource: "conversation",
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* HEADER */}
      <div>
        <MetadataLabel className="mb-1">Intelligence</MetadataLabel>
        <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight">
          Conversations
        </h1>
        <p className="text-sm text-[#888888] mt-2">
          All conversations with prospects and outcomes
        </p>
      </div>

      {/* CONVERSATIONS LIST */}
      <Section>
        {loading ? (
          <p className="text-[#888888] text-sm">Loading conversations...</p>
        ) : Array.isArray(conversations) && conversations.length > 0 ? (
          <div className="space-y-3">
            {conversations.map((conv: any) => (
              <Link
                key={conv.id}
                href={`/dashboard/intelligence/conversations/${conv.id}`}
              >
                <EntityCard
                  title={conv.businessName || conv.name || "Unknown"}
                  subtitle={conv.email}
                  details={[
                    conv.businessCategory || "—",
                    conv.status || "new",
                  ]}
                  status={
                    <StatusPill
                      status={
                        conv.status === "warm"
                          ? "active"
                          : conv.status === "contacted"
                            ? "pending"
                            : "pending"
                      }
                      text={conv.status || "New"}
                    />
                  }
                />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No conversations yet"
            description="Start by exploring opportunities or adding a new prospect"
          />
        )}
      </Section>
    </div>
  );
}
