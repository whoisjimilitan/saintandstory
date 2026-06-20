/**
 * Reusable components for Morning Brief
 * Used to maintain consistency and reduce duplication
 */

interface MetricCardProps {
  value: number;
  label: string;
}

export function MetricCard({ value, label }: MetricCardProps) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-5xl font-black text-[#0D0D0D] mb-2">{value}</p>
      <p className="text-xs font-semibold text-[#888888] uppercase tracking-[0.15em]">
        {label}
      </p>
    </div>
  );
}

interface PriorityQueueItemProps {
  theme: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export function PriorityQueueItem({
  theme,
  description,
  actionText,
  actionHref,
}: PriorityQueueItemProps) {
  return (
    <div className="pb-6 border-b border-[#E8E8E8] last:border-b-0">
      <p className="text-base font-medium text-[#0D0D0D] mb-2">{theme}</p>
      <p className="text-sm text-[#888888] mb-4">{description}</p>
      {actionText && actionHref && (
        <a
          href={actionHref}
          className="text-sm font-medium text-[#0D0D0D] hover:text-[#666666] transition-colors"
        >
          {actionText}
        </a>
      )}
    </div>
  );
}

interface KnowledgeLoopStageProps {
  name: string;
  count: number;
}

export function KnowledgeLoopStage({ name, count }: KnowledgeLoopStageProps) {
  return (
    <div className="text-center flex-1">
      <p className="text-sm font-medium text-[#0D0D0D] mb-1">{name}</p>
      <p className="text-2xl font-black text-[#0D0D0D]">{count}</p>
    </div>
  );
}

interface RecommendationItemProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export function RecommendationItem({
  title,
  description,
  actionText,
  actionHref,
}: RecommendationItemProps) {
  return (
    <div className="p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded">
      <p className="text-sm font-medium text-[#0D0D0D] mb-2">{title}</p>
      <p className="text-sm text-[#888888] mb-3">{description}</p>
      {actionText && actionHref && (
        <a
          href={actionHref}
          className="text-xs font-medium text-[#0D0D0D] hover:text-[#666666] transition-colors"
        >
          {actionText}
        </a>
      )}
    </div>
  );
}

export function SectionDivider() {
  return <div className="h-px bg-[#E8E8E8] mb-12"></div>;
}

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <h2 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-8">
      {title}
    </h2>
  );
}

interface LoadingSkeletonProps {
  lines?: number;
}

export function LoadingSkeleton({ lines = 3 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-[#E8E8E8] rounded animate-pulse"
        ></div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <p className="text-sm text-[#888888] italic py-8 text-center">{message}</p>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="p-4 bg-[#FEE8E8] border border-[#FCCCC9] rounded">
      <p className="text-sm text-[#8B2323] mb-2">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-medium text-[#8B2323] hover:text-[#6B1B1B] transition-colors underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
