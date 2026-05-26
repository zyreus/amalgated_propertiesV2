import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Building2, Coins, Landmark } from 'lucide-react';
import { investmentPrograms } from '../../data/enterpriseContent.js';

const icons = [Landmark, Building2, Coins];

const InvestmentExpansion = () => (
  <section data-animate className="relative overflow-hidden bg-brand-primary py-16 text-white sm:py-24">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(117,162,191,0.34),transparent_30%),radial-gradient(circle_at_85%_65%,rgba(255,255,255,0.12),transparent_24%)]" />
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">Investment & Expansion</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
            Capital programs built for acquisition readiness and portfolio depth.
          </h2>
          <p className="mt-5 text-base leading-8 text-white/72">
            The profile’s expansion agenda is organized around corporate infrastructure, education-linked assets, and a nationwide building acquisition program.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {investmentPrograms.map((program, index) => {
            const Icon = icons[index] || Landmark;

            return (
              <motion.article
                key={program.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-2xl bg-white/15 p-3 text-brand-accent">
                    <Icon className="h-6 w-6" />
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-white/55" />
                </div>
                <p className="mt-6 text-3xl font-black">{program.capital}</p>
                <h3 className="mt-3 text-lg font-bold">{program.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/68">{program.focus}</p>
                <div className="mt-6">
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                    <span>Program Progress</span>
                    <span>{program.progress}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-brand-accent" style={{ width: `${program.progress}%` }} />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);

export default InvestmentExpansion;
