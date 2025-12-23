
import React, { useState } from 'react';
import { User, UserRole, StudentLevel } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Static Admin Credentials
    if (email === 'insanusconcursos@gmail.com' && password === 'Ins@nus110921') {
      onLogin({
        id: 'admin-1',
        name: 'Administrador',
        email: 'insanusconcursos@gmail.com',
        cpf: '000.000.000-00',
        role: UserRole.ADMIN,
        level: StudentLevel.ADVANCED,
        accessiblePlans: [],
        routine: { days: {} },
        studyStats: { totalMinutes: 0, planStats: {} }
      });
      return;
    }

    // Example Student Login for demo
    if (email === 'aluno@teste.com' && password === '123456') {
       onLogin({
        id: 'student-1',
        name: 'João Estudante',
        email: 'aluno@teste.com',
        cpf: '123.456.789-00',
        role: UserRole.STUDENT,
        level: StudentLevel.BEGINNER,
        accessiblePlans: [],
        routine: { days: { '1': 120, '2': 120, '3': 120, '4': 120, '5': 120 } },
        studyStats: { totalMinutes: 0, planStats: {} }
      });
      return;
    }

    setError('E-mail ou senha incorretos.');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600 rounded-full mix-blend-screen filter blur-[128px] opacity-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-600 rounded-full mix-blend-screen filter blur-[128px] opacity-10"></div>
      
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative z-10 border border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-futuristic font-bold text-red-600 tracking-tighter mb-2">
            INSANUS<span className="text-white">PLANNER</span>
          </h1>
          <p className="text-gray-400 text-sm">Acesse sua plataforma de estudos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">E-mail</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:border-red-600 focus:outline-none transition text-white"
              placeholder="exemplo@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:border-red-600 focus:outline-none transition text-white"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-red-900/20"
          >
            ENTRAR NO SISTEMA
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            Dificuldades no acesso? <a href="#" className="text-red-500 hover:underline">Fale com o suporte.</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
