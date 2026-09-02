/**
 * Automated Sync Script: API-Football -> Supabase Database
 * Optimized for 100 req/day API Quota Limit
 * Pure Dynamic Date & Time Fetching
 */

const { createClient } = require('@supabase/supabase-js');

const cleanString = (val) => {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (trimmed.includes('\n') || trimmed.includes('=')) return null;
  return trimmed;
};

const DEFAULT_API_KEY = '3f779659d2f2fdc3ecf432a3c49b2aae';
const DEFAULT_SUPABASE_URL = 'https://gahvaakmpvvnmryqzbpg.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhaHZhYWttcHZ2bm1yeXF6YnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI0NDQ4OSwiZXhwIjoyMTAzODIwNDg5fQ.zmk8IFzZ3rCG0NvVTWDQyZq2tf5qHXDGPEtpTk4fS8I';

const API_FOOTBALL_KEY = cleanString(process.env.API_FOOTBALL_KEY) || cleanString(process.env.NEXT_PUBLIC_API_FOOTBALL_KEY) || DEFAULT_API_KEY;
const SUPABASE_URL = cleanString(process.env.NEXT_PUBLIC_SUPABASE_URL) || DEFAULT_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = cleanString(process.env.SUPABASE_SERVICE_ROLE_KEY) || cleanString(process.env.SUPABASE_KEY) || DEFAULT_SUPABASE_KEY;

console.log('🔗 Connecting to Supabase URL:', SUPABASE_URL);

// Options to disable realtime websocket in Node.js background environment
const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  realtime: { timeout: 1000 }
};

let supabase;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, clientOptions);
} catch (err) {
  console.error('⚠️ Supabase client creation error, falling back to default key:', err.message);
  supabase = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY, clientOptions);
}

const LEAGUE_MAP = {
  PL: 39,
  LL: 140,
  SA: 135,
  BL: 78,
  L1: 61,
  UCL: 2
};

// Helper: Format Date object to YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function syncMatches() {
  const now = new Date();
  const todayStr = formatDate(now);
  console.log(`🚀 Starting Dynamic API-Football Sync Job at ${now.toISOString()} (Today: ${todayStr})...`);

  // Dynamically calculate date range: 3 days ago to 3 days in the future
  const past3Days = new Date(now);
  past3Days.setDate(now.getDate() - 3);

  const future3Days = new Date(now);
  future3Days.setDate(now.getDate() + 3);

  const fromStr = formatDate(past3Days);
  const toStr = formatDate(future3Days);

  // Dynamically calculate European football season year based on execution date
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const dynamicSeason = currentMonth >= 8 ? currentYear : currentYear - 1;

  console.log(`📅 Dynamic Window: ${fromStr} -> ${toStr} (Dynamic Season: ${dynamicSeason})`);

  const headers = {
    'x-apisports-key': API_FOOTBALL_KEY,
    'x-rapidapi-key': API_FOOTBALL_KEY
  };

  let allFixtures = [];
  const targetLeagueIds = Object.values(LEAGUE_MAP);

  // 1. Fetch Today's Matches worldwide using date parameter (Standalone parameter supported by API-Football!)
  try {
    const todayUrl = `https://v3.football.api-sports.io/fixtures?date=${todayStr}`;
    const todayRes = await fetch(todayUrl, { headers });
    if (todayRes.ok) {
      const todayData = await todayRes.json();
      if (todayData.response && Array.isArray(todayData.response)) {
        const filteredToday = todayData.response.filter(item => targetLeagueIds.includes(item.league?.id));
        console.log(`⚽ Found ${filteredToday.length} target league matches occurring today (${todayStr}).`);
        allFixtures.push(...filteredToday);
      }
    }
  } catch (err) {
    console.error('Error fetching today fixtures:', err.message);
  }

  // 2. Fetch matches for main leagues using league + season + date range (from -> to)
  const topLeagues = [39, 140, 135]; // PL, LL, SA
  for (const lId of topLeagues) {
    try {
      const leagueUrl = `https://v3.football.api-sports.io/fixtures?league=${lId}&season=${dynamicSeason}&from=${fromStr}&to=${toStr}`;
      const res = await fetch(leagueUrl, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.response && Array.isArray(data.response) && data.response.length > 0) {
          console.log(`🏆 Found ${data.response.length} matches for league ${lId} in range ${fromStr} to ${toStr}.`);
          allFixtures.push(...data.response);
        }
      }
    } catch (e) {
      console.error(`Error fetching league ${lId} range:`, e.message);
    }
  }

  // 3. Fallback: If still few matches, fetch last 5 for top leagues
  if (allFixtures.length < 5) {
    for (const lId of topLeagues) {
      try {
        const fallbackUrl = `https://v3.football.api-sports.io/fixtures?league=${lId}&season=${dynamicSeason}&last=5`;
        const res = await fetch(fallbackUrl, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.response && Array.isArray(data.response)) {
            allFixtures.push(...data.response);
          }
        }
      } catch (e) {
        console.error(`Fallback error for league ${lId}:`, e.message);
      }
    }
  }

  if (allFixtures.length === 0) {
    console.log('⚠️ No fixtures retrieved. Job completed gracefully.');
    return;
  }

  // Deduplicate by fixture ID
  const uniqueMap = new Map();
  for (const item of allFixtures) {
    if (item.fixture?.id) {
      uniqueMap.set(item.fixture.id, item);
    }
  }
  const uniqueFixtures = Array.from(uniqueMap.values());
  console.log(`📦 Deduplicated ${uniqueFixtures.length} total dynamic matches to insert into Supabase.`);

  // Map to Supabase table schema
  const rows = uniqueFixtures.map(item => {
    const statusShort = item.fixture?.status?.short || 'NS';
    let status = 'UPCOMING';
    if (['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE'].includes(statusShort)) status = 'LIVE';
    else if (['FT', 'AET', 'PEN'].includes(statusShort)) status = 'FINISHED';

    const leagueCode = Object.keys(LEAGUE_MAP).find(k => LEAGUE_MAP[k] === item.league?.id) || 'PL';

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
      home_team_name: item.teams?.home?.name || '',
      home_team_logo: item.teams?.home?.logo || '',
      away_team_id: item.teams?.away?.id?.toString() || '',
      away_team_name: item.teams?.away?.name || '',
      away_team_logo: item.teams?.away?.logo || '',
      home_score: item.goals?.home ?? 0,
      away_score: item.goals?.away ?? 0,
      updated_at: new Date().toISOString()
    };
  });

  // Upsert into Supabase matches table
  try {
    const { data, error } = await supabase
      .from('matches')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('❌ Supabase upsert error:', error.message);
    } else {
      console.log(`✅ Successfully upserted ${rows.length} dynamic matches into Supabase Database!`);
    }
  } catch (err) {
    console.error('❌ Database connection exception:', err.message);
  }
}

syncMatches()
  .then(() => {
    console.log('🎉 Dynamic sync process completed successfully.');
    process.exit(0);
  })
  .catch(e => {
    console.error('Dynamic sync process exception:', e);
    process.exit(0);
  });
