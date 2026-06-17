'use client';

import { useState, useEffect } from 'react';

interface Lead {
  id: string;
  businessName: string;
  businessCategory: string;
  email: string;
  city: string;
  postcode: string;
  status: string;
  leadState: string;
  createdAt: string;
}

interface B2BLeadsReviewProps {
  searchTrigger?: number;
}

export function B2BLeadsReview({ searchTrigger }: B2BLeadsReviewProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (searchTrigger !== undefined) {
      loadRecentLeads();
    }
  }, [searchTrigger]);

  const loadRecentLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/b2b/discover/search?limit=10&status=new');
      const result = await response.json();
      if (response.ok) {
        setLeads(result.results || []);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (leadId: string, businessName: string) => {
    setSendingId(leadId);
    try {
      const defaultEmail = `Hi ${businessName},\n\nWe noticed your business might benefit from our services.\n\nWould you be interested in learning more?\n\nBest regards,\nSaint & Story`;

      const response = await fetch('/api/b2b/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          subject: `Saint & Story - Service Opportunity for ${businessName}`,
          body: defaultEmail,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: `Email sent to ${businessName}` });
        setLeads(leads.filter(l => l.id !== leadId));
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send email' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Send failed' });
    } finally {
      setSendingId(null);
    }
  };

  const handleSkip = (leadId: string) => {
    setLeads(leads.filter(l => l.id !== leadId));
  };

  if (!leads.length && !loading) return null;

  return (
    <div className="mb-16">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
        B2B Leads Review
      </p>
      <div className="bg-white border border-[#E8E8E8] rounded p-6">
        {loading ? (
          <p className="text-sm text-[#666666] italic">Loading leads...</p>
        ) : leads.length === 0 ? (
          <p className="text-sm text-[#666666] italic">No leads to review.</p>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="border border-[#E8E8E8] rounded p-4 hover:border-[#D0D0D0] transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-[#0D0D0D]">{lead.businessName}</p>
                    <p className="text-[10px] text-[#888888] mt-1">
                      {lead.businessCategory} • {lead.city}, {lead.postcode}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.05em] px-2 py-1 rounded bg-[#F5F5F5] text-[#0D0D0D]">
                    {lead.status}
                  </span>
                </div>
                <p className="text-[10px] text-[#666666] mb-4">{lead.email}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSend(lead.id, lead.businessName)}
                    disabled={sendingId === lead.id}
                    className="flex-1 px-3 py-2 text-sm font-semibold uppercase tracking-[0.05em] rounded bg-[#0D0D0D] text-white hover:bg-[#333333] disabled:opacity-60 transition-colors"
                  >
                    {sendingId === lead.id ? 'Sending...' : 'Send'}
                  </button>
                  <button
                    onClick={() => handleSkip(lead.id)}
                    disabled={sendingId === lead.id}
                    className="flex-1 px-3 py-2 text-sm font-semibold uppercase tracking-[0.05em] rounded border border-[#E8E8E8] text-[#0D0D0D] hover:border-[#D0D0D0] disabled:opacity-60 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            ))}
            {message && (
              <div className={`p-3 rounded text-sm ${
                message.type === 'success'
                  ? 'bg-[#E8F5E9] text-[#1B5E20]'
                  : 'bg-[#FFE5E5] text-[#CC0000]'
              }`}>
                {message.text}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
