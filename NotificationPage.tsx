
import React, { useState } from 'react';
import { Bell, Zap, Info, CheckCircle2, AlertCircle, Clock, Trash2, Shield } from 'lucide-react';
import { SystemNotification } from '../types';

export const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    { id: 1, type: 'info', title: 'Gemini Engine Update', message: 'Vector processing speed increased with text-embedding-004.', time: 'Just now', read: false },
    { id: 2, type: 'success', title: 'Knowledge Indexed', message: 'Corporate manual has been fully vectorized.', time: '2 hours ago', read: false },
    { id: 3, type: 'zap', title: 'Peak Performance', message: 'All regional AI clusters are operating at zero latency.', time: '5 hours ago', read: true },
    { id: 4, type: 'alert', title: 'Maintenance Notice', message: 'Database optimization scheduled for tomorrow.', time: '1 day ago', read: true },
    { id: 5, type: 'shield', title: 'Security Protocol', message: 'New administrative access detected from secure terminal.', time: '3 days ago', read: true },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <header className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black tracking-tight text-white uppercase">System Logs</h2>
          <p className="text-slate-500 font-medium">Real-time alerts and operational history.</p>
        </div>
        <button 
          onClick={markAllRead}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-[#4ade80] transition-all group"
        >
          <CheckCircle2 size={16} className="group-hover:scale-110" /> Acknowledge All
        </button>
      </header>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="py-40 flex flex-col items-center justify-center text-slate-800">
             <Bell size={64} className="opacity-20 mb-6" />
             <p className="font-black uppercase text-xs tracking-widest">Logs Empty</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`bg-[#12161c] border rounded-[2rem] p-6 flex items-start gap-6 transition-all group relative ${
                n.read ? 'border-white/5 opacity-60' : 'border-[#4ade80]/20 border-l-4 border-l-[#4ade80] shadow-[0_0_20px_rgba(74,222,128,0.05)]'
              } hover:border-[#4ade80]/40`}
            >
              <div className={`p-4 rounded-2xl flex-shrink-0 shadow-inner ${
                n.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                n.type === 'alert' ? 'bg-amber-500/10 text-amber-500' :
                n.type === 'zap' ? 'bg-indigo-500/10 text-indigo-500' :
                n.type === 'shield' ? 'bg-blue-500/10 text-blue-500' :
                'bg-[#4ade80]/10 text-[#4ade80]'
              }`}>
                {n.type === 'success' ? <CheckCircle2 size={24} /> :
                 n.type === 'alert' ? <AlertCircle size={24} /> :
                 n.type === 'zap' ? <Zap size={24} /> :
                 n.type === 'shield' ? <Shield size={24} /> :
                 <Info size={24} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-white text-lg flex items-center gap-3">
                    {n.title}
                    {!n.read && <span className="w-2 h-2 bg-[#4ade80] rounded-full animate-pulse"></span>}
                  </h4>
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-[10px] uppercase tracking-tighter">
                    <Clock size={12} /> {n.time}
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{n.message}</p>
              </div>
              <button 
                onClick={() => deleteNotification(n.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-700 hover:text-red-500 transition-all active:scale-90"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
