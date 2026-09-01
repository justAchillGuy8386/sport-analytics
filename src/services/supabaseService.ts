import { Match, LeagueCode } from '@/types/football';
import { supabase, getSupabaseAdmin } from '@/lib/supabaseClient';

/**
 * Upsert real-world matches into Supabase 'matches' table for permanent storage
 */
export async function upsertMatchesToSupabase(matches: Match[]): Promise<number> {
  if (!matches || matches.length === 0) return 0;

  const adminClient = getSupabaseAdmin();

  const rows = matches.map((m) => ({
    id: m.id,
    league_id: m.leagueId,
    season: m.season || '2024/25',
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
 * Read saved historical matches directly from Supabase database
 */
export async function getMatchesFromSupabase(leagueCode?: LeagueCode | 'ALL', limit: number = 50): Promise<Match[]> {
  try {
    let query = supabase
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

    return data.map((row: any) => ({
      id: row.id,
      leagueId: row.league_id as LeagueCode,
      homeTeam: {
        id: row.home_team_id,
        name: row.home_team_name,
        shortName: (row.home_team_name || 'HOM').substring(0, 3).toUpperCase(),
        logo: row.home_team_logo,
        leagueId: row.league_id as LeagueCode,
        stadium: row.venue || 'Stadium'
      },
      awayTeam: {
        id: row.away_team_id,
        name: row.away_team_name,
        shortName: (row.away_team_name || 'AWY').substring(0, 3).toUpperCase(),
        logo: row.away_team_logo,
        leagueId: row.league_id as LeagueCode,
        stadium: row.venue || 'Stadium'
      },
      homeScore: row.home_score,
      awayScore: row.away_score,
      status: row.status as Match['status'],
      elapsedTime: row.elapsed_time,
      date: row.date,
      venue: row.venue,
      referee: row.referee,
      round: row.round,
      season: row.season,
      stats: row.stats || { home: {}, away: {} },
      events: row.events || []
    }));
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    return [];
  }
}
