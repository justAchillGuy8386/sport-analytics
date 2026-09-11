export function getLiveMinute(match: { date?: string; elapsedTime?: number; status?: string }): string {
  // 1. If API provides a valid elapsed time > 0
  if (typeof match.elapsedTime === 'number' && match.elapsedTime > 0) {
    if (match.elapsedTime === 45) return `45'`;
    if (match.elapsedTime > 45 && match.elapsedTime <= 50) return `45+'`;
    if (match.elapsedTime > 90) return `90+'`;
    return `${match.elapsedTime}'`;
  }

  // 2. Dynamic fallback: Calculate based on kickoff time (date)
  if (match.date) {
    const kickoffMs = new Date(match.date).getTime();
    if (!isNaN(kickoffMs)) {
      const nowMs = Date.now();
      const elapsedMinutes = Math.floor((nowMs - kickoffMs) / (60 * 1000));

      if (elapsedMinutes <= 0) return `1'`;
      if (elapsedMinutes <= 45) return `${elapsedMinutes}'`;
      if (elapsedMinutes <= 60) return `HT`;
      if (elapsedMinutes <= 105) {
        const secondHalfMinute = elapsedMinutes - 15;
        if (secondHalfMinute >= 90) return `90+'`;
        return `${secondHalfMinute}'`;
      }
      if (elapsedMinutes <= 125) return `90+'`;
      return `FT`;
    }
  }

  return `LIVE`;
}

/**
 * Calculates raw numeric elapsed minutes for database storage or numeric comparisons.
 */
export function calculateLiveElapsedNumber(dateStr?: string, existingElapsed: number = 0): number {
  if (existingElapsed > 0) return existingElapsed;
  if (!dateStr) return 0;

  const kickoffMs = new Date(dateStr).getTime();
  if (isNaN(kickoffMs)) return 0;

  const diffMins = Math.floor((Date.now() - kickoffMs) / (60 * 1000));
  if (diffMins <= 0) return 1;
  if (diffMins <= 45) return diffMins;
  if (diffMins <= 60) return 45;
  if (diffMins <= 105) return Math.min(90, diffMins - 15);
  return 90;
}
