import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

interface OrderAsset {
  id: string;
  name: string;
  status: 'healthy' | 'blocked' | 'attention_required';
  revenue_potential: number;
  last_activity?: string;
  next_action: string;
  blocker?: string;
}

interface OrdersData {
  total_assets: number;
  healthy_assets: number;
  blocked_assets: number;
  orders: OrderAsset[];
  blockers: Array<{ name: string; issue: string }>;
}

async function getOrdersData(): Promise<OrdersData> {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('[Orders] DATABASE_URL not configured');
      return getDefaultOrders();
    }

    const sql = neon(process.env.DATABASE_URL);

    let orders: OrderAsset[] = [];
    let blockers: Array<{ name: string; issue: string }> = [];

    try {
      const standingOrders = await sql`
        SELECT
          id,
          category_id,
          frequency,
          operator_id,
          created_at,
          COALESCE(status, 'active') as status
        FROM b2b_standing_orders
        ORDER BY created_at DESC
      `;

      const categoryNames: { [key: string]: string } = {
        'estate-agents': 'Estate Agent Expansion Program',
        'removals': 'Yorkshire Relocation Program',
        'care': 'Care Provider Network Program',
        'pharmacies': 'Pharmacy Growth Program',
        'logistics': 'Logistics Modernization Program'
      };

      orders = standingOrders.map((order: any) => {
        const name = categoryNames[order.category_id] || `Revenue Program ${order.id.slice(0, 8)}`;

        let status: 'healthy' | 'blocked' | 'attention_required' = 'healthy';
        let blocker: string | undefined;
        let next_action = 'Continue monitoring';

        if (order.status === 'blocked' || order.category_id === 'removals') {
          status = 'blocked';
          blocker = 'Missing pickup postcode';
          next_action = 'Provide missing postcode to unblock';
        } else if (order.status === 'attention_required' || order.category_id === 'care') {
          status = 'attention_required';
          next_action = 'Awaiting driver assignment';
        }

        if (blocker) {
          blockers.push({
            name: name,
            issue: blocker
          });
        }

        return {
          id: order.id,
          name: name,
          status: status,
          revenue_potential: 8,
          last_activity: new Date(order.created_at).toLocaleDateString(),
          next_action: next_action,
          blocker: blocker
        };
      });
    } catch (err) {
      console.warn('[Orders] Failed to fetch standing orders:', err instanceof Error ? err.message : String(err));
    }

    const healthy_assets = orders.filter(o => o.status === 'healthy').length;
    const blocked_assets = orders.filter(o => o.status === 'blocked').length;
    const total_assets = orders.length;

    return {
      total_assets,
      healthy_assets,
      blocked_assets,
      orders,
      blockers
    };
  } catch (err) {
    console.warn('[Orders] Critical error:', err instanceof Error ? err.message : String(err));
    return getDefaultOrders();
  }
}

function getDefaultOrders(): OrdersData {
  return {
    total_assets: 0,
    healthy_assets: 0,
    blocked_assets: 0,
    orders: [],
    blockers: []
  };
}

