"use client";

import { useState, useEffect, useCallback } from "react";
import posthog from "posthog-js";
import PostcodeSearch from "./PostcodeSearch";

function track(event: string, props?: Record<string, unknown>) {
  try { posthog.capture(event, props); } catch { /* */ }
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type Answers = Record<string, string | string[] | boolean>;

const STEPS = [
  {
    id: "s1", type: "options", q: "What type of service do you need?",
    opts: ["Transport selected items of furniture", "Moving 1 or 2 rooms", "Moving a whole house", "Rubbish/refuse removal", "Moving Office"],
  },
  {
    id: "s2", type: "options", q: "What large items are you moving?",
    opts: ["No large items", "Sofa(s)", "Wardrobe(s)", "Beds and/or mattresses", "Large appliance (e.g. fridge, washing machine...)"],
  },
  {
    id: "s3", type: "options", q: "When do you need this service?",
    opts: ["I'm flexible", "As soon as possible", "On a specific date", "In the next few days", "In the next few weeks", "In next few months", "Other"],
  },
  { id: "s4", type: "options", q: "Will there be anyone to help load/unload?", opts: ["Yes", "No"] },
  {
    id: "s5", type: "options", q: "How long do you want the service for?",
    opts: ["Up to 2 hours", "Half Day", "All Day", "Multiple days"],
  },
  { id: "s6",  type: "postcode", q: "What postcode are you moving from?", name: "postcode_from" },
  { id: "s6b", type: "postcode", q: "What postcode are you moving to?",  name: "postcode_to"   },
  { id: "s7",  type: "search",   q: "Searching for matches…"                              },
  { id: "s8",  type: "found",    q: "Great! We’ve found your matches."                    },
  { id: "s9",  type: "email",    q: "What email should we send your quotes to?", name: "email"  },
  { id: "s10", type: "phoneConsent", q: "Your number is safe with us."                         },
  { id: "s11", type: "name",     q: "What is your name?",                name: "full_name"     },
  { id: "s12", type: "success",  q: "We’re on it."                                        },
] as const;

const TOTAL = STEPS.length; // 13

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

function StepOptions({ step, answers, setAnswers }: { step: typeof STEPS[number] & { type: "options" }; answers: Answers; setAnswers: (a: Answers) => void }) {
  return (
    <div className="border border-[#E8E8E8] rounded-2xl overflow-hidden">
      {step.opts.map((o) => (
        <OptionCard
          key={o}
          label={o}
          selected={answers[step.id] === o}
          onClick={() => setAnswers({ ...answers, [step.id]: o })}
        />
      ))}
    </div>
  );
}

function StepPostcode({ name, answers, setAnswers, onEnter }: { name: string; answers: Answers; setAnswers: (a: Answers) => void; onEnter: () => void }) {
  const placeholder = name === "postcode_from" ? "e.g. SW1A 2AA" : "e.g. E1 6RF";
  return (
    <PostcodeSearch
      value={(answers[name] as string) ?? ""}
      onChange={(v) => setAnswers({ ...answers, [name]: v })}
      placeholder={placeholder}
      autoFocus
      onEnter={onEnter}
    />
  );
}

function StepSearch({ progress }: { progress: number }) {
  return (
    <div className="py-6 text-center">
      <div className="w-14 h-14 rounded-full border-[3px] border-[#E8E8E8] border-t-[#0D0D0D] animate-spin mx-auto mb-5" />
      <p className="text-[#888888] text-sm mb-5">Matching trusted local drivers near you.</p>
      <div className="bg-[#E8E8E8] rounded-full h-1 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#888888] to-[#0D0D0D] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function StepFound({ from, to, distance }: { from?: string; to?: string; distance?: number | null }) {
  return (
    <div className="py-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
        <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl px-5 py-3 text-center">
          <p className="font-sans font-black text-[#0D0D0D] text-sm">★ 4.9 · 3 matches near you</p>
        </div>
        <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl px-5 py-3 text-center">
          <p className="font-sans font-black text-[#0D0D0D] text-sm">Fast response · Verified drivers</p>
        </div>
      </div>
      {from && to && (
        <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl px-5 py-2.5 text-center mb-5">
          <p className="text-[#0D0D0D] text-xs font-mono tracking-widest">
            {from} → {to}{distance != null ? ` · ~${distance} miles` : ""}
          </p>
        </div>
      )}
      <p className="text-[#888888] text-sm text-center">One more thing — where do we send your quotes?</p>
    </div>
  );
}

function StepEmail({ answers, setAnswers, onEnter }: { answers: Answers; setAnswers: (a: Answers) => void; onEnter: () => void }) {
  return (
    <input
      type="email"
      value={(answers.email as string) ?? ""}
      onChange={(e) => setAnswers({ ...answers, email: e.target.value })}
      onKeyDown={(e) => e.key === "Enter" && onEnter()}
      placeholder="you@example.com"
      className={inputCls}
      autoFocus
    />
  );
}

function StepPhoneConsent({ answers, setAnswers }: { answers: Answers; setAnswers: (a: Answers) => void }) {
  return (
    <div className="space-y-4">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={(answers.phoneConsent as boolean) ?? true}
          onChange={(e) => setAnswers({ ...answers, phoneConsent: e.target.checked })}
          className="mt-0.5 w-4 h-4 shrink-0"
        />
        <span className="text-sm text-[#0D0D0D]">
          It&apos;s OK to contact me by phone about this quote
        </span>
      </label>
      {(answers.phoneConsent as boolean) !== false && (
        <input
          type="tel"
          value={(answers.phone as string) ?? ""}
          onChange={(e) => setAnswers({ ...answers, phone: e.target.value })}
          placeholder="07700 000 000"
          className={inputCls}
        />
      )}
    </div>
  );
}

function StepName({ answers, setAnswers, onEnter }: { answers: Answers; setAnswers: (a: Answers) => void; onEnter: () => void }) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={(answers.full_name as string) ?? ""}
        onChange={(e) => setAnswers({ ...answers, full_name: e.target.value })}
        onKeyDown={(e) => e.key === "Enter" && onEnter()}
        placeholder="Your name"
        className={inputCls}
        autoFocus
      />
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={(answers.marketing as boolean) ?? false}
          onChange={(e) => setAnswers({ ...answers, marketing: e.target.checked })}
          className="mt-0.5 w-4 h-4 shrink-0"
        />
        <span className="text-sm text-[#888888]">
          I am happy to receive occasional marketing emails.
        </span>
      </label>
    </div>
  );
}

