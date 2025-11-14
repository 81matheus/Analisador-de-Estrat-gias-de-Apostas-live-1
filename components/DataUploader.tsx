
import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';

interface DataUploaderProps {
    onFileProcess: (file: File) => void;
    isLoading: boolean;
}

const DataUploader: React.FC<DataUploaderProps> = ({ onFileProcess, isLoading }) => {
    const [dragActive, setDragActive] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [onFileProcess]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };
    
    const handleFile = (file: File) => {
        if (file && file.type === 'text/csv') {
            setFileName(file.name);
            onFileProcess(file);
        } else {
            alert("Por favor, selecione um arquivo .csv");
        }
    }

    return (
        <div className="bg-gray-800 p-6 rounded-xl border-2 border-dashed border-gray-700 transition-all duration-300 hover:border-brand-primary">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-semibold text-white">Carregue seus dados de jogos</h2>
                <p className="text-gray-400 mt-2">
                    Faça o upload de um arquivo <code className="bg-gray-700 text-brand-light px-1 rounded">.csv</code> para começar a análise.
                </p>
                <p className="text-sm text-gray-500 mt-2">O arquivo CSV deve conter as colunas: <code className="bg-gray-700 text-brand-light px-1 rounded">LIGA, EQUIPA CASA, EQUIPA VISITANTE, RESULTADO HT CASA, RESULTADO HT FORA, RESULTADO FT CASA, RESULTADO FT FORA</code></p>
            </div>
            <div 
                className={`relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${dragActive ? 'border-brand-primary bg-gray-700' : 'border-gray-600 hover:bg-gray-700'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".csv"
                    onChange={handleChange}
                    disabled={isLoading}
                />
                {isLoading ? (
                    <div className="flex flex-col items-center text-center">
                        <Loader2 className="h-10 w-10 text-brand-primary animate-spin" />
                        <p className="mt-4 text-lg font-medium text-gray-300">Processando...</p>
                    </div>
                ) : fileName ? (
                     <div className="flex flex-col items-center text-center">
                        <FileText className="h-10 w-10 text-brand-primary" />
                        <p className="mt-4 text-lg font-medium text-gray-300">{fileName}</p>
                        <p className="text-gray-400">Arraste outro arquivo ou clique para substituir</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center">
                        <UploadCloud className="h-10 w-10 text-gray-500" />
                        <p className="mt-4 text-lg font-medium text-gray-300">
                            <span className="text-brand-primary">Clique para carregar</span> ou arraste e solte
                        </p>
                        <p className="text-gray-400">Apenas arquivos .csv</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataUploader;
