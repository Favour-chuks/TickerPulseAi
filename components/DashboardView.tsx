
import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Eye, 
  ArrowUpRight,
  ShieldAlert,
  Activity,
  BarChart3,
  Clock,
  Newspaper,
  ChevronLeft,
  X
} from 'lucide-react';
import { VolumeSpike, Ticker } from '../types';
import { generateDivergenceHypothesis } from '../services/geminiService';
import { api } from '../services/api';
import { Card, Badge } from './Shared';

const MOCK_SPIKES: VolumeSpike[] = [
  { id: 1, tickerSymbol: 'NVDA', detectedAt: '10:45 AM', volume: 15400000, deviationMultiple: 4.2, zScore: 3.8, priceAtSpike: 142.30, priceChangePercent: 2.1, severity: 'critical', hasCatalyst: false },
  { id: 2, tickerSymbol: 'TSLA', detectedAt: '10:32 AM', volume: 8200000, deviationMultiple: 2.1, zScore: 1.9, priceAtSpike: 254.10, priceChangePercent: -0.8, severity: 'medium', hasCatalyst: true },
  { id: 3, tickerSymbol: 'AMD', detectedAt: '09:45 AM', volume: 5200000, deviationMultiple: 3.1, zScore: 2.5, priceAtSpike: 112.50, priceChangePercent: 1.2, severity: 'high', hasCatalyst: true },
  { id: 4, tickerSymbol: 'PLTR', detectedAt: '09:30 AM', volume: 12000000, deviationMultiple: 5.5, zScore: 4.1, priceAtSpike: 24.80, priceChangePercent: 5.4, severity: 'critical', hasCatalyst: false },
];

