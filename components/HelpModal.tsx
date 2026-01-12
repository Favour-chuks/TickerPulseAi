
import React, { useState } from 'react';
import { X, HelpCircle, Zap, AlertTriangle, Activity, BarChart2, BookOpen, Navigation } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'icons' | 'nav'>('metrics');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/20 dark:bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#2d2d31] rounded-2xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-[#2d2d31] flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BookOpen size={20} />
             </div>
             <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">System Guide</h2>
                <p className="text-xs text-slate-500">Glossary & Navigation Help</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-[#2d2d31]">
          <button 
            onClick={() => setActiveTab('metrics')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'metrics' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Metrics Glossary
          </button>
          <button 
            onClick={() => setActiveTab('icons')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'icons' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Icon Legend
          </button>
          <button 
            onClick={() => setActiveTab('nav')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'nav' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Navigation
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart2 size={16} /> Deviation Multiple
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Represents how many times larger the current volume is compared to the 20-day moving average. A multiple of <span className="font-mono bg-slate-100 dark:bg-zinc-800 px-1 rounded">2.0x</span> means volume is double the normal average. High deviation without news often indicates insider action.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity size={16} /> Z-Score
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  A statistical measurement of a score's relationship to the mean in a group of scores. A Z-score of <span className="font-mono bg-slate-100 dark:bg-zinc-800 px-1 rounded">3.0</span> indicates the event is 3 standard deviations from the mean (highly anomalous, top 0.1% probability).
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle size={16} /> Contradiction Severity
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  The AI analyzes semantic distance between two statements. "Critical" severity implies a complete logical reversal (e.g., saying "growth is strong" then cutting guidance). "Medium" implies nuance shifts or soft pivoting.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'icons' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Zap, label: "Volume Spike", desc: "Abnormal trading volume detected.", color: "text-amber-500" },
                { icon: AlertTriangle, label: "Contradiction", desc: "Logical inconsistency in company statements.", color: "text-rose-500" },
                { icon: Activity, label: "Market Activity", desc: "General volatility or price movement.", color: "text-slate-500" },
                { icon: HelpCircle, label: "Prediction", desc: "AI generated hypothesis.", color: "text-indigo-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                  <item.icon className={`shrink-0 ${item.color}`} size={20} />
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'nav' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 font-bold text-slate-500">1</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Dashboard</h4>
                  <p className="text-xs text-slate-500 mt-1">Your command center. View live volume spikes and initiate AI analysis on specific tickers.</p>
                </div>
              </div>
              <div className="flex gap-4">
                 <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 font-bold text-slate-500">2</div>
                 <div>
                   <h4 className="font-bold text-slate-900 dark:text-white text-sm">Narrative Engine (Chat)</h4>
                   <p className="text-xs text-slate-500 mt-1">Ask questions in natural language. "Compare NVDA and AMD sentiment" or "Why is TSLA dropping?".</p>
                 </div>
               </div>
               <div className="flex gap-4">
                 <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 font-bold text-slate-500">3</div>
                 <div>
                   <h4 className="font-bold text-slate-900 dark:text-white text-sm">Contradictions</h4>
                   <p className="text-xs text-slate-500 mt-1">A timeline of broken promises. See where management said one thing but did another.</p>
                 </div>
               </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-[#2d2d31] bg-slate-50 dark:bg-[#121214]">
          <button 
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl text-sm hover:opacity-90 transition-opacity"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
