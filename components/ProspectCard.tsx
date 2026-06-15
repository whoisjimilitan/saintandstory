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
  email_content?: {
    subject?: string;
    body?: string;
  };
}

type EmailState = 'idle' | 'loading' | 'success' | 'error';

// Determine conversation state based on engagement
function getConversationState(engagement?: any): { state: string; label: string; color: string } {
  if (!engagement?.sent_at) {
    return { state: 'uncontacted', label: 'UNCONTACTED', color: 'bg-[#F5F5F5] text-[#0D0D0D]' };
  }
  if (engagement.replied) {
    return { state: 'replied', label: 'REPLIED', color: 'bg-[#E8F5E9] text-[#1B5E20]' };
  }
  if (engagement.clicked_count && engagement.clicked_count > 0) {
    return { state: 'clicked', label: 'CLICKED', color: 'bg-[#FFF3E0] text-[#E65100]' };
  }
  if (engagement.opened_count && engagement.opened_count > 0) {
    return { state: 'opened', label: 'OPENED', color: 'bg-[#E3F2FD] text-[#0D47A1]' };
  }
  return { state: 'contacted', label: 'CONTACTED', color: 'bg-[#F3E5F5] text-[#4A148C]' };
}

export default function ProspectCard({
  prospect,
  opportunity,
  context,
  recommendation,
  executiveSummary = "",
  evidence = [],
  engagement,
  email_content,
}: ProspectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [emailState, setEmailState] = useState<EmailState>('idle');
  const [emailError, setEmailError] = useState<string>('');
  const conversationState = getConversationState(engagement);

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
      className="border border-[#E8E8E8] bg-white cursor-pointer transition-all duration-200 hover:border-[#D0D0D0] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* COLLAPSED STATE — Conversation-First */}
      <div className="px-6 py-5">
        {/* SECTION 1: CONVERSATION STATE (PRIMARY) */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.05em] px-3 py-1 rounded ${conversationState.color}`}>
              {conversationState.label}
            </span>
          </div>
          {prospect.business_category && (
            <span className="text-[11px] font-medium text-[#888888] uppercase tracking-[0.05em]">
              {prospect.business_category}
            </span>
          )}
        </div>

        {/* Company Name */}
        <h3 className="text-base font-semibold text-[#0D0D0D] mb-3">
          {prospect.business_name}
        </h3>

        {/* Engagement Summary (if contacted) */}
        {engagement?.sent_at && (
          <div className="mb-3 pb-3 border-b border-[#E8E8E8]">
            <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#888888] mb-2">
              Engagement
            </p>
            <div className="text-sm text-[#0D0D0D]">
              {engagement.opened_count ? (
                <p className="mb-1">
                  <span className="font-semibold">{engagement.opened_count}</span> open{engagement.opened_count !== 1 ? 's' : ''}
                </p>
              ) : null}
              {engagement.clicked_count ? (
                <p className="mb-1">
                  <span className="font-semibold">{engagement.clicked_count}</span> click{engagement.clicked_count !== 1 ? 's' : ''}
                </p>
              ) : null}
              {engagement.replied ? (
                <p className="mb-1">
                  <span className="font-semibold">Reply received</span>
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Recommended Action */}
        <p className="text-sm font-medium text-[#0D0D0D] mb-3">
          {recommendation}
        </p>

        {/* Metadata Footer */}
        <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.05em] text-[#888888]">
          <span>
            {engagement?.sent_at
              ? `Sent ${new Date(engagement.sent_at).toLocaleDateString()}`
              : 'Not yet contacted'}
          </span>
          <span className="text-[9px]">Click to expand</span>
        </div>
      </div>

      {/* EXPANDED STATE — Conversation-Centric */}
      {isExpanded && (
        <div className="border-t border-[#E8E8E8] bg-[#FAFAFA]">
          <div className="px-6 py-6 space-y-6">
            {/* SECTION 1: CURRENT CONVERSATION STATE */}
            <div className="bg-white border border-[#E8E8E8] rounded p-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#0D0D0D] mb-3">
                Conversation State
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-sm font-semibold uppercase px-3 py-1 rounded ${conversationState.color}`}>
                    {conversationState.label}
                  </span>
                </div>
                {engagement?.sent_at && (
                  <p className="text-[10px] text-[#888888]">
                    Sent {new Date(engagement.sent_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* SECTION 2: EMAIL SENT (CENTER OF TRUTH) */}
            {engagement?.sent_at && (
              <div className="bg-white border border-[#E8E8E8] rounded p-4">
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#0D0D0D] mb-3">
                  Email Sent
                </h4>
                {email_content?.subject && (
                  <div className="mb-3 pb-3 border-b border-[#E8E8E8]">
                    <p className="text-[10px] font-medium text-[#888888] mb-1">Subject</p>
                    <p className="text-sm text-[#0D0D0D] font-medium">{email_content.subject}</p>
                  </div>
                )}
                {email_content?.body && (
                  <div>
                    <p className="text-[10px] font-medium text-[#888888] mb-2">Body</p>
                    <p className="text-sm text-[#0D0D0D] leading-relaxed whitespace-pre-wrap">{email_content.body}</p>
                  </div>
                )}
                {!email_content && (
                  <p className="text-sm text-[#666666] italic">Email content not available</p>
                )}
              </div>
            )}

            {/* SECTION 3: ENGAGEMENT METRICS (ENGAGEMENT ONLY) */}
            {engagement?.sent_at && (
              <div className="bg-white border border-[#E8E8E8] rounded p-4">
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#0D0D0D] mb-3">
                  Prospect Engagement
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#0D0D0D]">Opens</span>
                    <span className="text-sm font-semibold text-[#0D0D0D]">{engagement.opened_count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#0D0D0D]">Clicks</span>
                    <span className="text-sm font-semibold text-[#0D0D0D]">{engagement.clicked_count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#0D0D0D]">Reply</span>
                    <span className="text-sm font-semibold text-[#0D0D0D]">{engagement.replied ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: WHY THE SYSTEM SENT THIS */}
            <div className="bg-white border border-[#E8E8E8] rounded p-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#0D0D0D] mb-3">
                Why We Targeted This Prospect
              </h4>
              <p className="text-sm leading-relaxed text-[#0D0D0D]">
                {executiveSummary || opportunity}
              </p>
              {evidence.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#E8E8E8]">
                  <p className="text-[10px] font-medium text-[#888888] mb-2">Supporting Signals</p>
                  <ul className="space-y-1">
                    {evidence.map((item, i) => (
                      <li key={i} className="text-sm text-[#0D0D0D]">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* SECTION 5: RECOMMENDED NEXT ACTION (SINGLE ONLY) */}
            <div className="bg-white border border-[#E8E8E8] rounded p-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#0D0D0D] mb-3">
                Recommended Next Action
              </h4>
              <p className="text-sm font-medium text-[#0D0D0D]">
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
