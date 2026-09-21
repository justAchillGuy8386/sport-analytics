import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseClient';
import { GOAL_LEAGUE_MAP, getGoalApiKey, mapGoalFixtureToMatch, updateQuotaFromHeaders } from '@/services/goalApi';
import { LeagueCode } from '@/types/football';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const GOAL_API_BASE = 'https://api.goal-api.com/v1';

function isAuthorized(request: Request): boolean {
  const secretKey = process.env.SPORT_ANALYTICS_KEY || process.env.CRON_SECRET;
  if (!secretKey) return true;

  const url = new URL(request.url);
  const keyParam = url.searchParams.get('sport_analytics_key') || 
                   url.searchParams.get('key') || 
                   url.searchParams.get('secret');
  if (keyParam && keyParam === secretKey) return true;

  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token === secretKey) return true;
  }

  return false;
}

async function handleLiveSync(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Invalid or missing CRON_SECRET.' }, { status: 401 });
  }

  const apiKey = getGoalApiKey();
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'Missing GOAL_API_KEY on server.' }, { status: 500 });
  }

  const adminClient = getSupabaseAdmin();
  const headers = { 'Authorization': `Bearer ${apiKey}` };

  const targetLeagues = Object.entries(GOAL_LEAGUE_MAP) as [LeagueCode, { id: string; apiId: number; name: string }][];
  const targetLeagueIds = targetLeagues.map(([, obj]) => obj.id);

  try {
    // 1. Make EXACTLY 1 request to Goal API to get all in-play matches worldwide
    const liveRes = await fetch(`${GOAL_API_BASE}/fixtures/live`, { 
      headers, 
      cache: 'no-store' 
    });

    updateQuotaFromHeaders(liveRes);

    if (!liveRes.ok) {
      if (liveRes.status === 429) {
        console.warn('⚠️ Goal API Rate Limit reached (HTTP 429). Skipped cycle safely.');
        return NextResponse.json({ 
          success: true, 
          message: 'Rate limit hit, skipped safely without error.', 
          status: 429 
        });
      }
      return NextResponse.json({ 
        success: false, 
        error: `Goal API returned HTTP ${liveRes.status}` 
      }, { status: liveRes.status });
    }

    const liveJson = await liveRes.json();
    const allLiveFixtures = Array.isArray(liveJson.data) ? liveJson.data : [];

    // 2. Filter matches belonging to our 6 target leagues (PL, LL, SA, BL, L1, UCL)
    const targetLiveFixtures = allLiveFixtures.filter((f: any) => targetLeagueIds.includes(f.leagueId));

    const upsertRows: any[] = [];
    const activeLiveIds = new Set<string>();

    for (const f of targetLiveFixtures) {
      const lEntry = targetLeagues.find(([, obj]) => obj.id === f.leagueId);
      if (!lEntry) continue;
      const leagueCode = lEntry[0];

      const match = mapGoalFixtureToMatch(f, leagueCode);
      activeLiveIds.add(match.id);

      upsertRows.push({
        id: match.id,
        league_id: match.leagueId,
        season: match.season,
        round: match.round,
        status: 'LIVE',
        date: match.date,
        venue: match.venue,
        referee: match.referee,
        elapsed_time: match.elapsedTime,
        home_team_id: match.homeTeam.id,
        home_team_name: match.homeTeam.name,
        home_team_logo: match.homeTeam.logo,
        away_team_id: match.awayTeam.id,
        away_team_name: match.awayTeam.name,
        away_team_logo: match.awayTeam.logo,
        home_score: match.homeScore,
        away_score: match.awayScore,
        stats: match.stats,
        events: match.events,
        updated_at: new Date().toISOString()
      });
    }

    // 3. Check existing LIVE matches in Supabase:
    // Only mark as FINISHED if at least 135 minutes (2h15m) have passed since kickoff.
    // This prevents premature conclusions during halftime, VAR delays, or transient API glitches.
    const { data: dbLiveMatches } = await adminClient
      .from('matches')
      .select('id, date, elapsed_time')
      .eq('status', 'LIVE');

    const finishedIds: string[] = [];
    const nowMs = Date.now();
    const SAFE_MATCH_DURATION_MS = 135 * 60 * 1000; // 135 minutes = 2 hours 15 mins

    if (Array.isArray(dbLiveMatches)) {
      for (const m of dbLiveMatches) {
        if (!activeLiveIds.has(String(m.id))) {
          const startTime = new Date(m.date).getTime();
          const elapsedMs = nowMs - startTime;

          // Only conclude if >= 135 minutes have passed since kickoff
          if (!isNaN(startTime) && elapsedMs >= SAFE_MATCH_DURATION_MS) {
            finishedIds.push(String(m.id));
          } else {
            console.log(`⏳ Match ${m.id} missing from live feed, but only ${Math.round(elapsedMs / 60000)}m passed. Keeping status LIVE.`);
          }
        }
      }
    }

    if (finishedIds.length > 0) {
      await adminClient
        .from('matches')
        .update({ status: 'FINISHED', updated_at: new Date().toISOString() })
        .in('id', finishedIds);
      console.log(`🏁 Marked ${finishedIds.length} matches as FINISHED (duration >= 135m).`);
    }

    // 4. Upsert current live matches into Supabase
    if (upsertRows.length > 0) {
      const { error } = await adminClient
        .from('matches')
        .upsert(upsertRows, { onConflict: 'id' });

      if (error) {
        console.error('Supabase Live Upsert Error:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      quotaUsedInThisCall: 1,
      totalLiveWorldwide: allLiveFixtures.length,
      targetLiveCount: upsertRows.length,
      autoFinishedCount: finishedIds.length,
      matches: upsertRows.map(r => ({
        id: r.id,
        league: r.league_id,
        home: `${r.home_team_name} (${r.home_score})`,
        away: `${r.away_team_name} (${r.away_score})`,
        status: r.status
      }))
    });
  } catch (err: any) {
    console.error('Error in /api/cron/live:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handleLiveSync(request);
}

export async function POST(request: Request) {
  return handleLiveSync(request);
}

