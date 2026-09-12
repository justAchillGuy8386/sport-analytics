import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseClient';
import { LeagueCode } from '@/types/football';
import { 
  GOAL_LEAGUE_MAP, 
  getGoalApiKey, 
  mapGoalFixtureToMatch, 
  fetchGoalFixtureDetails 
} from '@/services/goalApi';

export const dynamic = 'force-dynamic';

const GOAL_API_BASE = 'https://api.goal-api.com/v1';

async function performSync(apiKey?: string) {
  const keyToUse = (apiKey && apiKey.trim()) || getGoalApiKey();
  if (!keyToUse) {
    return { success: false, message: 'Vui lòng cung cấp Goal API Key để thực hiện đồng bộ.' };
  }

  const adminClient = getSupabaseAdmin();
  const headers = { 'Authorization': `Bearer ${keyToUse}` };
  const targetLeagues = Object.entries(GOAL_LEAGUE_MAP) as [LeagueCode, { id: string; apiId: number; name: string }][];
  const targetLeagueIds = targetLeagues.map(([, obj]) => obj.id);

  console.log(`🚀 Starting Goal API Sync at ${new Date().toISOString()}...`);

  const fetchedMatches: any[] = [];

  // 1. Fetch LIVE matches worldwide first
  try {
    const liveRes = await fetch(`${GOAL_API_BASE}/fixtures/live`, { headers, cache: 'no-store' });
    if (liveRes.ok) {
      const liveJson = await liveRes.json();
      if (Array.isArray(liveJson.data)) {
        const liveFiltered = liveJson.data.filter((f: any) => targetLeagueIds.includes(f.leagueId));
        console.log(`🔴 Found ${liveFiltered.length} matches currently LIVE in target leagues!`);
        for (const item of liveFiltered) {
          const lEntry = targetLeagues.find(([, obj]) => obj.id === item.leagueId);
          if (lEntry) {
            // Live matches should have detailed stats/events
            const details = await fetchGoalFixtureDetails(item.id, keyToUse);
            fetchedMatches.push(mapGoalFixtureToMatch(details || item, lEntry[0]));
          }
        }
      }
    }
  } catch (err: any) {
    console.error('Error fetching live matches from Goal API:', err.message);
  }

  // 2. Fetch recent finished & upcoming matches for each target league
  for (const [leagueCode, leagueObj] of targetLeagues) {
    try {
      const [resResults, resSched] = await Promise.all([
        fetch(`${GOAL_API_BASE}/results/league/${leagueObj.id}?limit=15`, { headers, cache: 'no-store' }),
        fetch(`${GOAL_API_BASE}/fixtures?leagueId=${leagueObj.id}&status=SCHEDULED&limit=10`, { headers, cache: 'no-store' })
      ]);

      if (resResults.ok) {
        const resJson = await resResults.json();
        if (Array.isArray(resJson.data) && resJson.data.length > 0) {
          const resultIds = resJson.data.map((r: any) => String(r.id)).filter(Boolean);
          const { data: existingInDb } = await adminClient
            .from('matches')
            .select('id, stats, events')
            .in('id', resultIds);

          const existingMap = new Map<string, any>();
          if (Array.isArray(existingInDb)) {
            existingInDb.forEach((item: any) => existingMap.set(String(item.id), item));
          }

          for (let i = 0; i < resJson.data.length; i++) {
            const raw = resJson.data[i];
            const existing = existingMap.get(String(raw.id));
            const hasDetailedStats = existing && (
              (existing.events && existing.events.length > 0) ||
              (existing.stats?.home?.shots > 0 || existing.stats?.away?.shots > 0 ||
               existing.stats?.home?.corners > 0 || existing.stats?.away?.corners > 0)
            );

            if (i < 3) {
              if (hasDetailedStats) {
                const mapped = mapGoalFixtureToMatch(raw, leagueCode);
                mapped.stats = existing.stats;
                mapped.events = existing.events;
                fetchedMatches.push(mapped);
              } else {
                const details = await fetchGoalFixtureDetails(raw.id, keyToUse);
                fetchedMatches.push(mapGoalFixtureToMatch(details || raw, leagueCode));
              }
            } else {
              const mapped = mapGoalFixtureToMatch(raw, leagueCode);
              if (hasDetailedStats) {
                mapped.stats = existing.stats;
                mapped.events = existing.events;
              }
              fetchedMatches.push(mapped);
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
      console.error(`Error fetching league ${leagueCode} from Goal API:`, e.message);
    }
  }

  if (fetchedMatches.length === 0) {
    return { success: true, message: 'Đã kiểm tra Goal API nhưng không có trận đấu mới cần cập nhật.', count: 0 };
  }

  // Deduplicate matches by ID
  const uniqueMap = new Map<string, any>();
  for (const m of fetchedMatches) {
    if (m.id) {
      uniqueMap.set(String(m.id), m);
    }
  }
  const uniqueMatches = Array.from(uniqueMap.values());
  console.log(`📦 Deduplicated ${uniqueMatches.length} total matches to sync to Supabase.`);

  // Prepare database rows
  const rows = uniqueMatches.map((m) => ({
    id: String(m.id),
    league_id: m.leagueId,
    season: m.season || '2026/2027',
    round: m.round || 'Vòng đấu',
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
    const { error } = await adminClient
      .from('matches')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('❌ Supabase upsert error:', error.message);
      return { success: false, message: `Lỗi lưu vào Supabase: ${error.message}` };
    }

    return {
      success: true,
      message: `Đã nạp thành công ${rows.length} trận đấu từ Goal API vào Supabase Database!`,
      count: rows.length
    };
  } catch (err: any) {
    console.error('❌ Database connection exception:', err.message);
    return { success: false, message: `Lỗi kết nối CSDL: ${err.message}` };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await performSync(body?.apiKey);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('apiKey') || undefined;
  const result = await performSync(apiKey);
  return NextResponse.json(result);
}
