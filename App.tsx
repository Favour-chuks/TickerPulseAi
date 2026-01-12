
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
  X,
  HelpCircle
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
import { ProfileModal } from './components/ProfileModal';
import { HelpModal } from './components/HelpModal';
import { useAuthStore } from './store/authStore';
import { NotificationService } from './services/notifications';
import { api } from './services/api';
import { Ticker, User } from './types';

const App: React.FC = () => {
  const { user, isAuthenticated, initialize, logout } = useAuthStore();
  const [selectedTicker, setSelectedTicker] = useState<Ticker | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'watchlist' | 'alerts' | 'analyse' | 'contradictions' | 'settings'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

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

  const handleUpdateProfile = (updatedUser: User) => {
    useAuthStore.setState({ user: updatedUser });
  };

  const NavItem = ({ id, label, icon: Icon }: { id: typeof currentView, label: string, icon: any }) => (
    <button
      onClick={() => { setCurrentView(id); setSelectedTicker(null); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        currentView === id && !selectedTicker 
          ? 'bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' 
          : 'text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/50'
      }`}
    >
      <Icon size={18} className={currentView === id && !selectedTicker ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-70'} />
      {label}
    </button>
  );

  return (
    <div className="h-screen w-full flex bg-gray-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-200 font-sans overflow-hidden transition-colors duration-200">
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onAdd={handleAddTicker} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} onUpdate={handleUpdateProfile} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Mobile Top Nav */}
      <div className="md:hidden fixed top-0 w-full flex items-center justify-between p-4 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 z-50">
        <div className="flex items-center gap-2" onClick={() => { setSelectedTicker(null); setCurrentView('dashboard'); }}>
          <Zap size={20} className="text-indigo-600 dark:text-indigo-500 fill-indigo-600 dark:fill-indigo-500" />
          <span className="font-bold text-lg text-slate-900 dark:text-white">SignalHub</span>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setIsSearchOpen(true)} className="p-2 text-slate-500 dark:text-zinc-400"><Search size={20} /></button>
           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 dark:text-zinc-400">
             {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
           </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#09090b] border-r border-slate-200 dark:border-[#212124] flex flex-col z-[60] transition-transform duration-300 md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0 shadow-2xl shadow-black/20' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <div className="hidden md:flex items-center gap-3 mb-8 cursor-pointer pl-2" onClick={() => { setSelectedTicker(null); setCurrentView('dashboard'); }}>
             <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <Zap size={16} className="text-white fill-white" />
             </div>
             <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">SignalHub</span>
          </div>

          <div className="mb-4 px-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Platform</div>
          <nav className="space-y-1">
            <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
            <NavItem id="watchlist" label="Watchlists" icon={List} />
            <NavItem id="alerts" label="Alerts" icon={Bell} />
          </nav>

          <div className="mt-8 mb-4 px-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Intelligence</div>
          <nav className="space-y-1">
            <NavItem id="contradictions" label="Contradictions" icon={AlertTriangle} />
            <NavItem id="analyse" label="Narrative Engine" icon={MessageSquareText} />
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-200 dark:border-white/5">
           <div 
             onClick={() => setIsProfileOpen(true)}
             className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group"
           >
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center font-medium text-sm text-slate-600 dark:text-zinc-300 group-hover:bg-slate-300 dark:group-hover:bg-zinc-700 transition-colors">
                {user.firstName?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                 <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.firstName || 'User'}</div>
                 <div className="text-xs text-slate-500 dark:text-zinc-500 truncate">{user.email}</div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); logout(); }} 
                className="text-slate-400 hover:text-slate-900 dark:text-zinc-600 dark:hover:text-white transition-colors"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
           </div>
           
           <div className="flex items-center gap-1 mt-2">
             <button 
               onClick={() => { setCurrentView('settings'); setSelectedTicker(null); setSidebarOpen(false); }}
               className="flex-1 flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300 transition-colors"
             >
               <Settings size={14} /> Settings
             </button>
             <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800"></div>
             <button 
               onClick={() => setIsHelpOpen(true)}
               className="flex-1 flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300 transition-colors"
             >
               <HelpCircle size={14} /> Help
             </button>
           </div>
        </div>
      </aside>

      {/* Content Canvas */}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative pt-16 md:pt-0">
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto h-full flex flex-col">
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
              <div className="h-full flex flex-col items-center justify-center text-center gap-6 animate-in fade-in duration-1000">
                <Activity className="text-slate-300 dark:text-zinc-800" size={80} />
                <h2 className="text-xl font-medium text-slate-400 dark:text-zinc-500">System Initializing...</h2>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Desktop Search FAB */}
      <div className="hidden md:block fixed bottom-8 right-8 z-[70]">
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all ring-4 ring-white dark:ring-[#09090b]"
        >
          <Search size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default App;
