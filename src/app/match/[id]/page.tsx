'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useFootball } from '@/context/FootballContext';
import { MatchCenterTab } from '../MatchCenterTab';

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = (params?.id as string) || '';
  const { matches, allMatches } = useFootball();

  return (
    <MatchCenterTab
      matches={matches}
      allMatches={allMatches}
      selectedMatchId={matchId}
    />
  );
}
