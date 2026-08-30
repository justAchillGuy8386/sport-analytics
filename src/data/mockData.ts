import { Competition, Team, Match, StandingItem, ETLRunLog } from '@/types/football';

export const COMPETITIONS: Competition[] = [
  { id: 'PL', name: 'Premier League', country: 'England', flag: '🇬🇧', season: '2026/27', totalTeams: 20 },
  { id: 'LL', name: 'La Liga', country: 'Spain', flag: '🇪🇸', season: '2026/27', totalTeams: 20 },
  { id: 'SA', name: 'Serie A', country: 'Italy', flag: '🇮🇹', season: '2026/27', totalTeams: 20 },
  { id: 'BL', name: 'Bundesliga', country: 'Germany', flag: '🇩🇪', season: '2026/27', totalTeams: 18 },
  { id: 'L1', name: 'Ligue 1', country: 'France', flag: '🇫🇷', season: '2026/27', totalTeams: 18 },
  { id: 'UCL', name: 'UEFA Champions League', country: 'Europe', flag: '🇪🇺', season: '2026/27', totalTeams: 36 }
];

export const TEAMS: Record<string, Team> = {
  // Premier League
  ARS: { id: 'ARS', name: 'Arsenal', shortName: 'ARS', logo: '🔴⚪', leagueId: 'PL', stadium: 'Emirates Stadium' },
  MCI: { id: 'MCI', name: 'Manchester City', shortName: 'MCI', logo: '🩵', leagueId: 'PL', stadium: 'Etihad Stadium' },
  LIV: { id: 'LIV', name: 'Liverpool', shortName: 'LIV', logo: '🔴', leagueId: 'PL', stadium: 'Anfield' },
  CHE: { id: 'CHE', name: 'Chelsea', shortName: 'CHE', logo: '🔵', leagueId: 'PL', stadium: 'Stamford Bridge' },
  MUN: { id: 'MUN', name: 'Manchester United', shortName: 'MUN', logo: '👹', leagueId: 'PL', stadium: 'Old Trafford' },
  TOT: { id: 'TOT', name: 'Tottenham Hotspur', shortName: 'TOT', logo: '⚪', leagueId: 'PL', stadium: 'Tottenham Hotspur Stadium' },

  // La Liga
  RMA: { id: 'RMA', name: 'Real Madrid', shortName: 'RMA', logo: '👑', leagueId: 'LL', stadium: 'Santiago Bernabéu' },
  BAR: { id: 'BAR', name: 'FC Barcelona', shortName: 'BAR', logo: '🔵🔴', leagueId: 'LL', stadium: 'Spotify Camp Nou' },
  ATM: { id: 'ATM', name: 'Atlético Madrid', shortName: 'ATM', logo: '🔴⚪', leagueId: 'LL', stadium: 'Cívitas Metropolitano' },
  GIR: { id: 'GIR', name: 'Girona FC', shortName: 'GIR', logo: '🔴⚪', leagueId: 'LL', stadium: 'Montilivi' },

  // Serie A
  INT: { id: 'INT', name: 'Inter Milan', shortName: 'INT', logo: '🔵⚫', leagueId: 'SA', stadium: 'San Siro' },
  JUV: { id: 'JUV', name: 'Juventus', shortName: 'JUV', logo: '⚪⚫', leagueId: 'SA', stadium: 'Allianz Stadium' },
  ACM: { id: 'ACM', name: 'AC Milan', shortName: 'ACM', logo: '🔴⚫', leagueId: 'SA', stadium: 'San Siro' },
  NAP: { id: 'NAP', name: 'SSC Napoli', shortName: 'NAP', logo: '🔵', leagueId: 'SA', stadium: 'Diego Armando Maradona' },

  // Bundesliga
  BAY: { id: 'BAY', name: 'Bayern München', shortName: 'BAY', logo: '🔴', leagueId: 'BL', stadium: 'Allianz Arena' },
  BVB: { id: 'BVB', name: 'Borussia Dortmund', shortName: 'BVB', logo: '🟡⚫', leagueId: 'BL', stadium: 'Signal Iduna Park' },
  LEV: { id: 'LEV', name: 'Bayer Leverkusen', shortName: 'LEV', logo: '🔴⚫', leagueId: 'BL', stadium: 'BayArena' },
  RBL: { id: 'RBL', name: 'RB Leipzig', shortName: 'RBL', logo: '⚪🔴', leagueId: 'BL', stadium: 'Red Bull Arena' },

  // Ligue 1
  PSG: { id: 'PSG', name: 'Paris Saint-Germain', shortName: 'PSG', logo: '🔵🔴', leagueId: 'L1', stadium: 'Parc des Princes' },
  ASM: { id: 'ASM', name: 'AS Monaco', shortName: 'ASM', logo: '🔴⚪', leagueId: 'L1', stadium: 'Stade Louis II' },
  OM:  { id: 'OM',  name: 'Olympique de Marseille', shortName: 'OM', logo: '⚪🔵', leagueId: 'L1', stadium: 'Orange Vélodrome' },
  LOSC:{ id: 'LOSC',name: 'LOSC Lille', shortName: 'LOSC', logo: '🔴⚪', leagueId: 'L1', stadium: 'Decathlon Arena' }
};

