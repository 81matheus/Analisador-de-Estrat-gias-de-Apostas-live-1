
import React from 'react';
import { StrategyStats } from '../types';

interface StrategyCardProps {
    stats: StrategyStats;
    onSelect: (stats: StrategyStats) => void;
}

const getBarColor = (rate: number): string => {
    if (rate >= 60) return 'bg-green-500';
    if (rate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
};

const StrategyCard: React.FC<StrategyCardProps> = ({ stats, onSelect }) => {
    const barColor = getBarColor(stats.successRate);
    
    return (
        <button
            onClick={() => onSelect(stats)}
            className="bg-gray-800 rounded-xl shadow-lg p-5 flex flex-col justify-between transition-transform duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl border border-gray-700 text-left w-full focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
            <div>
                <h3 className="text-lg font-bold text-white truncate">{stats.name}</h3>
                <p className="text-sm text-gray-400 mt-1 min-h-[40px]">{stats.description}</p>
            </div>
            <div className="mt-4">
                <div className="flex justify-between items-baseline mb-2">
                    <span className="text-3xl font-bold text-brand-light">{stats.successRate.toFixed(2)}%</span>
                    <span className="text-sm text-gray-500">
                        {stats.successes} / {stats.occurrences}
                    </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                        className={`${barColor} h-2.5 rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${stats.successRate}%` }}
                    ></div>
                </div>
                 <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Taxa de Sucesso</span>
                    <span>Ocorrências</span>
                </div>
            </div>
        </button>
    );
};

export default StrategyCard;
