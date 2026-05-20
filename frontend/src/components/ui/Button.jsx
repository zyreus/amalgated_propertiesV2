import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost: 'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-brand-primary hover:bg-brand-50 dark:text-brand-accent dark:hover:bg-brand-800/50',
  danger: 'inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700',
};

export function Button({ className, variant = 'primary', children, ...props }) {
  return (
    <button type="button" className={cn(variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export default Button;
