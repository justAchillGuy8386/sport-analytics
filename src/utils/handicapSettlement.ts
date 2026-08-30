import { HandicapResult } from '@/types/football';

/**
 * Asian Handicap Settlement Engine
 * Accurately calculates Asian Handicap outcome based on Section 10 of technical spec.
 * 
 * @param homeScore Score of home team
 * @param awayScore Score of away team
 * @param handicapLine Home team handicap line (e.g. -0.75 means Home gives 0.75 goals)
 * @param selection 'HOME' or 'AWAY'
 * @returns HandicapResult ('WIN' | 'HALF_WIN' | 'PUSH' | 'HALF_LOSS' | 'LOSS')
 */
export function calculateAsianHandicap(
  homeScore: number,
  awayScore: number,
  handicapLine: number,
  selection: 'HOME' | 'AWAY' = 'HOME'
): HandicapResult {
  // Determine target team's net handicap line and net goal difference
  const isHomeBet = selection === 'HOME';
  const targetHandicap = isHomeBet ? handicapLine : -handicapLine;
  const goalDiff = isHomeBet ? (homeScore - awayScore) : (awayScore - homeScore);

  // Check if it's a quarter line (e.g., 0.25, 0.75, -0.25, -0.75, 1.25, -1.25...)
  const absLine = Math.abs(targetHandicap * 4);
  const isQuarterLine = absLine % 2 === 1; // 0.25 * 4 = 1, 0.75 * 4 = 3 (odd numbers)

  if (!isQuarterLine) {
    // Single line (0, 0.5, 1.0, 1.5, 2.0...)
    const netResult = goalDiff + targetHandicap;
    if (netResult > 0) return 'WIN';
    if (netResult === 0) return 'PUSH';
    return 'LOSS';
  } else {
    // Split into 2 sub-bets (line - 0.25 and line + 0.25)
    const subLine1 = targetHandicap - 0.25;
    const subLine2 = targetHandicap + 0.25;

    const res1 = goalDiff + subLine1;
    const res2 = goalDiff + subLine2;

    const sub1Outcome = res1 > 0 ? 1 : (res1 === 0 ? 0 : -1);
    const sub2Outcome = res2 > 0 ? 1 : (res2 === 0 ? 0 : -1);

    const totalScore = sub1Outcome + sub2Outcome;

    if (totalScore === 2) return 'WIN';
    if (totalScore === 1) return 'HALF_WIN';
    if (totalScore === 0) return 'PUSH';
    if (totalScore === -1) return 'HALF_LOSS';
    return 'LOSS';
  }
}

/**
 * Over/Under Settlement Engine
 */
export function calculateOverUnder(
  homeScore: number,
  awayScore: number,
  ouLine: number,
  selection: 'OVER' | 'UNDER'
): HandicapResult {
  const totalGoals = homeScore + awayScore;
  const targetLine = selection === 'OVER' ? ouLine : ouLine; // line is always positive

  const absLine = Math.abs(targetLine * 4);
  const isQuarterLine = absLine % 2 === 1;

  if (selection === 'OVER') {
    if (!isQuarterLine) {
      if (totalGoals > targetLine) return 'WIN';
      if (totalGoals === targetLine) return 'PUSH';
      return 'LOSS';
    } else {
      const sub1 = targetLine - 0.25;
      const sub2 = targetLine + 0.25;
      const res1 = totalGoals > sub1 ? 1 : (totalGoals === sub1 ? 0 : -1);
      const res2 = totalGoals > sub2 ? 1 : (totalGoals === sub2 ? 0 : -1);
      const total = res1 + res2;
      if (total === 2) return 'WIN';
      if (total === 1) return 'HALF_WIN';
      if (total === 0) return 'PUSH';
      if (total === -1) return 'HALF_LOSS';
      return 'LOSS';
    }
  } else {
    // UNDER
    if (!isQuarterLine) {
      if (totalGoals < targetLine) return 'WIN';
      if (totalGoals === targetLine) return 'PUSH';
      return 'LOSS';
    } else {
      const sub1 = targetLine - 0.25;
      const sub2 = targetLine + 0.25;
      const res1 = totalGoals < sub1 ? 1 : (totalGoals === sub1 ? 0 : -1);
      const res2 = totalGoals < sub2 ? 1 : (totalGoals === sub2 ? 0 : -1);
      const total = res1 + res2;
      if (total === 2) return 'WIN';
      if (total === 1) return 'HALF_WIN';
      if (total === 0) return 'PUSH';
      if (total === -1) return 'HALF_LOSS';
      return 'LOSS';
    }
  }
}
