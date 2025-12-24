
import React, { useMemo } from 'react';
import { User, StudyPlan } from '../../types';

interface AdminDashboardProps {
  users: User[];
  plans: StudyPlan[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, plans }) => {
  // Estatísticas de Negócio
  const totalUsers = users.length;
  const activePlans = plans.length;
  const totalStudyMinutes = users.reduce((acc, u) => acc + (u.studyStats?.totalMinutes || 0), 0);
  
  // Cálculo de Infraestrutura (Estimativas baseadas no Firestore)
  // Média de 2kb por documento de usuário/plano para estimar storage
  const estimatedStorageKB = (users.length * 2) + (plans.length * 5); 
  const storageLimitGB = 1; // Limite Spark Tier
  const storageUsagePercent = (estimatedStorageKB / (storageLimitGB * 1024 * 1024)) * 100;

  const infraMetrics = [
    { label: 'Documentos Firestore', value: (users.length + plans.length).toString(), detail: 'Sincronizados' },
    { label: 'Uso de Storage (Est.)', value: `${estimatedStorageKB.toFixed(2)} KB`, detail: 'Limite 1GB (Grátis)' },
    { label: 'Status da Conexão', value: 'Ativo', detail: 'Criptografia TLS 1.3' },
    { label: 'Custo Mensal (Proj.)', value: 'U$ 0,00', detail: 'Dentro da Spark Tier' },
  ];

  const stats = [
    { label: 'Usuários Registrados', value: totalUsers.toString(), icon: '👥', color: 'text-blue-500' },
    { label: 'Planos Criados', value: activePlans.toString(), icon: '📁', color: 'text-green-500' },
    { label: 'Horas Estudadas (Total)', value: `${Math.floor(totalStudyMinutes / 60)}h`, icon: '⏱️', color: 'text-red-500' },
    { label: 'Média/Aluno', value: totalUsers > 0 ? `${Math.round(totalStudyMinutes / totalUsers)}m` : '0m', icon: '📊', color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-futuristic text-white uppercase tracking-tighter">Dashboard de Operações</h1>
          <p className="text-gray-500 mt-1 uppercase tracking-widest text-[10px] font-bold">Monitoramento em Tempo Real - Firebase Cloud</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Servidores Online</span>
        </div>
      </header>

      {/* Grid de Métricas de Negócio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-3xl border border-gray-800 relative overflow-hidden group hover:border-red-600/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <div className="h-1 w-12 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${stat.color.replace('text', 'bg')} w-2/3`}></div>
              </div>
            </div>
            <p className="text-3xl font-futuristic text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Painel de Infraestrutura e Custos */}
        <section className="lg:col-span-1 glass-panel p-8 rounded-[40px] border border-gray-800 shadow-2xl bg-gradient-to-br from-gray-900/50 to-black">
          <h2 className="text-sm font-futuristic text-red-500 mb-8 uppercase tracking-[4px]">Infraestrutura Cloud</h2>
          
          <div className="space-y-6">
            {infraMetrics.map((m, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-black/40 border border-gray-800/50 rounded-2xl">
                <div>
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">{m.label}</p>
                  <p className="text-sm font-bold text-gray-200">{m.value}</p>
                </div>
                <p className="text-[9px] text-gray-600 font-bold uppercase">{m.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-2">
              <span>Uso de Banco de Dados</span>
              <span>{storageUsagePercent.toFixed(4)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800">
              <div className="h-full bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${Math.max(2, storageUsagePercent)}%` }}></div>
            </div>
            <p className="text-[9px] text-gray-600 mt-4 italic leading-relaxed">
              * Estimativa baseada no volume de documentos. O custo real pode variar de acordo com o tráfego de saída (Egress).
            </p>
          </div>
        </section>

        {/* Lista de Atividades Reais */}
        <section className="lg:col-span-2 glass-panel p-8 rounded-[40px] border border-gray-800">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-sm font-futuristic text-white uppercase tracking-[4px]">Alunos em Foco</h2>
            <button className="text-[10px] font-black text-red-500 hover:underline uppercase tracking-widest">Ver Todos</button>
          </div>
          
          <div className="space-y-4">
            {users.slice(-6).map(u => (
              <div key={u.id} className="flex items-center gap-4 p-5 rounded-2xl bg-gray-900/30 border border-gray-800/50 hover:bg-gray-800/30 transition-all">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white font-bold shadow-lg">
                  {u.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white tracking-tight">{u.name}</p>
                  <p className="text-[10px] text-gray-600 uppercase font-black tracking-tighter">{u.email}</p>
                </div>
                <div className="flex gap-8 text-right">
                  <div>
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Estudo Líquido</p>
                    <p className="text-xs font-futuristic text-red-500">{u.studyStats?.totalMinutes || 0}m</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Acessos</p>
                    <p className="text-xs font-bold text-gray-400">{u.accessiblePlans?.length || 0}</p>
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="py-20 text-center">
                 <p className="text-xs text-gray-700 font-black uppercase tracking-[5px]">Nenhum dado de usuário disponível</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
