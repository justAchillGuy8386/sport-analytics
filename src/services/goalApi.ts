import { Match, StandingItem, LeagueCode, MatchEvent, TeamStatistics, MatchStatus } from '@/types/football';
import { calculateLiveElapsedNumber } from '@/utils/matchTime';

const GOAL_API_BASE = 'https://api.goal-api.com/v1';

export const GOAL_LEAGUE_MAP: Record<LeagueCode, { id: string; apiId: number; name: string }> = {
  PL: { id: 'cmr77dvkr005nrx06lp7rvp49', apiId: 152, name: 'Premier League' },
  LL: { id: 'cmr77dvnt006nrx063v3w622e', apiId: 302, name: 'La Liga' },
  SA: { id: 'cmr77dvpd006yrx06zig7907g', apiId: 207, name: 'Serie A' },
  BL: { id: 'cmr77dvgm0002rx06rt2uqxii', apiId: 175, name: 'Bundesliga' },
  L1: { id: 'cmr77dvqg007crx06q1kaceyo', apiId: 168, name: 'Ligue 1' },
  UCL: { id: 'cmr77dw3900f5rx06j05wgzv4', apiId: 3, name: 'UEFA Champions League' }
};

export const ALLOWED_LEAGUE_IDS = Object.values(GOAL_LEAGUE_MAP).map(l => l.id);

export const getGoalApiKey = () => 
  process.env.GOAL_API_KEY || 
  process.env.NEXT_PUBLIC_GOAL_API_KEY || 
  process.env.API_FOOTBALL_KEY || 
  process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || 
  '';

// Global Quota Tracker for Goal API (Default limit 1000 requests/day on Free tier)
let globalQuotaStatus = { current: 0, limit: 1000 };

export function getGlobalQuotaStatus() {
  return globalQuotaStatus;
}

export function updateQuotaFromHeaders(res: Response) {
  try {
    const remainingStr = res.headers.get('x-ratelimit-remaining') || res.headers.get('ratelimit-remaining');
    const limitStr = res.headers.get('x-ratelimit-limit') || res.headers.get('ratelimit-limit');
    if (remainingStr !== null && limitStr !== null) {
      const limit = parseInt(limitStr, 10) || 1000;
      const remaining = parseInt(remainingStr, 10) || 0;
      const current = Math.max(0, limit - remaining);
      globalQuotaStatus = { current, limit };
    }
  } catch (e) {
    console.error('Error updating Goal API quota from headers:', e);
  }
}

/**
 * Fetch real-time quota status directly from Goal API headers
 */
export async function fetchApiQuotaStatus(apiKey?: string): Promise<{ current: number; limit: number }> {
  const keyToUse = (apiKey && apiKey.trim()) || getGoalApiKey();
  if (!keyToUse) return globalQuotaStatus;

  try {
    const res = await fetch(`${GOAL_API_BASE}/leagues?limit=1`, {
      headers: { 'Authorization': `Bearer ${keyToUse}` },
      cache: 'no-store'
    });
    updateQuotaFromHeaders(res);
  } catch (err) {
    console.error('Error fetching Goal API quota status:', err);
  }
  return globalQuotaStatus;
}

/**
 * Helper to parse full statistics array from Goal API fixture
 */
