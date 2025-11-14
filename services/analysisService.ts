import { Match, StrategyStats, StrategyDetails, LeaguePerformance, MatchInstance, ReverseStrategyStats } from '../types';

export const parseCSV = (csvText: string): Match[] => {
    const rows = csvText.replace(/\r/g, '').split('\n').filter(row => row.trim() !== '');
    if (rows.length < 2) {
        throw new Error("Arquivo CSV inválido. Deve conter um cabeçalho e pelo menos uma linha de dados.");
    }
    
    const header = rows[0].split(',').map(h => h.trim());
    
    const columnMapping = {
        league: 'LIGA',
        homeTeam: 'EQUIPA CASA',
        awayTeam: 'EQUIPA VISITANTE',
        htHomeGoals: 'RESULTADO HT CASA',
        htAwayGoals: 'RESULTADO HT FORA',
        ftHomeGoals: 'RESULTADO FT CASA',
        ftAwayGoals: 'RESULTADO FT FORA'
    };

    const indices = {
        league: header.indexOf(columnMapping.league),
        homeTeam: header.indexOf(columnMapping.homeTeam),
        awayTeam: header.indexOf(columnMapping.awayTeam),
        htHomeGoals: header.indexOf(columnMapping.htHomeGoals),
        htAwayGoals: header.indexOf(columnMapping.htAwayGoals),
        ftHomeGoals: header.indexOf(columnMapping.ftHomeGoals),
        ftAwayGoals: header.indexOf(columnMapping.ftAwayGoals)
    };

    const missingHeaders = Object.entries(indices)
      .filter(([, index]) => index === -1)
      .map(([key]) => columnMapping[key as keyof typeof columnMapping]);

    if (missingHeaders.length > 0) {
        throw new Error(`Cabeçalho do CSV inválido. Faltando colunas: ${missingHeaders.join(', ')}. As colunas necessárias são: ${Object.values(columnMapping).join(', ')}`);
    }

    const matches: Match[] = [];
    for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',');
        if (values.length < Object.keys(indices).length) continue;

        const htHomeGoals = parseInt(values[indices.htHomeGoals], 10);
        const htAwayGoals = parseInt(values[indices.htAwayGoals], 10);
        const ftHomeGoals = parseInt(values[indices.ftHomeGoals], 10);
        const ftAwayGoals = parseInt(values[indices.ftAwayGoals], 10);

        if ([htHomeGoals, htAwayGoals, ftHomeGoals, ftAwayGoals].some(isNaN)) {
           continue; 
        }

        matches.push({
            id: i,
            league: values[indices.league] || 'N/A',
            homeTeam: values[indices.homeTeam],
            awayTeam: values[indices.awayTeam],
            htHomeGoals,
            htAwayGoals,
            ftHomeGoals,
            ftAwayGoals
        });
    }
    return matches;
};

type StrategyLogic = {
    description: string;
    preCondition: (match: Match) => boolean;
    successCondition: (match: Match) => boolean;
    isConditional: boolean;
};