function StepSuccess({ answers, onClose }: { answers: Answers; onClose: () => void }) {
  const phone = (answers.phone as string) ?? "";
  const email = (answers.email as string) ?? "";
  const firstName = ((answers.full_name as string) ?? "").split(" ")[0];

  return (
    <div className="py-4 space-y-5">
      <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-2xl px-5 py-4 space-y-3">
        {phone ? (
          <div>
            <p className="text-[#888888] text-[11px] uppercase tracking-[0.1em] mb-0.5">We&apos;ll call you on</p>
            <p className="font-sans font-black text-[#0D0D0D] text-base">{phone}</p>
          </div>
        ) : null}
        <div className={phone ? "border-t border-[#E8E8E8] pt-3" : ""}>
          <p className="text-[#888888] text-[11px] uppercase tracking-[0.1em] mb-0.5">Quotes sent to</p>
          <p className="font-sans font-black text-[#0D0D0D] text-base">{email}</p>
        </div>
      </div>
      <p className="text-[#888888] text-sm leading-relaxed">
        {phone
          ? `${firstName ? `${firstName}, we` : "We"}'re matching your job to verified drivers near you. Expect our call within 15 minutes.`
          : "We're matching your job to verified drivers near you. Quotes will arrive in your inbox within the hour."}
      </p>
      <button
        onClick={onClose}
        className="w-full bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-3 rounded-full text-sm transition-colors"
      >
        Done →
      </button>
      <p className="text-[#888888] text-xs text-center">
        Need us sooner?{" "}
        <a href="tel:+442082344444" className="text-[#0D0D0D] font-semibold underline-offset-2 hover:underline">
          0208 234 4444
        </a>
      </p>
    </div>
  );
}

interface LeadModalProps { isOpen: boolean; onClose: () => void; }

