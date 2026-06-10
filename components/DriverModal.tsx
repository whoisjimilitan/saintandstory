"use client";

import { useState, useEffect, useCallback } from "react";
import posthog from "posthog-js";

function track(event: string, props?: Record<string, unknown>) {
  try { posthog.capture(event, props); } catch { /* */ }
}

type Answers = Record<string, string | boolean>;

const STEPS = [
  {
    id: "vehicle", type: "options" as const,
    q: "What type of vehicle do you drive?",
    opts: ["Small van (e.g. Ford Connect)", "Transit-size van", "Luton van", "Curtainsider / flatbed", "Other"],
  },
  {
    id: "postcode", type: "input" as const,
    q: "What’s your postcode?",
    placeholder: "e.g., M1 5AE",
  },
  {
    id: "radius", type: "input" as const,
    q: "How many miles can you travel?",
    placeholder: "e.g., 15",
  },
  {
    id: "start", type: "options" as const,
    q: "When do you want to go live?",
    opts: ["Immediately", "This week", "Next week", "Next month"],
  },
  {
    id: "days", type: "options" as const,
    q: "How many days a week do you want bookings?",
    opts: ["1–2 days", "3–4 days", "5+ days", "Flexible"],
  },
  { id: "details", type: "details" as const, q: "Your details." },
  { id: "earnings", type: "earnings" as const, q: "Here’s what you’ll earn." },
  { id: "payment", type: "payment" as const, q: "Activate your profile." },
  { id: "success", type: "success" as const, q: "" },
];

const TOTAL = STEPS.length;

const EARNINGS_MAP: Record<string, number> = {
  "1–2 days": 102,
  "3–4 days": 238,
  "5+ days": 340,
  "Flexible": 204,
};

function calcEarnings(days: string): { weekly: number; monthly: number } {
  const weekly = EARNINGS_MAP[days] ?? 204;
  return { weekly, monthly: Math.round(weekly * 4.3) };
}

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

interface DriverModalProps { isOpen: boolean; onClose: () => void; }

