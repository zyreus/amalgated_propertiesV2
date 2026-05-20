import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-brand-100 text-brand-800 dark:bg-brand-800 dark:text-brand-200',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  outline: 'border border-brand-300 text-brand-700 dark:border-brand-600 dark:text-brand-300',
};

export function Badge({ className, variant = 'default', children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
