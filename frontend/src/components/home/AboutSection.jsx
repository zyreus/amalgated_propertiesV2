import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const pillars = ['Leasing discipline', 'Portfolio stewardship', 'Business consultancy'];

const AboutSection = () => (
  <section className="overflow-hidden bg-brand-background-alt py-16 sm:py-24">
    <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55 }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">About APMC</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          The real estate arm of a diversified Philippine business group.
        </h2>
        <p className="mt-5 text-base leading-8 text-brand-text/75">
          APMC works with Amalgated Capital Inc. and Amalgated Land & Development Corporation to
          acquire, lease, manage, and develop properties for long-term business value.
        </p>
        <div className="mt-6 grid gap-3">
          {pillars.map((pillar) => (
            <div key={pillar} className="flex items-center gap-3 text-sm font-semibold text-brand-text">
              <CheckCircle2 className="h-5 w-5 text-brand-primary" />
              {pillar}
            </div>
          ))}
        </div>
        <Link to="/about" className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary-hover">
          Learn About the Company
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
      <div className="relative">
        <div className="absolute -left-6 -top-6 h-40 w-40 rounded-full bg-brand-accent/25 blur-3xl" />
        <img
          src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Property management meeting"
          className="relative rounded-[2rem] shadow-soft"
        />
      </div>
    </div>
  </section>
);

export default AboutSection;
