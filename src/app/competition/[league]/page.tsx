'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFootball } from '@/context/FootballContext';
import { parseLeagueParam } from '@/constants/competitions';
import { CompetitionTab } from '../CompetitionTab';

export default function CompetitionLeaguePage() {
  const params = useParams();
  const router = useRouter();
  const { setSelectedMatchId } = useFootball();

  const rawLeague = params?.league as string | undefined;
  const parsedLeague = parseLeagueParam(rawLeague) || 'PL';

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    router.push('/match');
  };

  return (
    <CompetitionTab
      initialLeague={parsedLeague}
      onSelectMatch={handleSelectMatch}
    />
  );
}