const STRATEGY_LOGICS: Record<string, StrategyLogic> = {
    // Basic FT results
    'Back Casa (FT)': { description: 'Apostar na vitória do time da casa no final do jogo.', preCondition: () => true, successCondition: m => m.ftHomeGoals > m.ftAwayGoals, isConditional: false },
    'Back Empate (FT)': { description: 'Apostar no empate no final do jogo.', preCondition: () => true, successCondition: m => m.ftHomeGoals === m.ftAwayGoals, isConditional: false },
    'Back Visitante (FT)': { description: 'Apostar na vitória do time visitante no final do jogo.', preCondition: () => true, successCondition: m => m.ftHomeGoals < m.ftAwayGoals, isConditional: false },
    
    // Basic HT results
    'Back Casa (HT)': { description: 'Apostar na vitória do time da casa no intervalo.', preCondition: () => true, successCondition: m => m.htHomeGoals > m.htAwayGoals, isConditional: false },
    'Back Empate (HT)': { description: 'Apostar no empate no intervalo.', preCondition: () => true, successCondition: m => m.htHomeGoals === m.htAwayGoals, isConditional: false },
    'Back Visitante (HT)': { description: 'Apostar na vitória do time visitante no intervalo.', preCondition: () => true, successCondition: m => m.htHomeGoals < m.htAwayGoals, isConditional: false },
    
    // Goal markets
    'Over 0.5 HT': { description: 'Pelo menos 1 gol marcado no primeiro tempo.', preCondition: () => true, successCondition: m => (m.htHomeGoals + m.htAwayGoals) > 0, isConditional: false },
    'Over 1.5 FT': { description: 'Pelo menos 2 gols marcados no jogo todo.', preCondition: () => true, successCondition: m => (m.ftHomeGoals + m.ftAwayGoals) > 1, isConditional: false },
    'Over 2.5 FT': { description: 'Pelo menos 3 gols marcados no jogo todo.', preCondition: () => true, successCondition: m => (m.ftHomeGoals + m.ftAwayGoals) > 2, isConditional: false },
    'Under 2.5 FT': { description: 'Menos de 3 gols marcados no jogo todo.', preCondition: () => true, successCondition: m => (m.ftHomeGoals + m.ftAwayGoals) < 3, isConditional: false },
    'Ambas Marcam (BTTS)': { description: 'Ambos os times marcam pelo menos um gol no jogo.', preCondition: () => true, successCondition: m => m.ftHomeGoals > 0 && m.ftAwayGoals > 0, isConditional: false },
    'Over 0.5 ST': { description: 'Pelo menos 1 gol marcado no segundo tempo.', preCondition: () => true, successCondition: m => (m.ftHomeGoals + m.ftAwayGoals) > (m.htHomeGoals + m.htAwayGoals), isConditional: false },

    // HT/FT combinations
    'Casa Vence ao Intervalo e Vence no Final': { description: 'Time da casa está ganhando no HT e vence a partida.', preCondition: m => m.htHomeGoals > m.htAwayGoals, successCondition: m => m.ftHomeGoals > m.ftAwayGoals, isConditional: true },
    'Visitante Vence ao Intervalo e Vence no Final': { description: 'Visitante está ganhando no HT e vence a partida.', preCondition: m => m.htHomeGoals < m.htAwayGoals, successCondition: m => m.ftHomeGoals < m.ftAwayGoals, isConditional: true },
    'Empate no Intervalo e Casa Vence no Final': { description: 'Jogo empatado no HT e o time da casa vence.', preCondition: m => m.htHomeGoals === m.htAwayGoals, successCondition: m => m.ftHomeGoals > m.ftAwayGoals, isConditional: true },
    'Empate no Intervalo e Visitante Vence no Final': { description: 'Jogo empatado no HT e o time visitante vence.', preCondition: m => m.htHomeGoals === m.htAwayGoals, successCondition: m => m.ftHomeGoals < m.ftAwayGoals, isConditional: true },
    'Empate HT / Empate FT': { description: 'Jogo empatado no HT e termina empatado no final.', preCondition: m => m.htHomeGoals === m.htAwayGoals, successCondition: m => m.ftHomeGoals === m.ftAwayGoals, isConditional: true },
    'Manutenção do Placar do HT no FT': { description: 'O placar final do jogo é exatamente o mesmo do intervalo.', preCondition: () => true, successCondition: m => m.ftHomeGoals === m.htHomeGoals && m.ftAwayGoals === m.htAwayGoals, isConditional: false },

    // Conditional scenarios based on HT score
    'Casa Vence (FT) após 1-0 (HT)': { description: 'Time da casa está ganhando por 1-0 no HT e vence a partida.', preCondition: m => m.htHomeGoals === 1 && m.htAwayGoals === 0, successCondition: m => m.ftHomeGoals > m.ftAwayGoals, isConditional: true },
    'Visitante Vence (FT) após 0-1 (HT)': { description: 'Time visitante está ganhando por 0-1 no HT e vence a partida.', preCondition: m => m.htHomeGoals === 0 && m.htAwayGoals === 1, successCondition: m => m.ftHomeGoals < m.ftAwayGoals, isConditional: true },
    'Casa Vence (FT) após 2-0 (HT)': { description: 'Time da casa está ganhando por 2-0 no HT e vence a partida.', preCondition: m => m.htHomeGoals === 2 && m.htAwayGoals === 0, successCondition: m => m.ftHomeGoals > m.ftAwayGoals, isConditional: true },
    'Visitante Vence (FT) após 0-2 (HT)': { description: 'Time visitante está ganhando por 0-2 no HT e vence a partida.', preCondition: m => m.htHomeGoals === 0 && m.htAwayGoals === 2, successCondition: m => m.ftHomeGoals < m.ftAwayGoals, isConditional: true },
    'Visitante Vence no HT por 1 gol e Vence no Final': { description: 'Visitante está ganhando no HT por 1 gol de diferença e vence a partida.', preCondition: m => m.htAwayGoals - m.htHomeGoals === 1, successCondition: m => m.ftHomeGoals < m.ftAwayGoals, isConditional: true },
};

