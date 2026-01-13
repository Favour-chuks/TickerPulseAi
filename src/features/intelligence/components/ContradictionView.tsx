
import React, { useState, useRef, useEffect } from 'react';
import { 
  AlertTriangle, 
  Zap, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Newspaper, 
  ChevronDown, 
  BrainCircuit,
  Plus,
  History,
  AlertCircle
} from 'lucide-react';
import { Contradiction } from '../../../shared/types';

const MOCK_CONTRADICTIONS: Contradiction[] = [
  {
    id: 1,
    tickerSymbol: 'TSLA',
    contradiction_type: 'guidance_miss',
    explanation: "Management explicitly committed to a 2025 rollout for the $25k model in Q1 10-Q, but signaled a 'shift in priority' during the recent unannounced factory tour press release.",
    severity: 'critical',
    quote_1: "The next-generation vehicle platform remains on track for early 2025 production.",
    quote_2: "We are re-evaluating the timeline for entry-level platforms to focus on Robotaxi autonomy.",
    detected_at: '2 hours ago',
    market_trend_before: 'bullish',
    market_trend_after: 'bearish',
    price_impact: -4.2,
    volume_impact: 2.5,
    gemini_confidence: 0.92,
    is_validated: false,
    news_headline: "Tesla Shares Slide as Strategy Pivot Confuses Analysts"
  },
  {
    id: 2,
    tickerSymbol: 'META',
    contradiction_type: 'strategy_change',
    explanation: "CFO signaled hiring freeze for FY25, but 8-K filing shows 15% increase in compute-infrastructure recruitment budget.",
    severity: 'medium',
    quote_1: "Expect headcount to remain flat throughout the next fiscal year.",
    quote_2: "Expanding infrastructure engineering team by 2,000 to support Llama-4 training requirements.",
    detected_at: 'Yesterday',
    market_trend_before: 'neutral',
    market_trend_after: 'bullish',
    price_impact: 1.8,
    volume_impact: 1.2,
    gemini_confidence: 0.78,
    is_validated: true,
    validation_notes: "Confirmed by subsequent earnings call Q&A."
  }
];

interface ContradictionCardProps {
  data: Contradiction;
  onAddToWatchlist: (symbol: string) => void;
}

