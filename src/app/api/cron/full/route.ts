import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseClient';
import { 
  GOAL_LEAGUE_MAP, 
  getGoalApiKey, 
  mapGoalFixtureToMatch, 
  fetchGoalFixtureDetails 
} from '@/services/goalApi';
import { LeagueCode } from '@/types/football';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow enough time for serverless execution

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

async function handleFullSync(request: Request) {
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

  console.log(`🚀 Starting Goal API Full Sync Job at ${new Date().toISOString()}...`);

  const fetchedMatches: any[] = [];
  let requestsCount = 0;

  // 1. Fetch LIVE matches
  try {
    const liveRes = await fetch(`${GOAL_API_BASE}/fixtures/live`, { headers, cache: 'no-store' });
    requestsCount++;
    if (liveRes.ok) {
      const liveJson = await liveRes.json();
      if (Array.isArray(liveJson.data)) {
        const liveFiltered = liveJson.data.filter((f: any) => targetLeagueIds.includes(f.leagueId));
        for (const item of liveFiltered) {
          const lEntry = targetLeagues.find(([, obj]) => obj.id === item.leagueId);
          if (lEntry) {
            fetchedMatches.push(mapGoalFixtureToMatch(item, lEntry[0]));
          }
        }
      }
    }
  } catch (err: any) {
    console.error('Error fetching live matches:', err.message);
  }

  // 2. Fetch recent results & upcoming matches for each target league
  for (const [leagueCode, leagueObj] of targetLeagues) {
    try {
      const [resResults, resSched] = await Promise.all([
        fetch(`${GOAL_API_BASE}/results/league/${leagueObj.id}?limit=15`, { headers, cache: 'no-store' }),
        fetch(`${GOAL_API_BASE}/fixtures?leagueId=${leagueObj.id}&status=SCHEDULED&limit=10`, { headers, cache: 'no-store' })
      ]);
      requestsCount += 2;

      if (resResults.ok) {
        const resJson = await resResults.json();
        if (Array.isArray(resJson.data)) {
          for (let i = 0; i < resJson.data.length; i++) {
            const raw = resJson.data[i];
            if (i < 3) {
              // Fetch full match statistics & events for the 3 latest completed matches
              const details = await fetchGoalFixtureDetails(raw.id, apiKey);
              requestsCount++;
              fetchedMatches.push(mapGoalFixtureToMatch(details || raw, leagueCode));
            } else {
              fetchedMatches.push(mapGoalFixtureToMatch(raw, leagueCode));
            }
          }
        }
      }

      if (resSched.ok) {
        const schedJson = await resSched.json();
        if (Array.isArray(schedJson.data)) {
          schedJson.data.forEach((raw: any) => {
            fetchedMatches.push(mapGoalFixtureToMatch(raw, leagueCode));
          });
        }
      }
    } catch (e: any) {
      console.error(`Error fetching league ${leagueCode}:`, e.message);
    }
  }

  if (fetchedMatches.length === 0) {
    return NextResponse.json({ 
      success: true, 
      message: 'Không có trận đấu nào được trả về từ Goal API.', 
      requestsUsed: requestsCount 
    });
  }

  // Deduplicate matches
  const uniqueMap = new Map<string, any>();
  for (const m of fetchedMatches) {
    if (m.id) {
      uniqueMap.set(String(m.id), {
        id: String(m.id),
        league_id: m.leagueId,
        season: m.season || '2026/2027',
        round: m.round || 'Vòng đấu',
        status: m.status,
        date: m.date || new Date().toISOString(),
        venue: m.venue || '',
        referee: m.referee || '',
        elapsed_time: m.elapsedTime || 0,
        home_team_id: m.homeTeam?.id || 'home',
        home_team_name: m.homeTeam?.name || 'Home Team',
        home_team_logo: m.homeTeam?.logo || '',
        away_team_id: m.awayTeam?.id || 'away',
        away_team_name: m.awayTeam?.name || 'Away Team',
        away_team_logo: m.awayTeam?.logo || '',
        home_score: m.homeScore ?? 0,
        away_score: m.awayScore ?? 0,
        stats: m.stats || {},
        events: m.events || [],
        updated_at: new Date().toISOString()
      });
    }
  }

  const rows = Array.from(uniqueMap.values());

  try {
    const { error } = await adminClient
      .from('matches')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('Supabase Full Sync Upsert Error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      requestsUsed: requestsCount,
      totalUpserted: rows.length,
      message: `Đã đồng bộ thành công ${rows.length} trận đấu vào Supabase!`
    });
  } catch (err: any) {
    console.error('Error saving full sync to Supabase:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handleFullSync(request);
}

export async function POST(request: Request) {
  return handleFullSync(request);
}

