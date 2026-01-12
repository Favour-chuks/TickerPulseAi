
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Message } from '../types';

const NLPView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'model', text: 'I am the SignalHub market intelligence core. Query me for real-time analysis, ticker comparisons, or anomaly investigations.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Send history excluding the last user message we just added locally for optimistic UI
      const historyForApi = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await api.analyse.sendMessage(userMsg.text, historyForApi as any);
      
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.response || 'Analysis complete.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Connection to neural engine failed. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-[#121214] border border-[#212124] rounded-2xl overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#212124] flex items-center justify-between bg-[#151518]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Deep Analysis Engine</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-mono uppercase">Gemini-2.0-Flash Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[90%] md:max-w-[80%] flex items-start gap-3
              ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}
            `}>
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border
                ${msg.role === 'user' ? 'bg-[#212124] border-[#333] text-slate-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}
              `}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`
                p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-[#1c1c1f] text-slate-200 rounded-tl-none border border-[#2d2d31]'}
              `}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-[#1c1c1f] px-4 py-3 rounded-2xl rounded-tl-none border border-[#2d2d31] flex items-center gap-2">
               <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
               <span className="text-xs text-slate-500 font-mono">Processing market data...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-[#151518] border-t border-[#212124]">
        <div className="bg-[#0a0a0b] rounded-xl p-2 flex items-center gap-2 border border-[#212124] focus-within:border-indigo-500/50 transition-colors">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about volume spikes, contradictions, or ticker comparisons..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-slate-600 px-3"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-2 text-center">
          AI analysis may produce inaccurate results. Always verify financial data.
        </p>
      </div>
    </div>
  );
};

export default NLPView;
