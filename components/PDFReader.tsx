
import React from 'react';
import { User } from '../types';

interface PDFReaderProps {
  url: string;
  user: User;
  onClose: () => void;
}

const PDFReader: React.FC<PDFReaderProps> = ({ url, user, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col animate-in fade-in zoom-in duration-300">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
        <div className="flex items-center gap-4">
           <h2 className="text-lg font-futuristic text-red-600 uppercase tracking-widest">Leitor Seguro</h2>
           <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Acesso Protegido</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => window.open(url, '_blank')}
            className="px-4 py-2 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-xl transition text-[10px] font-black uppercase tracking-widest"
          >
            Baixar PDF 💾
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/40"
          >
            Fechar ✕
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative overflow-hidden flex justify-center bg-[#111]">
        <div className="w-full max-w-5xl h-full relative bg-white shadow-2xl overflow-hidden">
           {/* Visualizador de PDF */}
           <iframe 
            src={`${url}#toolbar=0&navpanes=0&scrollbar=0`} 
            className="w-full h-full border-none"
            title="PDF Viewer"
          />
          
          {/* CAMADA DE SEGURANÇA: Marca d'água em grade diagonal */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-10 flex flex-wrap justify-around items-center content-around z-10">
            {Array.from({ length: 30 }).map((_, i) => (
              <div 
                key={i} 
                className="transform -rotate-45 text-red-600 font-black text-[14px] whitespace-nowrap p-16 uppercase tracking-[3px]"
                style={{ fontFamily: 'monospace' }}
              >
                {user.name} <br/> {user.cpf}
              </div>
            ))}
          </div>

          {/* Overlay invisível para evitar print/clique direito fácil (básico) */}
          <div className="absolute inset-0 z-20 pointer-events-none bg-transparent"></div>
        </div>
      </div>
      
      <footer className="h-8 bg-red-600 flex items-center justify-center">
         <p className="text-[9px] font-black text-white uppercase tracking-[4px]">Material Protegido por Direitos Autorais - ID: {user.cpf}</p>
      </footer>
    </div>
  );
};

export default PDFReader;
