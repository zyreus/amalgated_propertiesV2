import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, MapPinned } from 'lucide-react';

const HeroSection = () => (
  <section className="relative overflow-hidden bg-brand-primary text-white">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(117,162,191,0.35),transparent_35%),linear-gradient(135deg,#003B65_0%,#002a47_100%)]" />
    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-background-alt to-transparent" />
    <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.08fr_0.92fr]">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
          <Building2 className="h-4 w-4" />
          Real Estate & Property Management
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Premium spaces for companies that build lasting value.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
          Amalgated Properties & Management Corporation delivers leasing, property management,
          asset strategy, and business consultancy for institutional and commercial tenants nationwide.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link to="/properties" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-primary shadow-soft transition hover:bg-brand-background-alt">
            Explore Properties
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            Talk to Leasing
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="relative"
      >
        <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur">
          <img
            src="https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=1400"
            alt="Premium commercial building"
            className="h-[460px] w-full rounded-[1.5rem] object-cover"
          />
        </div>
        <div className="absolute -bottom-6 left-6 right-6 rounded-3xl border border-white/20 bg-white/95 p-5 text-brand-text shadow-soft">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <MapPinned className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-semibold text-brand-primary">Nationwide portfolio</p>
              <p className="mt-1 text-sm text-brand-text/70">
                Strategic commercial, residential, office, warehouse, and land assets across key markets.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