export function parseGoalStats(statisticsArray: any[] = []): { home: TeamStatistics; away: TeamStatistics } {
  const findStat = (typeName: string) => {
    return statisticsArray.find(s => s.type?.toLowerCase() === typeName.toLowerCase());
  };

  const parseVal = (stat: any, side: 'home' | 'away', fallback = 0): number => {
    if (!stat || stat[side] === null || stat[side] === undefined) return fallback;
    const str = String(stat[side]).replace('%', '').trim();
    const parsed = parseInt(str, 10);
    return isNaN(parsed) ? fallback : parsed;
  };

  const possessionStat = findStat('Ball Possession') || findStat('Possession');
  const shotsTotal = findStat('Shots Total') || findStat('Total Shots');
  const shotsOnGoal = findStat('Shots On Goal') || findStat('On Target');
  const corners = findStat('Corners') || findStat('Corner Kicks');
  const fouls = findStat('Fouls');
  const offsides = findStat('Offsides');
  const yellowCards = findStat('Yellow Cards');
  const redCards = findStat('Red Cards');
  const saves = findStat('Saves') || findStat('Goalkeeper Saves');

  return {
    home: {
      possession: parseVal(possessionStat, 'home', 50),
      shots: parseVal(shotsTotal, 'home', 0),
      shotsOnTarget: parseVal(shotsOnGoal, 'home', 0),
      corners: parseVal(corners, 'home', 0),
      fouls: parseVal(fouls, 'home', 0),
      offsides: parseVal(offsides, 'home', 0),
      yellowCards: parseVal(yellowCards, 'home', 0),
      redCards: parseVal(redCards, 'home', 0),
      saves: parseVal(saves, 'home', 0)
    },
    away: {
      possession: parseVal(possessionStat, 'away', 50),
      shots: parseVal(shotsTotal, 'away', 0),
      shotsOnTarget: parseVal(shotsOnGoal, 'away', 0),
      corners: parseVal(corners, 'away', 0),
      fouls: parseVal(fouls, 'away', 0),
      offsides: parseVal(offsides, 'away', 0),
      yellowCards: parseVal(yellowCards, 'away', 0),
      redCards: parseVal(redCards, 'away', 0),
      saves: parseVal(saves, 'away', 0)
    }
  };
}

/**
 * Combine Goal API events, cards, and substitutions into MatchEvent list
 */
export function parseGoalEvents(events: any[] = [], cards: any[] = [], substitutions: any[] = []): MatchEvent[] {
  const result: MatchEvent[] = [];

  // 1. Goals
  events.forEach((e, idx) => {
    result.push({
      id: e.id || `goal-${idx}`,
      time: parseInt(e.time, 10) || 0,
      type: 'goal',
      teamId: e.homeScorer ? 'home' : 'away',
      player: e.homeScorer || e.awayScorer || 'Bàn thắng',
      assistPlayer: e.homeAssist || e.awayAssist || undefined,
      detail: e.score || undefined
    });
  });

  // 2. Cards
  cards.forEach((c, idx) => {
    const isYellow = (c.card || '').toLowerCase().includes('yellow');
    result.push({
      id: c.id || `card-${idx}`,
      time: parseInt(c.time, 10) || 0,
      type: isYellow ? 'yellow_card' : 'red_card',
      teamId: c.homeFault ? 'home' : 'away',
      player: c.homeFault || c.awayFault || 'Thẻ phạt'
    });
  });

  // 3. Substitutions
  substitutions.forEach((s, idx) => {
    result.push({
      id: s.id || `sub-${idx}`,
      time: parseInt(s.time, 10) || 0,
      type: 'substitution',
      teamId: s.homePlayerIn ? 'home' : 'away',
      player: s.homePlayerIn || s.awayPlayerIn || 'Vào sân',
      assistPlayer: s.homePlayerOut || s.awayPlayerOut || undefined,
      detail: 'Thay người'
    });
  });

  return result.sort((a, b) => a.time - b.time);
}

/**
 * Fetch detailed match data (events, cards, stats) from Goal API
 */
export async function fetchGoalFixtureDetails(fixtureId: string, apiKey?: string) {
  const keyToUse = (apiKey && apiKey.trim()) || getGoalApiKey();
  if (!keyToUse) return null;

  try {
    const res = await fetch(`${GOAL_API_BASE}/fixtures/${fixtureId}`, {
      headers: { 'Authorization': `Bearer ${keyToUse}` },
      cache: 'no-store'
    });
    updateQuotaFromHeaders(res);
    if (res.ok) {
      const data = await res.json();
      return data.data || null;
    }
  } catch (err) {
    console.error(`Error fetching Goal API details for ${fixtureId}:`, err);
  }
  return null;
}

