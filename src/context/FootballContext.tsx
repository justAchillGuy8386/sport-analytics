'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Match, LeagueCode } from '@/types/football';
import { MATCHES as MOCK_MATCHES } from '@/data/mockData';

const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || '3f779659d2f2fdc3ecf432a3c49b2aae';
const MATCHES_CACHE_TTL = 15 * 60 * 1000; // 15 minutes persistent cache

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
  selectedMatchId: string;
  setSelectedMatchId: (id: string) => void;
}

const FootballContext = createContext<FootballContextType | undefined>(undefined);

export const FootballProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLeague, setSelectedLeague] = useState<LeagueCode | 'ALL'>('ALL');
  const [quotaUsed, setQuotaUsed] = useState<number>(62);
  const [apiKey, setApiKey] = useState<string>(DEFAULT_API_KEY);
  const [isRealDataMode, setIsRealDataMode] = useState<boolean>(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');

  // Fetch real-time quota status from API-Football /status
  useEffect(() => {
    async function fetchQuota() {
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
    }

    fetchQuota();
  }, [apiKey, isRealDataMode]);

  useEffect(() => {
    async function loadData() {
      if (!isRealDataMode || !apiKey) {
        setMatches(MOCK_MATCHES);
        setSelectedMatchId(MOCK_MATCHES[0]?.id || '');
        setIsLoadingApi(false);
        return;
      }

      // Check localStorage persistent cache first to save API quota on browser reload (F5)
      const cacheKey = `fb_matches_${selectedLeague}`;
      const cacheTimeKey = `fb_matches_time_${selectedLeague}`;
      
      try {
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);
        const now = Date.now();

        if (cachedData && cachedTime && (now - parseInt(cachedTime) < MATCHES_CACHE_TTL)) {
          const parsedMatches: Match[] = JSON.parse(cachedData);
          if (parsedMatches && parsedMatches.length > 0) {
            setMatches(parsedMatches);
            setSelectedMatchId(parsedMatches[0].id);
            setIsLoadingApi(false);
            return; // Used persistent cache! Zero API requests spent.
          }
        }
      } catch (e) {
        console.error('Error reading localStorage cache:', e);
      }

      setIsLoadingApi(true);
      try {
        const res = await fetch(`/api/football?apiKey=${encodeURIComponent(apiKey)}&league=${selectedLeague}`);
        const result = await res.json();
        if (result.success && result.data && result.data.length > 0) {
          setMatches(result.data);
          setSelectedMatchId(result.data[0].id);
          
          // Save to localStorage for browser refresh persistence
          try {
            localStorage.setItem(cacheKey, JSON.stringify(result.data));
            localStorage.setItem(cacheTimeKey, Date.now().toString());
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }
        } else {
          setMatches(MOCK_MATCHES);
          setSelectedMatchId(MOCK_MATCHES[0]?.id || '');
        }
      } catch (err) {
        console.error('API Football fetch error:', err);
        setMatches(MOCK_MATCHES);
        setSelectedMatchId(MOCK_MATCHES[0]?.id || '');
      } finally {
        setIsLoadingApi(false);
      }
    }

    loadData();
  }, [isRealDataMode, apiKey, selectedLeague]);

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
