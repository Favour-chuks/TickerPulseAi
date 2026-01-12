
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronRight,
  Loader2,
  Edit2,
  X,
  Save,
  MoreVertical,
  Activity
} from 'lucide-react';
import { Watchlist, Ticker } from '../types';
import { api } from '../services/api';
import { Card } from './Shared';

const WatchlistView = ({ onSelectTicker }: { onSelectTicker: (t: Ticker) => void }) => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal State
  const [showCreate, setShowCreate] = useState(false);
  const [newWlName, setNewWlName] = useState('');

  // Edit Mode State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Add Item State
  const [addingToId, setAddingToId] = useState<string | null>(null);
  const [newItemSymbol, setNewItemSymbol] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.watchlist.getAll();
      // The API returns { count, watchlists }, we need to handle that or array
      const list = Array.isArray(res) ? res : res.watchlists || [];
      
      // Fetch items for each watchlist to hydrate the UI fully (since getAll usually returns summary)
      // Optimally backend would return full tree, but if not we fetch details:
      const fullDetails = await Promise.all(list.map(async (wl: Watchlist) => {
        try {
          const details = await api.watchlist.getItems(wl.id);
          return { ...wl, items: details.tickers || [] };
        } catch {
          return wl;
        }
      }));
      
      setWatchlists(fullDetails);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWlName.trim()) return;
    try {
      await api.watchlist.create(newWlName);
      setNewWlName('');
      setShowCreate(false);
      load();
    } catch (e) { console.error(e); }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await api.watchlist.update(id, editName);
      setEditingId(null);
      load();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this watchlist? This action cannot be undone.")) {
      try {
        await api.watchlist.delete(id);
        load();
      } catch (e) { console.error(e); }
    }
  };

  const handleAddItem = async (watchlistId: string) => {
    if (!newItemSymbol.trim()) return;
    try {
      await api.watchlist.addItem(watchlistId, newItemSymbol.toUpperCase());
      setNewItemSymbol('');
      setAddingToId(null);
      load();
    } catch (e) { 
      alert("Could not add ticker. Ensure symbol is valid.");
    }
  };

  const handleRemoveItem = async (watchlistId: string, symbol: string) => {
    try {
      await api.watchlist.removeItem(watchlistId, symbol);
      load();
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="h-[50vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500" size={32} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Watchlist Manager</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Organize assets into custom high-priority monitoring groups.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black font-bold text-sm hover:opacity-90 transition-all"
        >
          <Plus size={16} /> New List
        </button>
      </header>

      {showCreate && (
        <div className="bg-white dark:bg-[#121214] border border-emerald-500/30 rounded-xl p-6 animate-in slide-in-from-top-2 shadow-lg">
          <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-500 uppercase mb-4">Create New Watchlist</h3>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
             <input 
               autoFocus
               type="text" 
               placeholder="E.g., 'Semiconductor Shorts' or 'AI Longs'" 
               className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-[#212124] rounded-lg px-4 py-2 outline-none focus:border-emerald-500 text-slate-900 dark:text-white text-sm"
               value={newWlName}
               onChange={e => setNewWlName(e.target.value)}
             />
             <div className="flex gap-2">
               <button type="submit" className="flex-1 sm:flex-none px-6 py-2 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black font-bold rounded-lg text-sm hover:opacity-90">Save</button>
               <button type="button" onClick={() => setShowCreate(false)} className="flex-1 sm:flex-none px-6 py-2 bg-slate-100 dark:bg-[#212124] text-slate-600 dark:text-slate-300 font-bold rounded-lg text-sm hover:bg-slate-200 dark:hover:text-white">Cancel</button>
             </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {watchlists.map(wl => (
          <Card key={wl.id} className="relative group flex flex-col min-h-[300px]">
            {/* Watchlist Header */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100 dark:border-[#212124]">
               <div className="flex-1 mr-4">
                 {editingId === wl.id ? (
                   <div className="flex items-center gap-2">
                     <input 
                       className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-[#2d2d31] rounded px-2 py-1 text-slate-900 dark:text-white font-bold text-lg w-full"
                       value={editName}
                       onChange={e => setEditName(e.target.value)}
                       autoFocus
                     />
                     <button onClick={() => handleEdit(wl.id)} className="p-1.5 bg-emerald-500 text-white dark:text-black rounded hover:opacity-90"><Save size={14} /></button>
                     <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-200 dark:bg-[#212124] text-slate-500 dark:text-slate-400 rounded hover:text-slate-900 dark:hover:text-white"><X size={14} /></button>
                   </div>
                 ) : (
                   <div className="group/title flex items-center gap-3">
                     <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">{wl.name}</h3>
                     <button 
                       onClick={() => { setEditingId(wl.id); setEditName(wl.name); }}
                       className="opacity-0 group-hover/title:opacity-100 text-slate-400 hover:text-emerald-500 transition-opacity"
                     >
                       <Edit2 size={14} />
                     </button>
                   </div>
                 )}
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                   {new Date(wl.created_at).toLocaleDateString()} · {wl.items?.length || 0} Assets
                 </p>
               </div>
               <button 
                 onClick={() => handleDelete(wl.id)}
                 className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
               >
                 <Trash2 size={18} />
               </button>
            </div>
            
            {/* Ticker List */}
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px]">
              {wl.items && wl.items.length > 0 ? wl.items.map(ticker => (
                <div 
                  key={ticker.id} 
                  className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-[#18181b]/50 border border-transparent hover:border-slate-200 dark:hover:border-[#2d2d31] group/item transition-all"
                >
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTicker(ticker)}>
                    <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500 font-bold text-xs">{ticker.symbol[0]}</div>
                    <div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{ticker.symbol}</span>
                      {ticker.sector && <p className="text-[10px] text-slate-500">{ticker.sector}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleRemoveItem(wl.id, ticker.symbol)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={14} className="text-slate-400 dark:text-slate-600" />
                  </div>
                </div>
              )) : (
                <div className="h-32 flex flex-col items-center justify-center text-slate-500 dark:text-slate-600 text-xs italic border-2 border-dashed border-slate-200 dark:border-[#212124] rounded-xl bg-slate-50 dark:bg-[#0a0a0b]/30">
                  <Activity size={24} className="mb-2 opacity-20" />
                  No assets being monitored.
                </div>
              )}
            </div>

            {/* Add Item Footer */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#212124]">
              {addingToId === wl.id ? (
                <div className="flex items-center gap-2 animate-in fade-in">
                  <input 
                    className="flex-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-[#2d2d31] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    placeholder="Enter Symbol (e.g. AMD)"
                    autoFocus
                    value={newItemSymbol}
                    onChange={e => setNewItemSymbol(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleAddItem(wl.id)}
                  />
                  <button onClick={() => handleAddItem(wl.id)} className="px-3 py-2 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black text-xs font-bold rounded-lg hover:opacity-90">Add</button>
                  <button onClick={() => setAddingToId(null)} className="px-3 py-2 bg-slate-200 dark:bg-[#212124] text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg hover:text-slate-900 dark:hover:text-white">Cancel</button>
                </div>
              ) : (
                <button 
                  onClick={() => setAddingToId(wl.id)}
                  className="w-full py-2 border border-dashed border-slate-200 dark:border-[#2d2d31] rounded-lg text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-500 hover:border-emerald-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Add Asset
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WatchlistView;
