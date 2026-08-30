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

/**
 * Helper to parse statistics from API-Football fixture payload or fallback to event-derived stats
 */
function parseTeamStats(statisticsArray: any[], events: MatchEvent[], teamIdStr: string, isHome: boolean) {
  const teamStatObj = statisticsArray?.find((s: any) => s.team?.id?.toString() === teamIdStr)?.statistics;

  const getStatValue = (typeNames: string[], defaultVal: number): number => {
    if (!teamStatObj || !Array.isArray(teamStatObj)) return defaultVal;
    const found = teamStatObj.find((item: any) => 
      typeNames.some(tn => item.type?.toLowerCase() === tn.toLowerCase())
    );
    if (!found || found.value === null || found.value === undefined) return defaultVal;
    if (typeof found.value === 'string') {
      return parseInt(found.value.replace('%', '')) || defaultVal;
    }
    return typeof found.value === 'number' ? found.value : defaultVal;
  };

  const teamEvents = events.filter(e => e.teamId === teamIdStr);
  const derivedYellows = teamEvents.filter(e => e.type === 'yellow_card').length;
  const derivedReds = teamEvents.filter(e => e.type === 'red_card').length;
  const derivedGoals = teamEvents.filter(e => e.type === 'goal').length;

  return {
    possession: getStatValue(['Ball Possession', 'Possession'], isHome ? 53 : 47),
    shots: getStatValue(['Total Shots', 'Shots'], Math.max(8, derivedGoals * 3 + 4)),
    shotsOnTarget: getStatValue(['Shots on Goal', 'Shots on Target'], Math.max(derivedGoals, 3)),
    corners: getStatValue(['Corner Kicks', 'Corners'], 5),
    fouls: getStatValue(['Fouls'], 10),
    yellowCards: getStatValue(['Yellow Cards'], derivedYellows),
    redCards: getStatValue(['Red Cards'], derivedReds),
    offsides: getStatValue(['Offsides'], 2),
    saves: getStatValue(['Goalkeeper Saves', 'Saves'], 3)
  };
}

/**
 * Fetch real-world live, recent & upcoming fixtures ONLY for the specified European leagues
 */
export async function fetchRealFixtures(apiKey?: string, leagueCode?: LeagueCode): Promise<Match[]> {
  const keyToUse = apiKey && apiKey.trim() ? apiKey.trim() : DEFAULT_KEY;

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
  if (rawFixtures.length < 5) {
    const seasonsToTry = [2024, 2023];
    for (const season of seasonsToTry) {
      if (rawFixtures.length >= 8) break;

      const fetchPromises = targetLeagueIds.map(async (lId) => {
        try {
          // Fetch last 4 and next 4 fixtures
          const [lastRes, nextRes] = await Promise.all([
            fetch(`${API_SPORTS_BASE}/fixtures?league=${lId}&season=${season}&last=4`, { headers, cache: 'no-store' }),
            fetch(`${API_SPORTS_BASE}/fixtures?league=${lId}&season=${season}&next=4`, { headers, cache: 'no-store' })
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
        // Avoid duplicate fixture IDs
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

    const stats = {
      home: parseTeamStats(item.statistics || [], events, homeTeamId, true),
      away: parseTeamStats(item.statistics || [], events, awayTeamId, false)
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

  return results;
}
