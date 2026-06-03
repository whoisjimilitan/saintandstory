"use client";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  issuedAt: string;
  paidAt?: string;
}

interface EarningsData {
  today: number;
  week: number;
  month: number;
  pending: number;
  paid: number;
  invoices: Invoice[];
}

export default function DriverEarnings({ data }: { data: EarningsData }) {
  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0D0D0D] text-white rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#888888]">Today</p>
          <p className="font-black text-2xl mt-2">£{data.today}</p>
        </div>
        <div className="bg-[#F5F5F5] rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#888888]">This Week</p>
          <p className="font-black text-2xl mt-2">£{data.week}</p>
        </div>
        <div className="bg-[#F5F5F5] rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#888888]">This Month</p>
          <p className="font-black text-2xl mt-2">£{data.month}</p>
        </div>
        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#888888]">Pending</p>
          <p className="font-black text-2xl mt-2 text-[#0D0D0D]">£{data.pending}</p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-[#F5F5F5] rounded-xl p-3">
          <p className="text-[#888888] text-[10px] font-semibold uppercase">Pending Payment</p>
          <p className="font-black text-[#0D0D0D] mt-1">{data.invoices.filter(i => i.status === "pending").length}</p>
        </div>
        <div className="bg-[#F5F5F5] rounded-xl p-3">
          <p className="text-[#888888] text-[10px] font-semibold uppercase">Paid</p>
          <p className="font-black text-[#0D0D0D] mt-1">{data.invoices.filter(i => i.status === "paid").length}</p>
        </div>
      </div>

      {/* Recent Invoices */}
      {data.invoices.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888]">Recent Invoices</p>
          {data.invoices.slice(0, 5).map((invoice) => (
            <div key={invoice.id} className="bg-white border border-[#E8E8E8] rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="font-semibold text-[#0D0D0D] text-sm">{invoice.invoiceNumber}</p>
                <p className="text-[#888888] text-xs">{new Date(invoice.issuedAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-[#0D0D0D]">£{invoice.amount}</p>
                <p className={`text-[10px] font-semibold uppercase ${invoice.status === "paid" ? "text-green-600" : "text-[#888888]"}`}>
                  {invoice.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
