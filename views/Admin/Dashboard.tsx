
import React from 'react';

const AdminDashboard: React.FC = () => {
  const stats = [
    { label: 'Total de Usuários', value: '1.248', icon: '👥', color: 'text-blue-500' },
    { label: 'Planos Ativos', value: '12', icon: '📁', color: 'text-green-500' },
    { label: 'Metas Concluídas (Hoje)', value: '3.582', icon: '✅', color: 'text-red-500' },
    { label: 'Média de Estudo/Dia', value: '4h 12min', icon: '⏱️', color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-futuristic text-white">Painel de Controle</h1>
        <p className="text-gray-400 mt-1">Bem-vindo ao centro de comando, Admin.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition">
            <div className="flex justify-between items-start mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${stat.color}`}>Realtime</span>
            </div>
            <p className="text-3xl font-futuristic text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        <section className="glass-panel p-8 rounded-3xl border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6">Atividade Recente</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800/50">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sm">👤</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-300"><span className="font-bold text-white">Ana Silva</span> concluiu a meta "Atos Admin" no plano <span className="text-red-500">PC-SP</span></p>
                  <p className="text-[10px] text-gray-600 mt-1">Há {i * 15} minutos</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel p-8 rounded-3xl border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6">Estado dos Servidores</h2>
          <div className="p-6 bg-black rounded-2xl border border-gray-900 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 rounded-full border-4 border-green-500 border-t-transparent animate-spin mb-4"></div>
             <p className="text-green-500 font-bold uppercase tracking-widest text-xs">Sincronização OK</p>
             <p className="text-gray-500 text-sm mt-2 max-w-xs">Todos os bancos de dados do Firebase estão respondendo corretamente às requisições dos usuários.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
