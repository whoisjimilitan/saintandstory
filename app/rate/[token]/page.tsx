"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function RatePage() {
  const params = useParams();
  const token = params.token as string;

  const [job, setJob] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/ratings?token=${token}`)
      .then(r => r.json())
      .then(data => { setJob(data.job ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  async function submit() {
    if (score === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, score, comment }),
      });
      if (res.ok) setSubmitted(true);
      else setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
      <p className="text-[#888888] text-sm">Loading…</p>
    </div>
  );

  if (!job) return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-sans font-black text-[#0D0D0D] text-xl mb-2">Link not found.</p>
        <p className="text-[#888888] text-sm">This rating link may have expired or already been used.</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="bg-[#0D0D0D] rounded-2xl px-8 py-10 mb-6">
          <p className="font-sans font-black text-white text-4xl tracking-tight mb-3">
            {"★".repeat(score)}
          </p>
          <h1 className="font-sans font-black text-white text-2xl tracking-tight mb-2">Thank you.</h1>
          <p className="text-white/65 text-sm">Your rating helps other customers choose with confidence.</p>
        </div>
        <a
          href="/"
          className="inline-block bg-white border border-[#E8E8E8] hover:border-[#0D0D0D] text-[#0D0D0D] font-semibold px-7 py-3 rounded-full text-sm transition-colors"
        >
          Back to Saint &amp; Story →
        </a>
      </div>
    </div>
  );

  const driverName = (job.driver_name as string) || "your driver";
  const alreadyRated = job.already_rated === true;

  if (alreadyRated) return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-sans font-black text-[#0D0D0D] text-xl mb-2">Already rated.</p>
        <p className="text-[#888888] text-sm">You&apos;ve already submitted a rating for this job.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="bg-[#0D0D0D] rounded-2xl px-6 py-8 mb-4 text-center">
          <p className="text-white/55 text-[10px] uppercase tracking-[0.2em] mb-3">Rate your driver</p>
          <h1 className="font-sans font-black text-white text-2xl tracking-tight mb-1">{driverName}</h1>
          <p className="text-white/55 text-xs">
            {job.postcode_from as string}{job.postcode_to ? ` → ${job.postcode_to as string}` : ""}
          </p>
        </div>

        <div className="bg-white border border-[#E8E8E8] rounded-2xl px-6 py-7 mb-4">
          <p className="text-[#888888] text-[10px] uppercase tracking-[0.2em] text-center mb-5">How did they do?</p>

          {/* Star selector */}
          <div className="flex justify-center gap-3 mb-6">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setScore(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                className={`text-4xl transition-transform hover:scale-110 ${
                  n <= (hovered || score) ? "text-[#0D0D0D]" : "text-[#E8E8E8]"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          {score > 0 && (
            <p className="text-center text-[#888888] text-xs mb-5">
              {["", "Poor", "Below average", "Good", "Very good", "Excellent"][score]}
            </p>
          )}

          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Leave a comment (optional)"
            rows={3}
            className="w-full border border-[#E8E8E8] rounded-xl px-4 py-3 text-sm text-[#0D0D0D] placeholder-[#888888] focus:outline-none focus:border-[#0D0D0D] resize-none mb-5"
          />

          {error && <p className="text-red-500 text-xs text-center mb-3">{error}</p>}

          <button
            onClick={submit}
            disabled={score === 0 || submitting}
            className="w-full bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-30 text-white font-semibold py-3.5 rounded-full text-sm transition-colors"
          >
            {submitting ? "Submitting…" : "Submit rating →"}
          </button>
        </div>
      </div>
    </div>
  );
}
