
import React, { useState, useRef, useEffect } from 'react';
import { 
  AlertTriangle, 
  MessageSquare, 
  Zap, 
  ArrowRight, 
  ShieldAlert, 
  GanttChart, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Newspaper, 
  ChevronDown, 
  ChevronUp, 
  BrainCircuit,
  Plus 
} from 'lucide-react';
import { Contradiction } from '../types';
import { Badge } from './Shared';

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

const TrendIcon = ({ trend }: { trend?: string }) => {
  if (trend === 'bullish') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  if (trend === 'bearish') return <TrendingDown className="w-4 h-4 text-rose-500" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
};

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
    // Dynamically calculate height for smooth transition
    setHeight(expanded && contentRef.current ? `${contentRef.current.scrollHeight}px` : '0px');
  }, [expanded]);

  const handleValidate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValidated(true);
    // In a real app, this would call API
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWatchlist(data.tickerSymbol);
  };

  return (
    <div className={`
      bg-gradient-to-b from-white to-slate-50/80 dark:from-[#121214] dark:to-[#121214] 
      border rounded-2xl overflow-hidden flex flex-col transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-sm
      ${validated 
        ? 'border-emerald-500/30' 
        : 'border-slate-200/80 dark:border-[#212124] hover:border-rose-300 dark:hover:border-rose-500/30'}
    `}>
       {/* Card Header - Always Visible */}
       <div className="p-6 border-b border-slate-100 dark:border-[#212124] flex items-center justify-between bg-white dark:bg-[#1c1c1f]/50 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase shadow-sm ${
              data.severity === 'critical' ? 'bg-rose-500 text-white dark:text-black' :
              data.severity === 'high' ? 'bg-amber-500 text-black' :
              'bg-sky-500 text-black'
            }`}>
              {data.severity}
            </span>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                {data.tickerSymbol} 
                <span className="text-slate-300 dark:text-slate-500 font-light text-sm">//</span> 
                <span className="text-base font-medium">{data.contradiction_type.replace('_', ' ')}</span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {validated && (
              <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold uppercase tracking-wider animate-in fade-in duration-300">
                <CheckCircle2 size={14} /> Validated
              </div>
            )}
            <span className="hidden sm:block text-[10px] font-mono text-slate-500 dark:text-slate-600">{data.detected_at}</span>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleAdd}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors z-10"
                title="Add to Watchlist"
              >
                <Plus size={18} />
              </button>
              <div className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                <ChevronDown size={18} className="text-slate-400" />
              </div>
            </div>
          </div>
       </div>

       {/* Static Content - Summary */}
       <div className="p-6 pb-0 space-y-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            {data.explanation}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <div className="p-4 rounded-xl bg-white dark:bg-[#0a0a0b] border border-slate-200 dark:border-[#212124] relative min-h-[100px] shadow-sm">
              <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-[#121214] text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase border border-slate-200 dark:border-[#212124] rounded-md">Previous Narrative</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic pt-2">"{data.quote_1}"</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#0a0a0b] border border-rose-200 dark:border-rose-500/20 relative min-h-[100px] shadow-sm">
              <span className="absolute -top-3 left-4 px-2 bg-white dark:bg-[#121214] text-[9px] font-bold text-rose-500 dark:text-rose-400 uppercase border border-slate-200 dark:border-[#212124] rounded-md">Contradictory Statement</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic pt-2">"{data.quote_2}"</p>
            </div>
            {/* Divider Icon */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:flex hidden z-10">
              <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white dark:text-black border-4 border-white dark:border-[#121214] shadow-md">
                <Zap className="w-4 h-4 fill-current" />
              </div>
            </div>
          </div>
       </div>

       {/* Expanded Content - Detailed Metrics */}
       <div 
         ref={contentRef}
         style={{ height }}
         className="overflow-hidden transition-[height] duration-300 ease-in-out px-6"
       >
          <div className="pt-6 border-t border-slate-100 dark:border-[#212124] grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pb-2">
            {/* Market Context */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Context</h4>
              <div className="flex items-center gap-4 p-3 bg-white dark:bg-[#0a0a0b] rounded-lg border border-slate-200/50 dark:border-transparent">
                 <div className="flex items-center gap-2">
                    <TrendIcon trend={data.market_trend_before} />
                    <span className="text-xs font-medium capitalize text-slate-600 dark:text-slate-300">{data.market_trend_before}</span>
                 </div>
                 <ArrowRight className="w-3 h-3 text-slate-400" />
                 <div className="flex items-center gap-2">
                    <TrendIcon trend={data.market_trend_after} />
                    <span className={`text-xs font-bold capitalize ${data.market_trend_after === 'bullish' ? 'text-emerald-500' : 'text-rose-500'}`}>{data.market_trend_after}</span>
                 </div>
              </div>
            </div>

            {/* Impact Metrics */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Impact Analysis</h4>
              <div className="grid grid-cols-2 gap-2">
                 <div className="p-2 bg-white dark:bg-[#0a0a0b] rounded-lg border border-slate-200/50 dark:border-transparent">
                    <div className="text-[9px] text-slate-500">Price Δ</div>
                    <div className={`text-sm font-mono font-bold ${data.price_impact && data.price_impact > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {data.price_impact && data.price_impact > 0 ? '+' : ''}{data.price_impact}%
                    </div>
                 </div>
                 <div className="p-2 bg-white dark:bg-[#0a0a0b] rounded-lg border border-slate-200/50 dark:border-transparent">
                    <div className="text-[9px] text-slate-500">Vol Δ</div>
                    <div className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200">
                      {data.volume_impact}x
                    </div>
                 </div>
              </div>
            </div>

            {/* Confidence & News */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Confidence</h4>
              <div className="flex items-center gap-2 mb-2">
                 <div className="flex-1 h-2 bg-slate-100 dark:bg-[#212124] rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(data.gemini_confidence || 0) * 100}%` }}></div>
                 </div>
                 <span className="text-xs font-mono font-bold text-indigo-500">{Math.round((data.gemini_confidence || 0) * 100)}%</span>
              </div>
              {data.news_headline && (
                <div className="flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  <Newspaper className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span className="italic line-clamp-2">"{data.news_headline}"</span>
                </div>
              )}
            </div>
          </div>
       </div>

       {/* Footer Actions - Always Visible */}
       <div className="p-6 bg-slate-50/50 dark:bg-[#0a0a0b] border-t border-slate-100 dark:border-[#212124] flex items-center justify-between mt-auto">
          <div className="flex items-center gap-4 text-slate-500">
            <div className="flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4" />
              <span className="text-xs font-bold">SignalHub AI Analysis</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white dark:bg-[#1c1c1f] border border-slate-200 dark:border-[#2d2d31] rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252529] transition-all shadow-sm">
              Investigate
            </button>
            {!validated && (
              <button 
                onClick={handleValidate}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10 dark:shadow-none"
              >
                <CheckCircle2 size={14} /> Validate
              </button>
            )}
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
      <div className="bg-gradient-to-r from-rose-50 to-white dark:from-rose-500/10 dark:to-transparent border border-rose-200/60 dark:border-rose-500/20 p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-500/20 flex-shrink-0">
            <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-white dark:text-black" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Narrative Contradictions</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gemini detected {MOCK_CONTRADICTIONS.length} high-severity inconsistencies in the last 24 hours.</p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-2 bg-white dark:bg-[#1c1c1f] p-4 rounded-xl border border-slate-200 dark:border-[#2d2d31] shadow-sm">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">AUTO_VALIDATION_ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {MOCK_CONTRADICTIONS.map((c) => (
          <ContradictionCard key={c.id} data={c} onAddToWatchlist={onAddToWatchlist} />
        ))}
      </div>
    </div>
  );
};

export default ContradictionView;
