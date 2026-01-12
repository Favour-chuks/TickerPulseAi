
import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Eye, 
  ArrowUpRight,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { VolumeSpike } from '../types';
import { generateDivergenceHypothesis } from '../services/geminiService';
import { api } from '../services/api';

// Fallback data for demo purposes if backend isn't reachable
const MOCK_SPIKES: VolumeSpike[] = [
  { id: 1, tickerSymbol: 'NVDA', detectedAt: '10:45 AM', volume: 15400000, deviationMultiple: 4.2, zScore: 3.8, priceAtSpike: 142.30, priceChangePercent: 2.1, severity: 'critical', hasCatalyst: false },
  { id: 2, tickerSymbol: 'TSLA', detectedAt: '10:32 AM', volume: 8200000, deviationMultiple: 2.1, zScore: 1.9, priceAtSpike: 254.10, priceChangePercent: -0.8, severity: 'medium', hasCatalyst: true },
];

const DashboardView: React.FC = () => {
  const [spikes, setSpikes] = useState<VolumeSpike[]>(MOCK_SPIKES);
  const [selectedSpike, setSelectedSpike] = useState<VolumeSpike | null>(null);
  const [hypothesis, setHypothesis] = useState<string>('');
  const [loadingHypothesis, setLoadingHypothesis] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await api.alerts.getRecent();
        if (data && Array.isArray(data)) {
          setSpikes(data);
        }
      } catch (err) {
        console.warn("Backend unreachable, using cached signal data");
      }
    };
    fetchAlerts();
    // In a real scenario, you'd use the websocket connection here for live updates
  }, []);

  const handleAnalyze = async (spike: VolumeSpike) => {
    setSelectedSpike(spike);
    setLoadingHypothesis(true);
    try {
      const h = await generateDivergenceHypothesis(spike);
      setHypothesis(h);
    } catch (err) {
      setHypothesis("Error generating hypothesis.");
    } finally {
      setLoadingHypothesis(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Live Alerts Column */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-[#121214] border border-[#212124] rounded-xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-[#212124] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h2 className="font-bold text-white uppercase tracking-wider text-xs">Real-Time Divergence Feed</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500">LAST_REFRESH: {new Date().toLocaleTimeString()}</span>
            </div>
            
            <div className="divide-y divide-[#212124]">
              {spikes.length === 0 ? (
                 <div className="p-8 text-center text-slate-500">No active signals detected. Market is quiet.</div>
              ) : (
                spikes.map((spike) => (
                  <div key={spike.id} className="p-6 hover:bg-[#18181b] transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${spike.severity === 'critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'} border`}>
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-white">{spike.tickerSymbol}</h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${spike.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                              {spike.severity} DIVERGENCE
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            Volume Spike: <span className="text-slate-200 font-semibold">{spike.deviationMultiple}x</span> avg | 
                            Z-Score: <span className="text-slate-200 font-semibold">{spike.zScore}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${spike.priceChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'} flex items-center justify-end gap-1`}>
                          {spike.priceChangePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {spike.priceChangePercent}%
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Price: ${spike.priceAtSpike}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-4">
                      {!spike.hasCatalyst && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                          <ShieldAlert className="w-4 h-4" />
                          NO PUBLIC CATALYST DETECTED
                        </div>
                      )}
                      <button 
                        onClick={() => handleAnalyze(spike)}
                        className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                      >
                        <Eye className="w-4 h-4" />
                        RUN GEMINI ANALYSIS
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="space-y-6">
           <div className="bg-[#121214] border border-[#212124] rounded-xl p-6 h-full min-h-[400px] flex flex-col">
              {selectedSpike ? (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Signal Intelligence</h3>
                    <span className="text-[10px] text-emerald-400 font-mono">READY</span>
                  </div>
                  
                  <div className="bg-[#1c1c1f] rounded-lg p-4 border border-[#2d2d31]">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">Active Analysis: {selectedSpike.tickerSymbol}</p>
                    {loadingHypothesis ? (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-4">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-mono">Querying Gemini Flash 3.0...</p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-300 leading-relaxed italic">
                        "{hypothesis}"
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Risk Factors</h4>
                    {[
                      { factor: 'Institutional Accumulation', prob: 82 },
                      { factor: 'Short Squeeze Potential', prob: 45 },
                      { factor: 'Inside Information Leak', prob: 15 },
                    ].map((f, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400">{f.factor}</span>
                          <span className="text-emerald-400">{f.prob}%</span>
                        </div>
                        <div className="h-1 bg-[#212124] rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${f.prob}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-auto py-3 rounded-lg bg-[#1c1c1f] border border-[#2d2d31] text-xs font-bold text-slate-300 hover:text-white hover:bg-[#252529] transition-all flex items-center justify-center gap-2">
                    <ArrowUpRight className="w-4 h-4" />
                    OPEN TICKER DEEP DIVE
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center px-8">
                  <Activity className="w-12 h-12 mb-4 opacity-10" />
                  <p className="text-sm font-medium">Select a signal from the feed to initiate automated AI intelligence gathering.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
