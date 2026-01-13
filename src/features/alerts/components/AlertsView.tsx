
import React, { useState, useEffect } from 'react';
import { Loader2, BellRing, Zap, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { Card, Badge } from '../../../shared/components/Shared';
import { api } from '../../../shared/services/api';
import { Alert } from '../../../shared/types';

const AlertsView: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.alerts.getRecent();
      setAlerts(res || []);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const handleDismiss = async (id: string | number) => {
    await api.alerts.dismiss(id.toString());
    setAlerts(alerts.filter(a => a.id !== id));
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={32} /></div>;

  const getPriorityStyles = (p: string) => {
    switch(p) {
      case 'critical': return 'border-l-rose-500 bg-gradient-to-r from-rose-50/50 to-white dark:from-rose-900/10 dark:to-[#18181b]';
      case 'high': return 'border-l-amber-500 bg-white dark:bg-[#18181b]';
      default: return 'border-l-sky-500 bg-white dark:bg-[#18181b]';
    }
  }

  const getIcon = (type: string, priority: string) => {
    if (type === 'spike') return <Zap className={`w-5 h-5 ${priority === 'critical' ? 'text-rose-500 fill-rose-500' : 'text-emerald-500 fill-emerald-500'}`} />;
    return <AlertTriangle className={`w-5 h-5 ${priority === 'critical' ? 'text-rose-500' : 'text-amber-500'}`} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <header className="flex items-end justify-between border-b border-slate-200 dark:border-[#212124] pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Alert Center</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Real-time signal log & narrative anomalies.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="neutral">{alerts.length} New</Badge>
        </div>
      </header>

      <div className="space-y-3">
        {alerts.map(alert => (
          <div 
            key={alert.id} 
            className={`
              relative group flex flex-col md:flex-row items-start md:items-center justify-between p-5 
              rounded-xl border border-slate-200 dark:border-[#2d2d31] border-l-4 shadow-sm hover:shadow-md transition-all
              ${getPriorityStyles(alert.priority)}
            `}
          >
            {/* Left: Icon & Symbol */}
            <div className="flex items-center gap-5 w-full md:w-auto">
               <div className="p-3 bg-white dark:bg-[#27272a] rounded-xl border border-slate-100 dark:border-white/5 shadow-sm shrink-0">
                  {getIcon(alert.alert_type, alert.priority)}
               </div>
               
               <div className="min-w-[120px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xl text-slate-900 dark:text-white tracking-tight">
                      {alert.symbol}
                    </span>
                    {alert.priority === 'critical' && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {alert.alert_type}
                  </span>
               </div>
            </div>

            {/* Middle: Message */}
            <div className="flex-1 mt-3 md:mt-0 md:px-8">
               <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">
                 {alert.message}
               </p>
            </div>

            {/* Right: Time & Action */}
            <div className="flex items-center justify-between w-full md:w-auto gap-6 mt-4 md:mt-0">
               <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                 {new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </span>
               
               <button 
                onClick={() => handleDismiss(alert.id)}
                className="group/btn p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                title="Dismiss"
               >
                 <X size={18} />
               </button>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
           <div className="p-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 dark:border-[#212124] rounded-3xl bg-slate-50/50 dark:bg-[#0a0a0b]/50">
             <div className="w-16 h-16 bg-slate-100 dark:bg-[#18181b] rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
               <BellRing size={24} />
             </div>
             <p className="font-bold text-slate-500 dark:text-slate-400">All Quiet</p>
             <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No active anomalies detected in the current monitoring window.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default AlertsView;
