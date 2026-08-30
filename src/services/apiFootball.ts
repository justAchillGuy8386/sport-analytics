import { Match, StandingItem, LeagueCode, MatchEvent, TeamStatistics } from '@/types/football';

const API_SPORTS_BASE = 'https://v3.football.api-sports.io';
const DEFAULT_KEY = '3f779659d2f2fdc3ecf432a3c49b2aae';

export const LEAGUE_MAP: Record<LeagueCode, { id: number; name: string }> = {
  PL: { id: 39, name: 'Premier League' },
  LL: { id: 140, name: 'La Liga' },
  SA: { id: 135, name: 'Serie A' },
  BL: { id: 78, name: 'Bundesliga' },
  L1: { id: 61, name: 'Ligue 1' },
  UCL: { id: 2, name: 'UEFA Champions League' }
};

export const ALLOWED_LEAGUE_IDS = [39, 140, 135, 78, 61, 2];

// In-Memory Cache Store with TTL to save API Quota
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const FIXTURES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const STANDINGS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const fixturesCache = new Map<string, CacheEntry<Match[]>>();
const standingsCache = new Map<string, CacheEntry<StandingItem[]>>();

/**
 * Fetch real-time quota status directly from API-Football /status endpoint
 */
export async function fetchApiQuotaStatus(apiKey?: string): Promise<{ current: number; limit: number } | null> {
  const keyToUse = apiKey && apiKey.trim() ? apiKey.trim() : DEFAULT_KEY;
  const headers = {
    'x-apisports-key': keyToUse,
    'x-rapidapi-key': keyToUse
  };

  try {
    const res = await fetch(`${API_SPORTS_BASE}/status`, { headers, cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.response?.requests) {
        return {
          current: data.response.requests.current || 0,
          limit: data.response.requests.limit_day || 100
        };
      }
    }
  } catch (err) {
    console.error('Error fetching API quota status:', err);
  }
  return null;
}

/**
 * Fetch real statistics for a specific fixture from API-Football
 */
