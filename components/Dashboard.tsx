import React from 'react';
import { StrategyStats } from '../types';
import StrategyCard from './StrategyCard';
import { Bot, FileCode, Loader2 } from 'lucide-react';
import StrategyCharts from './StrategyCharts';

interface DashboardProps {
    results: StrategyStats[];
    totalMatches: number;
    onGetInsights: () => void;
    isGeminiLoading: boolean;
    onSelectStrategy: (strategy: StrategyStats) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ results, totalMatches, onGetInsights, isGeminiLoading, onSelectStrategy }) => {
    if (results.length === 0) {
        return (
            <div className="text-center py-16">
                <FileCode className="mx-auto h-16 w-16 text-gray-600" />
                <h3 className="mt-4 text-xl font-semibold text-gray-400">Aguardando dados</h3>
                <p className="mt-2 text-gray-500">Clique no botão para buscar e analisar os dados.</p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <div className="bg-gray-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Resultados da Análise</h2>
                    <p className="text-gray-400">
                        Analisando <span className="font-semibold text-brand-light">{totalMatches}</span> partidas da base de dados.
                    </p>
                </div>
                <button
                    onClick={onGetInsights}
                    disabled={isGeminiLoading}
                    className="flex items-center justify-center px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 w-full md:w-auto"
                >
                    {isGeminiLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Gerando Insights...
                        </>
                    ) : (
                        <>
                            <Bot className="h-5 w-5 mr-2" />
                            Obter Insights com IA
                        </>
                    )}
                </button>
            </div>

            <StrategyCharts data={results} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.map((stat) => (
                    <StrategyCard key={stat.name} stats={stat} onSelect={onSelectStrategy} />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;