
import React from 'react';
import { User } from '../types';

interface PDFReaderProps {
  url: string;
  user: User;
  onClose: () => void;
}

const PDFReader: React.FC<PDFReaderProps> = ({ url, user, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
        <h2 className="text-xl font-futuristic text-red-500">Leitor Seguro de PDF</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => window.open(url, '_blank')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition text-sm"
          >
            Baixar Original
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition text-sm font-bold"
          >
            Fechar
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative overflow-hidden flex justify-center bg-gray-800">
        {/* Mocking the PDF view with an iframe, overlaying the watermark */}
        <div className="w-full max-w-4xl h-full relative bg-white shadow-2xl">
           <iframe 
            src={`${url}#toolbar=0`} 
            className="w-full h-full border-none"
            title="PDF Viewer"
          />
          
          {/* Watermark layer */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-20 flex flex-wrap justify-around items-center content-around">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className="transform -rotate-45 text-red-600 font-bold text-lg whitespace-nowrap p-10"
              >
                {user.name} - {user.cpf}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFReader;
