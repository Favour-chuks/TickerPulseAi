
import React from 'react';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#2d2d31] rounded-2xl p-6 shadow-sm dark:shadow-none ${onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:bg-[#27272a] transition-all duration-300' : ''} ${className}`}
  >
    {children}
  </div>
);

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className = "" }) => {
  const styles = {
    default: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700",
    neutral: "bg-slate-50 text-slate-500 border border-slate-200 dark:bg-white/5 dark:text-zinc-400 dark:border-white/5",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/10",
    warning: "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/10",
    danger: "bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/10"
  };
  return <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide shadow-sm dark:shadow-none ${styles[variant]} ${className}`}>{children}</span>;
};
