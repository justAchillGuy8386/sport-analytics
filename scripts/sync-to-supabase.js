/**
 * Automated Sync Script: API-Football -> Supabase Database
 * Optimized for 100 req/day API Quota Limit
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

async function syncMatches() {
  console.log('🚀 Starting API-Football to Supabase Sync Job...');

  const headers = {
    'x-apisports-key': API_FOOTBALL_KEY,
    'x-rapidapi-key': API_FOOTBALL_KEY
  };

  let allFixtures = [];

  // 1. Fetch LIVE matches
  try {
    const liveRes = await fetch('https://v3.football.api-sports.io/fixtures?live=all', { headers });
    if (liveRes.ok) {
      const liveData = await liveRes.json();
      if (liveData.response && Array.isArray(liveData.response)) {
        console.log(`⚽ Found ${liveData.response.length} live matches.`);
        const targetIds = Object.values(LEAGUE_MAP);
        const filteredLive = liveData.response.filter(item => targetIds.includes(item.league?.id));
        allFixtures.push(...filteredLive);
      }
    }
  } catch (err) {
    console.error('Error fetching live matches:', err.message);
  }

  // 2. Fetch Recent Past & Upcoming Fixtures for Top Leagues (Premier League, La Liga, Serie A)
  const targetLeagues = [39, 140, 135]; // PL, LL, SA
  for (const lId of targetLeagues) {
    // Fetch upcoming fixtures
    try {
      const nextRes = await fetch(`https://v3.football.api-sports.io/fixtures?league=${lId}&next=5`, { headers });
      if (nextRes.ok) {
        const nextData = await nextRes.json();
        if (nextData.response && Array.isArray(nextData.response)) {
          allFixtures.push(...nextData.response);
        }
      }
    } catch (e) {
      console.error(`Error fetching upcoming fixtures for league ${lId}:`, e.message);
    }

    // Fetch past fixtures
    try {
      const lastRes = await fetch(`https://v3.football.api-sports.io/fixtures?league=${lId}&last=5`, { headers });
      if (lastRes.ok) {
        const lastData = await lastRes.json();
        if (lastData.response && Array.isArray(lastData.response)) {
          allFixtures.push(...lastData.response);
        }
      }
    } catch (e) {
      console.error(`Error fetching past fixtures for league ${lId}:`, e.message);
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
  console.log(`📦 Deduplicated ${uniqueFixtures.length} total matches to insert into Supabase.`);

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
      season: item.league?.season?.toString() || '2024/25',
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
      console.log(`✅ Successfully upserted ${rows.length} matches into Supabase Database!`);
    }
  } catch (err) {
    console.error('❌ Database connection exception:', err.message);
  }
}

syncMatches()
  .then(() => {
    console.log('🎉 Sync process completed successfully.');
    process.exit(0);
  })
  .catch(e => {
    console.error('Sync process exception:', e);
    process.exit(0);
  });
