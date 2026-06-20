/**
 * Reusable components for refined briefing design
 * Premium, minimal, typography-led
 */

interface MetricProps {
  value: number;
  label: string;
}

export function Metric({ value, label }: MetricProps) {
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-lg p-6">
      <p className="text-4xl font-black text-[#0D0D0D] mb-3">{value}</p>
      <p className="text-xs font-semibold text-[#888888] uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

interface SectionHeaderProps {
  icon?: string;
  title: string;
  description: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-wide mb-2">
        {title}
      </h2>
      <p className="text-sm text-[#888888]">{description}</p>
    </div>
  );
}

interface PriorityItemProps {
  title: string;
  subtitle: string;
  meta?: string;
  actionLabel?: string;
}

export function PriorityItem({
  title,
  subtitle,
  meta,
  actionLabel = "Review",
}: PriorityItemProps) {
  return (
    <div className="border-b border-[#E8E8E8] py-4 last:border-b-0 flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#0D0D0D] mb-1">{title}</p>
        <p className="text-xs text-[#888888]">{subtitle}</p>
        {meta && <p className="text-xs text-[#C9C9C9] mt-2">{meta}</p>}
      </div>
      <button className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors ml-6">
        {actionLabel}
      </button>
    </div>
  );
}

interface InsightCardProps {
  title: string;
  description: string;
  actionLabel?: string;
}

export function InsightCard({
  title,
  description,
  actionLabel = "View insight",
}: InsightCardProps) {
  return (
    <div className="bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg p-6">
      <p className="text-sm font-semibold text-[#0D0D0D] mb-2">{title}</p>
      <p className="text-xs text-[#888888] mb-4">{description}</p>
      <button className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors">
        {actionLabel} →
      </button>
    </div>
  );
}

interface PipelineStageProps {
  name: string;
  count: number;
  color: string;
}

export function PipelineStage({ name, count, color }: PipelineStageProps) {
  return (
    <div className="text-center">
      <div className={`w-2 h-2 rounded-full mx-auto mb-2`} style={{ backgroundColor: color }}></div>
      <p className="text-xs font-semibold text-[#0D0D0D] mb-1">{name}</p>
      <p className="text-2xl font-black text-[#0D0D0D] mb-1">{count}</p>
      <p className="text-xs text-[#888888]">{count === 1 ? "item" : "items"}</p>
    </div>
  );
}

export function Divider() {
  return <div className="h-px bg-[#E8E8E8] my-12"></div>;
}
