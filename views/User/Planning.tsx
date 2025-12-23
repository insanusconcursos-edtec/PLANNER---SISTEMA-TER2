
import React, { useState } from 'react';
import { User } from '../../types';

interface UserPlanningProps {
  user: User;
}

const UserPlanning: React.FC<UserPlanningProps> = ({ user }) => {
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK'>('WEEK');

  // Simple mock events generator for the calendar
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weekDates = [10, 11, 12, 13, 14, 15, 16]; // Mock days of current month

  const mockEvents = [
    { day: 1, title: 'Aula: Atos Admin', color: 'bg-red-600' },
    { day: 1, title: 'Material: Poderes', color: 'bg-blue-600' },
    { day: 2, title: 'Questões: Atos', color: 'bg-green-600' },
    { day: 3, title: 'Lei Seca: CF Art. 1-5', color: 'bg-yellow-600' },
  ];

  return (
    <div className="h-full flex flex-col">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-futuristic text-white">Seu Planejamento</h1>
          <p className="text-sm text-gray-400">Acompanhe seu progresso e metas futuras</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-red-900/30 transition">
            REPLANEJAR PLANO
          </button>
          <div className="flex bg-gray-900 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('WEEK')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${viewMode === 'WEEK' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              SEMANAL
            </button>
            <button 
              onClick={() => setViewMode('MONTH')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${viewMode === 'MONTH' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              MENSAL
            </button>
          </div>
        </div>
      </header>

      {/* Modern Calendar Grid */}
      <div className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col border border-gray-800">
        <div className="grid grid-cols-7 bg-gray-900/50 border-b border-gray-800">
          {days.map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">{d}</div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 divide-x divide-y divide-gray-800">
          {weekDates.map((date, idx) => (
            <div key={idx} className="p-2 min-h-[120px] bg-black/20 hover:bg-white/[0.02] transition">
              <span className="text-xs font-bold text-gray-600 mb-2 block">{date}</span>
              <div className="space-y-1">
                 {mockEvents.filter(e => e.day === idx).map((e, i) => (
                   <div key={i} className={`p-1.5 rounded text-[10px] font-bold leading-tight truncate ${e.color} text-white cursor-pointer hover:brightness-110 shadow-sm`}>
                     {e.title}
                   </div>
                 ))}
              </div>
            </div>
          ))}
          {/* Fill the rest of the grid if month view... omitted for brevity */}
        </div>
      </div>

      <div className="mt-6 flex gap-8">
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
           <span className="text-xs text-gray-400">Aulas</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
           <span className="text-xs text-gray-400">Material</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-green-600 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
           <span className="text-xs text-gray-400">Questões</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-yellow-600 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
           <span className="text-xs text-gray-400">Lei Seca</span>
        </div>
      </div>
    </div>
  );
};

export default UserPlanning;
