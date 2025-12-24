
import React from 'react';
import { User } from '../types';

interface PDFReaderProps {
  url: string;
  user: User;
  onClose: () => void;
}

const PDFReader: React.FC<PDFReaderProps> = ({ url, user, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex flex-col animate-in fade-in zoom-in duration-300">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
        <div className="flex items-center gap-4">
           <h2 className="text-lg font-futuristic text-red-600 uppercase tracking-widest">Leitor de Material Seguro</h2>
           <div className="flex flex-col">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">Proteção Ativa</span>
              <span className="text-[8px] text-gray-600 font-medium uppercase tracking-[2px]">{user.name}</span>
           </div>
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
          
          {/* CAMADA DE SEGURANÇA: Marca d'água em grade diagonal suave */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.07] flex flex-wrap justify-around items-center content-around z-10">
            {Array.from({ length: 48 }).map((_, i) => (
              <div 
                key={i} 
                className="transform -rotate-45 text-red-600 font-black text-[11px] whitespace-nowrap p-8 uppercase tracking-[3px] border border-red-600/10 rounded"
                style={{ fontFamily: 'monospace' }}
              >
                {user.name} <br/> {user.cpf}
              </div>
            ))}
          </div>

          {/* Overlay invisível para evitar cliques simples */}
          <div className="absolute inset-0 z-20 pointer-events-none bg-transparent"></div>
        </div>
      </div>
      
      <footer className="h-10 bg-red-600 flex items-center justify-between px-8">
         <p className="text-[9px] font-black text-white uppercase tracking-[3px]">
           Material Protegido - Lei de Direitos Autorais (Nº 9.610/98)
         </p>
         <p className="text-[9px] font-black text-white/80 uppercase tracking-[2px]">
           Rastreador: {user.cpf}
         </p>
      </footer>
    </div>
  );
};

export default PDFReader;
