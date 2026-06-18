"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Prospect {
  id: string;
  businessName: string;
  businessCategory: string;
  email: string;
  status: string;
  leadState: string;
  city?: string;
  lastActivity?: string;
}

export default function B2BDashboard() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchProspects() {
      try {
        const response = await fetch("/api/b2b/prospects");
        if (!response.ok) throw new Error("Failed to fetch prospects");
        const data = await response.json();
        setProspects(data.prospects || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchProspects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-yellow-100 text-yellow-800";
      case "warm":
        return "bg-green-100 text-green-800";
      case "cold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProspects = prospects.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center text-gray-600">Loading prospects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Prospects</h1>
              <p className="text-gray-600 mt-1">
                {filteredProspects.length} prospect{filteredProspects.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("new")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === "new"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                New
              </button>
              <button
                onClick={() => setFilter("warm")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === "warm"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Warm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 mb-8">
            Error: {error}
          </div>
        )}

        {filteredProspects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No prospects yet
            </h2>
            <p className="text-gray-600">
              Start by discovering prospects or adding them manually.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProspects.map((prospect) => (
                  <tr key={prospect.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {prospect.businessName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {prospect.businessCategory}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {prospect.email}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(prospect.status)}`}>
                        {prospect.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/b2b/prospect/${prospect.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
