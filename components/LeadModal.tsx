"use client";

import { useState, useCallback } from "react";
import posthog from "posthog-js";
import PostcodeSearch from "./PostcodeSearch";

function track(event: string, props?: Record<string, unknown>) {
  try { posthog.capture(event, props); } catch { /* */ }
}

const STEPS = [
  { id: "s1", type: "name", q: "What is your name?", name: "full_name" },
  { id: "s2", type: "phone", q: "What is your phone number?", name: "phone" },
  { id: "s3", type: "email", q: "What email should we contact you on?", name: "email" },
  { id: "s4", type: "postcode", q: "What postcode are you moving from?", name: "postcode_from" },
  { id: "s5", type: "postcode", q: "What postcode are you moving to?", name: "postcode_to" },
  { id: "s6", type: "urgency", q: "When are you ready to move?", opts: ["Now", "This week", "This month", "Later"] },
  { id: "s7", type: "success", q: "We're finding your driver..." },
] as const;

const TOTAL = STEPS.length;
const inputCls = "w-full border border-[#E8E8E8] rounded-2xl px-4 py-3 text-sm text-[#0D0D0D] placeholder:text-[#888888] focus:outline-none focus:border-[#0D0D0D] transition-colors";

function OptionCard({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-4 border-b border-[#E8E8E8] last:border-b-0 text-left hover:bg-[#F5F5F5] transition-colors"
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
        selected ? "border-[#0D0D0D] bg-[#0D0D0D]" : "border-[#E8E8E8] bg-white"
      }`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <span className={`text-sm flex-1 ${selected ? "text-[#0D0D0D] font-semibold" : "text-[#888888]"}`}>{label}</span>
    </button>
  );
}

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadModal({ isOpen, onClose }: LeadModalProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = STEPS[stepIdx];
  const isLast = stepIdx === TOTAL - 1;
  const isSuccess = step.type === "success";

  const validate = useCallback(() => {
    if (step.type === "name") return (answers.full_name || "").trim().length > 0;
    if (step.type === "phone") return (answers.phone || "").trim().length > 0;
    if (step.type === "email") return (answers.email || "").includes("@");
    if (step.type === "postcode") return (answers[step.name] || "").trim().length > 0;
    if (step.type === "urgency") return !!answers.urgency;
    return true;
  }, [step.type, step.name, answers]);

  const handleNext = useCallback(async () => {
    if (!validate()) return;
    track("lead_step_completed", { step: stepIdx, type: step.type });

    if (step.type === "urgency") {
      setIsSubmitting(true);
      try {
        const params = new URLSearchParams(window.location.search);
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: answers.full_name,
            phone: answers.phone,
            email: answers.email,
            postcode_from: answers.postcode_from,
            postcode_to: answers.postcode_to,
            urgency: answers.urgency,
            utm: {
              utm_source: params.get("utm_source") ?? "",
              utm_medium: params.get("utm_medium") ?? "",
              utm_campaign: params.get("utm_campaign") ?? "",
            },
          }),
        });
        track("lead_submitted");
        window.fbq?.('track', 'Lead', {
          content_name: 'Lead Form Submission',
          content_type: 'lead',
          value: 45,
          currency: 'GBP',
          phone_number: answers.phone || '',
          email: answers.email || '',
        });
      } catch {
        // non-fatal
      } finally {
        setIsSubmitting(false);
      }
    }

    if (stepIdx < TOTAL - 1) setStepIdx((i) => i + 1);
  }, [stepIdx, answers, step.type, validate]);

  function handleBack() {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {isSuccess ? (
            <div className="text-center py-12">
              <h2 className="text-3xl font-black text-[#0D0D0D] mb-3">{step.q}</h2>
              <p className="text-[#888888] mb-8">We'll match you with the nearest available driver and call within 15 minutes.</p>
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-[#0D0D0D] text-white font-semibold rounded-xl hover:bg-[#333333] transition"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: TOTAL - 1 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < stepIdx ? "bg-[#0D0D0D]" : i === stepIdx ? "bg-[#0D0D0D]" : "bg-[#E8E8E8]"
                      }`}
                    />
                  ))}
                </div>
                <h2 className="text-2xl font-black text-[#0D0D0D] leading-tight">{step.q}</h2>
              </div>

              <div className="mb-8">
                {step.type === "name" && (
                  <input
                    type="text"
                    placeholder="E.g., James"
                    value={answers.full_name || ""}
                    onChange={(e) => setAnswers({ ...answers, full_name: e.target.value })}
                    className={inputCls}
                    autoFocus
                  />
                )}

                {step.type === "phone" && (
                  <input
                    type="tel"
                    placeholder="E.g., 07700 900000"
                    value={answers.phone || ""}
                    onChange={(e) => setAnswers({ ...answers, phone: e.target.value })}
                    className={inputCls}
                    autoFocus
                  />
                )}

                {step.type === "email" && (
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={answers.email || ""}
                    onChange={(e) => setAnswers({ ...answers, email: e.target.value })}
                    className={inputCls}
                    autoFocus
                  />
                )}

                {step.type === "postcode" && (
                  <PostcodeSearch
                    value={answers[step.name] || ""}
                    onChange={(v) => setAnswers({ ...answers, [step.name]: v })}
                    placeholder={step.name === "postcode_from" ? "E.g., SW1A 2AA" : "E.g., E1 6RF"}
                    autoFocus
                    onEnter={handleNext}
                  />
                )}

                {step.type === "urgency" && (
                  <div className="border border-[#E8E8E8] rounded-2xl overflow-hidden">
                    {(step.opts || []).map((opt) => (
                      <OptionCard
                        key={opt}
                        label={opt}
                        selected={answers.urgency === opt}
                        onClick={() => setAnswers({ ...answers, urgency: opt })}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {stepIdx > 0 && (
                  <button
                    onClick={handleBack}
                    className="flex-1 px-4 py-3 border border-[#E8E8E8] text-[#0D0D0D] font-semibold rounded-xl hover:bg-[#F5F5F5] transition"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!validate() || isSubmitting}
                  className="flex-1 px-4 py-3 bg-[#0D0D0D] text-white font-semibold rounded-xl hover:bg-[#333333] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Matching…" : isLast ? "Get Matched →" : "Continue →"}
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-4 text-center text-sm text-[#888888] hover:text-[#0D0D0D] transition"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
