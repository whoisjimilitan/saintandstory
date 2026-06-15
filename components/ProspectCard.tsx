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
}

type EmailState = 'idle' | 'loading' | 'success' | 'error';

export default function ProspectCard({
  prospect,
  opportunity,
  context,
  recommendation,
  executiveSummary = "",
  evidence = [],
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
      {/* COLLAPSED STATE */}
      <div className="px-6 py-5">
        {/* 1. Company Name */}
        <h3 className="text-lg font-semibold text-[#0D0D0D] mb-3">
          {prospect.business_name}
        </h3>

        {/* 2. Opportunity */}
        <p className="text-sm leading-relaxed text-[#0D0D0D] mb-2">
          {opportunity}
        </p>

        {/* 3. Context */}
        <p className="text-sm leading-relaxed text-[#666666] mb-3">
          {context}
        </p>

        {/* 4. Recommended Action */}
        <p className="text-sm text-[#0D0D0D] mb-3">
          {recommendation}
        </p>

        {/* 5. Metadata */}
        <div className="flex gap-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888]">
          <span>Last reviewed {lastReviewedLabel}.</span>
          {prospect.business_category && <span>{prospect.business_category}.</span>}
        </div>
      </div>

      {/* EXPANDED STATE */}
      {isExpanded && (
        <div className="border-t border-[#E8E8E8] bg-[#FAFAFA]">
          <div className="px-6 py-5 space-y-5">
            {/* Executive Summary */}
            {executiveSummary && (
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0D0D0D] mb-2">
                  Executive Summary
                </h4>
                <p className="text-sm leading-relaxed text-[#0D0D0D]">
                  {executiveSummary}
                </p>
              </div>
            )}

            {/* Why This Matters */}
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0D0D0D] mb-2">
                Why This Matters
              </h4>
              <p className="text-sm text-[#0D0D0D]">
                Commercial timing is optimal. Early engagement significantly improves probability of engagement.
              </p>
            </div>

            {/* Evidence */}
            {evidence.length > 0 && (
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0D0D0D] mb-2">
                  Evidence
                </h4>
                <ul className="space-y-1">
                  {evidence.map((item, i) => (
                    <li key={i} className="text-sm text-[#0D0D0D]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Action */}
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0D0D0D] mb-2">
                Recommended Action
              </h4>
              <p className="text-sm text-[#0D0D0D]">
                {recommendation}
              </p>
            </div>

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
                  {emailState === 'success' && '✅ Email Sent'}
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
