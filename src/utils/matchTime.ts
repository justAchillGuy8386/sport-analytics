export function getLiveMinute(match: { date?: string; elapsedTime?: number; status?: string }): string {
  // If match date exists, calculate elapsed minutes from kickoff
  if (match.date) {
    const kickoffMs = new Date(match.date).getTime();
    if (!isNaN(kickoffMs)) {
      const nowMs = Date.now();
      const diffMins = Math.floor((nowMs - kickoffMs) / (60 * 1000));

      if (diffMins <= 0) return `1'`;
      if (diffMins <= 45) {
        // First half: use maximum between API elapsed and calculated elapsed
        const m = Math.max(match.elapsedTime || 0, diffMins);
        return m > 45 ? `45+'` : `${m}'`;
      }
      if (diffMins <= 60) return `HT`;
      if (diffMins <= 105) {
        // Second half
        const secondHalfMinute = diffMins - 15;
        const m = Math.max(match.elapsedTime || 0, secondHalfMinute);
        if (m >= 90) return `90+'`;
        return `${m}'`;
      }
      return `90+'`;
    }
  }

  // Fallback to static elapsedTime
  if (typeof match.elapsedTime === 'number' && match.elapsedTime > 0) {
    if (match.elapsedTime === 45) return `45'`;
    if (match.elapsedTime > 45 && match.elapsedTime <= 50) return `45+'`;
    if (match.elapsedTime >= 90) return `90+'`;
    return `${match.elapsedTime}'`;
  }

  return `LIVE`;
}

/**
 * Calculates raw numeric elapsed minutes for database storage or numeric comparisons.
 */
export function calculateLiveElapsedNumber(dateStr?: string, existingElapsed: number = 0): number {
  if (!dateStr) return existingElapsed || 0;

  const kickoffMs = new Date(dateStr).getTime();
  if (isNaN(kickoffMs)) return existingElapsed || 0;

  const diffMins = Math.floor((Date.now() - kickoffMs) / (60 * 1000));
  if (diffMins <= 0) return 1;
  if (diffMins <= 45) return Math.max(existingElapsed, diffMins);
  if (diffMins <= 60) return 45;
  if (diffMins <= 105) return Math.max(existingElapsed, diffMins - 15);
  return Math.max(existingElapsed, 90);
}
