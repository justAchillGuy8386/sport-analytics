
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

    // Background auto-repair for stale LIVE matches in Supabase DB
    const staleLiveIds = data
      .filter((row: any) => {
        const s = (row.status || '').toUpperCase().trim();
        const isLiveCode = ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'BT', 'IN_PLAY', 'INT'].includes(s);
        if (!isLiveCode) return false;
        const startTime = new Date(row.date).getTime();
        return !isNaN(startTime) && (Date.now() - startTime) > 3 * 60 * 60 * 1000;
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

    const mappedMatches: Match[] = data.map((row: any) => {
      const hScore = row.home_score ?? 0;
      const aScore = row.away_score ?? 0;
      const events = row.events || [];
      const stats = ensureMatchStats(row.stats, hScore, aScore, events);

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
        status: normalizeMatchStatus(row.status, row.date),
        elapsedTime: normalizeMatchStatus(row.status, row.date) === 'LIVE'
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

    // Sort so LIVE matches are placed at the top
    return mappedMatches.sort((a, b) => {
      if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
      if (a.status !== 'LIVE' && b.status === 'LIVE') return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    return [];
  }
}
