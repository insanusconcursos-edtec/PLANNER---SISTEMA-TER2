
import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeView: string;
  onNavigate: (view: string) => void;
  logoUrl?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeView, onNavigate, logoUrl }) => {
  const menuItems = role === UserRole.ADMIN ? [
    { id: 'admin-dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'admin-plans', label: 'Planos de Estudos', icon: '📁' },
    { id: 'admin-users', label: 'Usuários', icon: '👥' },
    { id: 'admin-embed', label: 'Código Embed', icon: '🔗' },
  ] : [
    { id: 'user-routine', label: 'Config. de Rotina', icon: '⚙️' },
    { id: 'user-planning', label: 'Planejamento', icon: '📅' },
    { id: 'user-daily', label: 'Metas Diárias', icon: '✅' },
  ];

  return (
    <div className="w-64 h-full bg-black border-r border-gray-800 flex flex-col fixed left-0 top-0 z-40 transition-all duration-300">
      <div className="p-6 border-b border-gray-800 flex justify-center">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="max-h-16 object-contain" />
        ) : (
          <div className="text-2xl font-futuristic font-bold text-red-600 tracking-tighter">
            INSANUS<span className="text-white">PLANNER</span>
          </div>
        )}
      </div>

      <nav className="flex-1 mt-4 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
              activeView === item.id 
                ? 'bg-red-600 text-white red-glow' 
                : 'text-gray-400 hover:bg-gray-900 hover:text-white'
            }`}
          >
            <span className="mr-3 text-xl">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800 text-center">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-futuristic">
          System v2.4.0
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
