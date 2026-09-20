'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFootball } from '@/context/FootballContext';
import { getLeagueSlug } from '@/constants/competitions';
import { CompetitionTab } from './CompetitionTab';

export default function CompetitionPage() {
  const router = useRouter();
  const { selectedLeague, setSelectedMatchId } = useFootball();

  const activeCode = selectedLeague !== 'ALL' ? selectedLeague : 'PL';

  useEffect(() => {
    const slug = getLeagueSlug(activeCode);
    router.replace(`/competition/${slug}`);
  }, [activeCode, router]);

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    router.push('/match');
  };

  return (
    <CompetitionTab
      initialLeague={activeCode}
      selectedLeague={selectedLeague}
      onSelectMatch={handleSelectMatch}
    />
  );
}
