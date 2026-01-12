
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  List, 
  Bell,
  Settings,
  Menu,
  Zap,
  Search,
  MessageSquareText,
  AlertTriangle,
  LogOut,
  LayoutDashboard,
  X
} from 'lucide-react';
import DashboardView from './components/DashboardView';
import WatchlistView from './components/WatchlistView';
import NLPView from './components/NLPView';
import AlertsView from './components/AlertsView';
import SettingsView from './components/SettingsView';
import ContradictionView from './components/ContradictionView';
import AuthPage from './components/AuthPage';
import TickerDetail from './components/TickerDetail';
import { SearchModal } from './components/SearchModal';
import { useAuthStore } from './store/authStore';
import { NotificationService } from './services/notifications';
import { api } from './services/api';
import { Ticker } from './types';

const App: React.FC = () => {
  const { user, isAuthenticated, initialize, logout } = useAuthStore();
  const [selectedTicker, setSelectedTicker] = useState<Ticker | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'watchlist' | 'alerts' | 'analyse' | 'contradictions' | 'settings'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (user) {
      NotificationService.requestPermission();
      NotificationService.simulateBackgroundAlerts();
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return <AuthPage />;
  }

  const handleAddTicker = async (t: Ticker) => {
    try {
      const { watchlists } = await api.watchlist.getAll();
      if (watchlists.length > 0) {
        await api.watchlist.addItem(watchlists[0].id, t.symbol);
      }
    } catch (e) { console.error(e); }
    
    setSelectedTicker(t);
    setIsSearchOpen(false);
  };

  const NavItem = ({ id, label, icon: Icon }: { id: typeof currentView, label: string, icon: any }) => (
    <button
      onClick={() => { setCurrentView(id); setSelectedTicker(null); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all relative ${
        currentView === id && !selectedTicker 
          ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={20} />
      {label}
      {currentView === id && !selectedTicker && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-emerald-500 rounded-r-full shadow-[0_0_15px_#10b981]" />}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0a0a0b] text-slate-200 font-sans">
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onAdd={handleAddTicker} />

      {/* Mobile Top Nav */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[#212124] bg-black/80 backdrop-blur-3xl sticky top-0 z-50">
        <div className="flex items-center gap-3" onClick={() => { setSelectedTicker(null); setCurrentView('dashboard'); }}>
          <Zap size={24} className="text-emerald-500" fill="currentColor" />
          <span className="font-black text-xl tracking-tighter text-white">SignalHub</span>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setIsSearchOpen(true)} className="p-2 bg-white/5 rounded-lg border border-white/10"><Search size={20} /></button>
           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-white/5 rounded-lg border border-white/10">
             {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
           </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 w-80 border-r border-[#212124] flex flex-col z-[60] bg-[#050505] transition-transform duration-300 md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8">
          <div className="hidden md:flex items-center gap-4 mb-10 cursor-pointer group" onClick={() => { setSelectedTicker(null); setCurrentView('dashboard'); }}>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:scale-110">
               <Zap size={24} className="text-emerald-500" fill="currentColor" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-white">SignalHub</span>
          </div>

          <nav className="space-y-2">
            <NavItem id="dashboard" label="Signal Terminal" icon={LayoutDashboard} />
            <NavItem id="watchlist" label="Watchlists" icon={List} />
            <NavItem id="alerts" label="Alert Center" icon={Bell} />
            <NavItem id="contradictions" label="Contradictions" icon={AlertTriangle} />
            <NavItem id="analyse" label="Narrative Engine" icon={MessageSquareText} />
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-[#212124] space-y-4">
           <button 
             onClick={() => { setCurrentView('settings'); setSelectedTicker(null); setSidebarOpen(false); }}
             className={`w-full flex items-center gap-4 px-5 py-2 text-sm font-bold transition-colors ${currentView === 'settings' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
           >
             <Settings size={20} /> Preferences
           </button>
           
           <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-emerald-500/20 shadow-xl flex items-center justify-center font-bold text-white text-sm">
                {user.firstName?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                 <div className="text-sm font-black truncate text-white">{user.firstName || 'User'}</div>
                 <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                 </div>
              </div>
              <button onClick={logout} className="text-slate-500 hover:text-white"><LogOut size={16} /></button>
           </div>
        </div>
      </aside>

      {/* Content Canvas */}
      <main className="flex-1 md:ml-80 p-4 md:p-8 lg:p-12 overflow-x-hidden relative min-h-screen">
        <div className="max-w-7xl mx-auto">
          {selectedTicker ? (
            <TickerDetail ticker={selectedTicker} onBack={() => setSelectedTicker(null)} />
          ) : currentView === 'dashboard' ? (
            <DashboardView onSelectTicker={setSelectedTicker} onOpenSearch={() => setIsSearchOpen(true)} />
          ) : currentView === 'watchlist' ? (
            <WatchlistView onSelectTicker={setSelectedTicker} />
          ) : currentView === 'alerts' ? (
            <AlertsView />
          ) : currentView === 'contradictions' ? (
            <ContradictionView />
          ) : currentView === 'analyse' ? (
            <NLPView />
          ) : currentView === 'settings' ? (
            <SettingsView user={user} onLogout={logout} />
          ) : (
             <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-6 animate-in fade-in duration-1000">
               <Activity className="text-white/10 animate-pulse" size={120} />
               <h2 className="text-3xl font-black uppercase tracking-[0.5em] opacity-20 text-white">Quant Node Initializing</h2>
             </div>
          )}
        </div>
      </main>

      {/* Desktop Search FAB */}
      <div className="hidden md:block fixed bottom-10 right-10 z-[70]">
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-110 active:scale-95 transition-all ring-8 ring-[#0a0a0b]"
        >
          <Search size={24} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default App;
