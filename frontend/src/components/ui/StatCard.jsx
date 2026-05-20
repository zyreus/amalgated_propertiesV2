import React from 'react';
import { cn } from '../../lib/utils';

export function StatCard({ title, value, change, icon: Icon, className }) {
  return (
    <div className={cn('kpi-card', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-brand-text-muted dark:text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-brand-primary dark:text-white">{value}</p>
          {change != null && (
            <p className={cn('mt-1 text-xs font-medium', change >= 0 ? 'text-emerald-600' : 'text-red-600')}>
              {change >= 0 ? '+' : ''}{change}% vs last month
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary dark:bg-brand-600/30 dark:text-brand-accent">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
