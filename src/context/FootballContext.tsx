'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Match, LeagueCode } from '@/types/football';

const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || '3f779659d2f2fdc3ecf432a3c49b2aae';

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
  const [quotaUsed, setQuotaUsed] = useState<number>(0);
  const [apiKey, setApiKey] = useState<string>(DEFAULT_API_KEY);
  const [isRealDataMode, setIsRealDataMode] = useState<boolean>(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');

  // Clear any legacy cached matches from localStorage on startup
  useEffect(() => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('fb_matches') || key.includes('mock') || key.includes('m-live'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('Error clearing legacy cache:', e);
    }
  }, []);

  // Fetch real-time quota status from API-Football /status
  const refreshQuota = useCallback(async () => {
    if (!isRealDataMode || !apiKey) return;
    try {
      const res = await fetch(`/api/football/quota?apiKey=${encodeURIComponent(apiKey)}`);
      const result = await res.json();
      if (result.success && typeof result.current === 'number') {
        setQuotaUsed(result.current);
      }
    } catch (err) {
      console.error('Error fetching API quota:', err);
    }
  }, [apiKey, isRealDataMode]);

  useEffect(() => {
    refreshQuota();
  }, [refreshQuota]);

  // Load fresh data directly from Database & Live Stream (No temporary cache)
  useEffect(() => {
    async function loadData() {
      if (!isRealDataMode || !apiKey) {
        setMatches([]);
        setSelectedMatchId('');
        setIsLoadingApi(false);
        return;
      }

      setIsLoadingApi(true);
      try {
        const res = await fetch(`/api/football?apiKey=${encodeURIComponent(apiKey)}&league=${selectedLeague}`);
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setMatches(result.data);
          if (result.data.length > 0) {
            setSelectedMatchId(result.data[0].id);
          } else {
            setSelectedMatchId('');
          }
        } else {
          setMatches([]);
          setSelectedMatchId('');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setMatches([]);
        setSelectedMatchId('');
      } finally {
        setIsLoadingApi(false);
        refreshQuota();
      }
    }

    loadData();
  }, [isRealDataMode, apiKey, selectedLeague, refreshQuota]);

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
        setSelectedMatchId,
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
