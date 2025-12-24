
import React, { useState, useMemo } from 'react';
import { User, StudyPlan } from '../../types';
import { distributeGoals } from '../../lib/scheduler';

interface UserPlanningProps {
  user: User;
  plans: StudyPlan[];
}

const UserPlanning: React.FC<UserPlanningProps> = ({ user, plans }) => {
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK'>('WEEK');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Plano Ativo Real
  const activePlan = useMemo(() => {
    return plans.find(p => p.id === user.activePlanId);
  }, [user.activePlanId, plans]);

  // Distribuição Dinâmica e Real das Metas (Consumindo Firebase)
  const realGoals = useMemo(() => {
    if (!activePlan || !user.routine || Object.keys(user.routine.days).length === 0) return [];
    return distributeGoals(activePlan, user.routine, user.level);
  }, [activePlan, user.routine, user.level]);

  // Função aprimorada para agrupar metas no calendário e não mostrar submetas individuais
  const getGoalsForDate = (date: Date) => {
    const dayGoals = realGoals.filter(rg => rg.date.toDateString() === date.toDateString());
    // Agrupa para exibir apenas uma vez a meta principal se houver submetas no mesmo dia (como Aula 1, Aula 2)
    const unique = [];
    const seen = new Set();
    for (const g of dayGoals) {
      if (!seen.has(g.meta.id)) {
        seen.add(g.meta.id);
        unique.push(g);
      }
    }
    return unique;
  };

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Dados Calendário Mensal
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentDate]);

  // Dados Calendário Semanal
  const weekData = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  const exportToCalendar = () => {
    if (realGoals.length === 0) return alert("Não há metas reais cadastradas para este plano.");
    
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Insanus Planner//PT\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";
    
    realGoals.forEach(g => {
      const start = g.date.toISOString().replace(/-|:|\.\d+/g, "");
      const end = new Date(g.date.getTime() + (g.duration || 60) * 60000).toISOString().replace(/-|:|\.\d+/g, "");
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `SUMMARY:[${g.meta.type}] ${g.meta.title}\n`;
      icsContent += `DESCRIPTION:Disciplina: ${g.disciplineName}\\nAssunto: ${g.subjectName}\\n${g.meta.observations || ""}\\nLink: ${g.meta.link || "N/A"}\n`;
      icsContent += `DTSTART:${start}\n`;
      icsContent += `DTEND:${end}\n`;
      icsContent += "END:VEVENT\n";
    });
    
    icsContent += "END:VCALENDAR";
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `insanus_calendar_${activePlan?.name || 'export'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-1000">
      <header className="flex justify-between items-center border-b border-gray-900 pb-6">
        <div>
          <h1 className="text-3xl font-futuristic text-white uppercase tracking-tighter shadow-sm">Meu Planejamento</h1>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[3px] mt-1">
            {activePlan ? `PLANO EM NUVEM: ${activePlan.name}` : 'AGUARDANDO SELEÇÃO DE PLANO'}
          </p>
        </div>
        
        <div className="flex gap-4 items-center">
          <button 
            onClick={exportToCalendar}
            className="px-6 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-xl text-[10px] font-black hover:border-red-600 transition-all uppercase tracking-widest flex items-center gap-2"
          >
            Sincronizar Externo 💻
          </button>
          
          <div className="flex bg-black p-1 rounded-xl border border-gray-800 shadow-inner">
            <button 
              onClick={() => setViewMode('WEEK')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest ${viewMode === 'WEEK' ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-gray-400'}`}
            >
              Semanal
            </button>
            <button 
              onClick={() => setViewMode('MONTH')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest ${viewMode === 'MONTH' ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-gray-400'}`}
            >
              Mensal
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col glass-panel rounded-[40px] border border-gray-800 overflow-hidden shadow-2xl relative">
        <div className="grid grid-cols-7 bg-gray-900/80 border-b border-gray-800 backdrop-blur-md sticky top-0 z-10">
          {daysOfWeek.map(d => (
            <div key={d} className="py-5 text-center text-[11px] font-black text-gray-500 uppercase tracking-[4px]">{d}</div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 divide-x divide-y divide-gray-800/40 overflow-y-auto custom-scrollbar bg-black/40">
          {viewMode === 'MONTH' ? (
            calendarData.map((d, idx) => (
              <div key={idx} className={`p-3 min-h-[140px] transition-all duration-300 ${d ? 'bg-black/20 hover:bg-red-600/5' : 'bg-transparent opacity-10'}`}>
                {d && (
                  <>
                    <span className={`text-[12px] font-futuristic mb-3 block ${d.toDateString() === new Date().toDateString() ? 'text-red-500 scale-125 origin-left font-black' : 'text-gray-700'}`}>
                      {d.getDate().toString().padStart(2, '0')}
                    </span>
                    <div className="space-y-1.5">
                      {getGoalsForDate(d).map((g, i) => (
                        <div key={i} className={`px-2 py-1.5 rounded-md text-[9px] font-black leading-tight truncate text-white shadow-lg border-l-2 border-black/30 animate-in fade-in zoom-in duration-300`} style={{ backgroundColor: g.meta.color || '#ef4444' }}>
                          {g.meta.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            weekData.map((d, idx) => (
              <div key={idx} className={`p-4 min-h-[500px] transition-all duration-500 ${d.toDateString() === new Date().toDateString() ? 'bg-red-600/5 border-x border-red-900/10' : 'bg-black/10'}`}>
                <div className="mb-8">
                  <span className={`text-[24px] font-futuristic block tracking-tighter ${d.toDateString() === new Date().toDateString() ? 'text-red-500' : 'text-gray-500'}`}>
                    {d.getDate().toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-black text-gray-700 uppercase tracking-[2px]">{daysOfWeek[d.getDay()]}</span>
                </div>
                <div className="space-y-4">
                  {getGoalsForDate(d).map((g, i) => (
                    <div key={i} className={`p-5 rounded-2xl text-[10px] font-black leading-snug text-white shadow-2xl border-t border-white/10 group cursor-pointer hover:scale-[1.05] transition-all animate-in slide-in-from-top-4 duration-500`} style={{ backgroundColor: g.meta.color || '#ef4444' }}>
                      <div className="uppercase opacity-40 text-[8px] mb-2 tracking-[2px]">{g.meta.type}</div>
                      <div className="mb-2 text-sm tracking-tight">{g.meta.title}</div>
                      <div className="text-[8px] font-bold text-black/50 uppercase tracking-widest">{g.disciplineName}</div>
                    </div>
                  ))}
                  {getGoalsForDate(d).length === 0 && (
                    <div className="py-12 border border-dashed border-gray-800 rounded-[32px] flex items-center justify-center opacity-20">
                      <span className="text-[9px] font-black uppercase tracking-[4px] -rotate-90">Vazio</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {realGoals.length === 0 && activePlan && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20">
              <div className="text-center p-12 glass-panel rounded-[40px] border border-gray-800 max-w-sm">
                 <p className="text-2xl mb-4">📅</p>
                 <p className="text-white font-futuristic uppercase tracking-widest text-sm mb-2">Configure sua Rotina</p>
                 <p className="text-gray-500 text-xs leading-relaxed">
                   Vá até a aba "Configuração de Rotina" e defina seus horários para que o sistema possa distribuir as metas do plano "{activePlan.name}".
                 </p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default UserPlanning;
