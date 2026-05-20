import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Card({ className, children, hover = false, ...props }) {
  return (
    <motion.div
      className={cn(
        'glass-card overflow-hidden',
        hover && 'transition duration-300 hover:-translate-y-1 hover:shadow-soft',
        className
      )}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <motion.div className={cn('border-b border-brand-100/80 px-6 py-4 dark:border-brand-700/50', className)}>
      {children}
    </motion.div>
  );
}

export function CardBody({ className, children }) {
  return <motion.div className={cn('p-6', className)}>{children}</motion.div>;
}

export default Card;
