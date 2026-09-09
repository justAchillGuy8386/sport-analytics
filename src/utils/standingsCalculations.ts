import { Match, StandingItem } from '@/types/football';

export function calculateStandingsFromMatches(matches: Match[]): StandingItem[] {
  if (!matches || matches.length === 0) return [];

  const teamMap = new Map<string, {
    id: string;
    name: string;
    logo: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
    form: ('W' | 'D' | 'L')[];
  }>();

  // Process all matches (both finished and live)
  const validMatches = matches.filter(
    m => (m.status === 'FINISHED' || m.status === 'LIVE') && m.homeScore !== null && m.awayScore !== null
  );

  // Helper to ensure team entry exists in map
  const getOrCreateTeam = (teamId: string, name: string, logo: string) => {
    if (!teamMap.has(teamId)) {
      teamMap.set(teamId, {
        id: teamId,
        name: name || 'Team',
        logo: logo || '',
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
        form: []
      });
    }
    return teamMap.get(teamId)!;
  };

  // Sort matches by date ascending to calculate form correctly
  const sortedMatches = [...validMatches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedMatches.forEach(m => {
    const home = getOrCreateTeam(m.homeTeam.id, m.homeTeam.name, m.homeTeam.logo);
    const away = getOrCreateTeam(m.awayTeam.id, m.awayTeam.name, m.awayTeam.logo);

    const hScore = m.homeScore!;
    const aScore = m.awayScore!;

    home.played += 1;
    away.played += 1;

    home.goalsFor += hScore;
    home.goalsAgainst += aScore;
    away.goalsFor += aScore;
    away.goalsAgainst += hScore;

    if (hScore > aScore) {
      home.won += 1;
      home.points += 3;
      home.form.push('W');

      away.lost += 1;
      away.form.push('L');
    } else if (hScore < aScore) {
      away.won += 1;
      away.points += 3;
      away.form.push('W');

      home.lost += 1;
      home.form.push('L');
    } else {
      home.drawn += 1;
      home.points += 1;
      home.form.push('D');

      away.drawn += 1;
      away.points += 1;
      away.form.push('D');
    }
  });

  const standingsList = Array.from(teamMap.values()).map(t => {
    const goalDiff = t.goalsFor - t.goalsAgainst;
    // Only take the actual recent matches played (up to 5), strictly NO fake padding
    const last5Form = t.form.slice(-5);

    return {
      rank: 0,
      team: {
        id: t.id,
        name: t.name,
        shortName: t.name.substring(0, 3).toUpperCase(),
        logo: t.logo,
        leagueId: matches[0]?.leagueId || 'PL',
        stadium: 'Stadium'
      },
      played: t.played,
      won: t.won,
      drawn: t.drawn,
      lost: t.lost,
      goalsFor: t.goalsFor,
      goalsAgainst: t.goalsAgainst,
      goalDifference: goalDiff,
      points: t.points,
      form: last5Form
    };
  });

  // Sort by points -> goal difference -> goals for
  standingsList.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  // Assign ranks
  standingsList.forEach((item, index) => {
    item.rank = index + 1;
  });

  return standingsList;
}