export const STANDINGS_DATA: Record<string, StandingItem[]> = {
  PL: [
    { rank: 1, team: TEAMS.ARS, played: 5, won: 4, drawn: 1, lost: 0, goalsFor: 12, goalsAgainst: 3, goalDifference: 9, points: 13, form: ['W', 'W', 'W', 'D', 'W'] },
    { rank: 2, team: TEAMS.MCI, played: 5, won: 4, drawn: 0, lost: 1, goalsFor: 14, goalsAgainst: 5, goalDifference: 9, points: 12, form: ['W', 'L', 'W', 'W', 'W'] },
    { rank: 3, team: TEAMS.LIV, played: 5, won: 3, drawn: 1, lost: 1, goalsFor: 10, goalsAgainst: 6, goalDifference: 4, points: 10, form: ['W', 'D', 'W', 'L', 'W'] },
    { rank: 4, team: TEAMS.CHE, played: 5, won: 3, drawn: 0, lost: 2, goalsFor: 9, goalsAgainst: 7, goalDifference: 2, points: 9, form: ['L', 'W', 'W', 'L', 'W'] },
    { rank: 5, team: TEAMS.TOT, played: 5, won: 2, drawn: 1, lost: 2, goalsFor: 8, goalsAgainst: 8, goalDifference: 0, points: 7, form: ['D', 'W', 'L', 'W', 'L'] },
    { rank: 6, team: TEAMS.MUN, played: 5, won: 2, drawn: 0, lost: 3, goalsFor: 6, goalsAgainst: 10, goalDifference: -4, points: 6, form: ['L', 'W', 'L', 'L', 'W'] }
  ],
  LL: [
    { rank: 1, team: TEAMS.RMA, played: 5, won: 5, drawn: 0, lost: 0, goalsFor: 15, goalsAgainst: 2, goalDifference: 13, points: 15, form: ['W', 'W', 'W', 'W', 'W'] },
    { rank: 2, team: TEAMS.BAR, played: 5, won: 4, drawn: 0, lost: 1, goalsFor: 13, goalsAgainst: 4, goalDifference: 9, points: 12, form: ['W', 'W', 'W', 'L', 'W'] },
    { rank: 3, team: TEAMS.ATM, played: 5, won: 3, drawn: 2, lost: 0, goalsFor: 8, goalsAgainst: 3, goalDifference: 5, points: 11, form: ['W', 'D', 'W', 'D', 'W'] },
    { rank: 4, team: TEAMS.GIR, played: 5, won: 2, drawn: 1, lost: 2, goalsFor: 7, goalsAgainst: 8, goalDifference: -1, points: 7, form: ['D', 'L', 'W', 'W', 'L'] }
  ],
  SA: [
    { rank: 1, team: TEAMS.INT, played: 5, won: 4, drawn: 1, lost: 0, goalsFor: 11, goalsAgainst: 2, goalDifference: 9, points: 13, form: ['W', 'W', 'D', 'W', 'W'] },
    { rank: 2, team: TEAMS.JUV, played: 5, won: 3, drawn: 2, lost: 0, goalsFor: 9, goalsAgainst: 3, goalDifference: 6, points: 11, form: ['W', 'D', 'W', 'D', 'W'] },
    { rank: 3, team: TEAMS.NAP, played: 5, won: 3, drawn: 1, lost: 1, goalsFor: 8, goalsAgainst: 5, goalDifference: 3, points: 10, form: ['L', 'W', 'W', 'D', 'W'] },
    { rank: 4, team: TEAMS.ACM, played: 5, won: 2, drawn: 2, lost: 1, goalsFor: 7, goalsAgainst: 6, goalDifference: 1, points: 8, form: ['D', 'W', 'D', 'L', 'W'] }
  ],
  BL: [
    { rank: 1, team: TEAMS.BAY, played: 4, won: 4, drawn: 0, lost: 0, goalsFor: 16, goalsAgainst: 3, goalDifference: 13, points: 12, form: ['W', 'W', 'W', 'W'] },
    { rank: 2, team: TEAMS.LEV, played: 4, won: 3, drawn: 1, lost: 0, goalsFor: 11, goalsAgainst: 5, goalDifference: 6, points: 10, form: ['W', 'W', 'D', 'W'] },
    { rank: 3, team: TEAMS.BVB, played: 4, won: 2, drawn: 1, lost: 1, goalsFor: 8, goalsAgainst: 6, goalDifference: 2, points: 7, form: ['W', 'D', 'L', 'W'] },
    { rank: 4, team: TEAMS.RBL, played: 4, won: 2, drawn: 0, lost: 2, goalsFor: 7, goalsAgainst: 7, goalDifference: 0, points: 6, form: ['L', 'W', 'L', 'W'] }
  ],
  L1: [
    { rank: 1, team: TEAMS.PSG, played: 5, won: 4, drawn: 1, lost: 0, goalsFor: 14, goalsAgainst: 4, goalDifference: 10, points: 13, form: ['W', 'W', 'W', 'D', 'W'] },
    { rank: 2, team: TEAMS.ASM, played: 5, won: 3, drawn: 1, lost: 1, goalsFor: 10, goalsAgainst: 6, goalDifference: 4, points: 10, form: ['W', 'L', 'W', 'D', 'W'] },
    { rank: 3, team: TEAMS.OM,  played: 5, won: 3, drawn: 0, lost: 2, goalsFor: 9, goalsAgainst: 7, goalDifference: 2, points: 9, form: ['L', 'W', 'W', 'L', 'W'] },
    { rank: 4, team: TEAMS.LOSC,played: 5, won: 2, drawn: 2, lost: 1, goalsFor: 6, goalsAgainst: 5, goalDifference: 1, points: 8, form: ['D', 'W', 'D', 'L', 'W'] }
  ],
  UCL: [
    { rank: 1, team: TEAMS.RMA, played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 1, goalDifference: 5, points: 6, form: ['W', 'W'] },
    { rank: 2, team: TEAMS.BAY, played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 5, goalsAgainst: 1, goalDifference: 4, points: 6, form: ['W', 'W'] },
    { rank: 3, team: TEAMS.MCI, played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 4, goalsAgainst: 1, goalDifference: 3, points: 4, form: ['W', 'D'] },
    { rank: 4, team: TEAMS.ARS, played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 3, goalsAgainst: 0, goalDifference: 3, points: 4, form: ['D', 'W'] }
  ]
};

