import { Suspense } from 'react';
import { OperatorBriefCard } from '../components/OperatorBriefCard';

/**
 * CLOSED-LOOP DASHBOARD
 *
 * Shows complete prospect funnel from cold → hot
 * Displays action items, gate breakdown, trends
 * Minimal, scannable, operator-first
 */

async function getMetrics() {
  try {
    const res = await fetch('http://localhost:3000/api/b2b/closed-loop-metrics', {
      cache: 'no-store',
    });
    return res.json();
  } catch {
    return {
      data: {
        funnel: {
          gate_1_delivered: 0,
          gate_2_opened: 0,
          gate_3_visited: 0,
          gate_4_replied: 0,
          gate_5_advancing: 0,
          gate_6_hot: 0,
        },
        conversion_rate: 0,
        avg_days_to_hot: 0,
        biggest_drop: { count: 0 },
        week_trend: 0,
      },
    };
  }
}

async function getActionItems() {
  try {
    const res = await fetch('http://localhost:3000/api/b2b/action-items', {
      cache: 'no-store',
    });
    return res.json();
  } catch {
    return { data: { total_count: 0, action_items: [] } };
  }
}

export default async function ClosedLoopDashboard() {
  const metricsResult = await getMetrics();
  const actionItemsResult = await getActionItems();

  const metrics = metricsResult?.data || {};
  const actionItems = actionItemsResult?.data?.action_items || [];

  const funnel = metrics.funnel || {};
  const conversionRate = (metrics.conversion_rate * 100).toFixed(1);
  const weekTrend = (metrics.week_trend * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-12">
        <h1 className="text-4xl font-serif font-bold mb-2">Closed Loop</h1>
        <p className="text-gray-600">Cold prospect → Hot prospect pipeline</p>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* SECTION 1: Funnel (Immediate) */}
        <section className="mb-20">
          <h2 className="text-xs uppercase text-gray-500 tracking-wider mb-6">Conversion Funnel</h2>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-6">
            {/* Funnel Visualization */}
            <div className="space-y-3 mb-8">
              <FunnelBar
                label="Gate 1: Delivered"
                count={funnel.gate_1_delivered}
                percentage={100}
              />
              <FunnelBar
                label="Gate 2: Opened (72h)"
                count={funnel.gate_2_opened}
                percentage={(funnel.gate_2_opened / funnel.gate_1_delivered) * 100}
              />
              <FunnelBar
                label="Gate 3: Visited (24h)"
                count={funnel.gate_3_visited}
                percentage={(funnel.gate_3_visited / funnel.gate_1_delivered) * 100}
                warning={true}
              />
              <FunnelBar
                label="Gate 4: Replied"
                count={funnel.gate_4_replied}
                percentage={(funnel.gate_4_replied / funnel.gate_1_delivered) * 100}
              />
              <FunnelBar
                label="Gate 5: Advancing (48h)"
                count={funnel.gate_5_advancing}
                percentage={(funnel.gate_5_advancing / funnel.gate_1_delivered) * 100}
              />
              <FunnelBar
                label="Gate 6: Hot 🔥"
                count={funnel.gate_6_hot}
                percentage={(funnel.gate_6_hot / funnel.gate_1_delivered) * 100}
                hot={true}
              />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-8 pt-6 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                <p className="text-3xl font-serif font-bold">{conversionRate}%</p>
                <p className="text-xs text-gray-500 mt-1">cold → standing order</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Days to Hot</p>
                <p className="text-3xl font-serif font-bold">{metrics.avg_days_to_hot?.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-1">days</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Week Trend</p>
                <p className="text-3xl font-serif font-bold text-green-600">↑ {weekTrend}%</p>
                <p className="text-xs text-gray-500 mt-1">vs last week</p>
              </div>
            </div>
          </div>

          {/* Biggest Drop Alert */}
          {metrics.biggest_drop?.count > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900">
                💡 <strong>Biggest drop:</strong> Gate {metrics.biggest_drop.from_gate} → {metrics.biggest_drop.to_gate}
                ({metrics.biggest_drop.count} prospects)
              </p>
            </div>
          )}
        </section>

        {/* SECTION 2: Action Items (What to do now) */}
        <section className="mb-20">
          <h2 className="text-xs uppercase text-gray-500 tracking-wider mb-6">Action Needed Today</h2>

          <div className="space-y-4">
            {actionItems.map((item: any) => (
              <ActionItem key={item.prospect_id} item={item} />
            ))}
          </div>

          {actionItems.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No action items today</p>
            </div>
          )}
        </section>

        {/* SECTION 3: Gate Breakdown (Details, Expandable) */}
        <section>
          <details className="group">
            <summary className="cursor-pointer text-xs uppercase text-gray-500 tracking-wider hover:text-gray-700">
              ▼ Gate Progression Details
            </summary>

            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
              <GateDetail label="Gate 1: Email Delivered" count={funnel.gate_1_delivered} total={funnel.gate_1_delivered} />
              <GateDetail label="Gate 2: Email Opened (72h)" count={funnel.gate_2_opened} total={funnel.gate_1_delivered} />
              <GateDetail label="Gate 3: Page Visited (24h)" count={funnel.gate_3_visited} total={funnel.gate_1_delivered} />
              <GateDetail label="Gate 4: Prospect Replied" count={funnel.gate_4_replied} total={funnel.gate_1_delivered} />
              <GateDetail label="Gate 5: Conversation Advancing (48h)" count={funnel.gate_5_advancing} total={funnel.gate_1_delivered} />
              <GateDetail label="Gate 6: Standing Order (HOT) 🔥" count={funnel.gate_6_hot} total={funnel.gate_1_delivered} />
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}

function FunnelBar({
  label,
  count,
  percentage,
  warning = false,
  hot = false,
}: {
  label: string;
  count: number;
  percentage: number;
  warning?: boolean;
  hot?: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <span className="text-sm text-gray-600">
          {count}/{100} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded overflow-hidden">
        <div
          className={`h-full transition-all ${
            hot
              ? 'bg-green-600'
              : warning
                ? 'bg-amber-400'
                : 'bg-gray-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function GateDetail({ label, count, total }: { label: string; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-700">{label}</span>
      <span className="text-sm font-medium text-gray-900">
        {count}/{total} ({percentage.toFixed(0)}%)
      </span>
    </div>
  );
}

function ActionItem({ item }: { item: any }) {
  const urgencyColor: Record<string, string> = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-amber-200 bg-amber-50',
    low: 'border-gray-200 bg-gray-50',
  };

  const actionIcon: Record<string, string> = {
    follow_up_1: '📧',
    follow_up_2: '⏰',
    follow_up_3: '📞',
    operator_brief: '💬',
  };

  return (
    <div className={`border rounded-lg p-4 ${urgencyColor[item.urgency] || 'border-gray-200 bg-gray-50'}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{actionIcon[item.action_needed]}</span>
            <div>
              <p className="font-medium text-gray-900">{item.prospect_name}</p>
              <p className="text-sm text-gray-600">{item.action_label}</p>
            </div>
          </div>
          {item.reply_preview && (
            <p className="text-sm text-gray-600 mt-2 italic">"{item.reply_preview}"</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{item.days_in_gate}d in gate</p>
          <button className="mt-2 px-3 py-1 bg-gray-900 text-white text-xs rounded hover:bg-gray-800">
            Action
          </button>
        </div>
      </div>
    </div>
  );
}
