import React from 'react';
import { motion } from 'framer-motion';
import { companyMilestones } from '../../data/enterpriseContent.js';

const CompanyTimeline = () => (
  <section data-animate className="relative overflow-hidden bg-white py-16 sm:py-24">
    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-background-alt to-transparent" />
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">Company Timeline</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-text sm:text-5xl">
          From a 20sqm Davao office to a nationwide property platform.
        </h2>
        <p className="mt-5 text-base leading-8 text-brand-text/72">
          APMC’s growth story is built on practical acquisitions, long-term leases, tenant retention, and a steady move toward investor-grade portfolio management.
        </p>
      </div>

      <div className="relative mt-12">
        <div className="absolute left-4 top-0 h-full w-px bg-brand-100 md:left-0 md:right-0 md:top-8 md:mx-auto md:h-px md:w-full" />
        <motion.div
          initial={{ scaleX: 0, scaleY: 0 }}
          whileInView={{ scaleX: 1, scaleY: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute left-4 top-0 h-full w-px origin-top bg-brand-primary md:left-0 md:right-0 md:top-8 md:mx-auto md:h-px md:w-full md:origin-left"
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {companyMilestones.map((milestone, index) => (
            <motion.article
              key={`${milestone.year}-${milestone.title}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="relative pl-12 md:pl-0 md:pt-16"
            >
              <span className="absolute left-1 top-5 z-10 h-7 w-7 rounded-full border-4 border-white bg-brand-primary shadow-brand-primary ring-8 ring-brand-primary/10 md:left-1/2 md:top-5 md:-translate-x-1/2" />
              <div className="group rounded-[1.75rem] border border-brand-secondary/20 bg-brand-background-alt p-5 shadow-card transition hover:-translate-y-1 hover:border-brand-primary/30 hover:bg-white hover:shadow-glow">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-2xl font-bold text-brand-primary">{milestone.year}</p>
                  <span className="rounded-full bg-brand-primary px-3 py-1 text-xs font-bold text-white shadow-brand-primary">
                    {milestone.value}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-bold uppercase tracking-[0.12em] text-brand-text">{milestone.title}</h3>
                <p className="mt-3 text-sm leading-6 text-brand-text/68">{milestone.detail}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default CompanyTimeline;
