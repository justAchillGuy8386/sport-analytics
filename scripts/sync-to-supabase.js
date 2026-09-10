const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Auto-load .env.local if run locally
try {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envText = fs.readFileSync(envPath, 'utf8');
    envText.split(/\r?\n/).forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2 && parts[0].trim() && !parts[0].trim().startsWith('#')) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim();
        if (!process.env[key]) process.env[key] = val;
      }
    });
  }
} catch (e) {}

const cleanString = (val) => {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (trimmed.includes('\n') || trimmed.includes('=')) return null;
  return trimmed;
};

const GOAL_API_KEY = cleanString(process.env.GOAL_API_KEY) || 
  cleanString(process.env.NEXT_PUBLIC_GOAL_API_KEY) || 
  cleanString(process.env.API_FOOTBALL_KEY) || 
  cleanString(process.env.NEXT_PUBLIC_API_FOOTBALL_KEY);

const SUPABASE_URL = cleanString(process.env.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_SERVICE_ROLE_KEY = cleanString(process.env.SUPABASE_SERVICE_ROLE_KEY) || cleanString(process.env.SUPABASE_KEY);

if (!GOAL_API_KEY) {
  console.error('❌ Missing GOAL_API_KEY environment variable.');
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase URL:', SUPABASE_URL);

const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  realtime: { timeout: 1000 }
};

let supabase;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, clientOptions);
} catch (err) {
  console.error('⚠️ Supabase client creation error:', err.message);
  process.exit(1);
}

const GOAL_API_BASE = 'https://api.goal-api.com/v1';

const GOAL_LEAGUE_MAP = {
  PL: { id: 'cmr77dvkr005nrx06lp7rvp49', name: 'Premier League' },
  LL: { id: 'cmr77dvnt006nrx063v3w622e', name: 'La Liga' },
  SA: { id: 'cmr77dvpd006yrx06zig7907g', name: 'Serie A' },
  BL: { id: 'cmr77dvgm0002rx06rt2uqxii', name: 'Bundesliga' },
  L1: { id: 'cmr77dvqg007crx06q1kaceyo', name: 'Ligue 1' },
  UCL: { id: 'cmr77dw3900f5rx06j05wgzv4', name: 'UEFA Champions League' }
};

function parseGoalStats(statisticsArray = []) {
  const findStat = (typeName) => {
    return statisticsArray.find(s => s.type?.toLowerCase() === typeName.toLowerCase());
  };

  const parseVal = (stat, side, fallback = 0) => {
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

function parseGoalEvents(events = [], cards = [], substitutions = []) {
  const result = [];

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

async function fetchGoalDetails(id) {
  try {
    const res = await fetch(`${GOAL_API_BASE}/fixtures/${id}`, {
      headers: { 'Authorization': `Bearer ${GOAL_API_KEY}` }
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (e) {
    console.error(`Error fetching Goal API details for ${id}:`, e.message);
  }
  return null;
}

function mapFixture(f, leagueCode) {
  const statusRaw = (f.matchStatus || '').toUpperCase();
  let status = 'UPCOMING';
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
    id: String(f.id || f.apiId),
    league_id: leagueCode,
    season: f.leagueYear || '2026/2027',
    round: f.matchRound ? `Vòng ${f.matchRound}` : f.stageName || 'Vòng đấu',
    status,
    date: kickoff,
    venue: f.matchStadium || '',
    referee: f.matchReferee || '',
    elapsed_time: parseInt(f.minute || '0', 10) || 0,
    home_team_id: f.homeTeamId || 'home',
    home_team_name: f.homeTeamName || f.homeTeam?.name || 'Home Team',
    home_team_logo: f.teamHomeBadge || f.homeTeam?.badge || '',
    away_team_id: f.awayTeamId || 'away',
    away_team_name: f.awayTeamName || f.awayTeam?.name || 'Away Team',
    away_team_logo: f.teamAwayBadge || f.awayTeam?.badge || '',
    home_score: hScore,
    away_score: aScore,
    stats,
    events,
    updated_at: new Date().toISOString()
  };
}

async function syncMatches() {
  const now = new Date();
  console.log(`🚀 Starting Goal API Sync Job at ${now.toISOString()}...`);

  const headers = { 'Authorization': `Bearer ${GOAL_API_KEY}` };
  const targetLeagues = Object.entries(GOAL_LEAGUE_MAP);
  const targetLeagueIds = targetLeagues.map(([, obj]) => obj.id);

  let rawList = [];

  // 1. Fetch LIVE matches
  try {
    const liveRes = await fetch(`${GOAL_API_BASE}/fixtures/live`, { headers });
    if (liveRes.ok) {
      const liveJson = await liveRes.json();
      if (Array.isArray(liveJson.data)) {
        const liveFiltered = liveJson.data.filter(f => targetLeagueIds.includes(f.leagueId));
        console.log(`🔴 Found ${liveFiltered.length} LIVE matches in target leagues!`);
        for (const item of liveFiltered) {
          const lEntry = targetLeagues.find(([, obj]) => obj.id === item.leagueId);
          if (lEntry) {
            const details = await fetchGoalDetails(item.id);
            rawList.push(mapFixture(details || item, lEntry[0]));
          }
        }
      }
    }
  } catch (err) {
    console.error('Error fetching live matches:', err.message);
  }

  // 2. Fetch Results & Upcoming matches for target 6 leagues
  for (const [code, leagueObj] of targetLeagues) {
    try {
      const [resResults, resSched] = await Promise.all([
        fetch(`${GOAL_API_BASE}/results/league/${leagueObj.id}?limit=15`, { headers }),
        fetch(`${GOAL_API_BASE}/fixtures?leagueId=${leagueObj.id}&status=SCHEDULED&limit=10`, { headers })
      ]);

      if (resResults.ok) {
        const resJson = await resResults.json();
        if (Array.isArray(resJson.data)) {
          console.log(`🏆 [${code}] Retrieved ${resJson.data.length} recent results.`);
          for (let i = 0; i < resJson.data.length; i++) {
            const item = resJson.data[i];
            if (i < 4) {
              // Fetch full statistics & events for the 4 latest completed matches
              const details = await fetchGoalDetails(item.id);
              rawList.push(mapFixture(details || item, code));
            } else {
              rawList.push(mapFixture(item, code));
            }
          }
        }
      }

      if (resSched.ok) {
        const schedJson = await resSched.json();
        if (Array.isArray(schedJson.data)) {
          console.log(`📅 [${code}] Retrieved ${schedJson.data.length} scheduled matches.`);
          schedJson.data.forEach(item => {
            rawList.push(mapFixture(item, code));
          });
        }
      }
    } catch (e) {
      console.error(`Error fetching league ${code}:`, e.message);
    }
  }

  if (rawList.length === 0) {
    console.log('⚠️ No fixtures retrieved from Goal API.');
    return;
  }

  // Deduplicate matches
  const uniqueMap = new Map();
  for (const m of rawList) {
    if (m.id) {
      uniqueMap.set(m.id, m);
    }
  }
  const rows = Array.from(uniqueMap.values());
  console.log(`📦 Upserting ${rows.length} unique matches into Supabase Database...`);

  try {
    const { error } = await supabase
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
    console.log('🎉 Goal API Sync Job finished successfully.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Sync process exception:', err);
    process.exit(1);
  });
