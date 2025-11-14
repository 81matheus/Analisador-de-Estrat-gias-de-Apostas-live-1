import React from 'react';
import { StrategyStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StrategyChartsProps {
    data: StrategyStats[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
                <p className="text-gray-200 font-semibold">{label}</p>
                <p style={{ color: payload[0].color }}>{`${payload[0].name}: ${payload[0].value.toFixed(2)}${payload[0].unit || ''}`}</p>
            </div>
        );
    }
    return null;
};

const StrategyCharts: React.FC<StrategyChartsProps> = ({ data }) => {
    // Get top 10 strategies by success rate
    const topStrategies = data.slice(0, 10);

    // Filter out strategies with infinite break-even odd for a cleaner chart and cap for readability
    const strategiesForOddChart = topStrategies.filter(s => isFinite(s.breakEvenOdd) && s.breakEvenOdd < 20);

    return (
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
             <h2 className="text-2xl font-bold text-white mb-6 text-center">Visualização de Estratégias</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold text-brand-light mb-4 text-center">Top 10 - Taxa de Sucesso (%)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topStrategies} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval={0} angle={-45} textAnchor="end" height={80} />
                            <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} unit="%" />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
                            <Bar dataKey="successRate" name="Taxa de Sucesso" fill="#10B981" unit="%" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-yellow-400 mb-4 text-center">Odd Justa Mínima (para Top 10)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={strategiesForOddChart} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval={0} angle={-45} textAnchor="end" height={80} />
                            <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(251, 191, 36, 0.1)' }}/>
                            <Bar dataKey="breakEvenOdd" name="Odd Justa" fill="#FBBF24" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default StrategyCharts;
