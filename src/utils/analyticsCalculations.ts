import { Match } from '@/types/football';

export interface KPIMetrics {
  totalMatches: number;
  finishedMatches: number;
  totalGoals: number;
  avgGoalsPerMatch: number;
  avgCorners: number;
  avgYellowCards: number;
  avgRedCards: number;
  bttsRate: number;
  cleanSheetRate: number;
  over25Rate: number;
  homeWinRate: number;
  drawRate: number;
  awayWinRate: number;
}

export function calculateKPIMetrics(matches: Match[]): KPIMetrics {
  const matchesWithScores = matches.filter(
    m => m.homeScore !== null && m.awayScore !== null && typeof m.homeScore === 'number' && typeof m.awayScore === 'number'
  );
  const finishedCount = matchesWithScores.length;

  if (finishedCount === 0) {
    return {
      totalMatches: matches.length,
      finishedMatches: 0,
      totalGoals: 0,
      avgGoalsPerMatch: 0,
      avgCorners: 0,
      avgYellowCards: 0,
      avgRedCards: 0,
      bttsRate: 0,
      cleanSheetRate: 0,
      over25Rate: 0,
      homeWinRate: 0,
      drawRate: 0,
      awayWinRate: 0
    };
  }

  let totalGoals = 0;
  let totalCorners = 0;
  let totalYellowCards = 0;
  let totalRedCards = 0;

  let bttsCount = 0;
  let cleanSheetCount = 0;
  let over25Count = 0;

  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;

  matchesWithScores.forEach(m => {
    const hScore = m.homeScore!;
    const aScore = m.awayScore!;
    const matchGoals = hScore + aScore;

    totalGoals += matchGoals;

    if (hScore > 0 && aScore > 0) bttsCount++;
    if (hScore === 0 || aScore === 0) cleanSheetCount++;
    if (matchGoals > 2.5) over25Count++;

    if (hScore > aScore) homeWins++;
    else if (hScore === aScore) draws++;
    else awayWins++;

    if (m.stats) {
      totalCorners += (m.stats.home.corners + m.stats.away.corners);
      totalYellowCards += (m.stats.home.yellowCards + m.stats.away.yellowCards);
      totalRedCards += (m.stats.home.redCards + m.stats.away.redCards);
    }
  });

  return {
    totalMatches: matches.length,
    finishedMatches: finishedCount,
    totalGoals,
    avgGoalsPerMatch: Number((totalGoals / finishedCount).toFixed(2)),
    avgCorners: Number((totalCorners / finishedCount).toFixed(2)),
    avgYellowCards: Number((totalYellowCards / finishedCount).toFixed(2)),
    avgRedCards: Number((totalRedCards / finishedCount).toFixed(2)),
    bttsRate: Number(((bttsCount / finishedCount) * 100).toFixed(1)),
    cleanSheetRate: Number(((cleanSheetCount / (finishedCount * 2)) * 100).toFixed(1)),
    over25Rate: Number(((over25Count / finishedCount) * 100).toFixed(1)),
    homeWinRate: Number(((homeWins / finishedCount) * 100).toFixed(1)),
    drawRate: Number(((draws / finishedCount) * 100).toFixed(1)),
    awayWinRate: Number(((awayWins / finishedCount) * 100).toFixed(1))
  };
}
