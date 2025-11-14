
import React, { useMemo } from 'react';
import { Match } from '../types';
import { getReverseStrategyDetails } from '../services/analysisService';
import { X } from 'lucide-react';

interface ReverseAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    matches: Match[];
    strategyName: string;
}

const ReverseAnalysisModal: React.FC<ReverseAnalysisModalProps> = ({ isOpen, onClose, matches, strategyName }) => {
    const details = useMemo(() => {
        if (!isOpen) return null;
        return getReverseStrategyDetails(matches, strategyName);
    }, [isOpen, matches, strategyName]);

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg border border-indigo-700 m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Análise de Estratégia Inversa</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                {!details ? (
                    <p className="text-gray-400">Carregando análise...</p>
                ) : (
                    <div>
                        <h4 className="text-lg font-semibold text-indigo-400">{details.name}</h4>
                        <p className="text-sm text-gray-400 mt-1 mb-6">{details.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <p className="text-sm text-gray-400">Taxa de Sucesso</p>
                                <p className="text-3xl font-bold text-brand-light">{details.stats.successRate.toFixed(2)}%</p>
                            </div>
                             <div className="bg-gray-700 p-4 rounded-lg">
                                <p className="text-sm text-gray-400">Odd Justa Mínima</p>
                                <p className="text-3xl font-bold text-yellow-400">{details.breakEvenOdd.toFixed(2)}</p>
                            </div>
                             <div className="bg-gray-700 p-4 rounded-lg col-span-2">
                                <p className="text-sm text-gray-400">Ocorrências (Acertos/Total)</p>
                                <p className="text-3xl font-bold text-white">{details.stats.successes} / {details.stats.occurrences}</p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-6 text-center">
                            Esta análise mostra o quão frequentemente a estratégia original falha. Uma alta taxa de sucesso aqui indica uma oportunidade de apostar contra a tendência original.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReverseAnalysisModal;
