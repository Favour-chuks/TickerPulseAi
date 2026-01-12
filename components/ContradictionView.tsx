
import React from 'react';
import { 
  AlertTriangle, 
  MessageSquare, 
  Zap, 
  ArrowRight,
  ShieldAlert,
  GanttChart
} from 'lucide-react';
import { Contradiction } from '../types';

const MOCK_CONTRADICTIONS: Contradiction[] = [
  {
    id: 1,
    tickerSymbol: 'TSLA',
    type: 'GUIDANCE_REVERSAL',
    explanation: "Management explicitly committed to a 2025 rollout for the $25k model in Q1 10-Q, but signaled a 'shift in priority' during the recent unannounced factory tour press release.",
    severity: 'critical',
    quote1: "The next-generation vehicle platform remains on track for early 2025 production.",
    quote2: "We are re-evaluating the timeline for entry-level platforms to focus on Robotaxi autonomy.",
    detectedAt: '2 hours ago'
  },
  {
    id: 2,
    tickerSymbol: 'META',
    type: 'MARGIN_CONFLICT',
    explanation: "CFO signaled hiring freeze for FY25, but 8-K filing shows 15% increase in compute-infrastructure recruitment budget.",
    severity: 'medium',
    quote1: "Expect headcount to remain flat throughout the next fiscal year.",
    quote2: "Expanding infrastructure engineering team by 2,000 to support Llama-4 training requirements.",
    detectedAt: 'Yesterday'
  }
];

const ContradictionView: React.FC = () => {
  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-500/20">
            <AlertTriangle className="w-10 h-10 text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Narrative Contradictions</h2>
            <p className="text-slate-400">Gemini detected 2 high-severity inconsistencies in the last 24 hours.</p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-2 bg-[#1c1c1f] p-4 rounded-xl border border-[#2d2d31]">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <span className="text-xs font-bold text-slate-300">AUTO_VALIDATION_ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {MOCK_CONTRADICTIONS.map((c) => (
          <div key={c.id} className="bg-[#121214] border border-[#212124] rounded-2xl overflow-hidden flex flex-col hover:border-rose-500/30 transition-all shadow-xl">
             <div className="p-6 border-b border-[#212124] flex items-center justify-between bg-[#1c1c1f]/50">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-rose-500 text-black text-[10px] font-black rounded-lg uppercase">{c.severity}</span>
                  <h3 className="text-xl font-bold text-white tracking-tight">{c.tickerSymbol} <span className="text-slate-500 font-light">//</span> {c.type}</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-600">{c.detectedAt}</span>
             </div>

             <div className="p-8 space-y-8 flex-1">
                <div className="space-y-2">
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    {c.explanation}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  <div className="p-4 rounded-xl bg-[#0a0a0b] border border-[#212124] relative">
                    <span className="absolute -top-3 left-4 px-2 bg-[#121214] text-[9px] font-bold text-indigo-400 uppercase">Statement A</span>
                    <p className="text-xs text-slate-300 italic">"{c.quote1}"</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0a0a0b] border border-rose-500/20 relative">
                    <span className="absolute -top-3 left-4 px-2 bg-[#121214] text-[9px] font-bold text-rose-400 uppercase">Statement B</span>
                    <p className="text-xs text-slate-300 italic">"{c.quote2}"</p>
                  </div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:flex hidden">
                    <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-black border-4 border-[#121214]">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                </div>
             </div>

             <div className="p-6 bg-[#0a0a0b] border-t border-[#212124] flex items-center justify-between">
                <div className="flex items-center gap-4 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-bold">14 Analysts Flagged</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GanttChart className="w-4 h-4" />
                    <span className="text-xs font-bold">Price Impact: -3.2%</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-xs font-bold text-white hover:text-rose-400 transition-all uppercase tracking-widest">
                  Investigate Source <ArrowRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContradictionView;
