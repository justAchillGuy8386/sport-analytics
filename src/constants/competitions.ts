import { Competition, LeagueCode } from '@/types/football';

export const COMPETITIONS: Competition[] = [
  { id: 'PL', name: 'Premier League', slug: 'premier-league', country: 'England', flag: '🇬🇧', season: '2026/27', totalTeams: 20 },
  { id: 'LL', name: 'La Liga', slug: 'la-liga', country: 'Spain', flag: '🇪🇸', season: '2026/27', totalTeams: 20 },
  { id: 'SA', name: 'Serie A', slug: 'serie-a', country: 'Italy', flag: '🇮🇹', season: '2026/27', totalTeams: 20 },
  { id: 'BL', name: 'Bundesliga', slug: 'bundesliga', country: 'Germany', flag: '🇩🇪', season: '2026/27', totalTeams: 18 },
  { id: 'L1', name: 'Ligue 1', slug: 'ligue-1', country: 'France', flag: '🇫🇷', season: '2026/27', totalTeams: 18 },
  { id: 'UCL', name: 'UEFA Champions League', slug: 'champions-league', country: 'Europe', flag: '🇪🇺', season: '2026/27', totalTeams: 36 }
];

/**
 * Parse any param from URL (e.g. 'premier-league', 'PL', 'pl', 'la-liga', 'LL') into LeagueCode
 */
export function parseLeagueParam(param?: string): LeagueCode | null {
  if (!param) return null;
  const normalized = param.trim().toLowerCase();

  // Check code directly (case-insensitive)
  if (normalized === 'pl') return 'PL';
  if (normalized === 'll') return 'LL';
  if (normalized === 'sa') return 'SA';
  if (normalized === 'bl') return 'BL';
  if (normalized === 'l1') return 'L1';
  if (normalized === 'ucl') return 'UCL';

  // Check slug
  const match = COMPETITIONS.find(c => 
    c.slug.toLowerCase() === normalized || 
    c.id.toLowerCase() === normalized
  );
  if (match) return match.id;

  // Alternate friendly aliases
  if (normalized === 'uefa-champions-league' || normalized === 'c1') return 'UCL';
  if (normalized === 'epl' || normalized === 'ngoai-hang-anh') return 'PL';
  if (normalized === 'laliga' || normalized === 'tay-ban-nha') return 'LL';
  if (normalized === 'seriea' || normalized === 'y') return 'SA';
  if (normalized === 'bundes' || normalized === 'duc') return 'BL';
  if (normalized === 'ligue1' || normalized === 'phap') return 'L1';

  return null;
}

/**
 * Get canonical URL slug for a given LeagueCode
 */
export function getLeagueSlug(leagueCode: LeagueCode): string {
  const match = COMPETITIONS.find(c => c.id === leagueCode);
  return match?.slug || leagueCode.toLowerCase();
}
