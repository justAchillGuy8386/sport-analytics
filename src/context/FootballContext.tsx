'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Match, LeagueCode } from '@/types/football';

const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || '';

interface FootballContextType {
  matches: Match[];
  isLoadingApi: boolean;
  selectedLeague: LeagueCode | 'ALL';
  setSelectedLeague: (league: LeagueCode | 'ALL') => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  isRealDataMode: boolean;
  setIsRealDataMode: (real: boolean) => void;
  quotaUsed: number;
  setQuotaUsed: (quota: number) => void;
  refreshQuota: () => Promise<void>;
  selectedMatchId: string;
  setSelectedMatchId: (id: string) => void;
}

const FootballContext = createContext<FootballContextType | undefined>(undefined);

export const FootballProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLeague, setSelectedLeague] = useState<LeagueCode | 'ALL'>('ALL');
  const [quotaUsed, setQuotaUsed] = useState<number>(100);
  const [apiKey, setApiKey] = useState<string>(DEFAULT_API_KEY);
  const [isRealDataMode, setIsRealDataMode] = useState<boolean>(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');

  // No-op refreshQuota to prevent calling external API
  const refreshQuota = useCallback(async () => {
    // 100% Database-only mode enabled
  }, []);

  // Load matches 100% from Supabase Database
  useEffect(() => {
    async function loadDataFromDb() {
      setIsLoadingApi(true);
      try {
        const res = await fetch(`/api/football?league=${selectedLeague}&_t=${Date.now()}`, { cache: 'no-store' });
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setMatches(result.data);
          if (result.data.length > 0) {
            setSelectedMatchId(prev => (prev && result.data.some((m: Match) => m.id === prev)) ? prev : result.data[0].id);
          } else {
            setSelectedMatchId('');
          }
        }
      } catch (err) {
        console.error('Database fetch error:', err);
      } finally {
        setIsLoadingApi(false);
      }
    }

    // Initial load
    loadDataFromDb();

    // 10-minute automatic polling interval to re-fetch from Supabase Database
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    const intervalId = setInterval(() => {
      loadDataFromDb();
    }, TEN_MINUTES_MS);

    return () => clearInterval(intervalId);
  }, [selectedLeague]);

  return (
    <FootballContext.Provider
      value={{
        matches,
        isLoadingApi,
        selectedLeague,
        setSelectedLeague,
        apiKey,
        setApiKey,
        isRealDataMode,
        setIsRealDataMode,
        quotaUsed,
        setQuotaUsed,
        refreshQuota,
        selectedMatchId,
        setSelectedMatchId
      }}
    >
      {children}
    </FootballContext.Provider>
  );
};

export const useFootball = () => {
  const context = useContext(FootballContext);
  if (!context) {
    throw new Error('useFootball must be used within a FootballProvider');
  }
  return context;
};