/**
 * Fetch real standings for a league from Goal API
 */
export async function fetchRealStandings(apiKey?: string, leagueCode: LeagueCode = 'PL'): Promise<StandingItem[]> {
  const keyToUse = (apiKey && apiKey.trim()) || getGoalApiKey();
  if (!keyToUse) return [];

  const league = GOAL_LEAGUE_MAP[leagueCode];
  if (!league) return [];

  try {
    const res = await fetch(`${GOAL_API_BASE}/standings/${league.id}`, {
      headers: { 'Authorization': `Bearer ${keyToUse}` },
      cache: 'no-store'
    });
    updateQuotaFromHeaders(res);

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data.map((item: any) => {
          const played = parseInt(item.overallLeaguePlayed, 10) || 0;
          const won = parseInt(item.overallLeagueW, 10) || 0;
          const drawn = parseInt(item.overallLeagueD, 10) || 0;
          const lost = parseInt(item.overallLeagueL, 10) || 0;
          const gf = parseInt(item.overallLeagueGF, 10) || 0;
          const ga = parseInt(item.overallLeagueGA, 10) || 0;
          const pts = parseInt(item.overallLeaguePTS, 10) || 0;
          const rank = parseInt(item.overallLeaguePosition, 10) || 1;

          return {
            rank,
            team: {
              id: item.team?.id || item.teamId || '',
              name: item.team?.name || item.teamName || 'Đội bóng',
              shortName: (item.team?.name || item.teamName || 'TM').substring(0, 3).toUpperCase(),
              logo: item.team?.badge || '',
              leagueId: leagueCode,
              stadium: 'Sân vận động'
            },
            played,
            won,
            drawn,
            lost,
            goalsFor: gf,
            goalsAgainst: ga,
            goalDifference: gf - ga,
            points: pts,
            form: []
          };
        });
      }
    }
  } catch (err) {
    console.error(`Error fetching Goal API standings for ${leagueCode}:`, err);
  }
  return [];
}

/**
 * Map a Goal API fixture object to internal Match interface
 */
