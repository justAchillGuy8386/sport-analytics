'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFootball } from '@/context/FootballContext';
import { CompetitionTab } from '@/components/CompetitionTab';

export default function CompetitionPage() {
  const router = useRouter();
  const { selectedLeague, setSelectedMatchId } = useFootball();

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    router.push('/match');
  };

  return (
    <CompetitionTab
      selectedLeague={selectedLeague}
      onSelectMatch={handleSelectMatch}
    />
  );
}
