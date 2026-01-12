
import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, Plus, Cpu } from 'lucide-react';
import { Ticker } from '../types';
import { api } from '../services/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (t: Ticker) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.market.search(query);
        setResults(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-[#0a0a0b] border border-[#212124] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative z-10">
        <div className="p-6 border-b border-[#212124] flex items-center gap-4">
          <Search size={24} className="text-slate-500" />
          <input 
            autoFocus
            type="text"
            placeholder="Asset Lookup (Symbol or Name)..."
            className="flex-1 bg-transparent border-none outline-none text-xl font-bold tracking-tight text-white placeholder:text-slate-700"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-400"><X size={24} /></button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={32} /></div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map(ticker => (
                <div 
                  key={ticker.id}
                  onClick={() => onAdd(ticker)}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-lg">{ticker.symbol[0]}</div>
                    <div>
                      <div className="font-extrabold text-lg text-white">{ticker.symbol}</div>
                      <div className="text-xs text-slate-500">{ticker.companyName} · {ticker.sector}</div>
                    </div>
                  </div>
                  <Plus size={24} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="p-12 text-center text-slate-500 italic">No assets found for "{query}"</div>
          ) : (
            <div className="p-12 text-center text-slate-600 space-y-2 opacity-50">
               <Cpu size={40} className="mx-auto" />
               <p className="text-sm font-bold uppercase tracking-widest">Global Scan Active</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
