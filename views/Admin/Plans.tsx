
import React, { useState } from 'react';
import { StudyPlan, Discipline, GoalType, CycleSystem } from '../../types';

interface AdminPlansProps {
  onUpdateLogo: (url: string) => void;
}

const AdminPlans: React.FC<AdminPlansProps> = ({ onUpdateLogo }) => {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const handleCreatePlan = () => {
    const newPlan: StudyPlan = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Plano de Estudos',
      imageUrl: 'https://picsum.photos/400/200',
      disciplines: [],
      folders: [],
      cycles: [],
      cycleSystem: CycleSystem.CONTINUOUS,
      lastUpdated: new Date().toISOString()
    };
    setPlans([...plans, newPlan]);
    setEditingPlan(newPlan);
    setIsCreating(true);
  };

  const toggleFolder = (id: string) => {
    const newSet = new Set(expandedFolders);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedFolders(newSet);
  };

  if (editingPlan) {
    return (
      <div className="max-w-6xl mx-auto pb-20">
        <header className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setEditingPlan(null)} className="text-gray-400 hover:text-white">← Voltar</button>
            <h1 className="text-2xl font-futuristic text-white">Editando: {editingPlan.name}</h1>
          </div>
          <button className="px-6 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition shadow-lg shadow-red-900/20">
            SINCRONIZAR PLANO 🔄
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Structure */}
          <div className="lg:col-span-2 space-y-6">
            <section className="glass-panel p-6 rounded-2xl border border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-200">Estrutura de Disciplinas</h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs">Nova Pasta</button>
                  <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white">Nova Disciplina</button>
                </div>
              </div>

              {/* Recursive Structure Tree */}
              <div className="space-y-3">
                <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                       <span className="cursor-pointer">📁</span>
                       <h4 className="font-bold text-sm text-white">Pasta: Conhecimentos Básicos</h4>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button className="text-xs text-gray-500">Edit</button>
                      <button className="text-xs text-red-900">Del</button>
                    </div>
                  </div>
                  
                  {/* Disciplines within folder */}
                  <div className="ml-6 space-y-2">
                    <div className="p-3 bg-black border border-gray-800 rounded-lg flex justify-between items-center">
                      <span className="text-sm">Português</span>
                      <div className="flex gap-4">
                        <button className="text-[10px] text-gray-500 uppercase font-bold">+ Assunto</button>
                        <span className="text-xs text-gray-700">:::</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="glass-panel p-6 rounded-2xl border border-gray-800">
              <h2 className="text-lg font-bold text-gray-200 mb-6">Configuração de Ciclos</h2>
              <div className="p-4 border-2 border-dashed border-gray-800 rounded-xl text-center text-gray-600 text-sm">
                Nenhum ciclo configurado. Clique em "Adicionar Ciclo" para começar.
              </div>
            </section>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            <section className="glass-panel p-6 rounded-2xl border border-gray-800">
              <h3 className="text-md font-bold text-white mb-4">Configurações Gerais</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome do Plano</label>
                  <input type="text" className="w-full bg-black border border-gray-700 p-2 rounded text-sm text-white" defaultValue={editingPlan.name} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Capa do Plano (Imagem)</label>
                  <input type="file" className="text-xs text-gray-500" />
                  <p className="text-[10px] text-gray-600 mt-1">Recomendado: 800x400px</p>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sistema de Ciclo</label>
                   <select className="w-full bg-black border border-gray-700 p-2 rounded text-sm text-white">
                     <option value={CycleSystem.CONTINUOUS}>Contínuo</option>
                     <option value={CycleSystem.ROTATORY}>Rotativo</option>
                   </select>
                </div>
              </div>
            </section>

            <section className="glass-panel p-6 rounded-2xl border border-gray-800">
              <h3 className="text-md font-bold text-white mb-4">Personalização Visual</h3>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Logo do Sistema (Override)</label>
                <input type="file" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (re) => onUpdateLogo(re.target?.result as string);
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }} className="text-xs text-gray-500" />
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-futuristic text-white">Planos de Estudos</h1>
          <p className="text-gray-400 mt-1">Gerencie e publique os cronogramas para os alunos</p>
        </div>
        <button 
          onClick={handleCreatePlan}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all transform active:scale-95 shadow-xl shadow-red-900/20"
        >
          + CRIAR NOVO PLANO
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full py-20 text-center glass-panel rounded-3xl border-2 border-dashed border-gray-800">
            <p className="text-gray-500 font-medium">Nenhum plano cadastrado ainda.</p>
          </div>
        ) : (
          plans.map(plan => (
            <div key={plan.id} className="glass-panel rounded-2xl overflow-hidden border border-gray-800 group hover:border-red-500/50 transition-all cursor-pointer" onClick={() => setEditingPlan(plan)}>
              <div className="h-40 overflow-hidden relative">
                <img src={plan.imageUrl} alt={plan.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                </div>
              </div>
              <div className="p-5 flex justify-between items-center">
                <span className="text-xs text-gray-500">Última att: {new Date(plan.lastUpdated).toLocaleDateString()}</span>
                <button className="text-xs text-red-500 font-bold hover:underline">EDITAR ESTRUTURA →</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPlans;
