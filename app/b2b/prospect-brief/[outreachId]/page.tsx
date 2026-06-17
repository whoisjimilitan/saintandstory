"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface OutreachData {
  id: string;
  subject: string;
  body: string;
  pressure_type: string | null;
  b2b_leads: {
    business_name: string;
    email: string | null;
    phone: string | null;
  };
}

interface QualificationFormData {
  prospect_first_name: string;
  prospect_role: string;
  prospect_phone: string;
  prospect_email: string;
  proposed_call_time: string;
  notes: string;
}

export default function ProspectBriefPage({
  params,
}: {
  params: { outreachId: string };
}) {
  const searchParams = useSearchParams();
  const response = searchParams.get("response");
  const [outreach, setOutreach] = useState<OutreachData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<QualificationFormData>({
    prospect_first_name: "",
    prospect_role: "",
    prospect_phone: "",
    prospect_email: "",
    proposed_call_time: "",
    notes: "",
  });

  useEffect(() => {
    const fetchOutreach = async () => {
      try {
        const res = await fetch(`/api/b2b/outreach/${params.outreachId}`);
        const data = await res.json();
        setOutreach(data);
      } catch (err) {
        console.error("Failed to fetch outreach:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOutreach();
  }, [params.outreachId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/b2b/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outreach_id: params.outreachId,
          ...form,
        }),
      });

      if (res.ok) {
        window.location.href = "/b2b/dashboard";
      }
    } catch (err) {
      console.error("Failed to submit:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!outreach) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Not found</h1>
          <p className="text-gray-600 mt-2">This opportunity is no longer available</p>
          <Link href="/b2b/dashboard" className="text-blue-600 mt-4 inline-block">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const responseText =
    response === "YES"
      ? "Great! You said this sounded like you."
      : response === "NO"
        ? "Got it—this isn't your immediate need."
        : "Let's understand your situation better.";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-8 py-4">
          <Link href="/b2b/dashboard" className="text-gray-600 hover:text-gray-900">
            ← Back
          </Link>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-2xl mx-auto px-8 py-8">
        {/* Context */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {outreach.b2b_leads.business_name}
          </h1>

          {response && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
              {responseText}
            </div>
          )}

          {outreach.pressure_type && (
            <div className="mt-4">
              <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm font-medium">
                {outreach.pressure_type}
              </span>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
            <p className="text-sm text-gray-600 mb-2 font-medium">
              The opportunity we saw:
            </p>
            <p className="text-gray-900 whitespace-pre-wrap">{outreach.body}</p>
          </div>
        </div>

        {/* Qualification Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Let's get to know you better
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First name
                </label>
                <input
                  type="text"
                  required
                  value={form.prospect_first_name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      prospect_first_name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your role
                </label>
                <input
                  type="text"
                  required
                  value={form.prospect_role}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      prospect_role: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={form.prospect_phone}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      prospect_phone: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.prospect_email}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      prospect_email: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Best time to chat
              </label>
              <select
                value={form.proposed_call_time}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    proposed_call_time: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
              >
                <option value="">Select a time</option>
                <option value="morning">Tomorrow morning</option>
                <option value="afternoon">Tomorrow afternoon</option>
                <option value="this_week">This week</option>
                <option value="next_week">Next week</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anything else?
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    notes: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                placeholder="Optional notes"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gray-900 text-white py-2 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save and continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
