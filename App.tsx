
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole, StudyPlan, StudentLevel } from './types';
import Sidebar from './components/Sidebar';
import Login from './views/Login';
import AdminDashboard from './views/Admin/Dashboard';
import AdminPlans from './views/Admin/Plans';
import AdminUsers from './views/Admin/Users';
import AdminEmbed from './views/Admin/Embed';
import UserRoutine from './views/User/Routine';
import UserPlanning from './views/User/Planning';
import UserDailyGoals from './views/User/DailyGoals';
import { db } from './firebase';
import { collection, onSnapshot, query } from "firebase/firestore";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<string>('');
  const [systemLogo, setSystemLogo] = useState<string>('');
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewPlanId, setPreviewPlanId] = useState<string | null>(null);

  // 1. Escuta Planos (Global)
  useEffect(() => {
    const q = query(collection(db, "plans"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const plansArr: StudyPlan[] = [];
      querySnapshot.forEach((doc) => {
        plansArr.push({ ...doc.data(), id: doc.id } as StudyPlan);
      });
      setPlans(plansArr);
    });
    return () => unsubscribe();
  }, []);

  // 2. Escuta Usuários (Somente se for Admin Real e não estiver em Preview)
  useEffect(() => {
    if (user?.role === UserRole.ADMIN && !isPreviewMode) {
      const q = query(collection(db, "users"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usersArr: User[] = [];
        querySnapshot.forEach((doc) => {
          usersArr.push({ ...doc.data(), id: doc.id } as User);
        });
        setUsersList(usersArr);
      });
      return () => unsubscribe();
    }
  }, [user?.id, user?.role, isPreviewMode]);

  // 3. Gestão de Login e Visualização Inicial
  const handleLogin = (u: User) => {
    setUser(u);
    // Define a visualização padrão baseada no papel real
    setActiveView(u.role === UserRole.ADMIN ? 'admin-dashboard' : 'user-planning');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveView('');
    setIsPreviewMode(false);
    setPreviewPlanId(null);
  };

  // 4. Funções de Prévia
  const startPreview = (planId: string) => {
    setPreviewPlanId(planId);
    setIsPreviewMode(true);
    setActiveView('user-planning');
  };

  const stopPreview = useCallback(() => {
    setIsPreviewMode(false);
    setPreviewPlanId(null);
    setActiveView('admin-plans');
  }, []);

  // 5. Atualização de Usuário Segura (Shield Logic)
  const handleUpdateUser = (updatedData: User) => {
    setUser(prev => {
      if (!prev) return null;
      // BLOQUEIO SÊNIOR: Nunca permite que a ROLE ou CPF mude via tela de rotina
      // Isso protege o administrador de perder seus privilégios durante a prévia
      return {
        ...updatedData,
        id: prev.id,
        role: prev.role,
        cpf: prev.cpf,
        email: prev.email
      };
    });
  };

  // 6. Projeções de Dados para Renderização
  const effectiveRole = isPreviewMode ? UserRole.STUDENT : (user?.role || UserRole.STUDENT);
  
  const effectiveUser = useMemo(() => {
    if (!user) return null;
    if (!isPreviewMode) return user;
    return { 
      ...user, 
      role: UserRole.STUDENT, 
      activePlanId: previewPlanId || user.activePlanId,
      level: user.level || StudentLevel.BEGINNER
    };
  }, [user, isPreviewMode, previewPlanId]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Erro ao tentar ativar modo tela cheia: ${err.message}`);
      });
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden">
      <Sidebar 
        role={effectiveRole} 
        activeView={activeView} 
        onNavigate={setActiveView} 
        logoUrl={systemLogo}
      />
      
      <div className="flex-1 flex flex-col ml-64 overflow-hidden relative">
        <header className="h-16 border-b border-gray-800 bg-black flex items-center justify-between px-8 z-30">
          <div className="flex items-center gap-4">
            {isPreviewMode && (
              <div className="flex items-center gap-3 px-4 py-1.5 bg-yellow-600/10 border border-yellow-600/30 rounded-full animate-in fade-in zoom-in">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest font-futuristic">Modo Prévia Ativo</span>
                <button 
                  type="button"
                  onClick={stopPreview}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white text-[9px] font-black px-4 py-1 rounded-full transition-all uppercase shadow-lg shadow-yellow-900/20 active:scale-95 cursor-pointer"
                >
                  SAIR DA PRÉVIA
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
               <button 
                onClick={toggleFullScreen}
                className="text-[10px] font-black text-gray-400 hover:text-white transition-all uppercase tracking-widest border border-gray-800 px-3 py-1.5 rounded-lg hover:border-gray-600"
               >
                 TELA CHEIA ⛶
               </button>
               <div className="h-4 w-px bg-gray-800"></div>
               <span className="text-xs font-medium text-gray-400">Olá, <span className="text-white font-bold">{user.name}</span></span>
               <div className="h-4 w-px bg-gray-800"></div>
               <button onClick={handleLogout} className="text-[10px] text-red-500 hover:text-red-400 font-black uppercase tracking-widest transition-all">SAIR</button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          {(!isPreviewMode && user.role === UserRole.ADMIN) ? (
            <div className="animate-in fade-in duration-300">
              {activeView === 'admin-dashboard' && <AdminDashboard users={usersList} plans={plans} />}
              {activeView === 'admin-plans' && (
                <AdminPlans 
                  plans={plans} 
                  onUpdateLogo={setSystemLogo} 
                  onPreview={startPreview}
                />
              )}
              {activeView === 'admin-users' && <AdminUsers users={usersList} />}
              {activeView === 'admin-embed' && <AdminEmbed />}
              {/* Fallback Seguro para Admin */}
              {!activeView.startsWith('admin-') && <AdminDashboard users={usersList} plans={plans} />}
            </div>
          ) : effectiveUser ? (
            <div className="animate-in fade-in duration-300">
              {activeView === 'user-routine' && <UserRoutine user={effectiveUser} onUpdateUser={handleUpdateUser} />}
              {activeView === 'user-planning' && <UserPlanning user={effectiveUser} plans={plans} />}
              {activeView === 'user-daily' && <UserDailyGoals user={effectiveUser} plans={plans} />}
              {/* Fallback Seguro para Estudante/Preview */}
              {!activeView.startsWith('user-') && <UserPlanning user={effectiveUser} plans={plans} />}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default App;
