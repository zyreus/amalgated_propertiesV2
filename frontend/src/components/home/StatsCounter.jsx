import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { stats } from '../../data/siteContent.js';

const AnimatedNumber = ({ stat }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.45 });
  const [displayValue, setDisplayValue] = useState(0);
  const target = Number(stat.value);

  useEffect(() => {
    if (!isInView || Number.isNaN(target)) return undefined;

    let frameId;
    const duration = 1400;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(target * eased);
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, target]);

  const precision = String(stat.value).includes('.') ? 1 : 0;
  const formatted = displayValue.toLocaleString('en-US', {
    maximumFractionDigits: precision,
    minimumFractionDigits: precision,
  });

  return (
    <span ref={ref}>
      {stat.prefix}{formatted}{stat.suffix}
    </span>
  );
};

const StatsCounter = () => (
  <section className="relative overflow-hidden bg-brand-background-alt py-16 sm:py-20">
    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent" />
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">Portfolio Statistics</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-text sm:text-5xl">
          A data-driven property platform with institutional scale.
        </h2>
      </div>
      <div className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className="group rounded-3xl border border-white/80 bg-white/90 p-6 shadow-card backdrop-blur transition hover:-translate-y-1 hover:border-brand-primary/20 hover:shadow-soft"
          >
            <div className="flex items-start justify-between gap-4">
              <dt className="text-4xl font-bold tracking-tight text-brand-primary">
                <AnimatedNumber stat={stat} />
              </dt>
              {stat.icon && (
                <span className="rounded-2xl bg-brand-primary/10 p-3 text-brand-primary transition group-hover:bg-brand-primary group-hover:text-white">
                  <stat.icon className="h-5 w-5" />
                </span>
              )}
            </div>
            <dd className="mt-3 text-sm font-semibold text-brand-text">{stat.label}</dd>
            <p className="mt-2 text-sm leading-6 text-brand-text/65">{stat.detail}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsCounter;
