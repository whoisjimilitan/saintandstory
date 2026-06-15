'use client';

import { useEffect, useState } from 'react';
import type { FrictionValidation } from '@/lib/friction-intelligence';
import { FrictionValidationPanel } from './FrictionValidationPanel';

interface Props {
  leadId: string;
}

export function FrictionValidationSection({ leadId }: Props) {
  const [validation, setValidation] = useState<FrictionValidation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchValidation() {
      try {
        const response = await fetch(`/api/b2b/friction-validation?leadId=${leadId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch friction validation');
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
        <p className="text-[#888888]">Validating friction diagnosis...</p>
      </div>
    );
  }

  if (error || !validation) {
    return (
      <div className="bg-white border border-[#E8E8E8] rounded p-8">
        <p className="text-[#CC0000]">{error || 'Could not validate friction'}</p>
      </div>
    );
  }

  return <FrictionValidationPanel validation={validation} />;
}
