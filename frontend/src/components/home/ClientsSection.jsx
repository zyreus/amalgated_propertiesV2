import React from 'react';
import { motion } from 'framer-motion';
import { clientLogos } from '../../data/enterpriseContent.js';

const ClientsSection = () => {
  const marqueeItems = [...clientLogos, ...clientLogos];

  return (
    <section data-animate className="overflow-hidden bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">Clients & Tenants</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-text sm:text-5xl">
              Trusted by banks, public sector offices, retailers, telcos, and corporate groups.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-brand-text/68">
            APMC’s tenant mix reflects an institutional leasing platform with relationships across finance, telecommunications, food, insurance, government, and business services.
          </p>
        </div>

        <div className="relative mt-10 overflow-hidden rounded-[2rem] border border-brand-secondary/20 bg-brand-background-alt py-5 shadow-card">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-brand-background-alt to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-brand-background-alt to-transparent" />
          <motion.div
            className="flex min-w-max gap-4 px-4"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          >
            {marqueeItems.map((client, index) => (
              <div
                key={`${client.name}-${index}`}
                className="group flex min-w-[220px] items-center justify-center rounded-2xl border border-white bg-white px-6 py-5 text-center shadow-card grayscale transition hover:-translate-y-0.5 hover:grayscale-0"
              >
                <div>
                  <p className="text-lg font-black tracking-tight text-brand-primary">{client.name}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-text/45">{client.category}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {clientLogos.slice(0, 10).map((client, index) => (
            <motion.div
              key={client.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="rounded-3xl border border-brand-secondary/20 bg-white p-5 text-center shadow-card transition hover:-translate-y-1 hover:shadow-soft"
            >
              <p className="text-base font-bold text-brand-text">{client.name}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary/70">{client.category}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientsSection;
