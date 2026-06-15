'use client';

import { useEffect, useState } from 'react';
import type { OutcomeCase } from '@/lib/outcome-case-engine';
import { OutcomePanel } from './OutcasePanel';

interface Props {
  leadId: string;
}

export function OutcomeCaseSection({ leadId }: Props) {
  const [outcomeCase, setOutcomeCase] = useState<OutcomeCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOutcomeCase() {
      try {
        const response = await fetch(`/api/b2b/outcome-case?leadId=${leadId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch outcome case');
        }
        const data = await response.json();
        setOutcomeCase(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchOutcomeCase();
  }, [leadId]);

  if (loading) {
    return (
      <div className="bg-white border border-[#E8E8E8] rounded p-8">
        <p className="text-[#888888]">Loading outcome analysis...</p>
      </div>
    );
  }

  if (error || !outcomeCase) {
    return (
      <div className="bg-white border border-[#E8E8E8] rounded p-8">
        <p className="text-[#CC0000]">{error || 'Could not analyze outcome'}</p>
      </div>
    );
  }

  return <OutcomePanel outcomeCase={outcomeCase} />;
}