async function fetchFixtureStatistics(fixtureId: number, headers: Record<string, string>): Promise<any[]> {
  try {
    const res = await fetch(`${API_SPORTS_BASE}/fixtures/statistics?fixture=${fixtureId}`, { headers, cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return data.response || [];
    }
  } catch (e) {
    console.error(`Error fetching stats for fixture ${fixtureId}:`, e);
  }
  return [];
}

/**
 * Helper to parse statistics from API-Football fixture payload or fallback to event-derived stats
 */
function parseTeamStats(statisticsArray: any[], events: MatchEvent[], teamIdStr: string, isHome: boolean) {
  const teamStatObj = statisticsArray?.find((s: any) => s.team?.id?.toString() === teamIdStr)?.statistics;

  const getStatValue = (typeNames: string[], fallbackVal: number): number => {
    if (!teamStatObj || !Array.isArray(teamStatObj)) return fallbackVal;
    const found = teamStatObj.find((item: any) => 
      typeNames.some(tn => item.type?.toLowerCase() === tn.toLowerCase())
    );
    if (!found || found.value === null || found.value === undefined) return fallbackVal;
    if (typeof found.value === 'string') {
      return parseInt(found.value.replace('%', '')) || fallbackVal;
    }
    return typeof found.value === 'number' ? found.value : fallbackVal;
  };

  const teamEvents = events.filter(e => e.teamId === teamIdStr);
  const derivedYellows = teamEvents.filter(e => e.type === 'yellow_card').length;
  const derivedReds = teamEvents.filter(e => e.type === 'red_card').length;
  const derivedGoals = teamEvents.filter(e => e.type === 'goal').length;

  const hasRealStats = teamStatObj && Array.isArray(teamStatObj) && teamStatObj.length > 0;

  return {
    possession: getStatValue(['Ball Possession', 'Possession'], isHome ? 52 : 48),
    shots: getStatValue(['Total Shots', 'Shots'], hasRealStats ? 0 : Math.max(8, derivedGoals * 3 + 3)),
    shotsOnTarget: getStatValue(['Shots on Goal', 'Shots on Target'], hasRealStats ? 0 : Math.max(derivedGoals, 2)),
    corners: getStatValue(['Corner Kicks', 'Corners'], hasRealStats ? 0 : Math.floor(Math.random() * 4) + 3),
    fouls: getStatValue(['Fouls'], hasRealStats ? 0 : 10),
    yellowCards: getStatValue(['Yellow Cards'], derivedYellows),
    redCards: getStatValue(['Red Cards'], derivedReds),
    offsides: getStatValue(['Offsides'], hasRealStats ? 0 : 2),
    saves: getStatValue(['Goalkeeper Saves', 'Saves'], hasRealStats ? 0 : 3)
  };
}

/**
 * Fetch real standings for a specific league from API-Football (With 30m Cache)
 */
export async function fetchRealStandings(apiKey?: string, leagueCode: LeagueCode = 'PL'): Promise<StandingItem[]> {
  const keyToUse = apiKey && apiKey.trim() ? apiKey.trim() : DEFAULT_KEY;
  const cacheKey = `${keyToUse}_${leagueCode}`;
  const now = Date.now();

  // Check In-Memory Cache first to save Quota
  const cached = standingsCache.get(cacheKey);
  if (cached && (now - cached.timestamp < STANDINGS_CACHE_TTL)) {
    return cached.data;
  }

  const leagueId = LEAGUE_MAP[leagueCode]?.id || 39;

  const headers = {
    'x-apisports-key': keyToUse,
    'x-rapidapi-key': keyToUse
  };

  const seasonsToTry = [2024, 2023];
  for (const season of seasonsToTry) {
    try {
      const url = `${API_SPORTS_BASE}/standings?league=${leagueId}&season=${season}`;
      const res = await fetch(url, { headers, cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const standingsArray = data.response?.[0]?.league?.standings?.[0];
        if (Array.isArray(standingsArray) && standingsArray.length > 0) {
          const result: StandingItem[] = standingsArray.map((item: any) => {
            const formStr: string = item.form || 'WWDDD';
            const formArray: ('W' | 'D' | 'L')[] = formStr
              .split('')
              .slice(-5)
              .map(c => (c === 'W' ? 'W' : c === 'D' ? 'D' : 'L'));

            return {
              rank: item.rank,
              team: {
                id: item.team?.id?.toString() || '',
                name: item.team?.name || 'Đội bóng',
                shortName: (item.team?.name || 'TEAM').substring(0, 3).toUpperCase(),
                logo: item.team?.logo || '',
                leagueId: leagueCode,
                stadium: 'Home Stadium'
              },
              played: item.all?.played || 0,
              won: item.all?.win || 0,
              drawn: item.all?.draw || 0,
              lost: item.all?.lose || 0,
              goalsFor: item.all?.goals?.for || 0,
              goalsAgainst: item.all?.goals?.against || 0,
              goalDifference: item.goalsDiff || 0,
              points: item.points || 0,
              form: formArray
            };
          });

          // Save to Cache
          standingsCache.set(cacheKey, { data: result, timestamp: now });
          return result;
        }
      }
    } catch (err) {
      console.error(`Error fetching standings for league ${leagueCode} season ${season}:`, err);
    }
  }

  return [];
}

/**
 * Fetch real-world live, recent & upcoming fixtures ONLY for specified European leagues (With 5m Cache)
 */
export async function fetchRealFixtures(apiKey?: string, leagueCode?: LeagueCode): Promise<Match[]> {
  const keyToUse = apiKey && apiKey.trim() ? apiKey.trim() : DEFAULT_KEY;
  const cacheKey = `${keyToUse}_${leagueCode || 'ALL'}`;
  const now = Date.now();

  // Check In-Memory Cache first to save Quota
  const cached = fixturesCache.get(cacheKey);
  if (cached && (now - cached.timestamp < FIXTURES_CACHE_TTL)) {
    return cached.data;
  }

  const selectedLeagueId = leagueCode && (leagueCode as string) !== 'ALL' 
    ? LEAGUE_MAP[leagueCode as LeagueCode]?.id 
    : null;

  const targetLeagueIds = selectedLeagueId ? [selectedLeagueId] : ALLOWED_LEAGUE_IDS;

  const headers = {
    'x-apisports-key': keyToUse,
    'x-rapidapi-key': keyToUse
  };

  let rawFixtures: any[] = [];

  // 1. Fetch LIVE matches first
  try {
    const liveUrl = `${API_SPORTS_BASE}/fixtures?live=all`;
    const liveRes = await fetch(liveUrl, { headers, cache: 'no-store' });
    if (liveRes.ok) {
      const liveData = await liveRes.json();
      if (liveData.response && Array.isArray(liveData.response)) {
        rawFixtures = liveData.response.filter((item: any) => 
          targetLeagueIds.includes(item.league?.id)
        );
      }
    }
  } catch (err) {
    console.error('Error fetching live matches:', err);
  }

  // 2. Fetch recent finished & upcoming matches for target leagues
  if (rawFixtures.length < 8) {
    const seasonsToTry = [2024, 2023];
    for (const season of seasonsToTry) {
      if (rawFixtures.length >= 10) break;

      const fetchPromises = targetLeagueIds.map(async (lId) => {
        try {
          // Fetch last 6 and next 3 fixtures
          const [lastRes, nextRes] = await Promise.all([
            fetch(`${API_SPORTS_BASE}/fixtures?league=${lId}&season=${season}&last=6`, { headers, cache: 'no-store' }),
            fetch(`${API_SPORTS_BASE}/fixtures?league=${lId}&season=${season}&next=3`, { headers, cache: 'no-store' })
          ]);

          let leagueFixtures: any[] = [];
          if (lastRes.ok) {
            const d = await lastRes.json();
            if (d.response) leagueFixtures.push(...d.response);
          }
          if (nextRes.ok) {
            const d = await nextRes.json();
            if (d.response) leagueFixtures.push(...d.response);
          }
          return leagueFixtures;
        } catch (e) {
          console.error(`Error fetching league ${lId} season ${season}:`, e);
          return [];
        }
      });

      const resultsArray = await Promise.all(fetchPromises);
      const additional = resultsArray.flat();
      if (additional.length > 0) {
        const existingIds = new Set(rawFixtures.map(f => f.fixture?.id));
        for (const item of additional) {
          if (item.fixture?.id && !existingIds.has(item.fixture.id)) {
            rawFixtures.push(item);
            existingIds.add(item.fixture.id);
          }
        }
      }
    }
  }

  // 3. Fetch real statistics for top 3 finished matches only to keep API requests minimal
  const matchesNeedingStats = rawFixtures
    .filter(item => item.fixture?.id && ['FT', 'AET', 'PEN', '1H', '2H', 'HT', 'ET', 'LIVE'].includes(item.fixture?.status?.short))
    .slice(0, 3);

  const statsMap = new Map<number, any[]>();
  if (matchesNeedingStats.length > 0) {
    const statsResults = await Promise.all(
      matchesNeedingStats.map(async (item) => {
        const statsData = await fetchFixtureStatistics(item.fixture.id, headers);
        return { fixtureId: item.fixture.id, stats: statsData };
      })
    );

    for (const s of statsResults) {
      if (s.stats && s.stats.length > 0) {
        statsMap.set(s.fixtureId, s.stats);
      }
    }
  }

  // Map API-Football JSON response to our Match interface
  const results: Match[] = rawFixtures.map((item: any) => {
    const statusShort = item.fixture?.status?.short || 'NS';
    let status: Match['status'] = 'UPCOMING';
    if (['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE'].includes(statusShort)) status = 'LIVE';
    else if (['FT', 'AET', 'PEN'].includes(statusShort)) status = 'FINISHED';

    const homeTeamId = item.teams?.home?.id?.toString() || 'home';
    const awayTeamId = item.teams?.away?.id?.toString() || 'away';

    const events: MatchEvent[] = (item.events || []).map((e: any, idx: number) => ({
      id: `real-event-${idx}`,
      time: e.time?.elapsed || 0,
      type: e.type === 'Goal' 
        ? 'goal' 
        : e.detail?.toLowerCase().includes('yellow') 
          ? 'yellow_card' 
          : e.detail?.toLowerCase().includes('red') 
            ? 'red_card' 
            : 'substitution',
      teamId: e.team?.id?.toString() || '',
      player: e.player?.name || 'Cầu thủ',
      assistPlayer: e.assist?.name
    }));

    const leagueCodeFound = (Object.keys(LEAGUE_MAP).find(
      key => LEAGUE_MAP[key as LeagueCode].id === item.league?.id
    ) as LeagueCode) || 'PL';

    const realStatsArray = statsMap.get(item.fixture?.id) || item.statistics || [];

    const stats = {
      home: parseTeamStats(realStatsArray, events, homeTeamId, true),
      away: parseTeamStats(realStatsArray, events, awayTeamId, false)
    };

    return {
      id: item.fixture?.id?.toString() || Math.random().toString(),
      leagueId: leagueCodeFound,
      season: item.league?.season?.toString() || '2024/25',
      round: item.league?.round || 'Regular Season',
      date: item.fixture?.date || new Date().toISOString(),
      status,
      elapsedTime: item.fixture?.status?.elapsed || 0,
      homeTeam: {
        id: homeTeamId,
        name: item.teams?.home?.name || 'Home Team',
        shortName: (item.teams?.home?.name || 'HOM').substring(0, 3).toUpperCase(),
        logo: item.teams?.home?.logo || '',
        leagueId: leagueCodeFound,
        stadium: item.fixture?.venue?.name || 'Home Stadium'
      },
      awayTeam: {
        id: awayTeamId,
        name: item.teams?.away?.name || 'Away Team',
        shortName: (item.teams?.away?.name || 'AWY').substring(0, 3).toUpperCase(),
        logo: item.teams?.away?.logo || '',
        leagueId: leagueCodeFound,
        stadium: item.fixture?.venue?.name || 'Away Stadium'
      },
      homeScore: item.goals?.home ?? (status === 'FINISHED' ? 0 : null),
      awayScore: item.goals?.away ?? (status === 'FINISHED' ? 0 : null),
      venue: item.fixture?.venue?.name || 'Sân vận động',
      referee: item.fixture?.referee || 'Trọng tài điều hành',
      events,
      stats
    };
  });

  // Save to Cache
  fixturesCache.set(cacheKey, { data: results, timestamp: now });

  return results;
}
