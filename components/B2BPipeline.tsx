"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { B2B_INDUSTRIES } from "@/lib/b2b-industries";
import { DELIVERY_TYPES } from "@/lib/delivery-types";
import { DELIVERY_FREQUENCIES, AVERAGE_DELIVERIES, COURIER_PROVIDERS, DELIVERY_CHALLENGES } from "@/lib/business-intelligence";

type Lead = Record<string, unknown>;
type Order = Record<string, unknown>;
type Tab = "pipeline" | "discover" | "standing" | "add";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  warm: "Warm",
  inbound: "Inbound",
  closed: "Closed",
  dead: "Dead",
};

const STATUS_STYLE: Record<string, string> = {
  new: "bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]",
  contacted: "bg-[#F5F5F5] text-[#0D0D0D] border border-[#E8E8E8]",
  warm: "bg-[#0D0D0D] text-white",
  inbound: "bg-[#0D0D0D] text-white",
  closed: "bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]",
  dead: "bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]",
};

const UK_CITIES = ["London", "Manchester", "Birmingham", "Leeds", "Liverpool", "Bristol", "Sheffield", "Glasgow", "Edinburgh", "Cardiff", "Newcastle", "Nottingham", "Leicester", "Southampton", "Brighton", "Oxford", "Cambridge", "Reading", "Derby", "Norwich"];

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function LeadCard({ lead, onRefresh }: { lead: Lead; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(lead.status as string);
  const [showStandingOrder, setShowStandingOrder] = useState(false);
  const [soForm, setSoForm] = useState({ price: "", day_of_week: "1", preferred_time: "", notes: "" });

  const hasPainPoint = !!lead.pain_point;

  async function getDraft() {
    setDrafting(true);
    try {
      const res = await fetch(`/api/b2b/outreach?lead_id=${lead.id as string}`);
      const data = await res.json() as { subject: string; body: string };
      setDraft(data);
    } finally {
      setDrafting(false);
    }
  }

  async function sendEmail() {
    if (!draft) return;
    setSending(true);
    try {
      await fetch("/api/b2b/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, subject: draft.subject, body: draft.body }),
      });
      setStatus("contacted");
      setDraft(null);
      onRefresh();
    } finally {
      setSending(false);
    }
  }

  async function updateStatus(newStatus: string) {
    await fetch("/api/b2b/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lead.id, status: newStatus }),
    });
    setStatus(newStatus);
    onRefresh();
  }

  async function createStandingOrder() {
    await fetch("/api/b2b/standing-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_id: lead.id,
        business_name: lead.business_name,
        contact_name: lead.contact_name,
        contact_phone: lead.phone,
        contact_email: lead.email,
        service_type: `${lead.business_category ?? "Logistics"} run`,
        frequency: "weekly",
        day_of_week: parseInt(soForm.day_of_week),
        preferred_time: soForm.preferred_time,
        price: soForm.price ? parseFloat(soForm.price) : undefined,
        notes: soForm.notes,
      }),
    });
    setStatus("closed");
    setShowStandingOrder(false);
    onRefresh();
  }

  const emailMissing = !lead.email;

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-[#F5F5F5] transition-colors"
        onClick={() => { setExpanded(e => !e); if (!expanded && !draft && lead.email) getDraft(); }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-sans font-bold text-[#0D0D0D] text-sm">{lead.business_name as string}</p>
            {hasPainPoint && (
              <span className="text-[10px] font-semibold text-white bg-[#0D0D0D] px-2 py-0.5 rounded-full uppercase tracking-[0.1em]">
                Pain point
              </span>
            )}
            {lead.source === "inbound" && (
              <span className="text-[10px] font-semibold text-[#0D0D0D] bg-[#F5F5F5] border border-[#E8E8E8] px-2 py-0.5 rounded-full uppercase tracking-[0.1em]">
                Inbound
              </span>
            )}
          </div>
          <p className="text-[#888888] text-xs">
            {lead.business_category as string}{lead.delivery_type ? ` · ${lead.delivery_type as string}` : ""}{lead.city ? ` · ${lead.city as string}` : ""}
            {lead.email ? ` · ${lead.email as string}` : " · No email"}
          </p>
          {hasPainPoint && (
            <p className="text-[#888888] text-xs mt-0.5 italic">&ldquo;{(lead.pain_point_review as string)?.slice(0, 80)}…&rdquo;</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.1em] ${STATUS_STYLE[status] ?? STATUS_STYLE.new}`}>
            {STATUS_LABELS[status] ?? status}
          </span>
          {!!lead.created_at && <p className="text-[#888888] text-[10px]">{timeAgo(lead.created_at as string)}</p>}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-[#E8E8E8]">
          {/* Lead details */}
          <div className="grid grid-cols-2 gap-3 py-4">
            {!!lead.phone && (
              <div>
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Phone</p>
                <a href={`tel:${lead.phone as string}`} className="text-[#0D0D0D] text-sm font-semibold hover:underline">{lead.phone as string}</a>
              </div>
            )}
            {!!lead.website && (
              <div>
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Website</p>
                <a href={lead.website as string} target="_blank" rel="noopener noreferrer" className="text-[#0D0D0D] text-sm hover:underline truncate block">{lead.website as string}</a>
              </div>
            )}
            {!!lead.delivery_frequency && (
              <div>
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Frequency</p>
                <p className="text-[#0D0D0D] text-sm">{lead.delivery_frequency as string}</p>
              </div>
            )}
            {!!lead.average_deliveries && (
              <div>
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Avg Deliveries/Month</p>
                <p className="text-[#0D0D0D] text-sm">{lead.average_deliveries as string}</p>
              </div>
            )}
            {!!lead.courier_provider && (
              <div>
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Current Courier</p>
                <p className="text-[#0D0D0D] text-sm">{lead.courier_provider as string}</p>
              </div>
            )}
            {!!lead.delivery_challenge && (
              <div>
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Main Challenge</p>
                <p className="text-[#0D0D0D] text-sm">{lead.delivery_challenge as string}</p>
              </div>
            )}
            {hasPainPoint && (
              <div className="col-span-2">
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Pain point</p>
                <p className="text-[#0D0D0D] text-sm">{lead.pain_point as string}</p>
                {!!lead.pain_point_review && (
                  <p className="text-[#888888] text-xs mt-1 italic">&ldquo;{lead.pain_point_review as string}&rdquo;</p>
                )}
              </div>
            )}
          </div>

          {/* Email draft */}
          {emailMissing ? (
            <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl px-4 py-3 mb-4">
              <p className="text-[#888888] text-xs">No email on file. Add one below to enable outreach.</p>
            </div>
          ) : draft ? (
            <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl p-4 mb-4 space-y-2">
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.15em]">Draft email</p>
              <input
                value={draft.subject}
                onChange={e => setDraft(d => d ? { ...d, subject: e.target.value } : d)}
                className="w-full text-sm font-semibold text-[#0D0D0D] bg-transparent focus:outline-none border-b border-[#E8E8E8] pb-1"
              />
              <textarea
                value={draft.body}
                onChange={e => setDraft(d => d ? { ...d, body: e.target.value } : d)}
                rows={4}
                className="w-full text-sm text-[#0D0D0D] bg-transparent focus:outline-none resize-none"
              />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={sendEmail}
                  disabled={sending}
                  className="bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold px-5 py-1.5 rounded-full text-xs transition-colors"
                >
                  {sending ? "Sending…" : "Send →"}
                </button>
                <button onClick={getDraft} className="text-[#888888] text-xs hover:text-[#0D0D0D] transition-colors">
                  Regenerate
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={getDraft}
              disabled={drafting}
              className="w-full bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold py-2.5 rounded-full text-xs transition-colors mb-4"
            >
              {drafting ? "Drafting…" : "Draft email →"}
            </button>
          )}

          {/* Standing order */}
          {showStandingOrder ? (
            <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl p-4 mb-4 space-y-2">
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.15em]">Create standing order</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Price (£)</label>
                  <input type="number" value={soForm.price} onChange={e => setSoForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 120" className="w-full mt-1 px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-[#0D0D0D]" />
                </div>
                <div>
                  <label className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Day of week</label>
                  <select value={soForm.day_of_week} onChange={e => setSoForm(f => ({ ...f, day_of_week: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-[#0D0D0D] bg-white">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d, i) => (
                      <option key={d} value={i + 1}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <input type="text" value={soForm.preferred_time} onChange={e => setSoForm(f => ({ ...f, preferred_time: e.target.value }))} placeholder="Preferred time (e.g. 9am)" className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-[#0D0D0D]" />
              <textarea value={soForm.notes} onChange={e => setSoForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Notes (route, special requirements…)" className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-[#0D0D0D] resize-none" />
              <div className="flex gap-2">
                <button onClick={createStandingOrder} className="bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold px-5 py-1.5 rounded-full text-xs transition-colors">
                  Create →
                </button>
                <button onClick={() => setShowStandingOrder(false)} className="text-[#888888] text-xs hover:text-[#0D0D0D] transition-colors">← back</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 border-t border-[#E8E8E8] pt-4">
              <button onClick={() => updateStatus("warm")} className="border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-4 py-1.5 rounded-full text-xs transition-colors">
                Mark warm
              </button>
              <button onClick={() => setShowStandingOrder(true)} className="border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-4 py-1.5 rounded-full text-xs transition-colors">
                Create standing order
              </button>
              <button onClick={() => updateStatus("dead")} className="text-[#888888] text-xs hover:text-[#0D0D0D] transition-colors">
                Not interested
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DiscoverPanel({ onRefresh }: { onRefresh: () => void }) {
  const [industry, setIndustry] = useState(Object.values(B2B_INDUSTRIES)[0][0]);
  const [deliveryType, setDeliveryType] = useState(DELIVERY_TYPES[0]);
  const [city, setCity] = useState("Manchester");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ count: number; added: string[] } | null>(null);

  async function discover() {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/b2b/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: industry, delivery_type: deliveryType, city }),
      });
      const data = await res.json() as { count: number; added: string[] };
      setResult(data);
      onRefresh();
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-5">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">Discover leads via Google Maps</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Industry</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
              {Object.entries(B2B_INDUSTRIES).map(([category, industries]) => (
                <optgroup key={category} label={category}>
                  {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">Delivery Type</label>
            <select value={deliveryType} onChange={e => setDeliveryType(e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
              {DELIVERY_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[#888888] text-[10px] uppercase tracking-[0.1em]">City</label>
            <select value={city} onChange={e => setCity(e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
              {UK_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={discover}
          disabled={running}
          className="w-full bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold py-2.5 rounded-full text-sm transition-colors"
        >
          {running ? "Searching Google Maps…" : `Find ${industry} in ${city} →`}
        </button>
        {result && (
          <div className="mt-4 bg-white border border-[#E8E8E8] rounded-xl px-4 py-3">
            <p className="text-[#0D0D0D] text-sm font-semibold">{result.count} new leads added</p>
            {result.added.length > 0 && (
              <ul className="mt-2 space-y-1">
                {result.added.map(name => (
                  <li key={name} className="text-[#888888] text-xs">· {name}</li>
                ))}
              </ul>
            )}
            {result.count === 0 && <p className="text-[#888888] text-xs mt-1">All businesses in this search are already in your pipeline.</p>}
          </div>
        )}
      </div>
      <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-5">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-2">Review monitoring</p>
        <p className="text-[#0D0D0D] text-sm font-medium mb-1">Pain point detection is automatic.</p>
        <p className="text-[#888888] text-sm leading-relaxed">
          When you run a discovery, the system checks each business&apos;s Google reviews for delivery, courier, shipping, or supplier complaints. Leads with pain points are flagged automatically and prioritised in your pipeline.
        </p>
      </div>
    </div>
  );
}

function AddLeadPanel({ onRefresh }: { onRefresh: () => void }) {
  const defaultIndustry = Object.values(B2B_INDUSTRIES)[0][0];
  const [form, setForm] = useState({
    business_name: "",
    industry: defaultIndustry,
    deliveryType: DELIVERY_TYPES[0],
    deliveryFrequency: DELIVERY_FREQUENCIES[0],
    averageDeliveries: AVERAGE_DELIVERIES[0],
    courierProvider: COURIER_PROVIDERS[0],
    deliveryChallenge: DELIVERY_CHALLENGES[0],
    email: "",
    phone: "",
    city: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.business_name) return;
    setSaving(true);
    try {
      await fetch("/api/b2b/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          niche: form.industry,
          delivery_type: form.deliveryType,
          delivery_frequency: form.deliveryFrequency,
          average_deliveries: form.averageDeliveries,
          courier_provider: form.courierProvider,
          delivery_challenge: form.deliveryChallenge,
        }),
      });
      setForm({
        business_name: "",
        industry: defaultIndustry,
        deliveryType: DELIVERY_TYPES[0],
        deliveryFrequency: DELIVERY_FREQUENCIES[0],
        averageDeliveries: AVERAGE_DELIVERIES[0],
        courierProvider: COURIER_PROVIDERS[0],
        deliveryChallenge: DELIVERY_CHALLENGES[0],
        email: "",
        phone: "",
        city: "",
        notes: "",
      });
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 space-y-3">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">Add lead manually</p>
      <input value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} placeholder="Business name *" className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D]" />

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-3">
        <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          {Object.entries(B2B_INDUSTRIES).map(([category, industries]) => (
            <optgroup key={category} label={category}>
              {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </optgroup>
          ))}
        </select>
        <select value={form.deliveryType} onChange={e => setForm(f => ({ ...f, deliveryType: e.target.value }))} className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          {DELIVERY_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
        </select>
        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D]" />
        <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D]" />
      </div>

      {/* Location & Intelligence */}
      <div className="grid grid-cols-2 gap-3">
        <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D]" />
        <select value={form.deliveryFrequency} onChange={e => setForm(f => ({ ...f, deliveryFrequency: e.target.value }))} className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          <option disabled>Delivery Frequency</option>
          {DELIVERY_FREQUENCIES.map(df => <option key={df} value={df}>{df}</option>)}
        </select>
      </div>

      {/* Intelligence Fields */}
      <div className="grid grid-cols-2 gap-3">
        <select value={form.averageDeliveries} onChange={e => setForm(f => ({ ...f, averageDeliveries: e.target.value }))} className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          <option disabled>Avg Deliveries/Month</option>
          {AVERAGE_DELIVERIES.map(ad => <option key={ad} value={ad}>{ad}</option>)}
        </select>
        <select value={form.courierProvider} onChange={e => setForm(f => ({ ...f, courierProvider: e.target.value }))} className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          <option disabled>Current Courier</option>
          {COURIER_PROVIDERS.map(cp => <option key={cp} value={cp}>{cp}</option>)}
        </select>
        <select value={form.deliveryChallenge} onChange={e => setForm(f => ({ ...f, deliveryChallenge: e.target.value }))} className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0D0D0D]">
          <option disabled>Biggest Challenge</option>
          {DELIVERY_CHALLENGES.map(dc => <option key={dc} value={dc}>{dc}</option>)}
        </select>
      </div>

      <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Notes or pain point" className="w-full px-4 py-2.5 border border-[#E8E8E8] rounded-xl text-sm focus:outline-none focus:border-[#0D0D0D] resize-none" />
      <button onClick={save} disabled={saving || !form.business_name} className="w-full bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold py-2.5 rounded-full text-sm transition-colors">
        {saving ? "Adding…" : "Add to pipeline →"}
      </button>
    </div>
  );
}

function StandingOrdersPanel({ orders, onGenerate }: { orders: Order[]; onGenerate: () => void }) {
  const [generating, setGenerating] = useState(false);

  async function generate() {
    setGenerating(true);
    try {
      await fetch("/api/b2b/standing-orders", { method: "PUT" });
      onGenerate();
    } finally {
      setGenerating(false);
    }
  }

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
          Active standing orders ({orders.length})
        </p>
        <button onClick={generate} disabled={generating} className="bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold px-4 py-1.5 rounded-full text-xs transition-colors">
          {generating ? "Generating…" : "Generate this week's jobs →"}
        </button>
      </div>
      {orders.length === 0 ? (
        <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-8 text-center">
          <p className="text-[#888888] text-sm">No standing orders yet. Close a lead to create one.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden divide-y divide-[#E8E8E8]">
          {orders.map((order) => (
            <div key={order.id as string} className="flex items-center justify-between px-5 py-4 gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-[#0D0D0D] text-sm">{order.business_name as string}</p>
                <p className="text-[#888888] text-xs">
                  {order.frequency as string}
                  {order.day_of_week != null ? ` · ${DAYS[(order.day_of_week as number) - 1]}` : ""}
                  {order.preferred_time ? ` · ${order.preferred_time as string}` : ""}
                  {order.pickup_postcode ? ` · ${order.pickup_postcode as string}` : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                {order.price != null && <p className="font-sans font-black text-[#0D0D0D] text-sm">£{Number(order.price).toFixed(0)}</p>}
                {!!order.next_scheduled_at && (
                  <p className="text-[#888888] text-[10px]">
                    Next: {new Date(order.next_scheduled_at as string).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  leads: Lead[];
  orders: Order[];
}

export default function B2BPipeline({ leads: initialLeads, orders: initialOrders }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pipeline");
  const [leads] = useState(initialLeads);
  const [orders] = useState(initialOrders);

  function refresh() {
    router.refresh();
  }

  const activeTabs: { key: Tab; label: string }[] = [
    { key: "pipeline", label: `Pipeline (${leads.filter(l => !["closed", "dead"].includes(l.status as string)).length})` },
    { key: "discover", label: "Discover" },
    { key: "add", label: "Add lead" },
    { key: "standing", label: `Standing orders (${orders.length})` },
  ];

  const pipelineLeads = tab === "pipeline"
    ? leads.filter(l => !["closed", "dead"].includes(l.status as string))
    : leads;

  return (
    <div>
      {/* Tab toggle */}
      <div className="flex flex-wrap gap-2 mb-6">
        {activeTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${tab === t.key ? "bg-[#0D0D0D] text-white" : "text-[#888888] hover:text-[#0D0D0D] border border-[#E8E8E8]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "pipeline" && (
        <div className="space-y-3">
          {pipelineLeads.length === 0 ? (
            <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl p-8 text-center">
              <p className="text-[#888888] text-sm">No active leads. Use Discover to find your first batch.</p>
            </div>
          ) : (
            pipelineLeads.map(lead => (
              <LeadCard key={lead.id as string} lead={lead} onRefresh={refresh} />
            ))
          )}
        </div>
      )}

      {tab === "discover" && <DiscoverPanel onRefresh={refresh} />}
      {tab === "add" && <AddLeadPanel onRefresh={refresh} />}
      {tab === "standing" && <StandingOrdersPanel orders={orders} onGenerate={refresh} />}
    </div>
  );
}
