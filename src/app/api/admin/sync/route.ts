import { NextResponse } from 'next/server';
import { fetchRealFixtures } from '@/services/apiFootball';
import { upsertMatchesToSupabase } from '@/services/supabaseService';

export const dynamic = 'force-dynamic';

import { getSupabaseAdmin } from '@/lib/supabaseClient';
import { LeagueCode } from '@/types/football';

const LEAGUE_MAP: Record<string, number> = {
  PL: 39,
  LL: 140,
  SA: 135,
  BL: 78,
  L1: 61,
  UCL: 2
};

function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function performSync(apiKey?: string) {
  const keyToUse = (apiKey && apiKey.trim()) || process.env.API_FOOTBALL_KEY || process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;
  if (!keyToUse) {
    return { success: false, message: 'Vui lòng cung cấp API Key để thực hiện đồng bộ.' };
  }

  const now = new Date();
  const todayStr = formatDateStr(now);
  const past3Days = new Date(now);
  past3Days.setDate(now.getDate() - 3);
  const future3Days = new Date(now);
  future3Days.setDate(now.getDate() + 3);

  const fromStr = formatDateStr(past3Days);
  const toStr = formatDateStr(future3Days);

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const dynamicSeason = currentMonth >= 8 ? currentYear : currentYear - 1;

  console.log(`🚀 Executing sync at ${now.toISOString()} (Range: ${fromStr} -> ${toStr}, Season: ${dynamicSeason})...`);

  const headers = {
    'x-apisports-key': keyToUse,
    'x-rapidapi-key': keyToUse
  };

  let allFixtures: any[] = [];
  const targetLeagueIds = Object.values(LEAGUE_MAP);

  // 0. Fetch LIVE matches worldwide first (Real-time in-play fixtures)
  try {
    const liveRes = await fetch('https://v3.football.api-sports.io/fixtures?live=all', { headers, cache: 'no-store' });
    if (liveRes.ok) {
      const liveData = await liveRes.json();
      if (liveData.response && Array.isArray(liveData.response)) {
        const filteredLive = liveData.response.filter((item: any) => targetLeagueIds.includes(item.league?.id));
        console.log(`🔴 Found ${filteredLive.length} target league matches currently LIVE!`);
        allFixtures.push(...filteredLive);
      }
    }
  } catch (err: any) {
    console.error('Error fetching live matches:', err.message);
  }

  // 1. Fetch Today's Matches
  try {
    const todayRes = await fetch(`https://v3.football.api-sports.io/fixtures?date=${todayStr}`, { headers, cache: 'no-store' });
    if (todayRes.ok) {
      const todayData = await todayRes.json();
      if (todayData.response && Array.isArray(todayData.response)) {
        const filtered = todayData.response.filter((item: any) => targetLeagueIds.includes(item.league?.id));
        allFixtures.push(...filtered);
      }
    }
  } catch (err: any) {
    console.error('Error fetching today fixtures:', err.message);
  }

  // 2. Fetch matches for target 6 leagues within 3-day window
  for (const lId of targetLeagueIds) {
    try {
      const url = `https://v3.football.api-sports.io/fixtures?league=${lId}&season=${dynamicSeason}&from=${fromStr}&to=${toStr}`;
      const res = await fetch(url, { headers, cache: 'no-store' });
      if (res.ok) {
        const d = await res.json();
        if (d.response && Array.isArray(d.response) && d.response.length > 0) {
          allFixtures.push(...d.response);
        }
      }
    } catch (e: any) {
      console.error(`Error fetching league ${lId}:`, e.message);
    }
  }

  if (allFixtures.length === 0) {
    return { success: true, message: 'Đã kiểm tra API-Football nhưng không có trận đấu mới cần cập nhật.', count: 0 };
  }

  // Deduplicate
  const uniqueMap = new Map<number, any>();
  for (const item of allFixtures) {
    if (item.fixture?.id) {
      uniqueMap.set(item.fixture.id, item);
    }
  }
  const uniqueFixtures = Array.from(uniqueMap.values());

  const rows = uniqueFixtures.map((item: any) => {
    const statusShort = item.fixture?.status?.short || 'NS';
    let status = 'UPCOMING';
    if (['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE', 'IN_PLAY'].includes(statusShort)) status = 'LIVE';
    else if (['FT', 'AET', 'PEN'].includes(statusShort)) status = 'FINISHED';

    if (status === 'LIVE' && item.fixture?.date) {
      const startTime = new Date(item.fixture.date).getTime();
      if (!isNaN(startTime) && (Date.now() - startTime) > 3 * 60 * 60 * 1000) {
        status = 'FINISHED';
      }
    }

    const leagueCode = Object.keys(LEAGUE_MAP).find(k => LEAGUE_MAP[k] === item.league?.id) || 'PL';
    const hScore = item.goals?.home ?? 0;
    const aScore = item.goals?.away ?? 0;

    const events = (item.events || []).map((e: any, idx: number) => ({
      id: `ev-${item.fixture?.id}-${idx}`,
      time: e.time?.elapsed || 0,
      teamId: e.team?.id?.toString() || '',
      player: e.player?.name || 'Player',
      type: e.type === 'Goal' ? 'goal' : e.detail?.includes('Yellow') ? 'yellow_card' : e.detail?.includes('Red') ? 'red_card' : 'sub'
    }));

    return {
      id: item.fixture?.id?.toString(),
      league_id: leagueCode,
      season: item.league?.season?.toString() || `${dynamicSeason}/${(dynamicSeason + 1).toString().slice(-2)}`,
      round: item.league?.round || 'Regular Season',
      status: status,
      date: item.fixture?.date || new Date().toISOString(),
      venue: item.fixture?.venue?.name || '',
      referee: item.fixture?.referee || '',
      elapsed_time: item.fixture?.status?.elapsed || 0,
      home_team_id: item.teams?.home?.id?.toString() || '',
      home_team_name: item.teams?.home?.name || 'Home Team',
      home_team_logo: item.teams?.home?.logo || '',
      away_team_id: item.teams?.away?.id?.toString() || '',
      away_team_name: item.teams?.away?.name || 'Away Team',
      away_team_logo: item.teams?.away?.logo || '',
      home_score: hScore,
      away_score: aScore,
      stats: item.statistics || {},
      events: events,
      updated_at: new Date().toISOString()
    };
  });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('matches').upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('Supabase upsert error in sync route:', error);
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: `Đã đồng bộ thành công ${rows.length} trận đấu vào Supabase Database!`,
    count: rows.length
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey') || undefined;
    const result = await performSync(apiKey);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Cron sync GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await performSync(body.apiKey);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Manual sync POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
