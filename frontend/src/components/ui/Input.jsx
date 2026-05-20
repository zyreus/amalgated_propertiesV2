import React from 'react';
import { cn } from '../../lib/utils';

const fieldClass =
  'w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white';

export function Input({ className, label, error, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">
          {label}
        </label>
      )}
      <input className={cn(fieldClass, error && 'border-red-500', className)} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({ className, label, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea className={cn(fieldClass, className)} {...props} />
    </div>
  );
}


export default Input;