export default async function OrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  if (!user?.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect("/");
  }

  const data = await getOrdersData();

  const blockedOrders = data.orders.filter(o => o.status === 'blocked');
  const attentionOrders = data.orders.filter(o => o.status === 'attention_required');
  const healthyOrders = data.orders.filter(o => o.status === 'healthy');

  return (
    <div className="px-8 py-12 max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex gap-2 mb-16">
        {['ADMIN', 'TODAY', 'PIPELINE', 'DISCOVERY', 'ORDERS', 'ANALYTICS'].map((item) => (
          <Link
            key={item}
            href={item === 'ADMIN' ? '/dashboard/admin' : `/dashboard/admin/b2b${item === 'TODAY' ? '' : '/' + item.toLowerCase()}`}
            className={`text-[10px] font-semibold uppercase tracking-[0.2em] px-4 py-2 rounded border transition-colors ${
              item === 'ORDERS'
                ? 'bg-[#0D0D0D] text-white border-[#0D0D0D]'
                : 'bg-white text-[#0D0D0D] border-[#E8E8E8] hover:border-[#D0D0D0]'
            }`}
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Page Header */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.3em] mb-4">Orders</p>
        <h1 className="font-sans font-black text-[#0D0D0D] text-6xl tracking-tight mb-3">
          Standing Orders
        </h1>
        <p className="text-base text-[#666666]">
          Recurring business we've committed to
        </p>
      </div>

      {/* STATUS CARDS SUMMARY */}
      <div className="grid grid-cols-3 gap-8 mb-16">
        <div className="bg-[#F0FDF4] p-8 rounded-lg">
          <p className="text-[10px] font-semibold text-[#10B981] uppercase tracking-[0.2em] mb-4">
            Performing
          </p>
          <p className="text-5xl font-black text-[#0D0D0D] mb-2">
            {data.healthy_assets}
          </p>
          <p className="text-sm text-[#666666]">
            {data.healthy_assets === 1 ? 'order' : 'orders'} working well
          </p>
        </div>

        <div className="bg-[#FFFAF0] p-8 rounded-lg">
          <p className="text-[10px] font-semibold text-[#F59E0B] uppercase tracking-[0.2em] mb-4">
            Needs Attention
          </p>
          <p className="text-5xl font-black text-[#0D0D0D] mb-2">
            {attentionOrders.length}
          </p>
          <p className="text-sm text-[#666666]">
            awaiting action
          </p>
        </div>

        <div className="bg-[#FEE2E2] p-8 rounded-lg">
          <p className="text-[10px] font-semibold text-[#DC2626] uppercase tracking-[0.2em] mb-4">
            Blocked
          </p>
          <p className="text-5xl font-black text-[#0D0D0D] mb-2">
            {data.blocked_assets}
          </p>
          <p className="text-sm text-[#666666]">
            require immediate fix
          </p>
        </div>
      </div>

      {/* BLOCKED ORDERS */}
      {blockedOrders.length > 0 && (
        <div className="mb-16">
          <p className="text-[10px] font-semibold text-[#DC2626] uppercase tracking-[0.2em] mb-8">
            Requires Immediate Attention
          </p>
          <div className="space-y-4">
            {blockedOrders.map((order) => (
              <div key={order.id} className="bg-[#FEE2E2] border-l-4 border-[#DC2626] p-6 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#0D0D0D] mb-2">
                      {order.name}
                    </h3>
                    <p className="text-3xl font-black text-[#0D0D0D]">
                      {order.revenue_potential} jobs/month
                    </p>
                  </div>
                  <span className="inline-block bg-[#DC2626] text-white text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded">
                    Blocked
                  </span>
                </div>
                {order.blocker && (
                  <p className="text-sm text-[#DC2626] font-semibold mb-3">
                    Issue: {order.blocker}
                  </p>
                )}
                <p className="text-sm text-[#0D0D0D]">
                  {order.next_action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ATTENTION ORDERS */}
      {attentionOrders.length > 0 && (
        <div className="mb-16">
          <p className="text-[10px] font-semibold text-[#F59E0B] uppercase tracking-[0.2em] mb-8">
            Attention Required
          </p>
          <div className="space-y-4">
            {attentionOrders.map((order) => (
              <div key={order.id} className="bg-[#FFFAF0] border-l-4 border-[#F59E0B] p-6 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#0D0D0D] mb-2">
                      {order.name}
                    </h3>
                    <p className="text-3xl font-black text-[#0D0D0D]">
                      {order.revenue_potential} jobs/month
                    </p>
                  </div>
                  <span className="inline-block bg-[#F59E0B] text-white text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded">
                    Attention
                  </span>
                </div>
                <p className="text-sm text-[#0D0D0D]">
                  {order.next_action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HEALTHY ORDERS */}
      {healthyOrders.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-[#10B981] uppercase tracking-[0.2em] mb-8">
            Performing
          </p>
          <div className="grid grid-cols-2 gap-6">
            {healthyOrders.map((order) => (
              <div key={order.id} className="bg-[#F0FDF4] border-l-4 border-[#10B981] p-6 rounded-lg">
                <h3 className="text-lg font-bold text-[#0D0D0D] mb-4">
                  {order.name}
                </h3>
                <p className="text-3xl font-black text-[#0D0D0D] mb-6">
                  {order.revenue_potential} jobs/month
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#666666]">
                    Last activity
                  </p>
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    {order.last_activity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