export function mapGoalFixtureToMatch(f: any, leagueCode: LeagueCode): Match {
  const statusRaw = (f.matchStatus || '').toUpperCase();
  let status: MatchStatus = 'UPCOMING';
  if (['FINISHED', 'FT', 'AET', 'PEN'].includes(statusRaw)) {
    status = 'FINISHED';
  } else if (['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'IN_PLAY'].includes(statusRaw) || f.matchLive === '1') {
    status = 'LIVE';
  } else if (['POSTPONED', 'PST'].includes(statusRaw)) {
    status = 'POSTPONED';
  } else if (['CANCELLED', 'CANC', 'ABD'].includes(statusRaw)) {
    status = 'CANCELLED';
  }

  const hScore = parseInt(f.homeTeamScore ?? f.homeTeamFtScore ?? '0', 10) || 0;
  const aScore = parseInt(f.awayTeamScore ?? f.awayTeamFtScore ?? '0', 10) || 0;

  const stats = f.statistics && f.statistics.length > 0
    ? parseGoalStats(f.statistics)
    : {
        home: { possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, yellowCards: 0, redCards: 0, offsides: 0, saves: 0 },
        away: { possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, yellowCards: 0, redCards: 0, offsides: 0, saves: 0 }
      };

  const events = parseGoalEvents(f.events || [], f.cards || [], f.substitutions || []);

  const kickoff = f.kickoffUtc || (f.matchDate ? `${f.matchDate}T${f.matchTime || '00:00'}:00.000Z` : new Date().toISOString());

  return {
    id: f.id || f.apiId,
    leagueId: leagueCode,
    season: f.leagueYear || '2026/2027',
    round: f.matchRound ? `Vòng ${f.matchRound}` : f.stageName || 'Vòng bảng',
    status,
    date: kickoff,
    venue: f.matchStadium || '',
    referee: f.matchReferee || '',
    elapsedTime: (() => {
      const rawMin = parseInt(f.minute || f.liveMinute || f.matchMinute || f.elapsedTime || f.elapsed || '0', 10) || 0;
      return (status === 'LIVE' && rawMin === 0) ? calculateLiveElapsedNumber(kickoff) : rawMin;
    })(),
    homeTeam: {
      id: f.homeTeamId || 'home',
      name: f.homeTeamName || f.homeTeam?.name || 'Home Team',
      shortName: (f.homeTeamName || 'HOM').substring(0, 3).toUpperCase(),
      logo: f.teamHomeBadge || f.homeTeam?.badge || '',
      leagueId: leagueCode,
      stadium: f.matchStadium || ''
    },
    awayTeam: {
      id: f.awayTeamId || 'away',
      name: f.awayTeamName || f.awayTeam?.name || 'Away Team',
      shortName: (f.awayTeamName || 'AWY').substring(0, 3).toUpperCase(),
      logo: f.teamAwayBadge || f.awayTeam?.badge || '',
      leagueId: leagueCode,
      stadium: f.matchStadium || ''
    },
    homeScore: hScore,
    awayScore: aScore,
    stats,
    events,
    updatedAt: f.updatedAt || new Date().toISOString()
  };
}

/**
 * Fetch real fixtures directly from Goal API
 */
export async function fetchRealFixtures(apiKey?: string, leagueCode?: LeagueCode | 'ALL'): Promise<Match[]> {
  const keyToUse = (apiKey && apiKey.trim()) || getGoalApiKey();
  if (!keyToUse) return [];

  const headers = { 'Authorization': `Bearer ${keyToUse}` };
  const targetLeagues: [LeagueCode, string][] = (leagueCode && leagueCode !== 'ALL')
    ? [[leagueCode as LeagueCode, GOAL_LEAGUE_MAP[leagueCode as LeagueCode]?.id]]
    : (Object.entries(GOAL_LEAGUE_MAP).map(([code, obj]) => [code as LeagueCode, obj.id]));

  const matches: Match[] = [];

  // 1. Fetch live matches
  try {
    const liveRes = await fetch(`${GOAL_API_BASE}/fixtures/live`, { headers, cache: 'no-store' });
    updateQuotaFromHeaders(liveRes);
    if (liveRes.ok) {
      const json = await liveRes.json();
      if (Array.isArray(json.data)) {
        json.data.forEach((f: any) => {
          const matchLeague = targetLeagues.find(([, id]) => id === f.leagueId);
          if (matchLeague) {
            matches.push(mapGoalFixtureToMatch(f, matchLeague[0]));
          }
        });
      }
    }
  } catch (err) {
    console.error('Error fetching live matches from Goal API:', err);
  }

  // 2. Fetch results & scheduled for target leagues
  for (const [code, id] of targetLeagues) {
    try {
      const [resResults, resSched] = await Promise.all([
        fetch(`${GOAL_API_BASE}/results/league/${id}?limit=15`, { headers, cache: 'no-store' }),
        fetch(`${GOAL_API_BASE}/fixtures?leagueId=${id}&status=SCHEDULED&limit=10`, { headers, cache: 'no-store' })
      ]);

      if (resResults.ok) {
        updateQuotaFromHeaders(resResults);
        const json = await resResults.json();
        if (Array.isArray(json.data)) {
          json.data.forEach((f: any) => matches.push(mapGoalFixtureToMatch(f, code)));
        }
      }

      if (resSched.ok) {
        updateQuotaFromHeaders(resSched);
        const json = await resSched.json();
        if (Array.isArray(json.data)) {
          json.data.forEach((f: any) => matches.push(mapGoalFixtureToMatch(f, code)));
        }
      }
    } catch (err) {
      console.error(`Error fetching fixtures for league ${code} from Goal API:`, err);
    }
  }

  return matches;
}

// Backward-compatibility alias
export const LEAGUE_MAP = GOAL_LEAGUE_MAP;
