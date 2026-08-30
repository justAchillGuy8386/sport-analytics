'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFootball } from '@/context/FootballContext';
import { OverviewTab } from '@/components/OverviewTab';

export default function OverviewPage() {
  const router = useRouter();
  const { matches, selectedLeague, isLoadingApi, setSelectedMatchId } = useFootball();

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    router.push('/match');
  };

  return (
    <div className="space-y-4">
      {isLoadingApi && (
        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl py-2 px-4 text-center text-xs font-semibold text-emerald-300 animate-pulse">
          ⚡ Đang tải dữ liệu thời gian thực từ API-Football...
        </div>
      )}

      <OverviewTab
        matches={matches}
        selectedLeague={selectedLeague}
        onSelectMatch={handleSelectMatch}
      />
    </div>
  );
}