const calculateStats = (matches: Match[], logic: StrategyLogic, totalMatches: number): StrategyStats => {
    const applicableMatches = logic.isConditional ? matches.filter(logic.preCondition) : matches;
    const successes = applicableMatches.filter(logic.successCondition).length;
    const occurrences = logic.isConditional ? applicableMatches.length : totalMatches;
    const successRate = occurrences > 0 ? parseFloat(((successes / occurrences) * 100).toFixed(2)) : 0;
    const breakEvenOdd = successRate > 0 ? 100 / successRate : Infinity;
    
    return {
        name: '', // Will be filled in by the caller
        description: logic.description,
        occurrences,
        successes,
        successRate,
        breakEvenOdd,
    };
}

export const analyzeData = (matches: Match[]): StrategyStats[] => {
    const totalMatches = matches.length;
    if (totalMatches === 0) return [];

    const results = Object.entries(STRATEGY_LOGICS).map(([name, logic]) => {
        const stats = calculateStats(matches, logic, totalMatches);
        return { ...stats, name };
    });

    return results.sort((a, b) => b.successRate - a.successRate);
};


export const getStrategyDetails = (matches: Match[], strategyName: string): StrategyDetails | null => {
    const logic = STRATEGY_LOGICS[strategyName];
    if (!logic) return null;

    const totalMatches = matches.length;
    const stats = { ...calculateStats(matches, logic, totalMatches), name: strategyName };
    const breakEvenOdd = stats.successRate > 0 ? 100 / stats.successRate : Infinity;

    const applicableMatches = matches.filter(logic.preCondition);

    const matchInstances: MatchInstance[] = applicableMatches.map(match => ({
        match,
        isSuccess: logic.successCondition(match),
    }));

    const leagueGroups = applicableMatches.reduce((acc, match) => {
        acc[match.league] = acc[match.league] || [];
        acc[match.league].push(match);
        return acc;
    }, {} as Record<string, Match[]>);

    const leaguePerformances: LeaguePerformance[] = Object.entries(leagueGroups).map(([league, leagueMatches]) => {
        const successes = leagueMatches.filter(logic.successCondition).length;
        const occurrences = leagueMatches.length;
        return {
            league,
            occurrences,
            successes,
            successRate: occurrences > 0 ? parseFloat(((successes / occurrences) * 100).toFixed(2)) : 0,
        };
    }).sort((a, b) => b.successRate - a.successRate);

    return {
        stats,
        breakEvenOdd,
        leaguePerformances,
        matchInstances,
    };
};

export const getReverseStrategyDetails = (matches: Match[], strategyName: string): ReverseStrategyStats | null => {
    const originalLogic = STRATEGY_LOGICS[strategyName];
    if (!originalLogic) return null;

    const reverseLogic: StrategyLogic = {
        ...originalLogic,
        successCondition: (match) => !originalLogic.successCondition(match),
    };
    
    const reverseName = `Inverso de: ${strategyName}`;
    const reverseDescription = `Análise da falha da estratégia '${strategyName}'.`;

    const stats = calculateStats(matches, reverseLogic, matches.length);
    const breakEvenOdd = stats.successRate > 0 ? 100 / stats.successRate : Infinity;
    
    return {
        name: reverseName,
        description: reverseDescription,
        stats: { ...stats, name: reverseName, description: reverseDescription },
        breakEvenOdd,
    };
};