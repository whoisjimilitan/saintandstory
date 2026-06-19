"use client";

import { useState, useEffect } from "react";
import { IntelligenceResource } from "../lib/types";

interface UseIntelligenceOptions {
  resource: IntelligenceResource;
  id?: string;
  limit?: number;
}

interface UseIntelligenceResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const apiEndpoints: Record<IntelligenceResource, string> = {
  conversation: "/api/b2b/prospects",
  signal: "/api/b2b/behavior/metrics",
  memory: "/api/b2b/memory/patterns",
  revenue: "/api/b2b/revenue/insights",
  observability: "/api/b2b/system/health",
};

export function useIntelligence<T = any>(
  options: UseIntelligenceOptions
): UseIntelligenceResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = apiEndpoints[options.resource];
      if (!endpoint) {
        throw new Error(`Unknown resource: ${options.resource}`);
      }

      const url = new URL(endpoint, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

      if (options.id) {
        url.searchParams.append("id", options.id);
      }
      if (options.limit) {
        url.searchParams.append("limit", options.limit.toString());
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Failed to fetch ${options.resource}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [options.resource, options.id]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
