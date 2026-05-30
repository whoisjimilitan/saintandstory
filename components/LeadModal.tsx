"use client";

import { useState, useEffect, useCallback } from "react";
import posthog from "posthog-js";

function track(event: string, props?: Record<string, unknown>) {
  try { posthog.capture(event, props); } catch { /* */ }
}

// ── Types ──────────────────────────────────────────────────────────────────
type Answers = Record<string, string | string[] | boolean>;

// ── Steps definition ───────────────────────────────────────────────────────
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
  { id: "s6", type: "input", q: "Where do you need the Man and Van Service?", placeholder: "Enter postcode or town", name: "postcode_from" },
  { id: "s7", type: "search", q: "Searching for matches…" },
  { id: "s8", type: "found", q: "Great! We’ve found you the perfect matches." },
  { id: "s9", type: "email", q: "What email address would you like quotes sent to?", name: "email" },
  { id: "s10", type: "phoneConsent", q: "Your number is safe with us." },
  { id: "s11", type: "name", q: "What is your name?", placeholder: "Please tell us your name", name: "full_name" },
  { id: "s12", type: "success", q: "We’ve posted your request" },
] as const;

const TOTAL = STEPS.length;

// ── Shared ─────────────────────────────────────────────────────────────────
const inputCls = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all";

