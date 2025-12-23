
import React, { useState, useEffect, useRef } from 'react';
import { User, GoalType } from '../../types';

interface DailyGoalsProps {
  user: User;
}

const DailyGoals: React.FC<DailyGoalsProps> = ({ user }) => {
  const [expandedMetaId, setExpandedMetaId] = useState<string | null>(null);
  const [activeMetaId, setActiveMetaId] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  // Fix: Use ReturnType<typeof setInterval> instead of NodeJS.Timeout to resolve namespace error in browser-only environments.
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => { 
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartMeta = (id: string) => {
    setActiveMetaId(id);
    setTimer(0);
    setIsRunning(true);
  };

  const handleFinishMeta = () => {
    // Save timer data to profile logic here
    setIsRunning(false);
    setActiveMetaId(null);
    setTimer(0);
    alert("Meta concluída! Tempo líquido registrado.");
  };

  // Mocked goals for current day
  const dailyGoals = [
    {
      id: 'm1',
      title: 'Direito Administrativo - Atos Administrativos',
      type: GoalType.AULA,
      color: '#ef4444',
      duration: 120,
      submetas: [
        { id: 's1', title: 'Conceito e Requisitos', duration: 45, link: 'https://youtube.com' },
        { id: 's2', title: 'Atributos e Classificação', duration: 75, link: 'https://youtube.com' },
      ],
      obs: 'Focar nos requisitos de validade (COM-FI-FOR-M-OB)'
    },
    {
       id: 'm2',
       title: 'Questões - Atos Administrativos',
       type: GoalType.QUESTOES,
       color: '#3b82f6',
       duration: 60,
       pages: 10,
       link: 'https://tecconcursos.com.br'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-futuristic text-white">Metas Diárias</h1>
          <p className="text-gray-400 mt-1">Hoje é {(new Date()).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        
        {activeMetaId && (
          <div className="glass-panel p-4 rounded-xl border border-red-900/30 flex items-center gap-6 animate-pulse">
            <div>
              <p className="text-[10px] uppercase font-bold text-red-500 tracking-widest">Estudando agora</p>
              <p className="text-xl font-futuristic text-white">{formatTime(timer)}</p>
            </div>
            <div className="flex gap-2">
               <button onClick={() => setIsRunning(!isRunning)} className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition text-lg">
                {isRunning ? '⏸️' : '▶️'}
              </button>
              <button onClick={handleFinishMeta} className="px-4 py-2 bg-red-600 rounded text-xs font-bold hover:bg-red-700">
                CONCLUIR
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="space-y-4">
        {dailyGoals.map((meta) => (
          <div key={meta.id} className="glass-panel rounded-xl overflow-hidden border border-gray-800">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-2 h-12 rounded-full" style={{ backgroundColor: meta.color }}></div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                      {meta.type}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{meta.duration} min</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{meta.title}</h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {meta.type === GoalType.AULA && (
                   <button 
                    onClick={() => setExpandedMetaId(expandedMetaId === meta.id ? null : meta.id)}
                    className="p-2 text-gray-400 hover:text-white transition"
                   >
                    {expandedMetaId === meta.id ? '🔼' : '🔽'}
                   </button>
                )}
                <button 
                  onClick={() => handleStartMeta(meta.id)}
                  disabled={!!activeMetaId}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                    activeMetaId === meta.id 
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20'
                  }`}
                >
                  {activeMetaId === meta.id ? 'EM ANDAMENTO' : 'INICIAR META'}
                </button>
              </div>
            </div>

            {/* Smart Accordion for subgoals / details */}
            {(expandedMetaId === meta.id || meta.obs) && (
              <div className="px-5 pb-5 pt-2 border-t border-gray-800 bg-black/40">
                {meta.obs && (
                  <div className="mb-4 p-3 rounded bg-blue-900/20 border border-blue-900/30 text-xs text-blue-300 italic">
                    <strong>Obs:</strong> {meta.obs}
                  </div>
                )}
                
                {meta.submetas && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-2">Submetas de Aula</p>
                    {meta.submetas.map((sm) => (
                      <div key={sm.id} className="flex items-center justify-between p-3 rounded bg-gray-900 border border-gray-800 hover:border-gray-700 transition group">
                        <div className="flex items-center gap-3">
                           <input type="checkbox" className="w-4 h-4 accent-red-600 rounded" />
                           <span className="text-sm text-gray-300">{sm.title} <span className="text-gray-600">({sm.duration} min)</span></span>
                        </div>
                        <a href={sm.link} target="_blank" rel="noopener noreferrer" className="text-xs text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition">
                          ACESSAR AULA ↗
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                
                {meta.type === GoalType.QUESTOES && (
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-400">Páginas: <span className="text-white">{meta.pages}</span></p>
                    <a href={meta.link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-xs font-bold transition">
                      VER LISTA DE QUESTÕES ↗
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyGoals;
