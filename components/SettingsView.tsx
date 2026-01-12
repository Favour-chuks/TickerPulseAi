
import React, { useState } from 'react';
import { RefreshCw, Zap, Settings, Loader2 } from 'lucide-react';
import { Card, Badge } from './Shared';
import { api } from '../services/api';
import { NotificationService } from '../services/notifications';
import { User } from '../types';

const SettingsView = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const [simulating, setSimulating] = useState(false);
  const [autoScan, setAutoScan] = useState(true);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const demoAlert = await api.alerts.triggerDemoSignal();
      NotificationService.sendNotification(
        `SIGNAL DETECTED: ${demoAlert.symbol}`,
        demoAlert.message
      );
      window.alert("LIVE SIGNAL INJECTED: Check the Dashboard or Alert Center.");
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Terminal Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Configure your signal engine, notification parameters, and terminal connection.</p>
      </header>

      <div className="max-w-2xl space-y-6">
        <Card className="border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-500"><RefreshCw size={18} /> Signal Simulation Engine</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Test your connection to the SignalHub detection engine. Triggering a simulation will bypass normal market filtering to demonstrate the alert protocol.
          </p>
          <button 
            onClick={handleSimulate}
            disabled={simulating}
            className="w-full py-4 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-emerald-500/10"
          >
            {simulating ? <Loader2 className="animate-spin" size={18} /> : <><Zap size={18} fill="currentColor" /> Trigger Live Signal Simulation</>}
          </button>
        </Card>

        <Card>
          <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white"><Settings size={18} className="text-slate-400" /> Connection Preferences</h3>
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-bold text-slate-900 dark:text-white">Auto-Scan Filings</p>
                   <p className="text-xs text-slate-500">Automatically extract narratives from SEC Edgar real-time feed.</p>
                </div>
                <button 
                  onClick={() => setAutoScan(!autoScan)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${autoScan ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoScan ? 'left-6' : 'left-1'}`} />
                </button>
             </div>
             <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-[#212124]">
                <div>
                   <p className="text-sm font-bold text-slate-900 dark:text-white">Latency Mode</p>
                   <p className="text-xs text-slate-500">Prioritize orderbook speed over historical backtesting depth.</p>
                </div>
                <Badge variant="success">Low Latency</Badge>
             </div>
          </div>
        </Card>

        <Card className="border-rose-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-white font-bold">
                 {user.firstName?.[0] || user.email[0]}
              </div>
              <div>
                 <p className="font-bold text-sm text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
                 <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="px-6 py-2 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-500 border border-rose-100 dark:border-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
            >
              Log Out
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsView;
