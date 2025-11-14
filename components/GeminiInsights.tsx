import React from 'react';
import { Loader2 } from 'lucide-react';

interface GeminiInsightsProps {
    insights: string | null;
    isLoading: boolean;
}

// Simple markdown-to-HTML parser for this specific use case
const renderMarkdown = (text: string) => {
    return text
        .split('\n')
        .map((line, index) => {
            if (line.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-bold text-brand-light mt-6 mb-2">{line.substring(4)}</h3>;
            }
            if (line.startsWith('- ')) {
                return <li key={index} className="ml-5 list-disc text-gray-300">{line.substring(2)}</li>;
            }
            if (line.trim() === '') {
                return <br key={index} />;
            }
            return <p key={index} className="text-gray-300 mb-2">{line}</p>;
        })
        .reduce((acc: React.ReactNode[], el, index) => {
            // FIX: Add type guards using React.isValidElement to safely access element properties
            // and prevent runtime errors when processing different ReactNode types.
            const lastEl = acc[acc.length - 1];
            const lastElIsNotUl = !React.isValidElement(lastEl) || lastEl.type !== 'ul';

            if (React.isValidElement(el) && el.type === 'li' && (index === 0 || lastElIsNotUl)) {
                acc.push(<ul key={`ul-${index}`} className="mb-4">{el}</ul>);
            } else if (React.isValidElement(el) && el.type === 'li') {
                // FIX: Cast `lastEl` to a ReactElement with a known `children` prop to satisfy TypeScript.
                // This resolves errors on the following lines related to accessing `props.children`.
                const lastUl = lastEl as React.ReactElement<{ children: React.ReactNode }>;
                // FIX: Safely handle children, which can be a single element or an array,
                // by using React.Children.toArray to ensure it's always an array.
                const newChildren = [...React.Children.toArray(lastUl.props.children), el];
                acc[acc.length-1] = React.cloneElement(lastUl, { children: newChildren });
            } else {
                acc.push(el);
            }
            return acc;
        }, [] as React.ReactNode[]);
};

const GeminiInsights: React.FC<GeminiInsightsProps> = ({ insights, isLoading }) => {
    if (isLoading) {
        return (
            <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-brand-dark shadow-lg flex flex-col items-center justify-center min-h-[200px]">
                <Loader2 className="h-10 w-10 text-brand-primary animate-spin" />
                <p className="mt-4 text-lg text-gray-300">A IA está analisando os dados para você...</p>
                <p className="text-gray-500">Isso pode levar alguns segundos.</p>
            </div>
        );
    }

    if (!insights) {
        return null;
    }

    return (
        <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-brand-dark shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Insights da IA</h2>
            <div className="prose prose-invert max-w-none">
                {renderMarkdown(insights)}
            </div>
        </div>
    );
};

export default GeminiInsights;
