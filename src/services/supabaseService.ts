
import { Match, LeagueCode, MatchStatus, TeamStatistics } from '@/types/football';
import { getSupabaseAdmin } from '@/lib/supabaseClient';
import { calculateLiveElapsedNumber } from '@/utils/matchTime';

/**
 * Normalize raw status string from DB/API to system MatchStatus.
 * Self-Healing: If a match is marked LIVE in DB but started over 3 hours ago, it auto-converts to FINISHED.
 */
export function normalizeMatchStatus(rawStatus: string, matchDate?: string): MatchStatus {
  if (!rawStatus) return 'UPCOMING';
  const s = rawStatus.toUpperCase().trim();

  // If match date is in the future, it cannot be LIVE or FINISHED
  if (matchDate) {
    const matchTime = new Date(matchDate).getTime();
    if (!isNaN(matchTime) && matchTime > Date.now()) {
      if (['POSTPONED', 'PST', 'SUSP'].includes(s)) return 'POSTPONED';
      if (['CANCELLED', 'CANC', 'ABD'].includes(s)) return 'CANCELLED';
      return 'UPCOMING';
    }
  }

  const isLiveCode = ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'BT', 'IN_PLAY', 'INT'].includes(s);

  if (isLiveCode) {
    if (matchDate) {
      const startTime = new Date(matchDate).getTime();
      const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
      if (!isNaN(startTime) && (Date.now() - startTime) > THREE_HOURS_MS) {
        return 'FINISHED';
      }
    }
    return 'LIVE';
  }

  if (['FINISHED', 'FT', 'AET', 'PEN'].includes(s)) return 'FINISHED';
  if (['POSTPONED', 'PST', 'SUSP'].includes(s)) return 'POSTPONED';
  if (['CANCELLED', 'CANC', 'ABD'].includes(s)) return 'CANCELLED';
  return 'UPCOMING';
}

/**
 * Helper to guarantee valid match statistics structure from raw database records or match events
 */
function ensureMatchStats(rawStats: any, homeScore: number, awayScore: number, events: any[] = []) {
  if (rawStats && rawStats.home && rawStats.away) {
    return rawStats;
  }

  const eventYellowsHome = events.filter(e => (e.teamId === 'home' || e.teamId === '1') && e.type === 'yellow_card').length;
  const eventYellowsAway = events.filter(e => (e.teamId === 'away' || e.teamId === '2') && e.type === 'yellow_card').length;
  const eventRedsHome = events.filter(e => (e.teamId === 'home' || e.teamId === '1') && e.type === 'red_card').length;
  const eventRedsAway = events.filter(e => (e.teamId === 'away' || e.teamId === '2') && e.type === 'red_card').length;

  return {
    home: {
      possession: rawStats?.home?.possession ?? 50,
      shots: rawStats?.home?.shots ?? 0,
      shotsOnTarget: rawStats?.home?.shotsOnTarget ?? 0,
      corners: rawStats?.home?.corners ?? 0,
      fouls: rawStats?.home?.fouls ?? 0,
      yellowCards: rawStats?.home?.yellowCards ?? eventYellowsHome,
      redCards: rawStats?.home?.redCards ?? eventRedsHome,
      offsides: rawStats?.home?.offsides ?? 0,
      saves: rawStats?.home?.saves ?? 0
    },
    away: {
      possession: rawStats?.away?.possession ?? 50,
      shots: rawStats?.away?.shots ?? 0,
      shotsOnTarget: rawStats?.away?.shotsOnTarget ?? 0,
      corners: rawStats?.away?.corners ?? 0,
      fouls: rawStats?.away?.fouls ?? 0,
      yellowCards: rawStats?.away?.yellowCards ?? eventYellowsAway,
      redCards: rawStats?.away?.redCards ?? eventRedsAway,
      offsides: rawStats?.away?.offsides ?? 0,
      saves: rawStats?.away?.saves ?? 0
    }
  };
}

/**
 * Upsert real-world matches into Supabase 'matches' table for permanent storage
 */
export async function upsertMatchesToSupabase(matches: Match[]): Promise<number> {
  if (!matches || matches.length === 0) return 0;

  const adminClient = getSupabaseAdmin();

  const rows = matches.map((m) => ({
    id: m.id,
    league_id: m.leagueId,
    season: m.season || '2026/27',
    round: m.round || 'Regular Season',
    status: m.status,
    date: m.date || new Date().toISOString(),
    venue: m.venue || '',
    referee: m.referee || '',
    elapsed_time: m.elapsedTime || 0,
    home_team_id: m.homeTeam?.id || '',
    home_team_name: m.homeTeam?.name || 'Home Team',
    home_team_logo: m.homeTeam?.logo || '',
    away_team_id: m.awayTeam?.id || '',
    away_team_name: m.awayTeam?.name || 'Away Team',
    away_team_logo: m.awayTeam?.logo || '',
    home_score: m.homeScore ?? 0,
    away_score: m.awayScore ?? 0,
    stats: m.stats || {},
    events: m.events || [],
    updated_at: new Date().toISOString()
  }));

  try {
    const { data, error } = await adminClient
      .from('matches')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('Error upserting matches to Supabase:', error.message);
      return 0;
    }
    return rows.length;
  } catch (err) {
    console.error('Failed to connect to Supabase for upsert:', err);
    return 0;
  }
}

/**
 * Read saved matches directly from Supabase database (Bypasses RLS with Admin Client)
 */
