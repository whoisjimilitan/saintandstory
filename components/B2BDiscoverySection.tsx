'use client';

import { useState } from 'react';
import { IntakeChannels } from './IntakeChannels';
import { B2BLeadsReview } from './B2BLeadsReview';

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

export function B2BDiscoverySection({ sources }: Props) {
  const [searchTrigger, setSearchTrigger] = useState(0);

  const handleSearchComplete = () => {
    setSearchTrigger(prev => prev + 1);
  };

  return (
    <>
      <IntakeChannels sources={sources} onSearchComplete={handleSearchComplete} />
      <B2BLeadsReview searchTrigger={searchTrigger} />
    </>
  );
}