const ContradictionCard: React.FC<ContradictionCardProps> = ({ data, onAddToWatchlist }) => {
  const [expanded, setExpanded] = useState(false);
  const [validated, setValidated] = useState(data.is_validated);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string>('0px');

  useEffect(() => {
    setHeight(expanded && contentRef.current ? `${contentRef.current.scrollHeight}px` : '0px');
  }, [expanded]);

  const handleValidate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValidated(true);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWatchlist(data.tickerSymbol);
  };

  const getSeverityColors = (s: string) => {
    switch (s) {
      case 'critical': return 'bg-rose-500 text-white shadow-rose-500/30';
      case 'high': return 'bg-amber-500 text-white shadow-amber-500/30';
      case 'medium': return 'bg-orange-400 text-white shadow-orange-400/30';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className={`
      group relative flex flex-col rounded-2xl border transition-all duration-300
      bg-white dark:bg-[#121214]
      ${validated 
        ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
        : 'border-slate-200 dark:border-[#2d2d31] hover:border-slate-300 dark:hover:border-[#3f3f46] hover:shadow-lg dark:hover:shadow-black/50'}
    `}>
       {/* Primary Card Face */}
       <div className="p-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          
          {/* Header Row: Severity & Ticker */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-lg shrink-0
                ${getSeverityColors(data.severity)}
              `}>
                <AlertTriangle size={20} fill="currentColor" className="opacity-90" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  {data.tickerSymbol}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {data.contradiction_type.replace('_', ' ')}
                  </span>
                  <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                    {data.detected_at}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
               {validated ? (
                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-100 dark:border-emerald-500/20">
                   <CheckCircle2 size={14} /> Validated
                 </div>
               ) : (
                 <button 
                   onClick={handleAdd}
                   className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                   title="Add to Watchlist"
                 >
                   <Plus size={20} />
                 </button>
               )}
               <button className={`p-2 transition-transform duration-300 text-slate-400 ${expanded ? 'rotate-180' : ''}`}>
                 <ChevronDown size={20} />
               </button>
            </div>
          </div>

          {/* Explanation - The "Hook" */}
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
            {data.explanation}
          </p>
       </div>

       {/* Comparisons (Always visible but styled to look like a snippet, expanding reveals more) */}
       <div className="px-5 pb-5">
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            
            {/* Left: Previous Statement */}
            <div className="relative p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2">
                <History size={12} className="text-indigo-500 shrink-0" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Original Narrative</span>
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 italic leading-relaxed flex-1">
                "{data.quote_1}"
              </p>
            </div>

            {/* Right: New Statement */}
            <div className="relative p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={12} className="text-rose-500 shrink-0" />
                <span className="text-[10px] font-black text-rose-400 dark:text-rose-300 uppercase tracking-widest">New Reality</span>
              </div>
              <p className="text-xs font-medium text-slate-900 dark:text-white italic leading-relaxed flex-1">
                "{data.quote_2}"
              </p>
            </div>

            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
               <div className="bg-white dark:bg-[#121214] p-1.5 rounded-full border border-slate-200 dark:border-[#2d2d31] shadow-sm">
                 <ArrowRight size={14} className="text-slate-400" />
               </div>
            </div>
          </div>
       </div>

       {/* Expanded Details */}
       <div 
         ref={contentRef}
         style={{ height }}
         className="overflow-hidden transition-[height] duration-300 ease-in-out px-6"
       >
          <div className="pt-6 border-t border-slate-100 dark:border-[#212124] grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pb-2">
            
            {/* Metric 1: Market Context - Updated Visuals */}
            <div className="space-y-1 min-w-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Market Reaction</div>
              <div className="flex items-center justify-between gap-1 p-2 bg-white dark:bg-[#0a0a0b] rounded-lg border border-slate-200/50 dark:border-transparent w-full h-[42px] overflow-hidden">
                 
                 {/* Before Pill */}
                 <div className="flex items-center justify-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shrink-1 min-w-0 max-w-[45%]">
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 truncate block w-full text-center">
                        {data.market_trend_before}
                    </span>
                 </div>

                 {/* Connector */}
                 <div className="flex-1 flex items-center justify-center min-w-[16px] shrink-0">
                    <div className="h-px w-full bg-slate-200 dark:bg-white/10 relative">
                       <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 dark:text-slate-600" />
                    </div>
                 </div>

                 {/* After Pill */}
                 <div className={`flex items-center justify-center gap-1.5 px-2 py-1 rounded-md border shrink-1 min-w-0 max-w-[45%] ${
                    data.market_trend_after === 'bullish' 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' 
                      : 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20'
                 }`}>
                    {data.market_trend_after === 'bullish' 
                      ? <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" /> 
                      : <TrendingDown className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                    }
                    <span className={`text-[10px] font-black uppercase truncate block w-full ${
                      data.market_trend_after === 'bullish' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                    }`}>
                      {data.market_trend_after}
                    </span>
                 </div>
              </div>
            </div>

            {/* Metric 2: Impact Analysis */}
            <div className="space-y-1 min-w-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Impact Analysis</div>
              <div className="grid grid-cols-2 gap-2 h-[42px]">
                 <div className="px-3 flex flex-col justify-center bg-white dark:bg-[#0a0a0b] rounded-lg border border-slate-200/50 dark:border-transparent">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-500 uppercase">Price</span>
                      <span className={`text-xs font-mono font-bold ${data.price_impact && data.price_impact > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {data.price_impact && data.price_impact > 0 ? '+' : ''}{data.price_impact}%
                      </span>
                    </div>
                 </div>
                 <div className="px-3 flex flex-col justify-center bg-white dark:bg-[#0a0a0b] rounded-lg border border-slate-200/50 dark:border-transparent">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-500 uppercase">Vol</span>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                        {data.volume_impact}x
                      </span>
                    </div>
                 </div>
              </div>
            </div>

            {/* Metric 3: AI Confidence */}
            <div className="space-y-1 min-w-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">AI Confidence</div>
              <div className="h-[42px] px-3 flex flex-col justify-center bg-white dark:bg-[#0a0a0b] rounded-lg border border-slate-200/50 dark:border-transparent">
                <div className="flex items-center gap-3">
                   <div className="flex-1 h-1.5 bg-slate-200 dark:bg-[#212124] rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(data.gemini_confidence || 0) * 100}%` }}></div>
                   </div>
                   <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0">{Math.round((data.gemini_confidence || 0) * 100)}%</span>
                </div>
              </div>
            </div>

          </div>

          {/* News Headline */}
          {data.news_headline && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-lg border border-indigo-100 dark:border-indigo-500/10">
              <Newspaper className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-indigo-500" />
              <span className="text-xs italic text-slate-600 dark:text-slate-400 leading-tight">"{data.news_headline}"</span>
            </div>
          )}

          {/* Validation Footer */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-2 text-slate-400">
               <BrainCircuit size={14} />
               <span className="text-[10px] font-bold uppercase tracking-wider">AI Inference Engine v2.4</span>
             </div>
             
             <div className="flex gap-3 w-full sm:w-auto">
               {!validated && (
                 <button 
                   onClick={handleValidate}
                   className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:scale-105 transition-transform shadow-lg shadow-slate-900/10"
                 >
                   <CheckCircle2 size={14} /> Confirm Divergence
                 </button>
               )}
             </div>
          </div>
       </div>
    </div>
  );
};

interface ContradictionViewProps {
  onAddToWatchlist: (symbol: string) => void;
}

const ContradictionView: React.FC<ContradictionViewProps> = ({ onAddToWatchlist }) => {
  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500 pb-12">
      <div className="bg-gradient-to-r from-rose-50 to-white dark:from-rose-500/10 dark:to-transparent border border-rose-200/60 dark:border-rose-500/20 p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-500/20 flex-shrink-0">
            <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-white dark:text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Narrative Contradictions</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-xl">
              AI-detected inconsistencies between executive guidance (10-Q/K) and recent public statements (Press/Social).
            </p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-3 bg-white/80 dark:bg-[#1c1c1f] p-3 pr-5 rounded-xl border border-slate-200 dark:border-[#2d2d31] shadow-sm backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Engine Status</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">Active Monitoring</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {MOCK_CONTRADICTIONS.map((c) => (
          <ContradictionCard key={c.id} data={c} onAddToWatchlist={onAddToWatchlist} />
        ))}
      </div>
    </div>
  );
};

export default ContradictionView;
