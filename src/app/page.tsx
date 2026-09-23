'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFootball } from '@/context/FootballContext';
import { LiveMatchesTab } from './live/LiveMatchesTab';

export default function RootLivePage() {
  const router = useRouter();
  const { matches, allMatches, selectedLeague, setSelectedLeague, isLoadingApi, setSelectedMatchId } = useFootball();

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    router.push(`/match/${matchId}`);
  };

  return (
    <div className="space-y-4">
      {isLoadingApi && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl py-2 px-4 text-center text-xs font-semibold text-red-300 animate-pulse flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
          <span>Đang cập nhật dữ liệu trực tiếp...</span>
        </div>
      )}

      <LiveMatchesTab
        matches={matches}
        allMatches={allMatches}
        selectedLeague={selectedLeague}
        setSelectedLeague={setSelectedLeague}
        onSelectMatch={handleSelectMatch}
      />
    </div>
  );
}
