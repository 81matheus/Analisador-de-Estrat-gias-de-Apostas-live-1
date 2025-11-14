export interface Match {
    id: number;
    league: string;
    homeTeam: string;
    awayTeam: string;
    htHomeGoals: number;
    htAwayGoals: number;
    ftHomeGoals: number;
    ftAwayGoals: number;
}

export interface StrategyStats {
    name: string;
    description: string;
    occurrences: number;
    successes: number;
    successRate: number;
    breakEvenOdd: number;
}

export interface LeaguePerformance {
    league: string;
    occurrences: number;
    successes: number;
    successRate: number;
}

export interface MatchInstance {
    match: Match;
    isSuccess: boolean;
}

export interface StrategyDetails {
    stats: StrategyStats;
    breakEvenOdd: number;
    leaguePerformances: LeaguePerformance[];
    matchInstances: MatchInstance[];
}

export interface ReverseStrategyStats {
    name: string;
    description: string;
    stats: StrategyStats;
    breakEvenOdd: number;
}