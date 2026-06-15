"use client";

import { useState } from "react";

interface ProspectCardProps {
  prospect: {
    id: string;
    business_name: string;
    business_category?: string;
    email?: string;
    last_contacted_at?: string;
  };
  opportunity: string;
  context: string;
  recommendation: string;
  executiveSummary?: string;
  evidence?: string[];
  engagement?: {
    sent_at?: string;
    opened_count?: number;
    clicked_count?: number;
    replied?: boolean;
  };
}

type EmailState = 'idle' | 'loading' | 'success' | 'error';

export default function ProspectCard({
  prospect,
  opportunity,
  context,
  recommendation,
  executiveSummary = "",
  evidence = [],
  engagement,
}: ProspectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [emailState, setEmailState] = useState<EmailState>('idle');
  const [emailError, setEmailError] = useState<string>('');

  const sendEmail = async () => {
    if (!prospect.email) {
      setEmailError('No email address available');
      setEmailState('error');
      return;
    }

    setEmailState('loading');
    setEmailError('');

    try {
      const response = await fetch('/api/b2b/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: prospect.id,
          subject: `Opportunity: ${prospect.business_name}`,
          body: `${opportunity}\n\n${recommendation}`,
          operator: 'operator@system'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      setEmailState('success');
      setTimeout(() => setEmailState('idle'), 3000);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Unknown error');
      setEmailState('error');
    }
  };

  const lastReviewedLabel = prospect.last_contacted_at
    ? (() => {
        const minsAgo = Math.floor(
          (Date.now() - new Date(prospect.last_contacted_at).getTime()) / (1000 * 60)
        );
        if (minsAgo < 60) return `${minsAgo}m ago`;
        const hoursAgo = Math.floor(minsAgo / 60);
        if (hoursAgo < 24) return `${hoursAgo}h ago`;
        const daysAgo = Math.floor(hoursAgo / 24);
        return `${daysAgo}d ago`;
      })()
    : "never";

  return (
    <div
      className="border border-[#E8E8E8] bg-white hover:border-[#D0D0D0] transition-colors cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* COLLAPSED STATE — Apple + Linear Hybrid */}
      <div className="px-6 py-5">
        {/* Header: Company + Category */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-[#0D0D0D] mb-1">
              {prospect.business_name}
            </h3>
            {prospect.business_category && (
              <p className="text-[11px] font-medium text-[#888888] uppercase tracking-[0.05em]">
                {prospect.business_category}
              </p>
            )}
          </div>
        </div>

        {/* Opportunity */}
        <p className="text-sm leading-relaxed text-[#0D0D0D] mb-4">
          {opportunity}
        </p>

        {/* Context — Important background */}
        <p className="text-sm leading-relaxed text-[#666666] mb-4 pb-4 border-b border-[#E8E8E8]">
          {context}
        </p>

        {/* Recommended Action */}
        <p className="text-sm font-medium text-[#0D0D0D] mb-4">
          {recommendation}
        </p>

        {/* Metadata Footer */}
        <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.05em] text-[#888888]">
          <span>Reviewed {lastReviewedLabel}</span>
          <span className="text-[9px]">Click to expand</span>
        </div>
      </div>

      {/* EXPANDED STATE — Apple + Linear Hybrid Polish */}
      {isExpanded && (
        <div className="border-t border-[#E8E8E8] bg-[#FAFAFA]">
          <div className="px-6 py-6 space-y-6">
            {/* OUTREACH TIMELINE — CARD WITH POLISH */}
            <div className="bg-white border border-[#E8E8E8] rounded p-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#0D0D0D] mb-4">
                {engagement?.sent_at ? 'Outreach Timeline' : 'Status'}
              </h4>
              {engagement?.sent_at ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-[#E8E8E8]">
                    <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#888888]">Email Sent</span>
                    <span className="text-sm font-medium text-[#0D0D0D]">{new Date(engagement.sent_at).toLocaleDateString()}</span>
                  </div>
                  {engagement.opened_count !== undefined && (
                    <div className="flex justify-between items-center pb-3 border-b border-[#E8E8E8]">
                      <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#888888]">Opened</span>
                      <span className="text-sm font-medium text-[#0D0D0D]">{engagement.opened_count} time{engagement.opened_count !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {engagement.clicked_count !== undefined && (
                    <div className="flex justify-between items-center pb-3 border-b border-[#E8E8E8]">
                      <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#888888]">Clicked</span>
                      <span className="text-sm font-medium text-[#0D0D0D]">{engagement.clicked_count} link{engagement.clicked_count !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {engagement.replied !== undefined && (
                    <div className="flex justify-between items-center pb-3 border-b border-[#E8E8E8]">
                      <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#888888]">Reply</span>
                      <span className="text-sm font-medium text-[#0D0D0D]">{engagement.replied ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#888888]">Current Stage</span>
                    <span className="text-sm font-medium text-[#0D0D0D]">{context.split('Current stage:')[1]?.split('.')[0]?.trim() || 'Active'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#0D0D0D]">
                  Not yet contacted. Ready for outreach.
                </p>
              )}
            </div>

            {/* Why This Matters — Card */}
            <div className="bg-white border border-[#E8E8E8] rounded p-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#0D0D0D] mb-3">
                Why This Matters
              </h4>
              <p className="text-sm leading-relaxed text-[#0D0D0D]">
                {executiveSummary || 'Commercial timing is optimal. Early engagement significantly improves probability of engagement.'}
              </p>
            </div>

            {/* Evidence — Card */}
            {evidence.length > 0 && (
              <div className="bg-white border border-[#E8E8E8] rounded p-4">
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#0D0D0D] mb-3">
                  Evidence
                </h4>
                <ul className="space-y-2">
                  {evidence.map((item, i) => (
                    <li key={i} className="text-sm text-[#0D0D0D] flex items-start">
                      <span className="text-[#888888] mr-2 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Action — Card */}
            <div className="bg-white border border-[#E8E8E8] rounded p-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#0D0D0D] mb-3">
                Recommended Action
              </h4>
              <p className="text-sm leading-relaxed text-[#0D0D0D]">
                {recommendation}
              </p>
            </div>

            {/* Send Email Action — Premium Button */}
            {prospect.email && (
              <div>
                <button
                  onClick={sendEmail}
                  disabled={emailState === 'loading'}
                  className={`w-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.05em] rounded border transition-all ${
                    emailState === 'success'
                      ? 'bg-[#0D0D0D] text-white border-[#0D0D0D]'
                      : emailState === 'error'
                      ? 'bg-white text-[#0D0D0D] border-[#E8E8E8] hover:border-[#D0D0D0]'
                      : 'bg-[#0D0D0D] text-white border-[#0D0D0D] hover:bg-[#333333] hover:border-[#333333]'
                  } ${emailState === 'loading' ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {emailState === 'loading' && 'Sending...'}
                  {emailState === 'success' && 'Email Sent'}
                  {emailState === 'error' && 'Try Again'}
                  {emailState === 'idle' && 'Send Email'}
                </button>
                {emailError && (
                  <p className="text-[10px] text-[#666666] mt-2">
                    {emailError}
                  </p>
                )}
              </div>
            )}

            {/* Operator Feedback — Refined */}
            <div className="bg-white border border-[#E8E8E8] rounded p-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#0D0D0D] mb-3">
                Outcome Feedback
              </h4>
              <div className="flex gap-2 flex-wrap">
                <button className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#0D0D0D] px-3 py-2 hover:bg-[#F5F5F5] rounded transition-colors">
                  Correct
                </button>
                <button className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#0D0D0D] px-3 py-2 hover:bg-[#F5F5F5] rounded transition-colors">
                  Not Useful
                </button>
                <button className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#0D0D0D] px-3 py-2 hover:bg-[#F5F5F5] rounded transition-colors">
                  Already Contacted
                </button>
                <button className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#0D0D0D] px-3 py-2 hover:bg-[#F5F5F5] rounded transition-colors">
                  Not Relevant
                </button>
              </div>
            </div>

            {/* Contact — Card */}
            {prospect.email && (
              <div className="bg-white border border-[#E8E8E8] rounded p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-2">
                  Contact
                </p>
                <p className="text-sm font-medium text-[#0D0D0D]">
                  {prospect.email}
                </p>
              </div>
            )}

            {/* Send Email Action */}
            {prospect.email && (
              <div>
                <button
                  onClick={sendEmail}
                  disabled={emailState === 'loading'}
                  className={`w-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.1em] rounded transition-colors ${
                    emailState === 'success'
                      ? 'bg-[#0D0D0D] text-white'
                      : emailState === 'error'
                      ? 'bg-[#0D0D0D] text-white opacity-75'
                      : 'bg-[#0D0D0D] text-white hover:bg-[#333333]'
                  } ${emailState === 'loading' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {emailState === 'loading' && 'Sending...'}
                  {emailState === 'success' && 'Email Sent'}
                  {emailState === 'error' && 'Error — Try Again'}
                  {emailState === 'idle' && 'Send Email'}
                </button>
                {emailError && (
                  <p className="text-[10px] text-[#666666] mt-2">
                    {emailError}
                  </p>
                )}
              </div>
            )}

            {/* Operator Feedback */}
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0D0D0D] mb-2">
                Outcome Feedback
              </h4>
              <div className="flex gap-3 flex-wrap">
                <button className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0D0D0D] hover:text-[#666666] transition-colors">
                  Correct
                </button>
                <button className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0D0D0D] hover:text-[#666666] transition-colors">
                  Not Useful
                </button>
                <button className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0D0D0D] hover:text-[#666666] transition-colors">
                  Already Contacted
                </button>
                <button className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0D0D0D] hover:text-[#666666] transition-colors">
                  Not Relevant
                </button>
              </div>
            </div>

            {/* Contact */}
            {prospect.email && (
              <div className="text-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-1">
                  Contact
                </p>
                <p className="text-sm text-[#0D0D0D]">
                  {prospect.email}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
