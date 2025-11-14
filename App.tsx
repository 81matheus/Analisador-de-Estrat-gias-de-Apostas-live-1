
import React, { useState, useCallback } from 'react';
import { StrategyStats, Match } from './types';
import { analyzeData, parseCSV } from './services/analysisService';
import { getStrategyInsights } from './services/geminiService';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import GeminiInsights from './components/GeminiInsights';
import DataUploader from './components/DataUploader';
import StrategyDetail from './components/StrategyDetail';
import { Loader2 } from 'lucide-react';


const App: React.FC = () => {
    const [analysisResults, setAnalysisResults] = useState<StrategyStats[]>([]);
    const [allMatches, setAllMatches] = useState<Match[]>([]);
    const [totalMatches, setTotalMatches] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [geminiInsights, setGeminiInsights] = useState<string | null>(null);
    const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false);

    const [selectedStrategy, setSelectedStrategy] = useState<StrategyStats | null>(null);


    const handleFileProcess = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);
        setAnalysisResults([]);
        setGeminiInsights(null);
        setTotalMatches(0);
        setAllMatches([]);
        setSelectedStrategy(null);

        try {
            const text = await file.text();
            if (!text) {
                throw new Error("O arquivo CSV está vazio.");
            }
            
            const matches = parseCSV(text);
            if (matches.length === 0) {
                throw new Error("Nenhuma partida válida encontrada no arquivo. Verifique o formato e o conteúdo do CSV.");
            }
            
            const results = analyzeData(matches);
            setAllMatches(matches);
            setAnalysisResults(results);
            setTotalMatches(matches.length);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleGetInsights = useCallback(async () => {
        if (analysisResults.length === 0) return;

        setIsGeminiLoading(true);
        setGeminiInsights(null);
        setError(null);

        try {
            const insights = await getStrategyInsights(analysisResults);
            setGeminiInsights(insights);
        } catch (err: any) {
            setError("Falha ao obter insights da IA. Verifique sua chave de API e a conexão.");
        } finally {
            setIsGeminiLoading(false);
        }
    }, [analysisResults]);

    const handleSelectStrategy = useCallback((strategy: StrategyStats) => {
        setSelectedStrategy(strategy);
    }, []);

    const handleBackToDashboard = useCallback(() => {
        setSelectedStrategy(null);
    }, []);


    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                
                {error && (
                    <div className="my-6 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
                        <strong className="font-bold">Erro: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                {selectedStrategy ? (
                    <StrategyDetail 
                        strategy={selectedStrategy}
                        matches={allMatches}
                        onBack={handleBackToDashboard}
                    />
                ) : (
                    <>
                        {analysisResults.length === 0 && !isLoading && (
                            <DataUploader onFileProcess={handleFileProcess} isLoading={isLoading} />
                        )}
                        
                        {isLoading && analysisResults.length === 0 && (
                            <div className="flex justify-center items-center my-10">
                                <Loader2 className="h-12 w-12 text-brand-primary animate-spin" />
                                <p className="ml-4 text-xl">Analisando dados do arquivo...</p>
                            </div>
                        )}

                        {analysisResults.length > 0 && !isLoading && (
                            <>
                                <Dashboard 
                                    results={analysisResults} 
                                    totalMatches={totalMatches}
                                    onGetInsights={handleGetInsights}
                                    isGeminiLoading={isGeminiLoading}
                                    onSelectStrategy={handleSelectStrategy}
                                />
                                <GeminiInsights 
                                    insights={geminiInsights} 
                                    isLoading={isGeminiLoading}
                                />
                            </>
                        )}
                    </>
                )}

            </main>
            <footer className="text-center p-4 text-gray-500 text-sm">
                Desenvolvido para encontrar os melhores ranges para bots de apostas.
            </footer>
        </div>
    );
};

export default App;
