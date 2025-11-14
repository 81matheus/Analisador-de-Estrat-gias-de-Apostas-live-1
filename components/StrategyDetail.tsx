
import React, { useMemo, useState } from 'react';
import { Match, StrategyStats } from '../types';
import { getStrategyDetails } from '../services/analysisService';
import { ArrowLeft, BarChart, FileText, Repeat } from 'lucide-react';
import ReverseAnalysisModal from './ReverseAnalysisModal';

interface StrategyDetailProps {
    strategy: StrategyStats;
    matches: Match[];
    onBack: () => void;
}

const getBarColor = (rate: number): string => {
    if (rate >= 60) return 'bg-green-500';
    if (rate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
};

const StrategyDetail: React.FC<StrategyDetailProps> = ({ strategy, matches, onBack }) => {
    const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);

    const details = useMemo(() => {
        return getStrategyDetails(matches, strategy.name);
    }, [matches, strategy.name]);

    if (!details) {
        return (
            <div className="text-center text-red-400">
                <p>Ocorreu um erro ao carregar os detalhes da estratégia.</p>
                <button onClick={onBack} className="mt-4 text-brand-primary hover:underline">Voltar ao Painel</button>
            </div>
        );
    }
    
    const { stats, breakEvenOdd, leaguePerformances, matchInstances } = details;

    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="flex items-center text-brand-primary hover:text-brand-light mb-6 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar ao Painel
            </button>

            <div className="bg-gray-800 rounded-xl p-6 mb-6">
                <h2 className="text-3xl font-bold text-white">{stats.name}</h2>
                <p className="text-gray-400 mt-1">{stats.description}</p>
                
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-400">Taxa de Sucesso</p>
                        <p className="text-3xl font-bold text-brand-light">{stats.successRate.toFixed(2)}%</p>
                    </div>
                     <div className="bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-400">Ocorrências</p>
                        <p className="text-3xl font-bold text-white">{stats.occurrences}</p>
                    </div>
                     <div className="bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-400">Acertos</p>
                        <p className="text-3xl font-bold text-green-400">{stats.successes}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-400">Odd Justa Mínima</p>
                        <p className="text-3xl font-bold text-yellow-400">{breakEvenOdd.toFixed(2)}</p>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={() => setIsReverseModalOpen(true)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-600 transition-colors duration-300"
                    >
                        <Repeat className="h-5 w-5 mr-2" />
                        Analisar Estratégia Inversa
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white flex items-center mb-4">
                        <BarChart className="h-6 w-6 mr-2 text-brand-primary" />
                        Desempenho por Campeonato
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {leaguePerformances.length > 0 ? leaguePerformances.map(league => (
                            <div key={league.league}>
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-sm font-medium text-gray-300 truncate">{league.league}</p>
                                    <p className="text-sm font-semibold text-brand-light">{league.successRate.toFixed(2)}%</p>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className={`${getBarColor(league.successRate)} h-2 rounded-full`}
                                        style={{ width: `${league.successRate}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-right text-gray-500 mt-1">{league.successes}/{league.occurrences}</p>
                            </div>
                        )) : <p className="text-gray-500">Nenhum dado de campeonato para exibir.</p>}
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                     <h3 className="text-xl font-bold text-white flex items-center mb-4">
                        <FileText className="h-6 w-6 mr-2 text-brand-primary" />
                        Histórico de Partidas ({matchInstances.length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {matchInstances.map(({ match, isSuccess }) => (
                            <div key={match.id} className={`p-3 rounded-lg flex justify-between items-center ${isSuccess ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                                <div>
                                    <p className="text-sm font-semibold text-gray-200">{match.homeTeam} vs {match.awayTeam}</p>
                                    <p className="text-xs text-gray-400">{match.league}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>{isSuccess ? 'Sucesso' : 'Falha'}</p>
                                    <p className="text-xs text-gray-300">HT {match.htHomeGoals}-{match.htAwayGoals} | FT {match.ftHomeGoals}-{match.ftAwayGoals}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <ReverseAnalysisModal
                isOpen={isReverseModalOpen}
                onClose={() => setIsReverseModalOpen(false)}
                matches={matches}
                strategyName={strategy.name}
            />
        </div>
    );
};

export default StrategyDetail;
