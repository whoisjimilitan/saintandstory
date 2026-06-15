'use client';

import { useEffect, useState } from 'react';
import type { ValidationIntelligence } from '@/lib/validation-intelligence';
import { ValidationPanel } from './ValidationPanel';

interface Props {
  leadId: string;
}

export function FrictionValidationSection({ leadId }: Props) {
  const [validation, setValidation] = useState<ValidationIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchValidation() {
      try {
        const response = await fetch(`/api/b2b/friction-validation?leadId=${leadId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch validation intelligence');
        }
        const data = await response.json();
        setValidation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchValidation();
  }, [leadId]);

  if (loading) {
    return (
      <div className="bg-white border border-[#E8E8E8] rounded p-8">
        <p className="text-[#888888]">Calculating Logistics Fit Score...</p>
      </div>
    );
  }

  if (error || !validation) {
    return (
      <div className="bg-white border border-[#E8E8E8] rounded p-8">
        <p className="text-[#CC0000]">{error || 'Could not calculate validation'}</p>
      </div>
    );
  }

  return <ValidationPanel validation={validation} />;
}
