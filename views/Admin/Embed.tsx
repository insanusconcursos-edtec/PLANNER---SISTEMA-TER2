
import React, { useState } from 'react';

const AdminEmbed: React.FC = () => {
  const embedCode = `<iframe 
  src="${window.location.origin}" 
  width="100%" 
  height="800px" 
  style="border:none; border-radius: 12px; overflow: hidden;"
  allow="fullscreen"
></iframe>`;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-futuristic text-white">Código Embed</h1>
        <p className="text-gray-400 mt-1">Incorpore o planejador em seu site ou plataforma de membros.</p>
      </header>

      <div className="glass-panel p-8 rounded-3xl border border-gray-800 space-y-6">
        <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-xl flex gap-4 items-start">
          <span className="text-xl">ℹ️</span>
          <p className="text-sm text-blue-300">
            O código abaixo gera um quadro responsivo que se adapta ao container do seu site. 
            Certifique-se de que o domínio de destino está autorizado nas configurações de segurança.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Código HTML para Incorporação</label>
          <div className="relative">
            <pre className="bg-black border border-gray-700 rounded-xl p-6 text-xs text-red-400 overflow-x-auto font-mono">
              {embedCode}
            </pre>
            <button 
              onClick={handleCopy}
              className={`absolute right-4 top-4 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                copied ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {copied ? 'COPIADO! ✓' : 'COPIAR CÓDIGO'}
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">Pré-visualização da Responsividade</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 text-center">
              <p className="text-xl mb-2">🖥️</p>
              <p className="text-xs font-bold text-gray-400 uppercase">Desktop</p>
              <p className="text-[10px] text-gray-600 mt-1">Full Sidebar</p>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 text-center">
              <p className="text-xl mb-2">📱</p>
              <p className="text-xs font-bold text-gray-400 uppercase">Mobile</p>
              <p className="text-[10px] text-gray-600 mt-1">Compact Menu</p>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 text-center">
              <p className="text-xl mb-2">📖</p>
              <p className="text-xs font-bold text-gray-400 uppercase">Tablet</p>
              <p className="text-[10px] text-gray-600 mt-1">Adaptive Grid</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmbed;
