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
  painPoint?: string | null;
  businessEvidence?: any;
}

interface Enrichment {
  prospect_name: string;
  industry: string;
  why_they_need_it: string;
  detected_pain_points: string[];
  probability_to_convert: number;
  confidence_level: 'high' | 'medium' | 'low';
  key_talking_points: string[];
  suggested_conversation_start: string;
}

interface B2BLeadsReviewProps {
  searchTrigger?: number;
}

export function B2BLeadsReview({ searchTrigger }: B2BLeadsReviewProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Enrichment state
  const [enrichedLead, setEnrichedLead] = useState<{ lead: Lead; enrichment: Enrichment } | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null);

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

  const handleEnrich = async (lead: Lead) => {
    setEnrichingId(lead.id);
    try {
      const response = await fetch(`/api/b2b/intelligence/prospect-brief?lead_id=${lead.id}`);
      const result = await response.json();

      if (response.ok && result.brief) {
        setEnrichedLead({ lead, enrichment: result.brief });

        // Generate email based on enrichment
        const subject = `${lead.businessName}: ${result.brief.why_they_need_it.substring(0, 40)}...`;
        const body = `Hi ${lead.businessName},\n\n${result.brief.suggested_conversation_start}\n\nKey points:\n${result.brief.key_talking_points.map((p: string) => `• ${p}`).join('\n')}\n\nLooking forward to connecting.\n\nBest regards,\nSaint & Story`;

        setGeneratedEmail({ subject, body });
        setMessage({ type: 'success', text: 'Enrichment complete. Email generated.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to enrich lead' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Enrichment failed' });
    } finally {
      setEnrichingId(null);
    }
  };

  const handleSend = async (leadId: string, businessName: string) => {
    setSendingId(leadId);
    try {
      const email = generatedEmail || {
        subject: `Saint & Story - Service Opportunity for ${businessName}`,
        body: `Hi ${businessName},\n\nWe noticed your business might benefit from our services.\n\nWould you be interested in learning more?\n\nBest regards,\nSaint & Story`
      };

      const response = await fetch('/api/b2b/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          subject: email.subject,
          body: email.body,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: `Email sent to ${businessName}` });
        setLeads(leads.filter(l => l.id !== leadId));
        setEnrichedLead(null);
        setGeneratedEmail(null);
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
    setEnrichedLead(null);
    setGeneratedEmail(null);
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
            {leads.map((lead) => {
              const isEnriched = enrichedLead?.lead.id === lead.id;

              return (
                <div key={lead.id} className="border border-[#E8E8E8] rounded p-4 hover:border-[#D0D0D0] transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-[#0D0D0D]">{lead.businessName}</p>
                      {lead.painPoint && (
                        <p className="text-sm text-[#0D0D0D] mt-1">
                          Pain: {lead.painPoint}
                        </p>
                      )}
                      <p className="text-[10px] text-[#888888] mt-1">
                        {lead.city}, {lead.postcode}
                      </p>
                    </div>
                  </div>

                  {/* Enrichment Display */}
                  {isEnriched && enrichedLead.enrichment && (
                    <div className="bg-[#F9FAFB] border border-[#E8E8E8] rounded p-3 mb-3">
                      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] mb-2">
                        Enrichment Analysis
                      </p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-[10px] font-semibold text-[#0D0D0D]">Confidence</p>
                          <p className="text-sm text-[#666666]">{enrichedLead.enrichment.confidence_level.toUpperCase()} • {(enrichedLead.enrichment.probability_to_convert * 100).toFixed(0)}% conversion probability</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-[#0D0D0D]">Why They Need It</p>
                          <p className="text-sm text-[#666666]">{enrichedLead.enrichment.why_they_need_it}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-[#0D0D0D]">Detected Pain Points</p>
                          <ul className="text-sm text-[#666666]">
                            {enrichedLead.enrichment.detected_pain_points.map((p: string, i: number) => (
                              <li key={i}>• {p}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generated Email Preview */}
                  {isEnriched && generatedEmail && (
                    <div className="bg-[#F9FAFB] border border-[#E8E8E8] rounded p-3 mb-3">
                      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] mb-2">
                        Generated Email
                      </p>
                      <div>
                        <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Subject:</p>
                        <p className="text-sm text-[#666666] mb-3">{generatedEmail.subject}</p>
                        <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Body:</p>
                        <p className="text-sm text-[#666666] whitespace-pre-wrap mb-3">{generatedEmail.body}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!isEnriched ? (
                      <>
                        <button
                          onClick={() => handleEnrich(lead)}
                          disabled={enrichingId === lead.id}
                          className="flex-1 px-3 py-2 text-sm font-semibold uppercase tracking-[0.05em] rounded border border-[#0D0D0D] text-[#0D0D0D] hover:bg-[#F5F5F5] disabled:opacity-60 transition-colors"
                        >
                          {enrichingId === lead.id ? 'Enriching...' : 'Enrich & Generate'}
                        </button>
                        <button
                          onClick={() => handleSkip(lead.id)}
                          className="flex-1 px-3 py-2 text-sm font-semibold uppercase tracking-[0.05em] rounded border border-[#E8E8E8] text-[#0D0D0D] hover:border-[#D0D0D0] transition-colors"
                        >
                          Skip
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSend(lead.id, lead.businessName)}
                          disabled={sendingId === lead.id}
                          className="flex-1 px-3 py-2 text-sm font-semibold uppercase tracking-[0.05em] rounded bg-[#0D0D0D] text-white hover:bg-[#333333] disabled:opacity-60 transition-colors"
                        >
                          {sendingId === lead.id ? 'Sending...' : 'Send Email'}
                        </button>
                        <button
                          onClick={() => {
                            setEnrichedLead(null);
                            setGeneratedEmail(null);
                          }}
                          className="flex-1 px-3 py-2 text-sm font-semibold uppercase tracking-[0.05em] rounded border border-[#E8E8E8] text-[#0D0D0D] hover:border-[#D0D0D0] transition-colors"
                        >
                          Back
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
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
