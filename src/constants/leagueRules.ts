import { LeagueCode } from '@/types/football';

export type ZoneType = 
  | 'UCL_DIRECT' 
  | 'UCL_QUALIFIERS' 
  | 'UCL_R16' 
  | 'UCL_PLAYOFF' 
  | 'UEL' 
  | 'UECL' 
  | 'RELEGATION_PLAYOFF' 
  | 'RELEGATION' 
  | 'ELIMINATED' 
  | 'SAFE';

export interface RankZone {
  type: ZoneType;
  minRank: number;
  maxRank: number;
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  borderLeftColor: string;
  description: string;
}

export interface CompetitionRules {
  leagueId: LeagueCode;
  totalTeams: number;
  leagueName: string;
  uclSummary: string;
  relegationSummary: string;
  additionalNotes: string;
  zones: RankZone[];
}

export const LEAGUE_RULES: Record<LeagueCode, CompetitionRules> = {
  PL: {
    leagueId: 'PL',
    leagueName: 'Premier League',
    totalTeams: 20,
    uclSummary: 'Top 4 đội dẫn đầu giành vé vào thẳng Vòng bảng (League Phase) UEFA Champions League.',
    relegationSummary: '3 đội xếp cuối bảng (Hạng 18, 19, 20) xuống hạng trực tiếp xuống chơi tại EFL Championship.',
    additionalNotes: 'Hạng 5 vào vòng bảng Europa League; Hạng 6 vào vòng Play-off Conference League. Suất dự cúp có thể mở rộng xuống hạng 7-8 tùy thuộc vào đội vô địch FA Cup & Carabao Cup.',
    zones: [
      {
        type: 'UCL_DIRECT',
        minRank: 1,
        maxRank: 4,
        label: 'Champions League (Vòng bảng)',
        shortLabel: 'UCL',
        badgeBg: 'bg-blue-500/20',
        badgeText: 'text-blue-300',
        badgeBorder: 'border-blue-500/40',
        dotColor: 'bg-blue-500',
        borderLeftColor: 'border-l-blue-500',
        description: 'Vào thẳng Vòng bảng UEFA Champions League 2027/28'
      },
      {
        type: 'UEL',
        minRank: 5,
        maxRank: 5,
        label: 'Europa League (Vòng bảng)',
        shortLabel: 'UEL',
        badgeBg: 'bg-amber-500/20',
        badgeText: 'text-amber-300',
        badgeBorder: 'border-amber-500/40',
        dotColor: 'bg-amber-500',
        borderLeftColor: 'border-l-amber-500',
        description: 'Vào thẳng Vòng bảng UEFA Europa League'
      },
      {
        type: 'UECL',
        minRank: 6,
        maxRank: 6,
        label: 'Conference League (Play-off)',
        shortLabel: 'UECL',
        badgeBg: 'bg-emerald-500/20',
        badgeText: 'text-emerald-300',
        badgeBorder: 'border-emerald-500/40',
        dotColor: 'bg-emerald-500',
        borderLeftColor: 'border-l-emerald-500',
        description: 'Vòng Play-off UEFA Conference League'
      },
      {
        type: 'RELEGATION',
        minRank: 18,
        maxRank: 20,
        label: 'Xuống hạng trực tiếp (Hạng 18 - 20)',
        shortLabel: 'Xuống hạng',
        badgeBg: 'bg-red-500/20',
        badgeText: 'text-red-300',
        badgeBorder: 'border-red-500/40',
        dotColor: 'bg-red-500',
        borderLeftColor: 'border-l-red-500',
        description: 'Xuống hạng trực tiếp xuống EFL Championship'
      }
    ]
  },

  LL: {
    leagueId: 'LL',
    leagueName: 'La Liga',
    totalTeams: 20,
    uclSummary: 'Top 4 đội dẫn đầu giành vé vào thẳng Vòng bảng (League Phase) UEFA Champions League.',
    relegationSummary: '3 đội xếp cuối bảng (Hạng 18, 19, 20) rớt hạng trực tiếp xuống Segunda División (La Liga 2).',
    additionalNotes: 'Hạng 5 vào Europa League; Hạng 6 vào Conference League. Đội vô địch Cúp Nhà Vua (Copa del Rey) nhận 1 suất Europa League bổ sung.',
    zones: [
      {
        type: 'UCL_DIRECT',
        minRank: 1,
        maxRank: 4,
        label: 'Champions League (Vòng bảng)',
        shortLabel: 'UCL',
        badgeBg: 'bg-blue-500/20',
        badgeText: 'text-blue-300',
        badgeBorder: 'border-blue-500/40',
        dotColor: 'bg-blue-500',
        borderLeftColor: 'border-l-blue-500',
        description: 'Vào thẳng Vòng bảng UEFA Champions League'
      },
      {
        type: 'UEL',
        minRank: 5,
        maxRank: 5,
        label: 'Europa League (Vòng bảng)',
        shortLabel: 'UEL',
        badgeBg: 'bg-amber-500/20',
        badgeText: 'text-amber-300',
        badgeBorder: 'border-amber-500/40',
        dotColor: 'bg-amber-500',
        borderLeftColor: 'border-l-amber-500',
        description: 'Vào thẳng Vòng bảng UEFA Europa League'
      },
      {
        type: 'UECL',
        minRank: 6,
        maxRank: 6,
        label: 'Conference League (Play-off)',
        shortLabel: 'UECL',
        badgeBg: 'bg-emerald-500/20',
        badgeText: 'text-emerald-300',
        badgeBorder: 'border-emerald-500/40',
        dotColor: 'bg-emerald-500',
        borderLeftColor: 'border-l-emerald-500',
        description: 'Vòng Play-off UEFA Conference League'
      },
      {
        type: 'RELEGATION',
        minRank: 18,
        maxRank: 20,
        label: 'Xuống hạng trực tiếp (Hạng 18 - 20)',
        shortLabel: 'Xuống hạng',
        badgeBg: 'bg-red-500/20',
        badgeText: 'text-red-300',
        badgeBorder: 'border-red-500/40',
        dotColor: 'bg-red-500',
        borderLeftColor: 'border-l-red-500',
        description: 'Xuống hạng trực tiếp xuống Segunda División (La Liga 2)'
      }
    ]
  },

  SA: {
    leagueId: 'SA',
    leagueName: 'Serie A',
    totalTeams: 20,
    uclSummary: 'Top 4 đội dẫn đầu giành vé vào thẳng Vòng bảng (League Phase) UEFA Champions League.',
    relegationSummary: '3 đội xếp cuối bảng (Hạng 18, 19, 20) xuống hạng trực tiếp chơi tại Serie B.',
    additionalNotes: 'Hạng 5 vào Europa League; Hạng 6 vào Conference League. Đội vô địch Cúp Quốc gia Ý (Coppa Italia) giành suất vào Europa League.',
    zones: [
      {
        type: 'UCL_DIRECT',
        minRank: 1,
        maxRank: 4,
        label: 'Champions League (Vòng bảng)',
        shortLabel: 'UCL',
        badgeBg: 'bg-blue-500/20',
        badgeText: 'text-blue-300',
        badgeBorder: 'border-blue-500/40',
        dotColor: 'bg-blue-500',
        borderLeftColor: 'border-l-blue-500',
        description: 'Vào thẳng Vòng bảng UEFA Champions League'
      },
      {
        type: 'UEL',
        minRank: 5,
        maxRank: 5,
        label: 'Europa League (Vòng bảng)',
        shortLabel: 'UEL',
        badgeBg: 'bg-amber-500/20',
        badgeText: 'text-amber-300',
        badgeBorder: 'border-amber-500/40',
        dotColor: 'bg-amber-500',
        borderLeftColor: 'border-l-amber-500',
        description: 'Vào thẳng Vòng bảng UEFA Europa League'
      },
      {
        type: 'UECL',
        minRank: 6,
        maxRank: 6,
        label: 'Conference League (Play-off)',
        shortLabel: 'UECL',
        badgeBg: 'bg-emerald-500/20',
        badgeText: 'text-emerald-300',
        badgeBorder: 'border-emerald-500/40',
        dotColor: 'bg-emerald-500',
        borderLeftColor: 'border-l-emerald-500',
        description: 'Vòng Play-off UEFA Conference League'
      },
      {
        type: 'RELEGATION',
        minRank: 18,
        maxRank: 20,
        label: 'Xuống hạng trực tiếp (Hạng 18 - 20)',
        shortLabel: 'Xuống hạng',
        badgeBg: 'bg-red-500/20',
        badgeText: 'text-red-300',
        badgeBorder: 'border-red-500/40',
        dotColor: 'bg-red-500',
        borderLeftColor: 'border-l-red-500',
        description: 'Xuống hạng trực tiếp xuống Serie B'
      }
    ]
  },

  BL: {
    leagueId: 'BL',
    leagueName: 'Bundesliga',
    totalTeams: 18,
    uclSummary: 'Top 4 đội dẫn đầu giành vé vào thẳng Vòng bảng (League Phase) UEFA Champions League.',
    relegationSummary: '2 đội bét bảng (Hạng 17, 18) xuống thẳng 2. Bundesliga. Đội Hạng 16 đá 2 lượt trận Play-off sinh tử với đội hạng 3 của 2. Bundesliga.',
    additionalNotes: 'Bundesliga chỉ gồm 18 đội thi đấu 34 vòng. Hạng 5 vào Europa League; Hạng 6 vào Conference League.',
    zones: [
      {
        type: 'UCL_DIRECT',
        minRank: 1,
        maxRank: 4,
        label: 'Champions League (Vòng bảng)',
        shortLabel: 'UCL',
        badgeBg: 'bg-blue-500/20',
        badgeText: 'text-blue-300',
        badgeBorder: 'border-blue-500/40',
        dotColor: 'bg-blue-500',
        borderLeftColor: 'border-l-blue-500',
        description: 'Vào thẳng Vòng bảng UEFA Champions League'
      },
      {
        type: 'UEL',
        minRank: 5,
        maxRank: 5,
        label: 'Europa League (Vòng bảng)',
        shortLabel: 'UEL',
        badgeBg: 'bg-amber-500/20',
        badgeText: 'text-amber-300',
        badgeBorder: 'border-amber-500/40',
        dotColor: 'bg-amber-500',
        borderLeftColor: 'border-l-amber-500',
        description: 'Vào thẳng Vòng bảng UEFA Europa League'
      },
      {
        type: 'UECL',
        minRank: 6,
        maxRank: 6,
        label: 'Conference League (Play-off)',
        shortLabel: 'UECL',
        badgeBg: 'bg-emerald-500/20',
        badgeText: 'text-emerald-300',
        badgeBorder: 'border-emerald-500/40',
        dotColor: 'bg-emerald-500',
        borderLeftColor: 'border-l-emerald-500',
        description: 'Vòng Play-off UEFA Conference League'
      },
      {
        type: 'RELEGATION_PLAYOFF',
        minRank: 16,
        maxRank: 16,
        label: 'Play-off Trụ Hạng (Hạng 16)',
        shortLabel: 'Play-off trụ hạng',
        badgeBg: 'bg-orange-500/20',
        badgeText: 'text-orange-300',
        badgeBorder: 'border-orange-500/40',
        dotColor: 'bg-orange-500',
        borderLeftColor: 'border-l-orange-500',
        description: 'Đá 2 lượt trận Play-off tranh suất trụ hạng với đội hạng 3 của 2. Bundesliga'
      },
      {
        type: 'RELEGATION',
        minRank: 17,
        maxRank: 18,
        label: 'Xuống hạng trực tiếp (Hạng 17 - 18)',
        shortLabel: 'Xuống hạng',
        badgeBg: 'bg-red-500/20',
        badgeText: 'text-red-300',
        badgeBorder: 'border-red-500/40',
        dotColor: 'bg-red-500',
        borderLeftColor: 'border-l-red-500',
        description: 'Xuống hạng trực tiếp xuống 2. Bundesliga'
      }
    ]
  },

  L1: {
    leagueId: 'L1',
    leagueName: 'Ligue 1',
    totalTeams: 18,
    uclSummary: 'Top 3 đội dẫn đầu vào thẳng Vòng bảng UEFA Champions League. Đội xếp Hạng 4 tham dự Vòng loại thứ 3 (Qualifiers) UEFA Champions League.',
    relegationSummary: '2 đội bét bảng (Hạng 17, 18) xuống thẳng Ligue 2. Đội Hạng 16 đá Play-off trụ hạng (Barrages) 2 lượt trận với đội thắng play-off của Ligue 2.',
    additionalNotes: 'Ligue 1 quy tụ 18 đội bóng. Điểm khác biệt: Pháp chỉ có 3 suất vào thẳng Cúp C1 và 1 suất đá sơ loại. Hạng 5 vào Europa League; Hạng 6 vào Conference League.',
    zones: [
      {
        type: 'UCL_DIRECT',
        minRank: 1,
        maxRank: 3,
        label: 'Vào thẳng Vòng bảng Champions League (Top 3)',
        shortLabel: 'UCL Trực tiếp',
        badgeBg: 'bg-blue-500/20',
        badgeText: 'text-blue-300',
        badgeBorder: 'border-blue-500/40',
        dotColor: 'bg-blue-500',
        borderLeftColor: 'border-l-blue-500',
        description: 'Vào thẳng Vòng bảng UEFA Champions League'
      },
      {
        type: 'UCL_QUALIFIERS',
        minRank: 4,
        maxRank: 4,
        label: 'Vòng loại Champions League (Hạng 4)',
        shortLabel: 'UCL Sơ loại',
        badgeBg: 'bg-cyan-500/20',
        badgeText: 'text-cyan-300',
        badgeBorder: 'border-cyan-500/40',
        dotColor: 'bg-cyan-500',
        borderLeftColor: 'border-l-cyan-500',
        description: 'Vào Vòng loại thứ 3 (Qualifiers) UEFA Champions League'
      },
      {
        type: 'UEL',
        minRank: 5,
        maxRank: 5,
        label: 'Europa League (Vòng bảng)',
        shortLabel: 'UEL',
        badgeBg: 'bg-amber-500/20',
        badgeText: 'text-amber-300',
        badgeBorder: 'border-amber-500/40',
        dotColor: 'bg-amber-500',
        borderLeftColor: 'border-l-amber-500',
        description: 'Vào thẳng Vòng bảng UEFA Europa League'
      },
      {
        type: 'UECL',
        minRank: 6,
        maxRank: 6,
        label: 'Conference League (Play-off)',
        shortLabel: 'UECL',
        badgeBg: 'bg-emerald-500/20',
        badgeText: 'text-emerald-300',
        badgeBorder: 'border-emerald-500/40',
        dotColor: 'bg-emerald-500',
        borderLeftColor: 'border-l-emerald-500',
        description: 'Vòng Play-off UEFA Conference League'
      },
      {
        type: 'RELEGATION_PLAYOFF',
        minRank: 16,
        maxRank: 16,
        label: 'Play-off Trụ Hạng Barrages (Hạng 16)',
        shortLabel: 'Play-off trụ hạng',
        badgeBg: 'bg-orange-500/20',
        badgeText: 'text-orange-300',
        badgeBorder: 'border-orange-500/40',
        dotColor: 'bg-orange-500',
        borderLeftColor: 'border-l-orange-500',
        description: 'Đá 2 lượt trận Play-off Barrages tranh suất trụ hạng với đại diện Ligue 2'
      },
      {
        type: 'RELEGATION',
        minRank: 17,
        maxRank: 18,
        label: 'Xuống hạng trực tiếp (Hạng 17 - 18)',
        shortLabel: 'Xuống hạng',
        badgeBg: 'bg-red-500/20',
        badgeText: 'text-red-300',
        badgeBorder: 'border-red-500/40',
        dotColor: 'bg-red-500',
        borderLeftColor: 'border-l-red-500',
        description: 'Xuống hạng trực tiếp xuống Ligue 2'
      }
    ]
  },

  UCL: {
    leagueId: 'UCL',
    leagueName: 'UEFA Champions League',
    totalTeams: 36,
    uclSummary: 'Top 8 đội dẫn đầu vào thẳng Vòng 1/8 (Round of 16). Các đội xếp Hạng 9 đến 24 thi đấu 2 lượt trận Play-off Knockout để tranh 8 suất còn lại.',
    relegationSummary: 'Không áp dụng xuống hạng. Các đội xếp Hạng 25 đến 36 bị loại hoàn toàn khỏi các cúp châu Âu (không còn xuống Europa League).',
    additionalNotes: 'Thể thức Thụy Sĩ (Swiss Model): 36 đội chung 1 bảng xếp hạng duy nhất, mỗi đội thi đấu 8 trận với 8 đối thủ khác nhau.',
    zones: [
      {
        type: 'UCL_R16',
        minRank: 1,
        maxRank: 8,
        label: 'Vào thẳng Vòng 1/8 (Hạng 1 - 8)',
        shortLabel: 'Vòng 1/8',
        badgeBg: 'bg-blue-500/20',
        badgeText: 'text-blue-300 font-bold',
        badgeBorder: 'border-blue-500/40',
        dotColor: 'bg-blue-500',
        borderLeftColor: 'border-l-blue-500',
        description: 'Vào thẳng Vòng 1/8 UEFA Champions League (Nhóm hạt giống)'
      },
      {
        type: 'UCL_PLAYOFF',
        minRank: 9,
        maxRank: 24,
        label: 'Play-off Knockout (Hạng 9 - 24)',
        shortLabel: 'Play-off 1/8',
        badgeBg: 'bg-indigo-500/20',
        badgeText: 'text-indigo-300',
        badgeBorder: 'border-indigo-500/40',
        dotColor: 'bg-indigo-500',
        borderLeftColor: 'border-l-indigo-500',
        description: 'Đá 2 lượt trận Play-off Knockout tranh vé vào vòng 1/8'
      },
      {
        type: 'ELIMINATED',
        minRank: 25,
        maxRank: 36,
        label: 'Bị loại khỏi Cúp Châu Âu (Hạng 25 - 36)',
        shortLabel: 'Bị loại',
        badgeBg: 'bg-rose-500/20',
        badgeText: 'text-rose-300',
        badgeBorder: 'border-rose-500/40',
        dotColor: 'bg-rose-500',
        borderLeftColor: 'border-l-rose-500',
        description: 'Bị loại khỏi Cúp Châu Âu (không được xuống Europa League)'
      }
    ]
  }
};

/**
 * Helper to get the specific zone for a given rank in a league
 */
export function getRankZone(leagueId: LeagueCode, rank: number, totalTeamsInTable?: number): RankZone | null {
  const rules = LEAGUE_RULES[leagueId];
  if (!rules) return null;

  // Handle dynamic table size if table has fewer teams than full season
  const actualTeams = totalTeamsInTable && totalTeamsInTable > 0 ? totalTeamsInTable : rules.totalTeams;

  for (const zone of rules.zones) {
    // If the league is relegation-based and table size varies, align bottom zones
    if (zone.type === 'RELEGATION' || zone.type === 'RELEGATION_PLAYOFF') {
      const offsetFromBottomMin = rules.totalTeams - zone.maxRank;
      const offsetFromBottomMax = rules.totalTeams - zone.minRank;
      const adjustedMin = actualTeams - offsetFromBottomMax;
      const adjustedMax = actualTeams - offsetFromBottomMin;

      if (rank >= adjustedMin && rank <= adjustedMax) {
        return zone;
      }
    } else {
      if (rank >= zone.minRank && rank <= zone.maxRank) {
        return zone;
      }
    }
  }

  return null;
}
