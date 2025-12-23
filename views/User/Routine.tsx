
import React from 'react';
import { User, StudentLevel } from '../../types';

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
    const mins = parseInt(hoursStr) * 60;
    const newRoutine = { ...user.routine, days: { ...user.routine.days, [dayId]: mins } };
    onUpdateUser({ ...user, routine: newRoutine });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-futuristic text-white">Minha Rotina</h1>
        <p className="text-gray-400 mt-1">Defina seus horários para que o sistema organize suas metas automaticamente.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <section className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-6">Configuração de Horários</h2>
            <div className="space-y-4">
              {days.map(day => (
                <div key={day.id} className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                  <span className="font-medium text-gray-300">{day.label}</span>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      min="0" max="24"
                      value={(user.routine.days[day.id] || 0) / 60}
                      onChange={(e) => handleUpdateHours(day.id, e.target.value)}
                      className="w-20 bg-black border border-gray-700 rounded px-2 py-1 text-center text-white"
                    />
                    <span className="text-xs text-gray-500 font-bold uppercase">horas</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h3 className="text-md font-bold text-white mb-4">Perfil de Estudante</h3>
            <div className="space-y-3">
              {[
                { id: StudentLevel.BEGINNER, label: 'Iniciante', desc: 'Ritmo mais calmo para assimilação' },
                { id: StudentLevel.INTERMEDIATE, label: 'Intermediário', desc: 'Equilíbrio entre teoria e questões' },
                { id: StudentLevel.ADVANCED, label: 'Avançado', desc: 'Foco total em velocidade e revisões' }
              ].map(level => (
                <button 
                  key={level.id}
                  onClick={() => onUpdateUser({ ...user, level: level.id })}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    user.level === level.id 
                      ? 'bg-red-600/10 border-red-600' 
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <p className={`text-sm font-bold ${user.level === level.id ? 'text-red-500' : 'text-gray-200'}`}>{level.label}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{level.desc}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h3 className="text-md font-bold text-white mb-4">Controle do Plano</h3>
            <div className="space-y-3">
              <button className="w-full py-2 bg-yellow-600/20 text-yellow-500 border border-yellow-600/30 rounded font-bold text-xs hover:bg-yellow-600/30 transition">
                PAUSAR PLANO ATUAL
              </button>
              <button 
                onClick={() => {
                   if(confirm("ATENÇÃO! Reiniciar o plano apagará todo o seu progresso. Esta ação não pode ser desfeita. Deseja continuar?")) {
                     alert("Plano reiniciado com sucesso.");
                   }
                }}
                className="w-full py-2 bg-red-900/20 text-red-500 border border-red-900/30 rounded font-bold text-xs hover:bg-red-900/30 transition"
              >
                REINICIAR PLANO
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserRoutine;
