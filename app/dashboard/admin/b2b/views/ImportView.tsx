"use client";

import { useState, useRef } from "react";

export function ImportView() {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setUploading(true);
    setError("");
    setResults(null);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        setError("CSV must have header row + at least 1 data row");
        setUploading(false);
        return;
      }

      // Parse header
      const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const requiredColumns = [
        "business_name",
        "email",
        "category",
        "pressure_type",
      ];
      const hasRequiredColumns = requiredColumns.every((col) =>
        header.includes(col)
      );

      if (!hasRequiredColumns) {
        setError(
          `CSV must have columns: ${requiredColumns.join(", ")}`
        );
        setUploading(false);
        return;
      }

      // Parse rows
      const rows = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        return {
          business_name: values[header.indexOf("business_name")],
          email: values[header.indexOf("email")],
          category: values[header.indexOf("category")],
          pressure_type: values[header.indexOf("pressure_type")],
        };
      });

      // Send to API
      const response = await fetch("/api/b2b/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: rows }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Import failed");
      }

      const data = await response.json();
      setResults({
        success: data.successCount,
        failed: data.failed,
        errors: data.errors,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 px-6 py-10 overflow-auto">
      <div className="max-w-3xl space-y-16">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-black text-[#0D0D0D] tracking-tight">
            Import Leads
          </h1>
          <p className="text-sm text-[#888888] mt-3">
            Upload CSV to add multiple prospects at once
          </p>
        </div>

        {/* UPLOAD AREA */}
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] block">
              CSV File
            </label>

            {/* File Input */}
            <div
              className="border-2 border-dashed border-[#E8E8E8] rounded-lg p-8 text-center cursor-pointer hover:border-[#0D0D0D] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="text-sm text-[#0D0D0D]">
                Click to select CSV file or drag and drop
              </p>
              <p className="text-xs text-[#888888] mt-2">
                Columns: business_name, email, category, pressure_type
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
                disabled={uploading}
              />
            </div>
          </div>

          {/* STATUS MESSAGES */}
          {error && (
            <div className="text-sm text-[#DC2626] border-l-2 border-[#DC2626] pl-4 py-2">
              {error}
            </div>
          )}

          {results && (
            <div className="space-y-3">
              <div className="text-sm text-green-600 border-l-2 border-green-600 pl-4 py-2">
                ✓ Import completed: {results.success} created
              </div>

              {results.failed > 0 && (
                <div className="text-sm text-[#F59E0B] border-l-2 border-[#F59E0B] pl-4 py-2">
                  ⚠ {results.failed} rows failed
                </div>
              )}

              {results.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-[#888888] uppercase tracking-[0.2em]">
                    Errors
                  </p>
                  <div className="space-y-1">
                    {results.errors.slice(0, 10).map((err, i) => (
                      <p key={i} className="text-xs text-[#666666]">
                        {err}
                      </p>
                    ))}
                    {results.errors.length > 10 && (
                      <p className="text-xs text-[#888888]">
                        ... and {results.errors.length - 10} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {uploading && (
            <div className="text-sm text-[#888888]">Processing...</div>
          )}
        </div>

        {/* CSV TEMPLATE */}
        <div className="space-y-6 pt-16 border-t border-[#E8E8E8]">
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D]">
            CSV Template
          </h2>

          <div className="space-y-3">
            <p className="text-sm text-[#0D0D0D] font-mono bg-[#F5F5F5] border border-[#E8E8E8] p-4 rounded-lg">
              business_name,email,category,pressure_type
            </p>

            <p className="text-sm text-[#0D0D0D] font-mono bg-[#F5F5F5] border border-[#E8E8E8] p-4 rounded-lg">
              ABC Logistics,contact@abc.com,Logistics,Delivery delays
            </p>

            <p className="text-sm text-[#0D0D0D] font-mono bg-[#F5F5F5] border border-[#E8E8E8] p-4 rounded-lg">
              XYZ Restaurants,info@xyz.com,Restaurants,Staff turnover
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-[#888888]">
              <strong>Pressure Types:</strong> Delivery delays, Staff turnover, Cash flow, Customer complaints, Operations chaos
            </p>
            <p className="text-xs text-[#888888]">
              <strong>Note:</strong> Emails sent manually from Add Lead form. Import only creates leads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
