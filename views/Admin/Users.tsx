
import React, { useState } from 'react';
import { User, UserRole, StudentLevel } from '../../types';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";

interface AdminUsersProps {
  users: User[];
}

const AdminUsers: React.FC<AdminUsersProps> = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.cpf.includes(searchTerm)
  );

  const handleCreateUser = async () => {
    const name = prompt("Nome completo do Usuário:");
    const email = prompt("E-mail:");
    const cpf = prompt("CPF:");
    if (!name || !email || !cpf) return;

    const newUser: Omit<User, 'id'> = {
      name,
      email,
      cpf,
      role: UserRole.STUDENT,
      level: StudentLevel.BEGINNER,
      accessiblePlans: [],
      routine: { days: {} },
      studyStats: { totalMinutes: 0, planStats: {} }
    };

    try {
      await addDoc(collection(db, "users"), newUser);
      alert("Usuário cadastrado com sucesso no Firebase!");
    } catch (e) {
      console.error("Error creating user: ", e);
    }
  };

  const handleTogglePlan = async (userId: string, planId: string, currentPlans: any[]) => {
    const isPresent = currentPlans.some(p => p.planId === planId);
    let updatedPlans;
    if (isPresent) {
      updatedPlans = currentPlans.filter(p => p.planId !== planId);
    } else {
      updatedPlans = [...currentPlans, { planId, expiresAt: '2025-12-31' }];
    }

    try {
      await updateDoc(doc(db, "users", userId), { accessiblePlans: updatedPlans });
    } catch (e) {
      console.error("Error updating user plans: ", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário permanentemente do banco de dados?')) {
      try {
        await deleteDoc(doc(db, "users", id));
      } catch (e) {
        console.error("Error deleting user: ", e);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-700">
      <header className="flex justify-between items-end border-b border-gray-900 pb-8">
        <div>
          <h1 className="text-3xl font-futuristic text-white uppercase tracking-tighter">Gestão de Alunos</h1>
          <p className="text-gray-500 mt-1 uppercase tracking-widest text-[10px] font-black">Base de Dados Centralizada no Firestore</p>
        </div>
        <button onClick={handleCreateUser} className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-900/20 font-futuristic text-xs tracking-widest">
          + NOVO USUÁRIO
        </button>
      </header>

      <div className="glass-panel p-8 rounded-[40px] border border-gray-800 shadow-2xl">
        <div className="mb-10 relative">
          <input 
            type="text"
            placeholder="Pesquisa por NOME, E-MAIL ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-gray-800 rounded-2xl px-14 py-5 focus:border-red-600 focus:outline-none transition text-white font-bold text-sm shadow-inner"
          />
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-[10px] uppercase font-black text-gray-600 tracking-[3px]">
                <th className="px-6 py-6">Perfil do Aluno</th>
                <th className="px-6 py-6">Documentação</th>
                <th className="px-6 py-6">Nível Técnico</th>
                <th className="px-6 py-6">Acessos Ativos</th>
                <th className="px-6 py-6 text-right">Comandos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/30">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-white/[0.01] transition group">
                  <td className="px-6 py-6">
                    <div className="font-bold text-gray-200 text-sm group-hover:text-white transition">{user.name}</div>
                    <div className="text-[10px] text-gray-600 uppercase tracking-widest font-black mt-0.5">{user.role}</div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-xs text-gray-400 font-futuristic">{user.cpf}</div>
                    <div className="text-[10px] text-gray-600 font-bold lowercase">{user.email}</div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-[9px] font-black px-3 py-1 rounded-full bg-black border border-gray-800 text-gray-500 uppercase tracking-widest">
                      {user.level}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-[10px] text-red-600 font-black uppercase tracking-widest bg-red-600/5 px-3 py-1 rounded-full border border-red-900/20">
                      {user.accessiblePlans.length} PLANOS
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        className="w-10 h-10 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl transition flex items-center justify-center grayscale hover:grayscale-0"
                        title="Gerenciar Acessos"
                      >
                        📂
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="w-10 h-10 bg-red-900/10 hover:bg-red-600 border border-red-900/30 text-red-500 hover:text-white rounded-xl transition flex items-center justify-center shadow-lg"
                        title="Excluir Definitivamente"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-700 italic font-black uppercase tracking-[5px] text-xs">
                    Nenhum aluno encontrado na base Firestore.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