export default function DriverModal({ isOpen, onClose }: DriverModalProps) {
  const [expanded, setExpanded] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stripeOpened, setStripeOpened] = useState(false);

  const step = STEPS[stepIdx];
  const progressPct = Math.round((stepIdx / (TOTAL - 1)) * 100);

  useEffect(() => {
    if (!isOpen) return;
    setExpanded(false);
    const t = setTimeout(() => requestAnimationFrame(() => setExpanded(true)), 800);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) track("driver_modal_opened", { step: stepIdx });
  }, [isOpen, stepIdx]);

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setExpanded(false);
        setStepIdx(0);
        setAnswers({});
        setStripeOpened(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  function validate(): boolean {
    if (step.type === "options") return !!answers[step.id];
    if (step.type === "input") {
      const value = ((answers[step.id] as string) ?? "").trim();
      if (step.id === "postcode") return value.length >= 2;
      if (step.id === "radius") return !isNaN(Number(value)) && Number(value) > 0 && Number(value) <= 100;
      return value.length >= 2;
    }
    if (step.type === "details") {
      const digits = ((answers.phone as string) ?? "").replace(/\D/g, "");
      return ((answers.full_name as string) ?? "").trim().length >= 2 &&
        digits.length >= 10 && digits.length <= 15;
    }
    return true;
  }

  const handleNext = useCallback(async () => {
    if (!validate()) return;
    track("driver_step_completed", { step: stepIdx, type: step.type });

    if (step.type === "details") {
      setIsSubmitting(true);
      try {
        const params = new URLSearchParams(window.location.search);
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...answers,
            is_driver: true,
            source: "driver_modal",
            utm: {
              utm_source: params.get("utm_source") ?? "",
              utm_medium: params.get("utm_medium") ?? "",
              utm_campaign: params.get("utm_campaign") ?? "",
            },
          }),
        });
        track("driver_lead_submitted");
      } catch {
        // non-fatal
      } finally {
        setIsSubmitting(false);
      }
    }

    if (stepIdx < TOTAL - 1) setStepIdx((i) => i + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, answers, step]);

  function handleBack() {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  }

  function handleStripeOpen() {
    const url = process.env.NEXT_PUBLIC_STRIPE_DRIVER_PAYMENT_LINK ?? "#";
    window.open(url, "_blank");
    setStripeOpened(true);
    track("driver_stripe_opened");
  }

  function handlePaid() {
    track("driver_payment_confirmed");
    setStepIdx((i) => i + 1);
  }

  const isSuccess = step.type === "success";
  const isPayment = step.type === "payment";
  const showNav = !isSuccess && !isPayment;

  const { weekly, monthly } = calcEarnings((answers.days as string) ?? "Flexible");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ backgroundColor: "rgba(13,13,13,0.6)", opacity: expanded ? 1 : 0 }}
        onClick={isSuccess ? onClose : undefined}
      />

      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          width: expanded ? "min(520px, calc(100vw - 32px))" : "300px",
          maxHeight: expanded ? "92vh" : "86px",
          transform: expanded ? "translateY(0)" : "translateY(calc(-50vh + 90px))",
          transition: "width 0.5s cubic-bezier(0.22,1,0.36,1), max-height 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}
      >

        {expanded && !isSuccess && (
          <div className="h-1 bg-[#E8E8E8] shrink-0">
            <div
              className="h-full bg-gradient-to-r from-[#888888] to-[#0D0D0D] transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {expanded && !isSuccess && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#888888] hover:text-[#0D0D0D] transition-colors p-1 z-10"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {!expanded ? (
          <div className="flex items-center gap-3 px-5 py-[26px]">
            <div className="w-7 h-7 rounded-full border-[3px] border-[#E8E8E8] border-t-[#0D0D0D] animate-spin shrink-0" />
            <div>
              <p className="font-sans font-semibold text-[#0D0D0D] text-sm leading-tight">Please wait…</p>
              <p className="text-[#888888] text-xs mt-0.5">Opening driver registration</p>
            </div>
          </div>
        ) : isSuccess ? (
          <div className="px-8 py-10 flex-1">
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-6">Profile activated</p>
            <h2 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-6">
              Y<span className="font-display italic font-normal">o</span>u&apos;re
              <br />live.
            </h2>
            <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl px-5 py-4 space-y-3 mb-5">
              {answers.postcode ? (
                <div>
                  <p className="text-[#888888] text-[11px] uppercase tracking-[0.1em] mb-0.5">Service area</p>
                  <p className="font-sans font-black text-[#0D0D0D] text-base">{answers.postcode as string} ({answers.radius as string} miles)</p>
                </div>
              ) : null}
              <div className={answers.postcode ? "border-t border-[#E8E8E8] pt-3" : ""}>
                <p className="text-[#888888] text-[11px] uppercase tracking-[0.1em] mb-0.5">Est. weekly earnings</p>
                <p className="font-sans font-black text-[#0D0D0D] text-base">£{weekly}</p>
              </div>
            </div>
            <p className="text-[#888888] text-sm leading-relaxed mb-6">
              Your driver profile is now live and searchable. Customers in your area can find and book you.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-3 rounded-full text-sm transition-colors"
            >
              Done →
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 pt-8 pb-4 overflow-y-auto flex-1">
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">For drivers</p>
              <h2 className="font-sans font-black text-[#0D0D0D] text-xl mb-6 pr-8 tracking-tight">{step.q}</h2>

              {step.type === "options" && (
                <div className="border border-[#E8E8E8] rounded-2xl overflow-hidden">
                  {(step as { opts: string[] }).opts.map((o) => (
                    <OptionCard
                      key={o}
                      label={o}
                      selected={answers[step.id] === o}
                      onClick={() => setAnswers({ ...answers, [step.id]: o })}
                    />
                  ))}
                </div>
              )}

              {step.type === "input" && (
                <input
                  type="text"
                  value={(answers[step.id] as string) ?? ""}
                  onChange={(e) => setAnswers({ ...answers, [step.id]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  placeholder={(step as { placeholder: string }).placeholder}
                  className={inputCls}
                  autoFocus
                />
              )}

              {step.type === "details" && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={(answers.full_name as string) ?? ""}
                    onChange={(e) => setAnswers({ ...answers, full_name: e.target.value })}
                    placeholder="Your name"
                    className={inputCls}
                    autoFocus
                  />
                  <input
                    type="tel"
                    value={(answers.phone as string) ?? ""}
                    onChange={(e) => setAnswers({ ...answers, phone: e.target.value })}
                    placeholder="Phone number"
                    className={inputCls}
                  />
                  <input
                    type="email"
                    value={(answers.email as string) ?? ""}
                    onChange={(e) => setAnswers({ ...answers, email: e.target.value })}
                    placeholder="Email address (optional)"
                    className={inputCls}
                  />
                  <p className="text-[#888888] text-xs">No spam, ever.</p>

                  <div className="border-t border-[#E8E8E8] pt-4 mt-4">
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-[#F5F5F5] p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={(answers.b2b_opt_in as boolean) ?? false}
                        onChange={(e) => setAnswers({ ...answers, b2b_opt_in: e.target.checked })}
                        className="w-5 h-5 mt-0.5 rounded border border-[#E8E8E8] cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#0D0D0D]">Earn from local business leads</p>
                        <p className="text-xs text-[#888888]">Automatically discover nearby businesses and earn standing orders. You can toggle this anytime.</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {step.type === "earnings" && (
                <div className="space-y-4">
                  <div className="bg-[#0D0D0D] rounded-2xl px-6 py-5">
                    <p className="text-[10px] text-white/70 uppercase tracking-[0.15em] mb-3">
                      Based on {answers.days ?? "your availability"}
                    </p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="font-sans font-black text-white text-4xl tracking-tight">£{weekly}</p>
                        <p className="text-white/65 text-xs uppercase tracking-[0.12em] mt-1">per week</p>
                      </div>
                      <div className="text-right">
                        <p className="font-sans font-black text-white text-2xl tracking-tight">£{monthly}</p>
                        <p className="text-white/65 text-xs uppercase tracking-[0.12em] mt-1">per month</p>
                      </div>
                    </div>
                    <div className="border-t border-white/15 mt-4 pt-4 space-y-1">
                      <p className="text-white/70 text-xs leading-relaxed">
                        Your £9.99 monthly fee is covered in your first 2 hours of work.
                      </p>
                      <p className="text-white/50 text-xs">Finish at 3pm. Paid before 4pm.</p>
                    </div>
                  </div>

                  <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-sans font-bold text-[#0D0D0D] text-sm mb-1">Other platforms</p>
                        <p className="text-[#888888] text-sm">Take 15–25% of every job, every time.</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-sans font-black text-[#0D0D0D] text-xl tracking-tight">15–25%</p>
                        <p className="text-[#888888] text-xs">per job</p>
                      </div>
                    </div>
                    <div className="border-t border-[#E8E8E8] mt-4 pt-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-sans font-bold text-[#0D0D0D] text-sm mb-1">Saint &amp; Story</p>
                        <p className="text-[#888888] text-sm">One flat fee. Keep 100% of every job.</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-sans font-black text-[#0D0D0D] text-xl tracking-tight">£9.99</p>
                        <p className="text-[#888888] text-xs">per month</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step.type === "payment" && (
                <div className="space-y-4">
                  <div className="bg-[#0D0D0D] rounded-2xl px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-sans font-black text-white text-2xl tracking-tight">£9.99</p>
                      <p className="text-white/70 text-sm">/month</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-[10px] font-semibold text-white bg-white/15 px-2.5 py-1 rounded-full uppercase tracking-[0.12em]">
                        Founding rate
                      </span>
                      <span className="text-[10px] font-semibold text-white/60 bg-white/10 px-2.5 py-1 rounded-full uppercase tracking-[0.12em]">
                        Cancel anytime
                      </span>
                    </div>
                    <p className="text-white/65 text-xs leading-relaxed">
                      Locked at £9.99/month forever. Weekly billing launches at 100 drivers — you&apos;re grandfathered.
                    </p>
                  </div>

                  <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl px-5 py-4">
                    <p className="text-[#888888] text-[10px] uppercase tracking-[0.12em] mb-2">Your earnings estimate</p>
                    <p className="font-sans font-black text-[#0D0D0D] text-base">£{weekly}/week · £{monthly}/month</p>
                    <p className="text-[#888888] text-xs mt-1">Fee covered in your first 2 hours.</p>
                  </div>

                  {!stripeOpened ? (
                    <button
                      onClick={handleStripeOpen}
                      className="w-full bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-3.5 rounded-full text-sm transition-colors"
                    >
                      Activate now →
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl px-4 py-3 text-center">
                        <p className="text-[#888888] text-sm">Complete payment in the new tab, then return here.</p>
                      </div>
                      <button
                        onClick={handlePaid}
                        className="w-full bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-3.5 rounded-full text-sm transition-colors"
                      >
                        I&apos;ve paid — go live →
                      </button>
                    </div>
                  )}

                  {!stripeOpened && (
                    <button
                      onClick={handleBack}
                      className="w-full text-center text-[#888888] hover:text-[#0D0D0D] font-medium text-sm transition-colors py-1"
                    >
                      ← Back
                    </button>
                  )}
                </div>
              )}
            </div>

            {showNav && (
              <div className="flex items-center justify-between px-6 py-5 border-t border-[#E8E8E8] shrink-0">
                <button
                  onClick={handleBack}
                  className={`text-[#888888] hover:text-[#0D0D0D] font-medium text-sm transition-colors ${stepIdx === 0 ? "invisible" : ""}`}
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!validate() || isSubmitting}
                  className="bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold px-8 py-2.5 rounded-full text-sm transition-colors"
                >
                  {isSubmitting ? "Submitting…" : "Continue →"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
