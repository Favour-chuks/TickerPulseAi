
import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  ArrowUpRight,
  ShieldAlert,
  Activity,
  BarChart3,
  Clock,
  ChevronLeft,
  Sparkles,
  Target,
  Maximize2
} from 'lucide-react';
import { VolumeSpike, Ticker } from '../../../shared/types';
import { generateDivergenceHypothesis } from '../../../shared/services/geminiService';
import { api } from '../../../shared/services/api';
import { Card, Badge } from '../../../shared/components/Shared';

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
    setHypothesis('');
  };

  const handleCloseMobileDetail = () => {
    setIsMobileDetailOpen(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-rose-500 shadow-rose-500/50';
      case 'high': return 'bg-orange-500 shadow-orange-500/50';
      case 'medium': return 'bg-amber-500 shadow-amber-500/50';
      default: return 'bg-slate-500 shadow-slate-500/50';
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] lg:h-[calc(100vh-6rem)] overflow-hidden flex flex-col lg:flex-row gap-6 animate-in fade-in duration-700 relative">
      {/* LEFT PANEL: FEED */}
      <div className={`
        flex-col h-full lg:w-1/3 min-w-[320px] transition-all duration-300
        ${isMobileDetailOpen ? 'hidden lg:flex' : 'flex w-full'}
      `}>
        <Card className="h-full flex flex-col p-0 overflow-hidden bg-white dark:bg-[#18181b] border-none shadow-xl shadow-slate-200/50 dark:shadow-black/20 ring-1 ring-slate-200 dark:ring-[#2d2d31]">
          {/* Feed Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-[#2d2d31] flex items-center justify-between bg-white dark:bg-[#18181b] z-10 sticky top-0">
            <div>
              <h2 className="font-black text-slate-900 dark:text-white text-lg tracking-tight flex items-center gap-2">
                <Activity size={20} className="text-brand-600 dark:text-brand-500" />
                Live Signals
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time volume anomaly detection</p>
            </div>
            <div className="flex gap-2">
               <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-[#27272a] text-xs font-bold text-slate-600 dark:text-slate-300">
                 {spikes.length}
               </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 bg-slate-50/50 dark:bg-[#0a0a0b]">
            {spikes.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                 <Zap size={48} className="mb-4" />
                 <span className="text-sm font-medium">Scanning Market...</span>
               </div>
            ) : (
                spikes.map((spike) => (
                  <div 
                    key={spike.id} 
                    onClick={() => handleSelectSpike(spike)}
                    className={`
                      relative p-4 rounded-xl cursor-pointer transition-all duration-200 group border
                      ${selectedSpike?.id === spike.id 
                        ? 'bg-white dark:bg-[#18181b] border-brand-500/30 shadow-lg shadow-brand-500/10 z-10' 
                        : 'bg-white dark:bg-[#18181b] border-transparent hover:border-slate-200 dark:hover:border-[#2d2d31] shadow-sm hover:shadow-md'}
                    `}
                  >
                    {/* Severity Strip */}
                    <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all duration-300 ${getSeverityColor(spike.severity)} ${selectedSpike?.id === spike.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`} />

                    <div className="pl-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                              {spike.tickerSymbol}
                            </h3>
                            {!spike.hasCatalyst && (
                              <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-500 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-500/20">
                                <ShieldAlert size={10} /> Divergence
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                            Detected {spike.detectedAt}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <div className={`text-sm font-mono font-bold flex items-center justify-end gap-1 ${spike.priceChangePercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {spike.priceChangePercent > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(spike.priceChangePercent)}%
                          </div>
                          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                            ${spike.priceAtSpike}
                          </div>
                        </div>
                      </div>

                      {/* Metrics Footer */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-[#27272a]">
                         <div className="flex gap-4">
                            <div className="flex flex-col">
                               <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Volume</span>
                               <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">{(spike.volume / 1000000).toFixed(1)}M</span>
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Z-Score</span>
                               <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">{spike.zScore}</span>
                            </div>
                         </div>
                         <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                           spike.deviationMultiple > 3 
                             ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' 
                             : 'bg-slate-100 text-slate-600 dark:bg-[#27272a] dark:text-slate-400'
                         }`}>
                           {spike.deviationMultiple}x Avg
                         </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>
      </div>

      {/* RIGHT PANEL: DETAIL */}
      <div className={`
        flex-col h-full lg:w-2/3 transition-all duration-300
        ${isMobileDetailOpen ? 'flex w-full absolute inset-0 z-20 bg-gray-50 dark:bg-[#09090b] lg:static lg:bg-transparent lg:z-auto' : 'hidden lg:flex'}
      `}>
         <Card className="h-full flex flex-col bg-white dark:bg-[#18181b] p-0 border-none shadow-xl shadow-slate-200/50 dark:shadow-black/20 ring-1 ring-slate-200 dark:ring-[#2d2d31] overflow-hidden">
            {selectedSpike ? (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="relative p-6 md:p-8 border-b border-slate-100 dark:border-[#2d2d31] overflow-hidden">
                  {/* Background Accents */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                  
                  {/* Mobile Back */}
                  <div className="lg:hidden mb-6">
                    <button 
                      onClick={handleCloseMobileDetail}
                      className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                    >
                      <ChevronLeft size={16} /> Signals
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                    <div className="flex items-start gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-3xl shadow-xl shadow-slate-900/20 dark:shadow-none">
                        {selectedSpike.tickerSymbol[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                            {selectedSpike.tickerSymbol}
                          </h1>
                          <Badge variant={selectedSpike.severity === 'critical' ? 'danger' : 'warning'} className="uppercase">
                            {selectedSpike.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                          <span>Volume Anomaly Detected</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="font-mono text-slate-700 dark:text-slate-300">{selectedSpike.detectedAt}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onSelectTicker({id: selectedSpike.id, symbol: selectedSpike.tickerSymbol, companyName: '', sector: ''})} 
                      className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#27272a] border border-slate-200 dark:border-[#3f3f46] rounded-xl hover:border-brand-500 dark:hover:border-brand-500 transition-all shadow-sm"
                    >
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400">Open Terminal</span>
                      <Maximize2 size={14} className="text-slate-400 group-hover:text-brand-500" />
                    </button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {[
                      { label: 'Vol Deviation', value: `${selectedSpike.deviationMultiple}x`, icon: Activity, color: 'text-brand-600 dark:text-brand-400' },
                      { label: 'Total Volume', value: `${(selectedSpike.volume / 1000000).toFixed(1)}M`, icon: BarChart3, color: 'text-slate-600 dark:text-slate-400' },
                      { label: 'Price Action', value: `$${selectedSpike.priceAtSpike}`, sub: `${selectedSpike.priceChangePercent}%`, icon: TrendingUp, color: selectedSpike.priceChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-600' },
                      { label: 'Z-Score', value: selectedSpike.zScore, icon: Target, color: 'text-amber-600' },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 bg-white/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <stat.icon size={14} className="text-slate-400" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</span>
                        </div>
                        <div className={`text-2xl font-mono font-bold tracking-tight ${stat.color}`}>
                          {stat.value}
                          {stat.sub && <span className="text-sm ml-2 opacity-80">{stat.sub}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Scrollable Content */}
                <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar space-y-8 bg-slate-50/30 dark:bg-[#0a0a0b]/30">
                  
                  {/* AI Analysis Card */}
                  <div className="relative overflow-hidden rounded-2xl border border-brand-200 dark:border-brand-500/20 bg-gradient-to-br from-white to-brand-50/50 dark:from-[#18181b] dark:to-[#2e1065]/20 shadow-sm">
                    <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10">
                      <Sparkles size={120} />
                    </div>
                    
                    <div className="p-6 md:p-8 relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
                            <Sparkles size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">AI Narrative Hypothesis</h3>
                            <p className="text-xs text-slate-500">Generative interpretation of market divergence</p>
                          </div>
                        </div>
                        {hypothesis && <Badge variant="success">Confidence: High</Badge>}
                      </div>

                      {loadingHypothesis ? (
                        <div className="py-12 flex flex-col items-center justify-center text-brand-600 dark:text-brand-400 gap-4">
                          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm font-medium animate-pulse">Synthesizing Order Flow & News...</span>
                        </div>
                      ) : hypothesis ? (
                        <div className="bg-white/60 dark:bg-black/20 rounded-xl p-6 border border-brand-100 dark:border-brand-500/10">
                          <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            "{hypothesis}"
                          </p>
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                            Generate a deep-dive analysis correlating this {selectedSpike.deviationMultiple}x volume spike with dark pool routing and SEC filing sentiment.
                          </p>
                          <button 
                            onClick={() => handleAnalyze(selectedSpike)}
                            className="bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10 dark:shadow-none inline-flex items-center gap-2"
                          >
                            <Sparkles size={16} /> Generate Insight
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Risk Analysis */}
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <ShieldAlert size={18} className="text-rose-500" />
                      Probabilistic Risk Factors
                    </h3>
                    <div className="grid gap-4">
                      {[
                        { factor: 'Institutional Flow', prob: 82, color: 'bg-emerald-500', desc: 'High alignment with block trade execution.' },
                        { factor: 'Short Squeeze Potential', prob: 65, color: 'bg-amber-500', desc: 'Moderate float tightening observed.' },
                        { factor: 'Dark Pool Variance', prob: 45, color: 'bg-indigo-500', desc: 'Standard deviation within acceptable bounds.' },
                      ].map((f, i) => (
                        <div key={i} className="group p-4 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#2d2d31] rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{f.factor}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{f.desc}</div>
                            </div>
                            <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-[#27272a] px-2 py-1 rounded-md text-xs">
                              {f.prob}%
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-[#27272a] rounded-full overflow-hidden">
                            <div className={`h-full ${f.color} rounded-full transition-all duration-1000 ease-out w-0 group-hover:w-[var(--target-width)]`} style={{ '--target-width': `${f.prob}%` } as React.CSSProperties}></div>
                            {/* Fallback for immediate render without hover if needed, but styling above animates on hover */}
                            <div className={`h-full ${f.color} rounded-full`} style={{ width: `${f.prob}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-600 text-center p-8 bg-slate-50/50 dark:bg-[#0a0a0b]">
                <div className="w-24 h-24 bg-white dark:bg-[#18181b] rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-200 dark:border-[#2d2d31]">
                  <Activity className="w-10 h-10 opacity-20" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Awaiting Signal Selection</h3>
                <p className="text-sm max-w-[280px] mt-2 leading-relaxed text-slate-500">
                  Select a divergence signal from the feed to initialize the deep-dive inference engine.
                </p>
              </div>
            )}
         </Card>
      </div>
    </div>
  );
};

export default DashboardView;
