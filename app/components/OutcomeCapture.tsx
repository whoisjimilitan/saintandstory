"use client";

import { useState } from "react";

interface OutcomeCaptureProps {
  conversationId: string;
  question: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OutcomeCapture({
  conversationId,
  question,
  onClose,
  onSuccess,
}: OutcomeCaptureProps) {
  const [step, setStep] = useState(1);
  const [signal, setSignal] = useState("");
  const [learning, setLearning] = useState("");
  const [classification, setClassification] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const signalOptions = [
    { value: "no_answer", label: "No answer" },
    { value: "spoke_briefly", label: "Spoke briefly" },
    { value: "real_conversation", label: "Real conversation" },
    { value: "not_interested", label: "Not interested" },
    { value: "wrong_fit", label: "Wrong fit" },
  ];

  const classificationOptions = [
    { value: "supports", label: "Supports hypothesis" },
    { value: "contradicts", label: "Contradicts hypothesis" },
    { value: "unclear", label: "Unclear" },
    { value: "new_signal", label: "New signal discovered" },
  ];

  const toggleClassification = (value: string) => {
    setClassification((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const canContinue =
    step === 1 && signal
      ? true
      : step === 2
        ? true
        : step === 3 && classification.length > 0
          ? true
          : false;

  const handleSave = async () => {
    if (!signal || classification.length === 0) return;

    setSaving(true);
    try {
      const response = await fetch("/api/workflow/outcomes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          signalType: signal,
          signalClassification: classification[0], // Use first selected classification
          unexpectedLearning: learning || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save outcome");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving outcome:", error);
      alert("Failed to save outcome");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        {/* Step 1: What happened? */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">What happened?</h2>
            <p className="text-gray-600 mb-6 text-sm">{question}</p>

            <div className="space-y-3 mb-8">
              {signalOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSignal(option.value)}
                  className={`w-full p-3 text-left rounded border-2 transition-colors ${
                    signal === option.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!signal}
              className={`w-full py-2 rounded font-medium ${
                signal
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: What surprised you? */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">What surprised you?</h2>
            <p className="text-gray-600 mb-6 text-sm">Optional observation</p>

            <textarea
              value={learning}
              onChange={(e) => setLearning(e.target.value)}
              placeholder="Owner mentioned 3-4 months coordination time..."
              className="w-full p-3 border border-gray-300 rounded mb-6 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              rows={4}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2 rounded font-medium border border-gray-300 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-2 rounded font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: What does this say? */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">What does this say?</h2>
            <p className="text-gray-600 mb-6 text-sm">About our hypothesis</p>

            <div className="space-y-3 mb-8">
              {classificationOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={classification.includes(option.value)}
                    onChange={() => toggleClassification(option.value)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="ml-3 font-medium text-sm">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2 rounded font-medium border border-gray-300 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={!signal || classification.length === 0 || saving}
                className={`flex-1 py-2 rounded font-medium ${
                  signal && classification.length > 0 && !saving
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-6 flex gap-2 justify-center">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-8 rounded ${
                step >= s ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