export const MATCHES: Match[] = [
  // LIVE MATCH 1 (Premier League)
  {
    id: 'm-live-1',
    leagueId: 'PL',
    season: '2026/27',
    round: 'Matchday 5',
    date: '2026-08-30T18:00:00Z',
    status: 'LIVE',
    elapsedTime: 68,
    homeTeam: TEAMS.ARS,
    awayTeam: TEAMS.MCI,
    homeScore: 2,
    awayScore: 1,
    venue: 'Emirates Stadium, London',
    referee: 'Anthony Taylor',
    events: [
      { id: 'e1', time: 14, type: 'goal', teamId: 'ARS', player: 'Bukayo Saka', assistPlayer: 'Martin Ødegaard' },
      { id: 'e2', time: 32, type: 'goal', teamId: 'MCI', player: 'Erling Haaland', assistPlayer: 'Kevin De Bruyne' },
      { id: 'e3', time: 41, type: 'yellow_card', teamId: 'MCI', player: 'Rodri' },
      { id: 'e4', time: 55, type: 'goal', teamId: 'ARS', player: 'Kai Havertz', assistPlayer: 'Declan Rice' },
      { id: 'e5', time: 62, type: 'yellow_card', teamId: 'ARS', player: 'William Saliba' }
    ],
    stats: {
      home: { possession: 52, shots: 12, shotsOnTarget: 6, corners: 7, fouls: 9, offsides: 2, yellowCards: 1, redCards: 0, saves: 3 },
      away: { possession: 48, shots: 9, shotsOnTarget: 4, corners: 4, fouls: 11, offsides: 1, yellowCards: 1, redCards: 0, saves: 4 }
    },
    lineups: {
      home: {
        formation: '4-3-3',
        starters: [
          { id: 'p1', name: 'David Raya', number: 22, position: 'GK', isStarter: true },
          { id: 'p2', name: 'Ben White', number: 4, position: 'DEF', isStarter: true },
          { id: 'p3', name: 'William Saliba', number: 2, position: 'DEF', isStarter: true },
          { id: 'p4', name: 'Gabriel Magalhães', number: 6, position: 'DEF', isStarter: true },
          { id: 'p5', name: 'Jurriën Timber', number: 12, position: 'DEF', isStarter: true },
          { id: 'p6', name: 'Declan Rice', number: 41, position: 'MID', isStarter: true },
          { id: 'p7', name: 'Thomas Partey', number: 5, position: 'MID', isStarter: true },
          { id: 'p8', name: 'Martin Ødegaard', number: 8, position: 'MID', isStarter: true },
          { id: 'p9', name: 'Bukayo Saka', number: 7, position: 'FWD', isStarter: true },
          { id: 'p10', name: 'Kai Havertz', number: 29, position: 'FWD', isStarter: true },
          { id: 'p11', name: 'Gabriel Martinelli', number: 11, position: 'FWD', isStarter: true }
        ],
        substitutes: [
          { id: 'p12', name: 'Neto', number: 32, position: 'GK', isStarter: false },
          { id: 'p13', name: 'Leandro Trossard', number: 19, position: 'FWD', isStarter: false },
          { id: 'p14', name: 'Gabriel Jesus', number: 9, position: 'FWD', isStarter: false }
        ]
      },
      away: {
        formation: '4-2-3-1',
        starters: [
          { id: 'ap1', name: 'Ederson', number: 31, position: 'GK', isStarter: true },
          { id: 'ap2', name: 'Kyle Walker', number: 2, position: 'DEF', isStarter: true },
          { id: 'ap3', name: 'Rúben Dias', number: 3, position: 'DEF', isStarter: true },
          { id: 'ap4', name: 'Manuel Akanji', number: 25, position: 'DEF', isStarter: true },
          { id: 'ap5', name: 'Josko Gvardiol', number: 24, position: 'DEF', isStarter: true },
          { id: 'ap6', name: 'Rodri', number: 16, position: 'MID', isStarter: true },
          { id: 'ap7', name: 'Mateo Kovacic', number: 8, position: 'MID', isStarter: true },
          { id: 'ap8', name: 'Bernardo Silva', number: 20, position: 'MID', isStarter: true },
          { id: 'ap9', name: 'Kevin De Bruyne', number: 17, position: 'MID', isStarter: true },
          { id: 'ap10', name: 'Phil Foden', number: 47, position: 'FWD', isStarter: true },
          { id: 'ap11', name: 'Erling Haaland', number: 9, position: 'FWD', isStarter: true }
        ],
        substitutes: [
          { id: 'ap12', name: 'Stefan Ortega', number: 18, position: 'GK', isStarter: false },
          { id: 'ap13', name: 'Jérémy Doku', number: 11, position: 'FWD', isStarter: false },
          { id: 'ap14', name: 'Jack Grealish', number: 10, position: 'FWD', isStarter: false }
        ]
      }
    },
    odds: {
      bookmaker: 'Bet365',
      timestamp: '2026-08-30T17:50:00Z',
      homeWin: 2.35,
      draw: 3.40,
      awayWin: 3.00,
      handicapLine: -0.25,
      homeHandicapOdds: 1.95,
      awayHandicapOdds: 1.85,
      overUnderLine: 2.75,
      overOdds: 1.90,
      underOdds: 1.90
    },
    oddsHistory: [
      { timestamp: '12h ago', homeWin: 2.50, draw: 3.30, awayWin: 2.80, handicapLine: 0.00 },
      { timestamp: '6h ago', homeWin: 2.40, draw: 3.35, awayWin: 2.90, handicapLine: -0.25 },
      { timestamp: 'Kickoff', homeWin: 2.35, draw: 3.40, awayWin: 3.00, handicapLine: -0.25 }
    ]
  },

  // FINISHED MATCH (Premier League)
  {
    id: 'm-fin-1',
    leagueId: 'PL',
    season: '2026/27',
    round: 'Matchday 4',
    date: '2026-08-23T16:30:00Z',
    status: 'FINISHED',
    homeTeam: TEAMS.LIV,
    awayTeam: TEAMS.CHE,
    homeScore: 3,
    awayScore: 1,
    venue: 'Anfield, Liverpool',
    referee: 'Michael Oliver',
    events: [
      { id: 'fe1', time: 18, type: 'goal', teamId: 'LIV', player: 'Mohamed Salah' },
      { id: 'fe2', time: 40, type: 'goal', teamId: 'CHE', player: 'Cole Palmer' },
      { id: 'fe3', time: 54, type: 'goal', teamId: 'LIV', player: 'Darwin Núñez' },
      { id: 'fe4', time: 82, type: 'goal', teamId: 'LIV', player: 'Cody Gakpo' }
    ],
    stats: {
      home: { possession: 56, shots: 16, shotsOnTarget: 8, corners: 8, fouls: 8, offsides: 3, yellowCards: 2, redCards: 0, saves: 3 },
      away: { possession: 44, shots: 8, shotsOnTarget: 4, corners: 3, fouls: 14, offsides: 1, yellowCards: 3, redCards: 0, saves: 5 }
    },
    odds: {
      bookmaker: 'Bet365',
      timestamp: '2026-08-23T16:00:00Z',
      homeWin: 1.85,
      draw: 3.60,
      awayWin: 4.20,
      handicapLine: -0.75,
      homeHandicapOdds: 1.90,
      awayHandicapOdds: 1.90,
      overUnderLine: 2.75,
      overOdds: 1.85,
      underOdds: 1.95
    }
  },

  // FINISHED MATCH (La Liga)
  {
    id: 'm-fin-2',
    leagueId: 'LL',
    season: '2026/27',
    round: 'Matchday 5',
    date: '2026-08-29T20:00:00Z',
    status: 'FINISHED',
    homeTeam: TEAMS.RMA,
    awayTeam: TEAMS.ATM,
    homeScore: 2,
    awayScore: 0,
    venue: 'Santiago Bernabéu, Madrid',
    referee: 'Gil Manzano',
    events: [
      { id: 'la1', time: 28, type: 'goal', teamId: 'RMA', player: 'Kylian Mbappé' },
      { id: 'la2', time: 76, type: 'goal', teamId: 'RMA', player: 'Jude Bellingham' }
    ],
    stats: {
      home: { possession: 60, shots: 14, shotsOnTarget: 7, corners: 6, fouls: 10, offsides: 2, yellowCards: 1, redCards: 0, saves: 2 },
      away: { possession: 40, shots: 6, shotsOnTarget: 2, corners: 2, fouls: 15, offsides: 4, yellowCards: 4, redCards: 0, saves: 5 }
    },
    odds: {
      bookmaker: 'Pinnacle',
      timestamp: '2026-08-29T19:30:00Z',
      homeWin: 1.70,
      draw: 3.80,
      awayWin: 4.90,
      handicapLine: -0.75,
      homeHandicapOdds: 1.92,
      awayHandicapOdds: 1.88,
      overUnderLine: 2.50,
      overOdds: 1.80,
      underOdds: 2.00
    }
  },

  // FINISHED MATCH (Serie A)
  {
    id: 'm-fin-3',
    leagueId: 'SA',
    season: '2026/27',
    round: 'Matchday 5',
    date: '2026-08-29T18:00:00Z',
    status: 'FINISHED',
    homeTeam: TEAMS.INT,
    awayTeam: TEAMS.ACM,
    homeScore: 2,
    awayScore: 1,
    venue: 'San Siro, Milan',
    referee: 'Daniele Orsato',
    events: [
      { id: 'sa1', time: 12, type: 'goal', teamId: 'INT', player: 'Lautaro Martínez' },
      { id: 'sa2', time: 50, type: 'goal', teamId: 'ACM', player: 'Rafael Leão' },
      { id: 'sa3', time: 88, type: 'goal', teamId: 'INT', player: 'Marcus Thuram' }
    ],
    stats: {
      home: { possession: 54, shots: 13, shotsOnTarget: 5, corners: 5, fouls: 12, offsides: 1, yellowCards: 2, redCards: 0, saves: 3 },
      away: { possession: 46, shots: 10, shotsOnTarget: 4, corners: 4, fouls: 14, offsides: 2, yellowCards: 3, redCards: 0, saves: 3 }
    },
    odds: {
      bookmaker: 'Bet365',
      timestamp: '2026-08-29T17:30:00Z',
      homeWin: 2.10,
      draw: 3.30,
      awayWin: 3.60,
      handicapLine: -0.25,
      homeHandicapOdds: 1.85,
      awayHandicapOdds: 1.95,
      overUnderLine: 2.50,
      overOdds: 1.95,
      underOdds: 1.85
    }
  },

  // FINISHED MATCH (Bundesliga)
  {
    id: 'm-fin-4',
    leagueId: 'BL',
    season: '2026/27',
    round: 'Matchday 4',
    date: '2026-08-28T19:30:00Z',
    status: 'FINISHED',
    homeTeam: TEAMS.BAY,
    awayTeam: TEAMS.BVB,
    homeScore: 4,
    awayScore: 1,
    venue: 'Allianz Arena, München',
    referee: 'Felix Zwayer',
    events: [
      { id: 'bl1', time: 8, type: 'goal', teamId: 'BAY', player: 'Harry Kane' },
      { id: 'bl2', time: 24, type: 'goal', teamId: 'BAY', player: 'Jamal Musiala' },
      { id: 'bl3', time: 58, type: 'goal', teamId: 'BVB', player: 'Julian Brandt' },
      { id: 'bl4', time: 71, type: 'goal', teamId: 'BAY', player: 'Harry Kane' },
      { id: 'bl5', time: 85, type: 'goal', teamId: 'BAY', player: 'Leroy Sané' }
    ],
    stats: {
      home: { possession: 64, shots: 21, shotsOnTarget: 11, corners: 9, fouls: 7, offsides: 1, yellowCards: 1, redCards: 0, saves: 2 },
      away: { possession: 36, shots: 6, shotsOnTarget: 3, corners: 2, fouls: 11, offsides: 3, yellowCards: 2, redCards: 0, saves: 7 }
    },
    odds: {
      bookmaker: 'Bet365',
      timestamp: '2026-08-28T19:00:00Z',
      homeWin: 1.50,
      draw: 4.50,
      awayWin: 5.50,
      handicapLine: -1.25,
      homeHandicapOdds: 1.95,
      awayHandicapOdds: 1.85,
      overUnderLine: 3.50,
      overOdds: 1.90,
      underOdds: 1.90
    }
  },

  // UPCOMING MATCH (UEFA Champions League)
  {
    id: 'm-up-1',
    leagueId: 'UCL',
    season: '2026/27',
    round: 'Group Stage - Matchday 3',
    date: '2026-09-15T19:00:00Z',
    status: 'UPCOMING',
    homeTeam: TEAMS.RMA,
    awayTeam: TEAMS.MCI,
    homeScore: null,
    awayScore: null,
    venue: 'Santiago Bernabéu, Madrid',
    referee: 'Szymon Marciniak',
    events: [],
    odds: {
      bookmaker: 'Unibet',
      timestamp: '2026-08-30T10:00:00Z',
      homeWin: 2.45,
      draw: 3.50,
      awayWin: 2.75,
      handicapLine: -0.25,
      homeHandicapOdds: 2.05,
      awayHandicapOdds: 1.75,
      overUnderLine: 2.75,
      overOdds: 1.80,
      underOdds: 2.00
    }
  }
];

