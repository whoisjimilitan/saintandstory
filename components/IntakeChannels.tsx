'use client';

import { useState } from 'react';

interface IntakeSource {
  name: string;
  route: string;
  status: 'operational' | 'hidden' | 'missing';
  count: number;
  last_activity?: string;
  color: string;
}

interface Props {
  sources: IntakeSource[];
}

export function IntakeChannels({ sources }: Props) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [postcode, setPostcode] = useState('');
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
        setMessage({ type: 'success', text: `Imported ${result.count} businesses successfully` });
        setCsvFile(null);
        setExpandedCard(null);
      } else {
        setMessage({ type: 'error', text: result.error || 'Import failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Upload failed' });
    } finally {
      setLoading(null);
    }
  };

  const handlePostcodeSearch = async () => {
    if (!postcode.trim()) {
      setMessage({ type: 'error', text: 'Please enter a postcode' });
      return;
    }

    setLoading('postcode');
    try {
      const response = await fetch('/api/b2b/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postcode: postcode.toUpperCase(),
          radius: 5,
          category: 'all',
        })
      });
      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Found ${result.count} businesses in ${postcode}. Added to pipeline.` });
        setPostcode('');
        setExpandedCard(null);
      } else {
        setMessage({ type: 'error', text: result.error || 'Search failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Search failed' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mb-16">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
        Opportunity Intake Channels
      </p>
      <div className="grid grid-cols-2 gap-4">
        {sources.map((source) => {
          const isExpanded = expandedCard === source.name;
          const isCSV = source.name === 'CSV Import';
          const isPostcode = source.name === 'Postcode Search';
          const isInteractive = isCSV || isPostcode;

          return (
            <div
              key={source.name}
              onClick={() => isInteractive && setExpandedCard(isExpanded ? null : source.name)}
              className={`bg-white border border-[#E8E8E8] rounded p-4 transition-all ${
                isInteractive ? 'cursor-pointer hover:border-[#D0D0D0] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]' : ''
              } ${isExpanded ? 'col-span-2' : ''}`}
            >
              {!isExpanded ? (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-[#0D0D0D]">
                        {source.name}
                      </p>
                      <p className="text-[10px] text-[#888888] mt-1">
                        {source.last_activity}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-[0.05em] px-2 py-1 rounded ${
                      source.status === 'operational'
                        ? 'bg-[#E8F5E9] text-[#1B5E20]'
                        : source.status === 'hidden'
                        ? 'bg-[#FFF8E5] text-[#CC6600]'
                        : 'bg-[#FFE5E5] text-[#CC0000]'
                    }`}>
                      {source.status === 'operational' ? 'Active' : source.status === 'hidden' ? 'Hidden' : 'Missing'}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-[#0D0D0D]">
                    {source.count}
                  </p>
                  <p className="text-[10px] text-[#666666] mt-2">
                    Entries from {source.name.toLowerCase()}
                  </p>
                  {isInteractive && (
                    <p className="text-[10px] text-[#0D0D0D] mt-3 font-medium">
                      Click to {isCSV ? 'upload CSV' : 'enter postcode'}
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-[#0D0D0D]">
                    {source.name}
                  </h3>

                  {isCSV && (
                    <>
                      <div className="border-2 border-dashed border-[#E8E8E8] rounded p-6 text-center hover:border-[#D0D0D0] transition-colors">
                        <input
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="csv-input"
                        />
                        <label
                          htmlFor="csv-input"
                          className="cursor-pointer block"
                        >
                          <p className="text-sm font-semibold text-[#0D0D0D] mb-1">
                            {csvFile ? csvFile.name : 'Click to upload or drag CSV'}
                          </p>
                          <p className="text-[10px] text-[#888888]">
                            CSV or Excel file
                          </p>
                        </label>
                      </div>

                      <button
                        onClick={handleCsvUpload}
                        disabled={!csvFile || loading === 'csv'}
                        className="w-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.05em] rounded bg-[#0D0D0D] text-white border border-[#0D0D0D] hover:bg-[#333333] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading === 'csv' ? 'Uploading...' : 'Upload CSV'}
                      </button>
                    </>
                  )}

                  {isPostcode && (
                    <>
                      <div>
                        <label className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] block mb-2">
                          Postcode
                        </label>
                        <input
                          type="text"
                          value={postcode}
                          onChange={(e) => setPostcode(e.target.value)}
                          placeholder="E.g., LS1 5QT"
                          className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                        />
                        <p className="text-[10px] text-[#888888] mt-1">
                          System will search this postcode and surrounding areas
                        </p>
                      </div>

                      <button
                        onClick={handlePostcodeSearch}
                        disabled={!postcode.trim() || loading === 'postcode'}
                        className="w-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.05em] rounded bg-[#0D0D0D] text-white border border-[#0D0D0D] hover:bg-[#333333] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading === 'postcode' ? 'Searching...' : 'Search Postcode'}
                      </button>
                    </>
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
                    onClick={() => setExpandedCard(null)}
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
