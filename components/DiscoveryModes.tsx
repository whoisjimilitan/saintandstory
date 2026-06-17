'use client';

import { useState } from 'react';

interface DiscoveryModesProps {
  csvCount: number;
  manualCount: number;
  autonomousCount: number;
}

export function DiscoveryModes({ csvCount, manualCount, autonomousCount }: DiscoveryModesProps) {
  const [expandedMode, setExpandedMode] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [manualForm, setManualForm] = useState({
    businessName: '',
    businessCategory: '',
    email: '',
    city: '',
    postcode: '',
    contactName: '',
    phone: ''
  });
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCsvUpload = async () => {
    if (!csvFile) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    setLoading('csv');
    try {
      const text = await csvFile.text();
      const response = await fetch('/api/b2b/csv-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: text })
      });

      const result = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: `Imported ${result.count} leads successfully` });
        setCsvFile(null);
        setExpandedMode(null);
      } else {
        setMessage({ type: 'error', text: result.error || 'Import failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Upload failed' });
    } finally {
      setLoading(null);
    }
  };

  const handleManualEntry = async () => {
    if (!manualForm.businessName || !manualForm.businessCategory || !manualForm.email) {
      setMessage({ type: 'error', text: 'Fill in required fields: Business Name, Category, Email' });
      return;
    }

    setLoading('manual');
    try {
      const response = await fetch('/api/b2b/add-prospect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualForm)
      });

      const result = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: `Added ${manualForm.businessName} to pipeline` });
        setManualForm({ businessName: '', businessCategory: '', email: '', city: '', postcode: '', contactName: '', phone: '' });
        setExpandedMode(null);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to add prospect' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Entry failed' });
    } finally {
      setLoading(null);
    }
  };

  const modes = [
    {
      id: 'upload',
      title: 'Upload Discovery',
      description: 'Batch import businesses',
      count: csvCount,
      label: 'CSV imports',
      icon: '📤',
      subtitle: 'Upload multiple leads at once'
    },
    {
      id: 'manual',
      title: 'Manual Entry',
      description: 'Add single prospect',
      count: manualCount,
      label: 'Manual entries',
      icon: '✏️',
      subtitle: 'Add one business to pipeline'
    },
    {
      id: 'autonomous',
      title: 'Autonomous View',
      description: 'System insights',
      count: autonomousCount,
      label: 'Autonomous discoveries',
      icon: '🤖',
      subtitle: 'What the system has identified'
    }
  ];

  return (
    <div className="mb-16">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
        Alternative Discovery Modes
      </p>
      <div className="grid grid-cols-3 gap-4">
        {modes.map((mode) => {
          const isExpanded = expandedMode === mode.id;

          return (
            <div
              key={mode.id}
              onClick={() => setExpandedMode(isExpanded ? null : mode.id)}
              className={`bg-white border border-[#E8E8E8] rounded p-4 cursor-pointer transition-all hover:border-[#D0D0D0] ${
                isExpanded ? 'col-span-3 ring-1 ring-[#0D0D0D]' : ''
              }`}
            >
              {!isExpanded ? (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#0D0D0D]">{mode.title}</p>
                      <p className="text-[10px] text-[#888888] mt-1">{mode.subtitle}</p>
                    </div>
                    <span className="text-xl">{mode.icon}</span>
                  </div>
                  <p className="text-2xl font-black text-[#0D0D0D] mt-4">{mode.count}</p>
                  <p className="text-[10px] text-[#666666] mt-1">{mode.label}</p>
                </>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-[#0D0D0D]">{mode.title}</h3>

                  {mode.id === 'upload' && (
                    <>
                      <div className="border-2 border-dashed border-[#E8E8E8] rounded p-6 text-center hover:border-[#D0D0D0] transition-colors">
                        <input
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="csv-input"
                        />
                        <label htmlFor="csv-input" className="cursor-pointer block">
                          <p className="text-sm font-semibold text-[#0D0D0D] mb-1">
                            {csvFile ? csvFile.name : 'Click to upload or drag CSV'}
                          </p>
                          <p className="text-[10px] text-[#888888]">CSV or Excel file</p>
                        </label>
                      </div>
                      <button
                        onClick={handleCsvUpload}
                        disabled={!csvFile || loading === 'csv'}
                        className="w-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.05em] rounded bg-[#0D0D0D] text-white hover:bg-[#333333] disabled:opacity-60 transition-colors"
                      >
                        {loading === 'csv' ? 'Uploading...' : 'Upload CSV'}
                      </button>
                    </>
                  )}

                  {mode.id === 'manual' && (
                    <>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] block mb-1">
                            Business Name *
                          </label>
                          <input
                            type="text"
                            value={manualForm.businessName}
                            onChange={(e) => setManualForm({ ...manualForm, businessName: e.target.value })}
                            placeholder="E.g., Acme Corporation"
                            className="w-full px-3 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] block mb-1">
                            Category *
                          </label>
                          <input
                            type="text"
                            value={manualForm.businessCategory}
                            onChange={(e) => setManualForm({ ...manualForm, businessCategory: e.target.value })}
                            placeholder="E.g., Logistics"
                            className="w-full px-3 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] block mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={manualForm.email}
                            onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                            placeholder="E.g., contact@acme.com"
                            className="w-full px-3 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] block mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              value={manualForm.city}
                              onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                              placeholder="London"
                              className="w-full px-3 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] block mb-1">
                              Postcode
                            </label>
                            <input
                              type="text"
                              value={manualForm.postcode}
                              onChange={(e) => setManualForm({ ...manualForm, postcode: e.target.value })}
                              placeholder="M1 1AA"
                              className="w-full px-3 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleManualEntry}
                        disabled={loading === 'manual'}
                        className="w-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.05em] rounded bg-[#0D0D0D] text-white hover:bg-[#333333] disabled:opacity-60 transition-colors"
                      >
                        {loading === 'manual' ? 'Adding...' : 'Add Prospect'}
                      </button>
                    </>
                  )}

                  {mode.id === 'autonomous' && (
                    <div className="bg-[#F5F5F5] rounded p-4 text-center">
                      <p className="text-sm text-[#0D0D0D] mb-3">
                        System-identified opportunities appear here when autonomous discovery runs.
                      </p>
                      <p className="text-[10px] text-[#888888]">
                        Currently: <span className="font-semibold">{autonomousCount}</span> discovered businesses awaiting review
                      </p>
                    </div>
                  )}

                  {message && (
                    <div className={`p-3 rounded text-sm ${
                      message.type === 'success'
                        ? 'bg-[#E8F5E9] text-[#1B5E20]'
                        : 'bg-[#FFE5E5] text-[#CC0000]'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <button
                    onClick={() => setExpandedMode(null)}
                    className="w-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.05em] rounded border border-[#E8E8E8] text-[#0D0D0D] hover:border-[#D0D0D0] transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
