
import React, { useState } from 'react';
import { User, UserRole, StudentLevel } from '../../types';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 'student-1',
      name: 'João Estudante',
      email: 'aluno@teste.com',
      cpf: '123.456.789-00',
      role: UserRole.STUDENT,
      level: StudentLevel.BEGINNER,
      accessiblePlans: [{ planId: 'p1', expiresAt: '2024-12-31' }],
      routine: { days: {} },
      studyStats: { totalMinutes: 0, planStats: {} }
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isManagingPlans, setIsManagingPlans] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.cpf.includes(searchTerm)
  );

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditing(true);
  };

  const handleManagePlans = (user: User) => {
    setSelectedUser(user);
    setIsManagingPlans(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-futuristic text-white">Usuários</h1>
          <p className="text-gray-400 mt-1">Gerencie os acessos e perfis dos alunos da plataforma.</p>
        </div>
        <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-xl shadow-red-900/20">
          + NOVO USUÁRIO
        </button>
      </header>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <div className="mb-6 relative">
          <input 
            type="text"
            placeholder="Pesquisar por Nome, E-mail ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-xl px-12 py-3 focus:border-red-600 focus:outline-none transition text-white"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                <th className="px-4 py-4">Nome</th>
                <th className="px-4 py-4">CPF / E-mail</th>
                <th className="px-4 py-4">Nível</th>
                <th className="px-4 py-4">Planos</th>
                <th className="px-4 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-4 py-4">
                    <div className="font-bold text-white">{user.name}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-tighter">{user.role}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-300">{user.cpf}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-400">
                      {user.level}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-red-500 font-bold">{user.accessiblePlans.length} ativos</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleManagePlans(user)}
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition"
                        title="Gerenciar Planos"
                      >
                        📂
                      </button>
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition"
                        title="Editar Perfil"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded transition"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais (Placeholder para funcionalidade completa) */}
      {isManagingPlans && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsManagingPlans(false)}></div>
          <div className="w-full max-w-lg glass-panel p-8 rounded-3xl relative z-10 border border-gray-700">
            <h2 className="text-xl font-futuristic text-red-500 mb-6">Gerenciar Planos: {selectedUser.name}</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800">
                <div>
                  <p className="font-bold text-white">Plano Polícia Civil - SP</p>
                  <p className="text-xs text-gray-500">Expira em: 31/12/2024</p>
                </div>
                <button className="text-xs text-red-500 font-bold hover:underline">REMOVER</button>
              </div>
              <button className="w-full py-4 border-2 border-dashed border-gray-800 rounded-xl text-gray-500 text-sm font-bold hover:border-red-500 hover:text-red-500 transition">
                + ADICIONAR PLANO
              </button>
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setIsManagingPlans(false)}
                className="px-6 py-2 bg-gray-800 rounded-lg text-white font-bold"
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
