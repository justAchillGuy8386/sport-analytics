'use client';

import React from 'react';
import { useFootball } from '@/context/FootballContext';
import { MatchCenterTab } from '@/components/MatchCenterTab';

export default function MatchCenterPage() {
  const { matches, selectedMatchId } = useFootball();

  return (
    <MatchCenterTab
      matches={matches}
      selectedMatchId={selectedMatchId}
    />
  );
}
