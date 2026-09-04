import { Match, StandingItem, LeagueCode, MatchEvent, TeamStatistics } from '@/types/football';

const API_SPORTS_BASE = 'https://v3.football.api-sports.io';
const getApiKey = () => process.env.API_FOOTBALL_KEY || process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || '';

export const LEAGUE_MAP: Record<LeagueCode, { id: number; name: string }> = {
  PL: { id: 39, name: 'Premier League' },
  LL: { id: 140, name: 'La Liga' },
  SA: { id: 135, name: 'Serie A' },
  BL: { id: 78, name: 'Bundesliga' },
  L1: { id: 61, name: 'Ligue 1' },
  UCL: { id: 2, name: 'UEFA Champions League' }
};

export const ALLOWED_LEAGUE_IDS = [39, 140, 135, 78, 61, 2];

// Global Quota Tracker updated dynamically on every single API response header
let globalQuotaStatus = { current: 0, limit: 100 };

export function getGlobalQuotaStatus() {
  return globalQuotaStatus;
}

export function updateQuotaFromHeaders(res: Response) {
  try {
    const remainingStr = res.headers.get('x-ratelimit-requests-remaining');
    const limitStr = res.headers.get('x-ratelimit-requests-limit');
    if (remainingStr !== null && limitStr !== null) {
      const limit = parseInt(limitStr, 10) || 100;
      const remaining = parseInt(remainingStr, 10) || 0;
      const current = Math.max(0, limit - remaining);
      globalQuotaStatus = { current, limit };
    }
  } catch (e) {
    console.error('Error updating quota from headers:', e);
  }
}

/**
 * Fetch real-time quota status directly from API-Football /status endpoint
 */
export async function fetchApiQuotaStatus(apiKey?: string): Promise<{ current: number; limit: number }> {
  const keyToUse = (apiKey && apiKey.trim()) || getApiKey();
  if (!keyToUse) return globalQuotaStatus;

  const headers = {
    'x-apisports-key': keyToUse,
    'x-rapidapi-key': keyToUse
  };

  try {
    const res = await fetch(`${API_SPORTS_BASE}/status`, { headers, cache: 'no-store' });
    updateQuotaFromHeaders(res);
    if (res.ok) {
      const data = await res.json();
      const reqObj = Array.isArray(data.response) ? data.response[0]?.requests : data.response?.requests;
      if (reqObj) {
        const current = typeof reqObj.current === 'number' ? reqObj.current : globalQuotaStatus.current;
        const limit = reqObj.limit_day || reqObj.limit || 100;
        globalQuotaStatus = { current, limit };
        return globalQuotaStatus;
      }
    }
  } catch (err) {
    console.error('Error fetching API quota status:', err);
  }
  return globalQuotaStatus;
}

/**
 * Fetch real statistics for a specific fixture from API-Football
 */
async function fetchFixtureStatistics(fixtureId: number, headers: Record<string, string>): Promise<any[]> {
  try {
    const res = await fetch(`${API_SPORTS_BASE}/fixtures/statistics?fixture=${fixtureId}`, { headers, cache: 'no-store' });
    updateQuotaFromHeaders(res);
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
 * Fetch real standings for a specific league from API-Football
 */
export async function fetchRealStandings(apiKey?: string, leagueCode: LeagueCode = 'PL'): Promise<StandingItem[]> {
  const keyToUse = (apiKey && apiKey.trim()) || getApiKey();
  if (!keyToUse) return [];

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
      updateQuotaFromHeaders(res);
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
 * Fetch real-world live, recent & upcoming fixtures ONLY for specified European leagues
 */
export async function fetchRealFixtures(apiKey?: string, leagueCode?: LeagueCode): Promise<Match[]> {
  const keyToUse = (apiKey && apiKey.trim()) || getApiKey();
  if (!keyToUse) return [];

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
    updateQuotaFromHeaders(liveRes);
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

          if (lastRes.ok) updateQuotaFromHeaders(lastRes);
          if (nextRes.ok) updateQuotaFromHeaders(nextRes);

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
      id: `ev-${item.fixture?.id}-${idx}`,
      time: e.time?.elapsed || 0,
      teamId: e.team?.id?.toString() || '',
      player: e.player?.name || 'Cầu thủ',
      type: e.type === 'Goal' ? 'goal' : e.detail?.includes('Yellow') ? 'yellow_card' : e.detail?.includes('Red') ? 'red_card' : 'sub'
    }));

    const fixtureStats = statsMap.get(item.fixture?.id);
    const homeStats = parseTeamStats(fixtureStats || [], events, homeTeamId, true);
    const awayStats = parseTeamStats(fixtureStats || [], events, awayTeamId, false);

    return {
      id: item.fixture?.id?.toString() || `f-${Math.random()}`,
      leagueId: (Object.keys(LEAGUE_MAP).find(
        key => LEAGUE_MAP[key as LeagueCode].id === item.league?.id
      ) || 'PL') as LeagueCode,
      homeTeam: {
        id: homeTeamId,
        name: item.teams?.home?.name || 'Đội nhà',
        shortName: (item.teams?.home?.name || 'HOM').substring(0, 3).toUpperCase(),
        logo: item.teams?.home?.logo || '',
        leagueId: 'PL',
        stadium: item.fixture?.venue?.name || 'Stadium'
      },
      awayTeam: {
        id: awayTeamId,
        name: item.teams?.away?.name || 'Đội khách',
        shortName: (item.teams?.away?.name || 'AWY').substring(0, 3).toUpperCase(),
        logo: item.teams?.away?.logo || '',
        leagueId: 'PL',
        stadium: item.fixture?.venue?.name || 'Stadium'
      },
      homeScore: item.goals?.home ?? 0,
      awayScore: item.goals?.away ?? 0,
      status,
      elapsedTime: item.fixture?.status?.elapsed || 0,
      date: item.fixture?.date || new Date().toISOString(),
      venue: item.fixture?.venue?.name || 'Sân vận động Quốc tế',
      referee: item.fixture?.referee || 'Trọng tài FIFA',
      round: item.league?.round || 'Vòng đấu',
      season: item.league?.season?.toString() || '2024/25',
      stats: {
        home: homeStats,
        away: awayStats
      },
      events
    };
  });

  return results;
}
