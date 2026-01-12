
import React, { useState, useEffect } from 'react';
import { Loader2, BellRing, Zap, AlertTriangle } from 'lucide-react';
import { Card, Badge } from './Shared';
import { api } from '../services/api';
import { Alert } from '../types';

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
    // Optimistic update
    setAlerts(alerts.filter(a => a.id !== id));
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={32} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white">Alert Center</h1>
        <p className="text-slate-400 text-sm">Chronological log of all high-frequency signals and corporate narrative anomalies.</p>
      </header>

      <div className="space-y-4">
        {alerts.map(alert => (
          <Card key={alert.id} className={`border-l-4 ${
            alert.priority === 'critical' ? 'border-l-rose-500 bg-rose-500/5' : 
            alert.priority === 'high' ? 'border-l-amber-500' : 'border-l-sky-500'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                     {alert.alert_type === 'spike' ? <Zap className="text-emerald-500" size={24} /> : <AlertTriangle className="text-amber-500" size={24} />}
                  </div>
                  <div className="space-y-1">
                     <div className="flex items-center gap-3">
                        <span className="font-mono font-extrabold text-lg text-white">{alert.symbol}</span>
                        <Badge variant={alert.priority === 'critical' ? 'danger' : 'default'}>{alert.priority}</Badge>
                        <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{alert.alert_type}</span>
                     </div>
                     <p className="text-sm text-slate-300 leading-relaxed">{alert.message}</p>
                     <p className="text-[10px] text-slate-500 font-mono">{new Date(alert.created_at).toLocaleString()}</p>
                  </div>
               </div>
               <button 
                onClick={() => handleDismiss(alert.id)}
                className="px-4 py-2 text-xs font-bold border border-[#212124] rounded-lg hover:bg-white/5 whitespace-nowrap text-slate-400"
               >
                 Dismiss
               </button>
            </div>
          </Card>
        ))}
        {alerts.length === 0 && (
           <div className="p-20 text-center border-2 border-dashed border-[#212124] rounded-3xl opacity-50 text-slate-500">
             <BellRing size={48} className="mx-auto mb-4" />
             <p className="font-bold">Clear Skies</p>
             <p className="text-xs">No active anomalies detected in the current monitoring window.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default AlertsView;