interface DashboardViewProps {
  onSelectTicker: (ticker: Ticker) => void;
  onOpenSearch: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onSelectTicker, onOpenSearch }) => {
  const [spikes, setSpikes] = useState<VolumeSpike[]>(MOCK_SPIKES);
  const [selectedSpike, setSelectedSpike] = useState<VolumeSpike | null>(null);
  const [hypothesis, setHypothesis] = useState<string>('');
  const [loadingHypothesis, setLoadingHypothesis] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await api.market.getSpikes();
        if (data && Array.isArray(data) && data.length > 0) {
          setSpikes(data);
        }
      } catch (err) {
        console.warn("Backend unreachable, using cached signal data");
      }
    };
    fetchAlerts();
  }, []);

  const handleAnalyze = async (spike: VolumeSpike) => {
    // If we are already analyzing this spike, don't re-run unless empty
    if (selectedSpike?.id === spike.id && hypothesis) return;
    
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

  const handleSelectSpike = (spike: VolumeSpike) => {
    setSelectedSpike(spike);
    setIsMobileDetailOpen(true);
    setHypothesis(''); // Reset hypothesis for new selection
  };

  const handleCloseMobileDetail = () => {
    setIsMobileDetailOpen(false);
    // Optional: Keep selectedSpike in state so desktop view doesn't clear, 
    // or clear it if you want to reset state. keeping it is usually better UX.
  };

  return (
    <div className="h-[calc(100vh-5rem)] lg:h-[calc(100vh-6rem)] overflow-hidden flex flex-col lg:flex-row gap-6 animate-in fade-in duration-700 relative">
      
      {/* --- LEFT PANEL: FEED --- */}
      {/* On mobile, hidden if detail is open. On Desktop, always visible as col-span-1 */}
      <div className={`
        flex-col h-full lg:w-1/3 min-w-[320px] transition-all duration-300
        ${isMobileDetailOpen ? 'hidden lg:flex' : 'flex w-full'}
      `}>
        <Card className="h-full flex flex-col p-0 overflow-hidden bg-white dark:bg-[#18181b] border-none shadow-sm ring-1 ring-slate-200 dark:ring-white/5">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#18181b] z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Zap size={18} fill="currentColor" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white">Divergence Feed</h2>
            </div>
            <Badge variant="neutral">{spikes.length} Active</Badge>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {spikes.length === 0 ? (
               <div className="p-8 text-center text-slate-500 dark:text-zinc-500">No active signals detected.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {spikes.map((spike) => (
                  <div 
                    key={spike.id} 
                    onClick={() => handleSelectSpike(spike)}
                    className={`
                      p-5 cursor-pointer transition-all duration-200 group relative overflow-hidden
                      ${selectedSpike?.id === spike.id 
                        ? 'bg-indigo-50 dark:bg-indigo-500/10' 
                        : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'}
                    `}
                  >
                    {/* Active Indicator Strip */}
                    {selectedSpike?.id === spike.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                    )}

                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${spike.severity === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">{spike.tickerSymbol}</h3>
                      </div>
                      <div className={`text-sm font-mono font-bold ${spike.priceChangePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {spike.priceChangePercent > 0 ? '+' : ''}{spike.priceChangePercent}%
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
                        <div className="flex items-center gap-1">
                          <BarChart3 size={12} />
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{spike.deviationMultiple}x</span> Vol
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity size={12} />
                          <span className="font-semibold text-slate-700 dark:text-slate-200">Z: {spike.zScore}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                        {spike.detectedAt}
                      </div>
                      {!spike.hasCatalyst && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md">
                          <ShieldAlert size={10} /> NO CATALYST
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* --- RIGHT PANEL: DETAILS --- */}
      {/* On mobile, visible ONLY if detail open. On Desktop, always visible as col-span-2 */}
      <div className={`
        flex-col h-full lg:w-2/3 transition-all duration-300
        ${isMobileDetailOpen ? 'flex w-full absolute inset-0 z-20 bg-gray-50 dark:bg-[#09090b] lg:static lg:bg-transparent lg:z-auto' : 'hidden lg:flex'}
      `}>
         <Card className="h-full flex flex-col bg-white dark:bg-[#18181b] p-0 border-none shadow-sm ring-1 ring-slate-200 dark:ring-white/5 overflow-hidden">
            {selectedSpike ? (
              <div className="flex flex-col h-full">
                {/* Detail Header */}
                <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#1c1c1f]">
                  {/* Mobile Back Button */}
                  <div className="lg:hidden mb-4">
                    <button 
                      onClick={handleCloseMobileDetail}
                      className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium"
                    >
                      <ChevronLeft size={16} /> Back to Feed
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-xl shadow-lg">
                        {selectedSpike.tickerSymbol[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-2xl text-slate-900 dark:text-white leading-none">{selectedSpike.tickerSymbol} Analysis</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time Anomaly Detection</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={selectedSpike.severity === 'critical' ? 'danger' : 'warning'}>{selectedSpike.severity} Priority</Badge>
                      <button onClick={() => onSelectTicker({id: selectedSpike.id, symbol: selectedSpike.tickerSymbol, companyName: '', sector: ''})} className="p-2 bg-slate-100 dark:bg-white/10 rounded-lg hover:bg-slate-200 dark:hover:bg-white/20 transition-colors text-slate-600 dark:text-white">
                        <ArrowUpRight size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Vol Ratio', value: `${selectedSpike.deviationMultiple}x`, icon: Activity },
                      { label: 'Volume', value: `${(selectedSpike.volume / 1000000).toFixed(1)}M`, icon: BarChart3 },
                      { label: 'Price', value: `$${selectedSpike.priceAtSpike}`, icon: TrendingUp },
                      { label: 'Time', value: selectedSpike.detectedAt, icon: Clock },
                    ].map((stat, i) => (
                      <div key={i} className="p-3 bg-white dark:bg-[#121214] rounded-xl border border-slate-200 dark:border-[#2d2d31] shadow-sm">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <stat.icon size={10} /> {stat.label}
                        </div>
                        <div className="text-sm md:text-lg font-mono font-bold text-slate-900 dark:text-white truncate">
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Scrollable Content */}
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-8">
                  {/* Hypothesis Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Zap size={12} className="text-indigo-500" /> AI Narrative Hypothesis
                      </h4>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/10 dark:to-[#121214] rounded-xl p-5 border border-indigo-100 dark:border-indigo-500/20 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={60} />
                      </div>
                      
                      {loadingHypothesis ? (
                        <div className="flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 py-8 gap-3">
                          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs font-medium">Synthesizing market data...</span>
                        </div>
                      ) : hypothesis ? (
                        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-2">
                          <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                            "{hypothesis}"
                          </p>
                          <div className="mt-4 flex gap-2">
                            <span className="text-[10px] px-2 py-1 bg-white/50 dark:bg-black/20 rounded border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-bold">
                              Confidence: High
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 relative z-10">
                          <p className="text-sm text-slate-500 mb-4 max-w-xs mx-auto">Generate a deep-dive analysis on why this divergence is occurring relative to the sector.</p>
                          <button 
                            onClick={() => handleAnalyze(selectedSpike)}
                            className="text-xs bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                          >
                            Generate AI Insight
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <ShieldAlert size={12} /> Probabilistic Risk Factors
                    </h4>
                    <div className="grid gap-3">
                      {[
                        { factor: 'Institutional Flow', prob: 82, color: 'bg-emerald-500' },
                        { factor: 'Short Squeeze Potential', prob: 65, color: 'bg-amber-500' },
                        { factor: 'Dark Pool Variance', prob: 45, color: 'bg-indigo-500' },
                      ].map((f, i) => (
                        <div key={i} className="p-3 bg-slate-50 dark:bg-[#121214] border border-slate-100 dark:border-[#2d2d31] rounded-lg">
                          <div className="flex justify-between text-xs mb-2 font-bold">
                            <span className="text-slate-700 dark:text-slate-300">{f.factor}</span>
                            <span className="text-slate-900 dark:text-white font-mono">{f.prob}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className={`h-full ${f.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${f.prob}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#18181b]">
                  <button onClick={() => onSelectTicker({id: selectedSpike.id, symbol: selectedSpike.tickerSymbol, companyName: '', sector: ''})} className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 dark:shadow-white/5">
                    Open Full Terminal <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-600 text-center p-8">
                <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Activity className="w-10 h-10 opacity-20" />
                </div>
                <h3 className="text-xl font-bold text-slate-500 dark:text-zinc-500">Awaiting Signal Selection</h3>
                <p className="text-sm max-w-[280px] mt-2 leading-relaxed">
                  Select a divergence signal from the feed on the left to initialize the deep-dive inference engine.
                </p>
              </div>
            )}
         </Card>
      </div>
    </div>
  );
};

export default DashboardView;
