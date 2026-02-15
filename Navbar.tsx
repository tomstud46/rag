import React from 'react';
import { Bell, MessageSquare, Sun, Moon, LogOut, Database, LayoutDashboard } from 'lucide-react';
import { User as UserType } from '../types';
import { PageType } from '../App';

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
  onNavigate: (page: PageType) => void;
  currentPage: PageType;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onLogout, 
  onNavigate, 
  currentPage,
  isDarkMode,
  onToggleDarkMode 
}) => {
  return (
    <nav className="w-full h-20 fixed top-0 left-0 bg-[#0a0c10]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-[100] shadow-2xl">
      {/* Left: Branding */}
      <div 
        className="flex items-center gap-4 cursor-pointer group" 
        onClick={() => onNavigate('chat')}
      >
        <div className="w-10 h-10 bg-[#4ade80] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.3)] transition-transform group-hover:scale-110">
          <LayoutDashboard size={20} className="text-black" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-lg font-black text-white tracking-tight uppercase leading-none">Dashboard</h1>
          <p className="text-[9px] text-[#4ade80] font-black uppercase tracking-widest mt-0.5 opacity-60">Control Hub</p>
        </div>
      </div>

      {/* Center: Main Navigation */}
      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
        <NavButton 
          icon={<MessageSquare size={18} />} 
          label="AI Chat" 
          active={currentPage === 'chat'} 
          onClick={() => onNavigate('chat')} 
        />
        <NavButton 
          icon={<Database size={18} />} 
          label="Knowledge" 
          active={currentPage === 'knowledge'} 
          onClick={() => onNavigate('knowledge')} 
        />
        {/* Removed the Account button from center nav */}
      </div>

      {/* Right: User & Controls */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 pr-4 border-r border-white/10">
          <button 
            onClick={() => onNavigate('notifications')}
            className={`p-2.5 rounded-xl transition-all relative group ${
              currentPage === 'notifications' 
                ? 'bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20' 
                : 'bg-white/5 text-slate-500 hover:text-white border border-transparent'
            }`}
          >
            <Bell size={18} className="group-active:scale-90" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#4ade80] rounded-full border-2 border-[#0a0c10]"></span>
          </button>
          <button 
            onClick={onToggleDarkMode}
            className="p-2.5 bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all border border-transparent hover:bg-white/10"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div 
            className={`flex items-center p-1.5 rounded-2xl border transition-all cursor-pointer ${
              currentPage === 'account' ? 'bg-[#4ade80]/5 border-[#4ade80]/20' : 'bg-white/5 border-transparent hover:border-white/10'
            }`}
            onClick={() => onNavigate('account')} // Avatar still clickable if needed
          >
            <img 
              src={user?.avatar || `https://picsum.photos/seed/${user?.id || 'default'}/32/32`} 
              className="w-8 h-8 rounded-lg object-cover border border-white/10 shadow-lg" 
              alt="avatar" 
            />
          </div>
          
          <button 
            onClick={onLogout}
            className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/10 group"
            title="Log out"
          >
            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </nav>
  );
};

const NavButton = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border group ${
      active 
        ? 'bg-[#4ade80] text-black border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.2)]' 
        : 'bg-transparent text-slate-400 border-transparent hover:text-white'
    }`}
  >
    <span className="transition-colors">{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{label}</span>
  </button>
);