// Radio-circle option row (matches Bark screenshot exactly)
function OptionCard({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0 text-left hover:bg-gray-50 transition-colors"
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
        selected ? "border-brand bg-brand" : "border-gray-300 bg-white"
      }`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <span className={`text-sm flex-1 ${selected ? "text-navy font-semibold" : "text-gray-600"}`}>{label}</span>
    </button>
  );
}

// ── Step renders ───────────────────────────────────────────────────────────
function StepOptions({ step, answers, setAnswers }: { step: typeof STEPS[number] & { type: "options" }; answers: Answers; setAnswers: (a: Answers) => void }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
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

function StepInput({ step, answers, setAnswers, onEnter }: { step: { q: string; placeholder: string; name: string }; answers: Answers; setAnswers: (a: Answers) => void; onEnter: () => void }) {
  return (
    <input
      type="text"
      value={(answers[step.name] as string) ?? ""}
      onChange={(e) => setAnswers({ ...answers, [step.name]: e.target.value })}
      onKeyDown={(e) => e.key === "Enter" && onEnter()}
      placeholder={step.placeholder}
      className={inputCls}
      autoFocus
    />
  );
}

function StepSearch({ progress }: { progress: number }) {
  return (
    <div className="py-6 text-center">
      <div
        className="w-16 h-16 rounded-full mx-auto mb-5 animate-spin"
        style={{ background: "conic-gradient(#0b6cff 0%, #3ac3ff 60%, transparent 60%)" }}
      />
      <h3 className="font-bold text-navy text-base mb-1">Searching for the best matches near you...</h3>
      <p className="text-gray-500 text-sm mb-5">We&apos;re matching trusted local movers now.</p>
      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg, #0b6cff, #3ac3ff)" }}
        />
      </div>
    </div>
  );
}

function StepFound() {
  return (
    <div className="py-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
        <div className="bg-white border border-gray-100 shadow-sm rounded-lg px-5 py-3 text-center">
          <p className="font-bold text-navy text-sm">★ 4.7 — Found 3 matches near you</p>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-lg px-5 py-3 text-center">
          <p className="font-bold text-navy text-sm">Fast response · Insured movers</p>
        </div>
      </div>
      <p className="text-gray-500 text-sm text-center">Lastly, we need your details to attach to your request.</p>
    </div>
  );
}

function StepEmail({ answers, setAnswers, onEnter }: { answers: Answers; setAnswers: (a: Answers) => void; onEnter: () => void }) {
  return (
    <div className="space-y-2">
      <input
        type="email"
        value={(answers.email as string) ?? ""}
        onChange={(e) => setAnswers({ ...answers, email: e.target.value })}
        onKeyDown={(e) => e.key === "Enter" && onEnter()}
        placeholder="you@example.com"
        className={inputCls}
        autoFocus
      />
      <p className="text-gray-400 text-xs">We will send quotes to this address.</p>
    </div>
  );
}

function StepPhoneConsent({ answers, setAnswers }: { answers: Answers; setAnswers: (a: Answers) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-gray-500 text-sm">Some matches prefer to provide quotes over the phone to get more details.</p>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={(answers.phoneConsent as boolean) ?? true}
          onChange={(e) => setAnswers({ ...answers, phoneConsent: e.target.checked })}
          className="mt-0.5 accent-brand w-4 h-4 shrink-0"
        />
        <span className="text-sm text-gray-700">
          It&apos;s OK to contact me by phone about this quote
        </span>
      </label>
      {(answers.phoneConsent as boolean) !== false && (
        <input
          type="tel"
          value={(answers.phone as string) ?? ""}
          onChange={(e) => setAnswers({ ...answers, phone: e.target.value })}
          placeholder="+44 7700 000 000"
          className={inputCls}
        />
      )}
      <p className="text-gray-400 text-xs">You can skip adding a phone and stay email-only.</p>
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
        placeholder="Please tell us your name"
        className={inputCls}
        autoFocus
      />
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={(answers.marketing as boolean) ?? false}
          onChange={(e) => setAnswers({ ...answers, marketing: e.target.checked })}
          className="mt-0.5 accent-brand w-4 h-4 shrink-0"
        />
        <span className="text-sm text-gray-600">
          I am happy to receive occasional marketing emails.
        </span>
      </label>
    </div>
  );
}

function StepSuccess({ onClose }: { onClose: () => void }) {
  return (
    <div className="py-4">
      <p className="text-gray-700 text-sm mb-5">
        Describe your request in detail to get faster and more accurate quotes.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          Add details &amp; photos
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-brand hover:bg-brand-dark text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
        >
          View matches
        </button>
      </div>
      <p className="text-gray-400 text-xs text-center mt-4">Protected under our privacy policy</p>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadModal({ isOpen, onClose }: LeadModalProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ phoneConsent: true });
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = STEPS[stepIdx];

  // Multi-stage progress bar: fills fast (13%/step) for first 5 steps so user thinks
  // "only 5 questions", then reveals the full journey at a slower pace for steps 6–12.
  const progressPct = stepIdx <= 4
    ? Math.round(((stepIdx + 1) / 5) * 65)
    : Math.round(65 + ((stepIdx - 4) / (TOTAL - 5)) * 35);

  // Search animation → auto-advance to found → auto-advance to email
  useEffect(() => {
    if (step.type !== "search") return;
    setProgress(0);
    const interval = setInterval(() => setProgress((p) => Math.min(p + 2, 95)), 50);
    const advance = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setStepIdx(stepIdx + 1);
      setTimeout(() => setStepIdx(stepIdx + 2), 900);
    }, 1400);
    return () => { clearInterval(interval); clearTimeout(advance); };
  }, [step.type, stepIdx]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) track("lead_modal_opened", { step: stepIdx });
  }, [isOpen, stepIdx]);

  // Reset state after close animation
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setStepIdx(0);
        setAnswers({ phoneConsent: true });
        setProgress(0);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  function validate(): boolean {
    if (step.type === "options") return !!answers[step.id];
    if (step.type === "input") return ((answers[(step as { name: string }).name] as string) ?? "").trim().length >= 2;
    if (step.type === "email") return /\S+@\S+\.\S+/.test((answers.email as string) ?? "");
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
    // Email step (8) must skip back past search (6) + found (7) which auto-advance
    if (stepIdx === 8) { setStepIdx(5); return; }
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  }

  const showNav = step.type !== "search" && step.type !== "found" && step.type !== "success";
  const isLast = stepIdx === TOTAL - 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isLast ? onClose : undefined}
      />

      {/* Modal card */}
      <div className="relative bg-white rounded-2xl w-full max-w-[520px] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Multi-stage progress bar — flush to top edge, no header padding */}
        <div className="h-1.5 bg-gray-100 shrink-0">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #0b6cff, #3ac3ff)" }}
          />
        </div>

        {/* Close button — floats top-right over content */}
        {!isLast && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 z-10"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Step body */}
        <div className="px-6 pt-8 pb-4 overflow-y-auto flex-1">
          <h2 className="font-bold text-navy text-xl mb-6 pr-8">{step.q}</h2>

          {step.type === "options" && (
            <StepOptions step={step as typeof STEPS[number] & { type: "options" }} answers={answers} setAnswers={setAnswers} />
          )}
          {step.type === "input" && (
            <StepInput step={step as { q: string; placeholder: string; name: string }} answers={answers} setAnswers={setAnswers} onEnter={handleNext} />
          )}
          {step.type === "search" && <StepSearch progress={progress} />}
          {step.type === "found" && <StepFound />}
          {step.type === "email" && <StepEmail answers={answers} setAnswers={setAnswers} onEnter={handleNext} />}
          {step.type === "phoneConsent" && <StepPhoneConsent answers={answers} setAnswers={setAnswers} />}
          {step.type === "name" && <StepName answers={answers} setAnswers={setAnswers} onEnter={handleNext} />}
          {step.type === "success" && <StepSuccess onClose={onClose} />}
        </div>

        {/* Footer nav — Back (ghost) + Continue (solid) */}
        {showNav && (
          <div className="flex items-center justify-between px-6 py-5 border-t border-gray-100 shrink-0">
            <button
              onClick={handleBack}
              className={`border border-gray-200 text-gray-600 font-medium px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors ${stepIdx === 0 ? "invisible" : ""}`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!validate() || isSubmitting}
              className="bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-8 py-2.5 rounded-lg text-sm transition-colors"
            >
              {isSubmitting ? "Posting..." : step.type === "name" ? "Submit" : "Continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
