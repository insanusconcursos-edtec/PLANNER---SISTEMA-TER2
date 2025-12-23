
import React, { useState, useEffect } from 'react';
import { User, UserRole, StudyPlan } from './types';
import Sidebar from './components/Sidebar';
import Login from './views/Login';
import AdminDashboard from './views/Admin/Dashboard';
import AdminPlans from './views/Admin/Plans';
import AdminUsers from './views/Admin/Users';
import AdminEmbed from './views/Admin/Embed';
import UserRoutine from './views/User/Routine';
import UserPlanning from './views/User/Planning';
import UserDailyGoals from './views/User/DailyGoals';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<string>('');
  const [systemLogo, setSystemLogo] = useState<string>('');

  // Auto-set view based on role
  useEffect(() => {
    if (user) {
      setActiveView(user.role === UserRole.ADMIN ? 'admin-dashboard' : 'user-planning');
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setActiveView('');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a]">
      <Sidebar 
        role={user.role} 
        activeView={activeView} 
        onNavigate={setActiveView} 
        logoUrl={systemLogo}
      />
      
      <div className="flex-1 flex flex-col ml-64 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-800 bg-black flex items-center justify-end px-8 gap-4 z-30">
          <button 
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-gray-900 border border-gray-700 hover:border-red-500 transition text-xs font-semibold"
          >
            TELA CHEIA
          </button>
          <div className="h-6 w-px bg-gray-800"></div>
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-gray-400">Olá, <span className="text-white">{user.name}</span></span>
             <button 
              onClick={handleLogout}
              className="text-xs text-red-500 hover:text-red-400 font-bold"
            >
              SAIR DA CONTA
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          {/* Admin Views */}
          {activeView === 'admin-dashboard' && <AdminDashboard />}
          {activeView === 'admin-plans' && <AdminPlans onUpdateLogo={setSystemLogo} />}
          {activeView === 'admin-users' && <AdminUsers />}
          {activeView === 'admin-embed' && <AdminEmbed />}
          
          {/* User Views */}
          {activeView === 'user-routine' && <UserRoutine user={user} onUpdateUser={setUser} />}
          {activeView === 'user-planning' && <UserPlanning user={user} />}
          {activeView === 'user-daily' && <UserDailyGoals user={user} />}
        </main>
      </div>
    </div>
  );
};

export default App;
