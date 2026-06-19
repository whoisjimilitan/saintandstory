"use client";

import Link from "next/link";
import { useIntelligence } from "../../hooks/useIntelligence";
import {
  MetadataLabel,
  Section,
  Card,
  StatusPill,
  EmptyState,
} from "../../components";
import { use } from "react";

export default function ConversationDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = use(params);
  const { data: conversation, loading } = useIntelligence({
    resource: "conversation",
    id,
  });

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-[#888888] text-sm">Loading conversation...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <EmptyState
          title="Conversation not found"
          description="The conversation you're looking for doesn't exist"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* HEADER WITH BACK */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/intelligence/conversations"
            className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.2em] transition-colors"
          >
            ← Back to Conversations
          </Link>
          <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mt-4">
            {(conversation as any).businessName || (conversation as any).name || "Unknown"}
          </h1>
          <p className="text-sm text-[#888888] mt-1">
            {(conversation as any).email}
          </p>
        </div>
        <StatusPill
          status={
            (conversation as any).status === "warm"
              ? "active"
              : (conversation as any).status === "contacted"
                ? "pending"
                : "pending"
          }
          text={(conversation as any).status || "New"}
        />
      </div>

      {/* CONVERSATION OVERVIEW */}
      <Section title="Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <MetadataLabel className="mb-2">Category</MetadataLabel>
            <p className="font-medium text-[#0D0D0D]">
              {(conversation as any).businessCategory || "—"}
            </p>
          </Card>
          <Card className="p-6">
            <MetadataLabel className="mb-2">Status</MetadataLabel>
            <p className="font-medium text-[#0D0D0D]">
              {(conversation as any).status || "New"}
            </p>
          </Card>
        </div>
      </Section>

      {/* ACTIVITY TIMELINE */}
      <Section title="Activity">
        <EmptyState
          title="No activity yet"
          description="Conversation details will appear here"
        />
      </Section>
    </div>
  );
}