export const MOCK_ETL_LOGS: ETLRunLog[] = [
  {
    id: 'run-104',
    timestamp: '2026-08-30T18:15:00Z',
    trigger: 'Schedule (15m)',
    requestsUsed: 94,
    requestsRemaining: 6,
    activeLiveMatches: 1,
    status: 'Quota Warning',
    details: 'Smart Polling prioritized 1 LIVE match (ARS vs MCI). Batched request skipped UPCOMING polling to conserve remaining quota (6 left).'
  },
  {
    id: 'run-103',
    timestamp: '2026-08-30T18:00:00Z',
    trigger: 'Schedule (15m)',
    requestsUsed: 88,
    requestsRemaining: 12,
    activeLiveMatches: 1,
    status: 'Success',
    details: 'Fetched live events, lineups and statistics for fixture ID m-live-1 in 1 batch request.'
  },
  {
    id: 'run-102',
    timestamp: '2026-08-30T17:45:00Z',
    trigger: 'Schedule (15m)',
    requestsUsed: 75,
    requestsRemaining: 25,
    activeLiveMatches: 0,
    status: 'Success',
    details: 'Smart Polling skipped API requests as no matches were live during this window.'
  },
  {
    id: 'run-101',
    timestamp: '2026-08-30T12:00:00Z',
    trigger: 'Manual',
    requestsUsed: 42,
    requestsRemaining: 58,
    activeLiveMatches: 0,
    status: 'Success',
    details: 'Daily standings and fixture metadata ingestion complete across 6 leagues.'
  }
];