export async function getMatchesFromSupabase(leagueCode?: LeagueCode | 'ALL', limit: number = 500): Promise<Match[]> {
  try {
    const adminClient = getSupabaseAdmin();
    let query = adminClient
      .from('matches')
      .select('*')
      .order('date', { ascending: false })
      .order('id', { ascending: true })
      .limit(limit);

    if (leagueCode && leagueCode !== 'ALL') {
      query = query.eq('league_id', leagueCode);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching matches from Supabase:', error.message);
      return [];
    }

    if (!data || !Array.isArray(data)) return [];

    const nowMs = Date.now();
    const staleLiveIds = data
      .filter((row: any) => {
        const s = (row.status || '').toUpperCase().trim();
        const isLiveCode = ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'BT', 'IN_PLAY', 'INT'].includes(s);
        if (!isLiveCode) return false;
        const startTime = new Date(row.date).getTime();
        return !isNaN(startTime) && (nowMs - startTime) > 3 * 60 * 60 * 1000;
      })
      .map((row: any) => row.id);

    const falseFinishedFutureIds = data
      .filter((row: any) => {
        const s = (row.status || '').toUpperCase().trim();
        if (!['FINISHED', 'FT', 'AET', 'PEN'].includes(s)) return false;
        const startTime = new Date(row.date).getTime();
        return !isNaN(startTime) && startTime > nowMs;
      })
      .map((row: any) => row.id);

    if (staleLiveIds.length > 0) {
      adminClient
        .from('matches')
        .update({ status: 'FINISHED', updated_at: new Date().toISOString() })
        .in('id', staleLiveIds)
        .then(({ error }) => {
          if (!error) {
            console.log(`🔧 Auto-repaired ${staleLiveIds.length} stale LIVE matches to FINISHED directly in Supabase DB.`);
          }
        });
    }

    if (falseFinishedFutureIds.length > 0) {
      adminClient
        .from('matches')
        .update({
          status: 'UPCOMING',
          home_score: 0,
          away_score: 0,
          stats: {
            home: { possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, yellowCards: 0, redCards: 0, offsides: 0, saves: 0 },
            away: { possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, yellowCards: 0, redCards: 0, offsides: 0, saves: 0 }
          },
          events: [],
          updated_at: new Date().toISOString()
        })
        .in('id', falseFinishedFutureIds)
        .then(({ error }) => {
          if (!error) {
            console.log(`🔧 Auto-repaired ${falseFinishedFutureIds.length} future matches to UPCOMING directly in Supabase DB.`);
          }
        });
    }

    const mappedMatches: Match[] = data.map((row: any) => {
      const matchStatus = normalizeMatchStatus(row.status, row.date);
      const isFutureMatch = new Date(row.date).getTime() > nowMs;
      const hScore = isFutureMatch ? 0 : (row.home_score ?? 0);
      const aScore = isFutureMatch ? 0 : (row.away_score ?? 0);
      const events = isFutureMatch ? [] : (row.events || []);
      const stats = isFutureMatch 
        ? {
            home: { possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, yellowCards: 0, redCards: 0, offsides: 0, saves: 0 },
            away: { possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, yellowCards: 0, redCards: 0, offsides: 0, saves: 0 }
          }
        : ensureMatchStats(row.stats, hScore, aScore, events);

      return {
        id: String(row.id),
        leagueId: row.league_id as LeagueCode,
        homeTeam: {
          id: row.home_team_id ? String(row.home_team_id) : 'home',
          name: row.home_team_name || 'Home Team',
          shortName: (row.home_team_name || 'HOM').substring(0, 3).toUpperCase(),
          logo: row.home_team_logo || '',
          leagueId: row.league_id as LeagueCode,
          stadium: row.venue || 'Stadium'
        },
        awayTeam: {
          id: row.away_team_id ? String(row.away_team_id) : 'away',
          name: row.away_team_name || 'Away Team',
          shortName: (row.away_team_name || 'AWY').substring(0, 3).toUpperCase(),
          logo: row.away_team_logo || '',
          leagueId: row.league_id as LeagueCode,
          stadium: row.venue || 'Stadium'
        },
        homeScore: hScore,
        awayScore: aScore,
        status: matchStatus,
        elapsedTime: matchStatus === 'LIVE'
          ? calculateLiveElapsedNumber(row.date, row.elapsed_time ?? 0)
          : (row.elapsed_time ?? 0),
        date: row.date,
        venue: row.venue || '',
        referee: row.referee || '',
        round: row.round || '',
        season: row.season || '',
        stats: stats,
        events: events,
        updatedAt: row.updated_at || row.date
      };
    });

    const getMatchPriority = (status: string, time: number) => {
      if (status === 'LIVE') return 100;
      if (status === 'FINISHED' && (nowMs - time) >= 0 && (nowMs - time) <= 48 * 3600 * 1000) return 90;
      if (status === 'UPCOMING' && (time - nowMs) >= 0 && (time - nowMs) <= 48 * 3600 * 1000) return 80;
      if (status === 'FINISHED' && (nowMs - time) >= 0 && (nowMs - time) <= 14 * 86400 * 1000) return 70;
      if (status === 'UPCOMING' && (time - nowMs) >= 0 && (time - nowMs) <= 14 * 86400 * 1000) return 60;
      if (status === 'FINISHED') return 50;
      return 10;
    };

    return mappedMatches.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      const prioA = getMatchPriority(a.status, timeA);
      const prioB = getMatchPriority(b.status, timeB);

      if (prioA !== prioB) {
        return prioB - prioA;
      }

      // Inside same priority tier:
      if (a.status === 'FINISHED' && b.status === 'FINISHED') {
        return timeB - timeA; // Newest finished match first
      }

      if (a.status === 'UPCOMING' && b.status === 'UPCOMING') {
        return timeA - timeB; // Closest upcoming kickoff first
      }

      return timeB - timeA;
    });
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    return [];
  }
}
