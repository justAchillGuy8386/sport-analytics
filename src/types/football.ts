export type LeagueCode = 'PL' | 'LL' | 'SA' | 'BL' | 'L1' | 'UCL';

export interface Competition {
  id: LeagueCode;
  name: string;
  country: string;
  flag: string;
  season: string;
  totalTeams: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  leagueId: LeagueCode;
  stadium: string;
}

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export interface MatchEvent {
  id: string;
  time: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'var';
  teamId: string;
  player: string;
  assistPlayer?: string;
  detail?: string;
}

export interface TeamStatistics {
  possession: number; // percentage e.g. 58
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  offsides: number;
  yellowCards: number;
  redCards: number;
  saves: number;
}

export interface LineupPlayer {
  id: string;
  name: string;
  number: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  isStarter: boolean;
}

export interface MatchLineup {
  formation: string;
  starters: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface BookmakerOdds {
  bookmaker: string;
  timestamp: string;
  homeWin: number;
  draw: number;
  awayWin: number;
  handicapLine: number; // e.g. -0.75 (Home gives 0.75 goals)
  homeHandicapOdds: number;
  awayHandicapOdds: number;
  overUnderLine: number; // e.g. 2.5
  overOdds: number;
  underOdds: number;
}

export interface Match {
  id: string;
  leagueId: LeagueCode;
  season: string;
  round: string;
  date: string;
  status: MatchStatus;
  elapsedTime?: number;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
  venue: string;
  referee: string;
  events: MatchEvent[];
  stats?: {
    home: TeamStatistics;
    away: TeamStatistics;
  };
  lineups?: {
    home: MatchLineup;
    away: MatchLineup;
  };
  odds?: BookmakerOdds;
  oddsHistory?: { timestamp: string; homeWin: number; draw: number; awayWin: number; handicapLine: number }[];
}

export interface StandingItem {
  rank: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export type HandicapResult = 'WIN' | 'HALF_WIN' | 'PUSH' | 'HALF_LOSS' | 'LOSS';

export interface ETLRunLog {
  id: string;
  timestamp: string;
  trigger: 'Schedule (15m)' | 'Manual' | 'Smart Polling';
  requestsUsed: number;
  requestsRemaining: number;
  activeLiveMatches: number;
  status: 'Success' | 'Quota Warning' | 'Rate Limited';
  details: string;
}
