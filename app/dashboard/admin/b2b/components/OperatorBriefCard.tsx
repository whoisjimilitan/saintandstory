'use client';

import { useState } from 'react';

interface OperatorBriefCardProps {
  prospect_name: string;
  prospect_reply: string;
  original_recognition: string;
  pressure_type: string;
  framework: {
    step_1_start: string;
    step_2_acknowledge: string;
    step_3_explain: string;
    step_4_proof: string;
    step_5_their_reality: string;
    step_6_validation: string;
  };
  do_not_do: string[];
  tone_guidance: string;
  onSubmit: (response: string) => void;
}

export function OperatorBriefCard({
  prospect_name,
  prospect_reply,
  original_recognition,
  pressure_type,
  framework,
  do_not_do,
  tone_guidance,
  onSubmit,
}: OperatorBriefCardProps) {
  const [response, setResponse] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (response.trim()) {
      onSubmit(response);
      setSubmitted(true);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h2 className="text-2xl font-serif font-bold mb-2">{prospect_name}</h2>
        <p className="text-sm text-gray-600 uppercase tracking-wider">Operator Brief</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Left: Context */}
        <div>
          <div className="mb-6">
            <p className="text-xs uppercase text-gray-500 tracking-wider mb-2">Their Reply</p>
            <p className="text-sm text-gray-700 italic leading-relaxed">"{prospect_reply}"</p>
          </div>

          <div className="mb-6">
            <p className="text-xs uppercase text-gray-500 tracking-wider mb-2">Original Recognition</p>
            <p className="text-sm text-gray-700 leading-relaxed">{original_recognition}</p>
          </div>

          <div>
            <p className="text-xs uppercase text-gray-500 tracking-wider mb-2">Pressure Type</p>
            <p className="text-sm font-medium text-gray-900">{pressure_type}</p>
          </div>
        </div>

        {/* Right: Framework */}
        <div>
          <p className="text-xs uppercase text-gray-500 tracking-wider mb-4">Response Framework</p>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-900">Step 1:</span>
              <p className="text-gray-600 mt-1">{framework.step_1_start}</p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Step 2:</span>
              <p className="text-gray-600 mt-1">{framework.step_2_acknowledge}</p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Step 3 (You fill):</span>
              <p className="text-gray-500 mt-1 italic">{framework.step_3_explain}</p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Step 4 (You fill):</span>
              <p className="text-gray-500 mt-1 italic">{framework.step_4_proof}</p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Step 5 (You fill):</span>
              <p className="text-gray-500 mt-1 italic">{framework.step_5_their_reality}</p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Step 6:</span>
              <p className="text-gray-600 mt-1">{framework.step_6_validation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guardrails */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-xs uppercase text-gray-500 tracking-wider mb-3">Do NOT:</p>
        <div className="grid grid-cols-2 gap-2">
          {do_not_do.map((rule, i) => (
            <p key={i} className="text-sm text-red-600">
              {rule}
            </p>
          ))}
        </div>
      </div>

      {/* Tone */}
      <div className="mt-4">
        <p className="text-xs uppercase text-gray-500 tracking-wider mb-2">Tone</p>
        <p className="text-sm text-gray-600">{tone_guidance}</p>
      </div>

      {/* Response Input */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <label className="block text-xs uppercase text-gray-500 tracking-wider mb-3">
          Your Response
        </label>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Write your response following the framework above..."
          className="w-full p-4 border border-gray-200 rounded text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
          rows={8}
        />

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!response.trim() || submitted}
            className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {submitted ? 'Submitted ✓' : 'Submit & Send'}
          </button>
          <button
            onClick={() => setResponse('')}
            className="px-6 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
