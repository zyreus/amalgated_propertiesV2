import React from 'react';
import { motion } from 'framer-motion';
import { MapPinned, Target } from 'lucide-react';
import { project101 } from '../../data/enterpriseContent.js';

const Project101Section = () => (
  <section data-animate className="bg-brand-background-alt py-16 sm:py-24">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">Project 101</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-text sm:text-5xl">
          A 10-year nationwide building ownership program.
        </h2>
        <p className="mt-5 text-base leading-8 text-brand-text/72">{project101.statement}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-card">
            <p className="text-4xl font-black text-brand-primary">{project101.targetBuildings}</p>
            <p className="mt-2 text-sm font-semibold text-brand-text">Target buildings</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-card">
            <p className="text-4xl font-black text-brand-primary">{project101.horizon}</p>
            <p className="mt-2 text-sm font-semibold text-brand-text">Program horizon</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-brand-secondary/20 bg-white p-6 shadow-card">
        <div className="relative min-h-[520px] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-brand-50 via-white to-brand-200">
          <div className="absolute inset-8 rounded-[45%] border border-brand-primary/10" />
          <div className="absolute left-1/2 top-12 h-[420px] w-24 -translate-x-1/2 rotate-12 rounded-full bg-brand-primary/10 blur-2xl" />
          <div className="absolute left-[42%] top-[12%] h-24 w-16 rotate-12 rounded-[45%] bg-brand-primary/25" />
          <div className="absolute left-[49%] top-[39%] h-20 w-14 -rotate-12 rounded-[45%] bg-brand-primary/25" />
          <div className="absolute left-[55%] top-[60%] h-32 w-20 rotate-[28deg] rounded-[45%] bg-brand-primary/25" />
          <div className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-brand-primary shadow-card">
            Luzon / Visayas / Mindanao
          </div>
          {project101.markers.map((marker, index) => (
            <motion.div
              key={marker.island}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`absolute ${marker.position}`}
            >
              <div className="relative">
                <span className="absolute inset-0 animate-ping rounded-full bg-brand-primary/30" />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-brand-primary">
                  <MapPinned className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3 w-64 rounded-3xl bg-white/95 p-4 shadow-card backdrop-blur">
                <p className="flex items-center gap-2 text-sm font-black text-brand-primary">
                  <Target className="h-4 w-4" />
                  {marker.island}
                </p>
                <p className="mt-2 text-xs leading-5 text-brand-text/68">{marker.label}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <span className="rounded-2xl bg-brand-background-alt px-3 py-2 font-semibold text-brand-text">
                    {marker.activeAssets} active assets
                  </span>
                  <span className="rounded-2xl bg-brand-background-alt px-3 py-2 font-semibold text-brand-text">
                    {marker.pipeline} pipeline
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Project101Section;
