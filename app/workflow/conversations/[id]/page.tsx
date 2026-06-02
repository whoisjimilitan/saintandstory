"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import OutcomeCapture from "@/app/components/OutcomeCapture";

type Conversation = {
  id: string;
  date: string;
  method: string;
  question: string;
  outcome?: {
    signalType: string;
    signalClassification: string;
    notes?: string;
    recordedAt: string;
  } | null;
  status: string;
};

export default function ConversationsPage() {
  const params = useParams();
  const businessId = typeof params.id === 'string' ? params.id : '';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCapture, setShowCapture] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/workflow/conversations/${businessId}`);
      const data = await res.json();
      setConversations(data.conversations);
      setLoading(false);
    }
    fetchData();
  }, [businessId]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-2">Conversations</h1>
      <p className="text-gray-600 mb-8">Outreach and interaction history</p>

      {conversations.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 p-12 rounded-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">No conversations yet</h2>
          <p className="text-gray-700 mb-6">
            This is where conversations with the business owner will be recorded. Each conversation
            preserves the question asked and the response received.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
            Schedule First Conversation
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {conversations.map(c => (
            <div key={c.id} className="bg-white border border-gray-200 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-gray-600">{new Date(c.date).toLocaleDateString()}</p>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    c.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <p className="font-semibold mb-3">{c.question}</p>
              {c.outcome ? (
                <div className="bg-gray-50 p-4 rounded mt-4">
                  <p className="text-sm font-medium mb-2">Outcome</p>
                  <p>Signal: {c.outcome.signalType}</p>
                  <p>Classification: {c.outcome.signalClassification}</p>
                  {c.outcome.notes && <p className="mt-2 italic">{c.outcome.notes}</p>}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedConversation(c);
                    setShowCapture(true);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                >
                  Log Outcome
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showCapture && selectedConversation && (
        <OutcomeCapture
          conversationId={selectedConversation.id}
          question={selectedConversation.question}
          onClose={() => setShowCapture(false)}
          onSuccess={() => {
            setShowCapture(false);
            window.location.reload();
          }}
        />
      )}

      <div className="mt-8 flex gap-4">
        <Link href={`/workflow/investigation/${params.id}`} className="text-blue-600">
          ← Back to Investigation
        </Link>
        <Link href={`/workflow/outcomes/${params.id}`} className="text-blue-600">
          View Outcomes →
        </Link>
      </div>
    </div>
  );
}
