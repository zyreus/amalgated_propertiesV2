import React from 'react';
import { motion } from 'framer-motion';
import { stats } from '../../data/siteContent.js';

const StatsCounter = () => (
  <section className="bg-brand-background-alt py-16 sm:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className="rounded-3xl border border-brand-secondary/20 bg-white p-6 shadow-card"
          >
            <dt className="text-4xl font-bold tracking-tight text-brand-primary">{stat.value}</dt>
            <dd className="mt-3 text-sm font-semibold text-brand-text">{stat.label}</dd>
            <p className="mt-2 text-sm leading-6 text-brand-text/65">{stat.detail}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsCounter;
