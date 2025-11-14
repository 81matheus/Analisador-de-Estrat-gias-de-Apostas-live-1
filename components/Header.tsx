
import React from 'react';
import { BarChart3 } from 'lucide-react';

const Header: React.FC = () => {
    return (
        <header className="bg-gray-800 shadow-lg">
            <div className="container mx-auto px-4 md:px-8 py-4 flex items-center">
                <BarChart3 className="h-8 w-8 text-brand-primary" />
                <h1 className="ml-3 text-2xl md:text-3xl font-bold text-white tracking-tight">
                    Analisador de Estratégias de Apostas
                </h1>
            </div>
        </header>
    );
};

export default Header;
