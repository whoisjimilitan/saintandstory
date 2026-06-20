"use client";

import { useEffect, useState } from "react";
import {
  getTodaySummary,
  getPriorityQueue,
  getKnowledgeLoop,
  getRecommendations,
  TodaySummary,
  PriorityItem,
  KnowledgeLoopStage,
  Recommendation,
} from "./lib/morning-brief-queries";
import {
  MetricCard,
  PriorityQueueItem,
  KnowledgeLoopStage as KnowledgeLoopStageComponent,
  RecommendationItem,
  SectionDivider,
  SectionHeader,
  LoadingSkeleton,
  EmptyState,
  ErrorState,
} from "./components/MorningBriefComponents";

export default function OperatorHome() {
  const [mounted, setMounted] = useState(false);
  const [summary, setSummary] = useState<TodaySummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [priorityQueue, setPriorityQueue] = useState<PriorityItem[]>([]);
  const [priorityLoading, setPriorityLoading] = useState(true);
  const [priorityError, setPriorityError] = useState<string | null>(null);

  const [knowledgeLoop, setKnowledgeLoop] = useState<KnowledgeLoopStage[]>([]);
  const [knowledgeLoading, setKnowledgeLoading] = useState(true);
  const [knowledgeError, setKnowledgeError] = useState<string | null>(null);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(
    null
  );

  // Hydration check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load all data
  useEffect(() => {
    if (!mounted) return;

    const loadData = async () => {
      try {
        // Load Today's Summary
        setSummaryLoading(true);
        setSummaryError(null);
        const summaryData = await getTodaySummary();
        setSummary(summaryData);
        setSummaryLoading(false);
      } catch (error) {
        setSummaryError("Failed to load summary data");
        setSummaryLoading(false);
        console.error("Summary error:", error);
      }

      try {
        // Load Priority Queue
        setPriorityLoading(true);
        setPriorityError(null);
        const priorityData = await getPriorityQueue();
        setPriorityQueue(priorityData);
        setPriorityLoading(false);
      } catch (error) {
        setPriorityError("Failed to load priority queue");
        setPriorityLoading(false);
        console.error("Priority queue error:", error);
      }

      try {
        // Load Knowledge Loop
        setKnowledgeLoading(true);
        setKnowledgeError(null);
        const knowledgeData = await getKnowledgeLoop();
        setKnowledgeLoop(knowledgeData);
        setKnowledgeLoading(false);
      } catch (error) {
        setKnowledgeError("Failed to load knowledge loop");
        setKnowledgeLoading(false);
        console.error("Knowledge loop error:", error);
      }

      try {
        // Load Recommendations
        setRecommendationsLoading(true);
        setRecommendationsError(null);
        const recommendationData = await getRecommendations();
        setRecommendations(recommendationData);
        setRecommendationsLoading(false);
      } catch (error) {
        setRecommendationsError("Failed to load recommendations");
        setRecommendationsLoading(false);
        console.error("Recommendations error:", error);
      }
    };

    loadData();
  }, [mounted]);

  if (!mounted) return null;

  // Format current date
  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const monthName = today.toLocaleDateString("en-US", { month: "long" });
  const dayNum = today.getDate();
  const dateString = `${dayName}, ${monthName} ${dayNum}`;

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="mx-auto px-6 py-10" style={{ maxWidth: "960px" }}>
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-sans font-black text-[#0D0D0D] text-5xl tracking-tight leading-tight mb-3">
            Morning Brief
          </h1>
          <p className="text-base text-[#888888] font-normal">Good morning.</p>
          <p className="text-sm text-[#C9C9C9] mt-2">{dateString}</p>
        </div>

        <SectionDivider />

        {/* Today's Summary */}
        <section className="mb-16">
          <SectionHeader title="Today's Summary" />

          {summaryLoading ? (
            <LoadingSkeleton lines={2} />
          ) : summaryError ? (
            <ErrorState
              message={summaryError}
              onRetry={() => window.location.reload()}
            />
          ) : summary ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <MetricCard
                value={summary.discovered}
                label="Discovered"
              />
              <MetricCard
                value={summary.enriched}
                label="Enriched"
              />
              <MetricCard
                value={summary.qualified}
                label="Qualified"
              />
              <MetricCard
                value={summary.orders}
                label="Orders"
              />
            </div>
          ) : (
            <EmptyState message="No summary data available." />
          )}
        </section>

        <SectionDivider />

        {/* Priority Queue */}
        <section className="mb-16">
          <SectionHeader title="Priority Queue" />
          <p className="text-sm text-[#888888] mb-8">
            The most important developments requiring attention.
          </p>

          {priorityLoading ? (
            <LoadingSkeleton lines={6} />
          ) : priorityError ? (
            <ErrorState
              message={priorityError}
              onRetry={() => window.location.reload()}
            />
          ) : priorityQueue.length > 0 ? (
            <div className="space-y-0">
              {priorityQueue.map((item, index) => (
                <PriorityQueueItem
                  key={index}
                  theme={item.theme}
                  description={item.description}
                  actionText={item.actionText}
                  actionHref={item.actionHref}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No priority items at this time." />
          )}
        </section>

        <SectionDivider />

        {/* Knowledge Loop */}
        <section className="mb-16">
          <SectionHeader title="Knowledge Loop" />

          {knowledgeLoading ? (
            <LoadingSkeleton lines={2} />
          ) : knowledgeError ? (
            <ErrorState
              message={knowledgeError}
              onRetry={() => window.location.reload()}
            />
          ) : knowledgeLoop.length > 0 ? (
            <div className="flex items-center justify-between gap-4">
              {knowledgeLoop.map((stage, index) => (
                <div key={index} className="flex-1 flex items-center">
                  <KnowledgeLoopStageComponent
                    name={stage.name}
                    count={stage.count}
                  />
                  {index < knowledgeLoop.length - 1 && (
                    <div className="text-[#C9C9C9] font-light px-2 shrink-0">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No stage data available." />
          )}
        </section>

        <SectionDivider />

        {/* Recommendations */}
        <section>
          <SectionHeader title="Recommendations" />

          {recommendationsLoading ? (
            <LoadingSkeleton lines={6} />
          ) : recommendationsError ? (
            <ErrorState
              message={recommendationsError}
              onRetry={() => window.location.reload()}
            />
          ) : recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <RecommendationItem
                  key={index}
                  title={rec.title}
                  description={rec.description}
                  actionText={rec.actionText}
                  actionHref={rec.actionHref}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No recommendations available." />
          )}
        </section>
      </div>
    </div>
  );
}