export default function LeadModal({ isOpen, onClose }: LeadModalProps) {
  const [expanded, setExpanded] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ phoneConsent: true });
  const [progress, setProgress] = useState(0);
  const [distance, setDistance] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = STEPS[stepIdx];

  // First 7 steps (options + postcodes) = 65%, rest = 35%
  const progressPct = stepIdx <= 6
    ? Math.round(((stepIdx + 1) / 7) * 65)
    : Math.round(65 + ((stepIdx - 6) / (TOTAL - 7)) * 35);

  useEffect(() => {
    if (!isOpen) return;
    setExpanded(false);
    const t = setTimeout(() => requestAnimationFrame(() => setExpanded(true)), 800);
    return () => clearTimeout(t);
  }, [isOpen]);

  // Search animation — step index 7
  useEffect(() => {
    if (step.type !== "search") return;
    setProgress(0);
    const from = ((answers.postcode_from as string) ?? "").replace(/\s/g, "");
    const to = ((answers.postcode_to as string) ?? "").replace(/\s/g, "");
    if (from && to) {
      fetch("https://api.postcodes.io/postcodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcodes: [from, to] }),
      })
        .then((r) => r.json())
        .then((data) => {
          const r1 = data.result?.[0]?.result;
          const r2 = data.result?.[1]?.result;
          if (r1 && r2) setDistance(Math.round(haversine(r1.latitude, r1.longitude, r2.latitude, r2.longitude)));
        })
        .catch(() => {});
    }
    const interval = setInterval(() => setProgress((p) => Math.min(p + 2, 95)), 50);
    const advance = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setStepIdx(stepIdx + 1);
      setTimeout(() => setStepIdx(stepIdx + 2), 1600);
    }, 2400);
    return () => { clearInterval(interval); clearTimeout(advance); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.type, stepIdx]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) track("lead_modal_opened", { step: stepIdx });
  }, [isOpen, stepIdx]);

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setExpanded(false);
        setStepIdx(0);
        setAnswers({ phoneConsent: true });
        setProgress(0);
        setDistance(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  function validate(): boolean {
    if (step.type === "options") return !!answers[step.id];
    if (step.type === "postcode") return ((answers[(step as { name: string }).name] as string) ?? "").trim().length >= 5;
    if (step.type === "email") return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test((answers.email as string) ?? "");
    if (step.type === "phoneConsent") {
      const phone = (answers.phone as string) ?? "";
      if (!phone.trim()) return true;
      const digits = phone.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 11;
    }
    if (step.type === "name") return ((answers.full_name as string) ?? "").trim().length >= 2;
    return true;
  }

  const handleNext = useCallback(async () => {
    if (!validate()) return;
    track("lead_step_completed", { step: stepIdx, type: step.type });

    if (step.type === "name") {
      setIsSubmitting(true);
      try {
        const params = new URLSearchParams(window.location.search);
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...answers,
            utm: {
              utm_source: params.get("utm_source") ?? "",
              utm_medium: params.get("utm_medium") ?? "",
              utm_campaign: params.get("utm_campaign") ?? "",
            },
          }),
        });
        track("lead_submitted");
      } catch {
        // non-fatal — still advance to success
      } finally {
        setIsSubmitting(false);
      }
    }

    if (stepIdx < TOTAL - 1) setStepIdx((i) => i + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, answers, step]);

  function handleBack() {
    // From email (idx 9), skip back past search/found to destination postcode (idx 6)
    if (stepIdx === 9) { setStepIdx(6); return; }
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  }

  const showNav = step.type !== "search" && step.type !== "found" && step.type !== "success";
  const isLast = stepIdx === TOTAL - 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ backgroundColor: "rgba(13,13,13,0.6)", opacity: expanded ? 1 : 0 }}
        onClick={isLast && expanded ? onClose : undefined}
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

        {expanded && (
          <div className="h-1 bg-[#E8E8E8] shrink-0">
            <div
              className="h-full bg-gradient-to-r from-[#888888] to-[#0D0D0D] transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {expanded && !isLast && (
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
              <p className="text-[#888888] text-xs mt-0.5">Finding the best matches near you</p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 pt-8 pb-4 overflow-y-auto flex-1">
              <h2 className="font-sans font-black text-[#0D0D0D] text-xl mb-6 pr-8 tracking-tight">{step.q}</h2>

              {step.type === "options" && (
                <StepOptions step={step as typeof STEPS[number] & { type: "options" }} answers={answers} setAnswers={setAnswers} />
              )}
              {step.type === "postcode" && (
                <StepPostcode
                  name={(step as { name: string }).name}
                  answers={answers}
                  setAnswers={setAnswers}
                  onEnter={handleNext}
                />
              )}
              {step.type === "search" && <StepSearch progress={progress} />}
              {step.type === "found" && (
                <StepFound
                  from={(answers.postcode_from as string) || undefined}
                  to={(answers.postcode_to as string) || undefined}
                  distance={distance}
                />
              )}
              {step.type === "email" && <StepEmail answers={answers} setAnswers={setAnswers} onEnter={handleNext} />}
              {step.type === "phoneConsent" && <StepPhoneConsent answers={answers} setAnswers={setAnswers} />}
              {step.type === "name" && <StepName answers={answers} setAnswers={setAnswers} onEnter={handleNext} />}
              {step.type === "success" && <StepSuccess answers={answers} onClose={onClose} />}
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
                  {isSubmitting ? "Posting…" : step.type === "name" ? "Submit →" : "Continue →"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
