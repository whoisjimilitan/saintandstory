"use client";

import { useState } from "react";
import Link from "next/link";

interface ImportResult {
  total_rows: number;
  rows_processed: number;
  rows_duplicates: number;
  rows_errors: number;
  errors?: string[];
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/b2b/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
      if (res.ok) {
        setFile(null);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-8 py-4">
          <Link href="/b2b/dashboard" className="text-gray-600 hover:text-gray-900">
            ← Back
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bulk Import</h1>
          <p className="text-gray-600 text-sm mb-4">
            Import prospects from CSV. Format: business_name, category, city, postcode, email, phone
          </p>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-input"
              />
              <label
                htmlFor="csv-input"
                className="cursor-pointer block"
              >
                <p className="font-medium text-gray-900">
                  {file ? file.name : "Click to select CSV"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Only .csv files accepted
                </p>
              </label>
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full bg-gray-900 text-white py-2 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {uploading ? "Importing..." : "Import prospects"}
            </button>
          </form>
        </div>

        {result && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Import Results
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total rows:</span>
                <span className="font-medium">{result.total_rows}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processed:</span>
                <span className="font-medium text-green-600">
                  {result.rows_processed}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duplicates (skipped):</span>
                <span className="font-medium text-yellow-600">
                  {result.rows_duplicates}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Errors:</span>
                <span className="font-medium text-red-600">
                  {result.rows_errors}
                </span>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs">
                <p className="font-medium mb-2">Errors:</p>
                <ul className="space-y-1">
                  {result.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
