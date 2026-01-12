
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Target, TrendingUp, Clock, Zap } from 'lucide-react';

const analyticsData = [
  { name: 'Creative', value: 85, color: '#6366f1' },
  { name: 'Logic', value: 72, color: '#0ea5e9' },
  { name: 'Focus', value: 94, color: '#10b981' },
  { name: 'Empathy', value: 68, color: '#f59e0b' },
];

const AnalyticsView: React.FC = () => {
  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Work Focus', value: '4.2h', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Task Velocity', value: '+14%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Goals Met', value: '8/10', icon: Target, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'AI Leverage', value: '62%', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-8">Cognitive Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                  {analyticsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Optimization Log</h3>
          <div className="space-y-6">
            {[
              { time: '09:30 AM', event: 'Peak focus detected. Strategy: Deep Work.', status: 'Applied' },
              { time: '11:15 AM', event: 'Creative block predicted. Strategy: Short break.', status: 'Resolved' },
              { time: '02:00 PM', event: 'Cognitive load rising. Strategy: Task batching.', status: 'Active' },
              { time: '04:45 PM', event: 'Output declining. Strategy: Wind down.', status: 'Pending' },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 mt-2 rounded-full bg-indigo-600 flex-shrink-0"></div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{log.time}</div>
                  <div className="text-sm font-medium text-slate-800 my-1">{log.event}</div>
                  <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                    {log.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
