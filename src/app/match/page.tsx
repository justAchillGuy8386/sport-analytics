'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFootball } from '@/context/FootballContext';
import { MatchCenterTab } from './MatchCenterTab';

export default function MatchCenterPage() {
  const router = useRouter();
  const { matches, allMatches, selectedMatchId } = useFootball();

  const dataset = matches.length > 0 ? matches : allMatches;

  useEffect(() => {
    if (dataset.length > 0) {
      const targetId = (selectedMatchId && dataset.some(m => m.id === selectedMatchId))
        ? selectedMatchId
        : dataset[0]?.id;

      if (targetId) {
        router.replace(`/match/${targetId}`);
      }
    }
  }, [dataset, selectedMatchId, router]);

  return (
    <MatchCenterTab
      matches={matches}
      allMatches={allMatches}
      selectedMatchId={selectedMatchId}
    />
  );
}
