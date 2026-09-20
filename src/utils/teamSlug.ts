import { Team } from '@/types/football';

/**
 * Standardize team name to URL slug
 * e.g. "Manchester City" -> "manchester-city"
 * "Atlético Madrid" -> "atletico-madrid"
 */
export function slugifyTeam(name: string): string {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics / accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '');        // trim leading/trailing hyphens
}

// Common aliases for football clubs
const TEAM_ALIASES: Record<string, string[]> = {
  'mancity': ['manchester city'],
  'man-city': ['manchester city'],
  'manutd': ['manchester united'],
  'man-utd': ['manchester united'],
  'mu': ['manchester united'],
  'psg': ['paris saint-germain', 'paris sg', 'paris saint germain'],
  'barca': ['barcelona', 'fc barcelona'],
  'real': ['real madrid', 'real madrid cf'],
  'bayern': ['bayern munich', 'fc bayern munchen', 'fc bayern munich'],
  'dortmund': ['borussia dortmund'],
  'inter': ['internazionale', 'inter milan'],
  'milan': ['ac milan'],
  'juve': ['juventus', 'juventus fc'],
  'atletico': ['atletico madrid', 'club atletico de madrid'],
  'leverkusen': ['bayer 04 leverkusen', 'bayer leverkusen'],
  'wolves': ['wolverhampton wanderers', 'wolverhampton'],
  'spurs': ['tottenham hotspur', 'tottenham'],
};

/**
 * Find team in a list by slug, id, shortName or alias
 */
export function findTeamBySlugOrId(teams: Team[], param: string): Team | undefined {
  if (!param || !teams || teams.length === 0) return undefined;

  const rawDecoded = decodeURIComponent(param).trim().toLowerCase();
  const slugDecoded = slugifyTeam(rawDecoded);

  // 1. Exact ID match (case-insensitive)
  const byId = teams.find(t => t.id && t.id.toLowerCase() === rawDecoded);
  if (byId) return byId;

  // 2. Exact slug match on team name
  const byNameSlug = teams.find(t => slugifyTeam(t.name) === slugDecoded);
  if (byNameSlug) return byNameSlug;

  // 3. Exact shortName match or slug
  const byShortName = teams.find(
    t => t.shortName && (t.shortName.toLowerCase() === rawDecoded || slugifyTeam(t.shortName) === slugDecoded)
  );
  if (byShortName) return byShortName;

  // 4. Common nickname alias check
  const aliasTargets = TEAM_ALIASES[slugDecoded] || TEAM_ALIASES[rawDecoded];
  if (aliasTargets) {
    const byAlias = teams.find(t => {
      const tSlug = slugifyTeam(t.name);
      return aliasTargets.some(target => tSlug.includes(slugifyTeam(target)) || slugifyTeam(target).includes(tSlug));
    });
    if (byAlias) return byAlias;
  }

  // 5. Partial / substring match on slug
  const bySubstr = teams.find(t => {
    const tSlug = slugifyTeam(t.name);
    return tSlug.includes(slugDecoded) || slugDecoded.includes(tSlug);
  });
  if (bySubstr) return bySubstr;

  return undefined;
}
