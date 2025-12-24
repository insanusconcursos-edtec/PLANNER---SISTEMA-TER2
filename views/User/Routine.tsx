
import React from 'react';
import { User, StudentLevel, RoutineConfig } from '../../types';

interface RoutineProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const UserRoutine: React.FC<RoutineProps> = ({ user, onUpdateUser }) => {
  const days = [
    { id: '1', label: 'Segunda-feira' },
    { id: '2', label: 'Terça-feira' },
    { id: '3', label: 'Quarta-feira' },
    { id: '4', label: 'Quinta-feira' },
    { id: '5', label: 'Sexta-feira' },
    { id: '6', label: 'Sábado' },
    { id: '0', label: 'Domingo' },
  ];

  const handleUpdateHours = (dayId: string, hoursStr: string) => {
    const hours = parseInt(hoursStr) || 0;
    const mins = hours * 60;
    const newRoutine: RoutineConfig = { 
      ...user.routine, 
      days: { ...user.routine.days, [dayId]: mins } 
    };
    onUpdateUser({ ...user, routine: newRoutine });
  };

  const handleLevelChange = (newLevel: StudentLevel) => {
    onUpdateUser({ ...user, level: newLevel });
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
      <header className="mb-10">
        <h1 className="text-3xl font-futuristic text-white uppercase tracking-tighter">Minha Rotina</h1>
        <p className="text-gray-400 mt-1 uppercase text-[10px] font-black tracking-widest">Ajuste seus horários para otimizar o algoritmo</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <section className="glass-panel p-8 rounded-[32px] border border-gray-800 shadow-2xl">
            <h2 className="text-sm font-futuristic text-red-500 mb-8 uppercase tracking-widest border-b border-gray-800 pb-2">Horários de Estudo</h2>
            <div className="space-y-4">
              {days.map(day => (
                <div key={day.id} className="flex items-center justify-between p-5 bg-gray-900/30 border border-gray-800/50 rounded-2xl hover:bg-gray-800/30 transition-all">
                  <span className="font-bold text-gray-300 text-sm uppercase tracking-wider">{day.label}</span>
                  <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      min="0" max="24"
                      value={(user.routine.days[day.id] || 0) / 60}
                      onChange={(e) => handleUpdateHours(day.id, e.target.value)}
                      className="w-20 bg-black border border-gray-700 rounded-xl px-2 py-2 text-center text-white font-futuristic focus:border-red-600 outline-none"
                    />
                    <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">horas</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="glass-panel p-8 rounded-[32px] border border-gray-800">
            <h3 className="text-xs font-futuristic text-white mb-6 uppercase tracking-widest border-b border-gray-800 pb-2">Nível Técnico</h3>
            <div className="space-y-4">
              {[
                { id: StudentLevel.BEGINNER, label: 'Iniciante', desc: 'Ritmo focado em base teórica' },
                { id: StudentLevel.INTERMEDIATE, label: 'Intermediário', desc: 'Teoria e questões balanceadas' },
                { id: StudentLevel.ADVANCED, label: 'Avançado', desc: 'Foco em desempenho e revisões' }
              ].map(level => (
                <button 
                  key={level.id}
                  onClick={() => handleLevelChange(level.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all group ${
                    user.level === level.id 
                      ? 'bg-red-600/10 border-red-600 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <p className={`text-xs font-black uppercase tracking-widest ${user.level === level.id ? 'text-red-500' : 'text-gray-400 group-hover:text-white'}`}>{level.label}</p>
                  <p className="text-[10px] text-gray-600 mt-1 font-bold italic">{level.desc}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="glass-panel p-8 rounded-[32px] border border-gray-800">
            <h3 className="text-xs font-futuristic text-white mb-6 uppercase tracking-widest border-b border-gray-800 pb-2">Gestão do Plano</h3>
            <div className="space-y-3">
              <button className="w-full py-3 bg-yellow-600/10 text-yellow-500 border border-yellow-600/20 rounded-xl font-black text-[10px] uppercase tracking-[2px] hover:bg-yellow-600/20 transition-all">
                PAUSAR PLANO ⏸️
              </button>
              <button 
                onClick={() => {
                   if(confirm("ATENÇÃO! Reiniciar o plano apagará todo o seu progresso local. Deseja continuar?")) {
                     alert("Plano reiniciado no cache local.");
                   }
                }}
                className="w-full py-3 bg-red-900/10 text-red-500 border border-red-900/20 rounded-xl font-black text-[10px] uppercase tracking-[2px] hover:bg-red-900/20 transition-all"
              >
                REINICIAR PLANO 🔄
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserRoutine;
