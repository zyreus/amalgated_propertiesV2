import React from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import { investorCharts, investorMetrics } from '../data/enterpriseContent.js';

const InvestorRelationsPage = () => (
  <div className="bg-brand-background-alt">
    <section className="relative overflow-hidden bg-brand-primary py-20 text-white sm:py-28">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,42,71,0.95),rgba(0,59,101,0.82)),radial-gradient(circle_at_80%_20%,rgba(117,162,191,0.38),transparent_30%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.75fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Investor Relations</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
            Portfolio intelligence for partners, lenders, and growth stakeholders.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">
            Track occupancy momentum, asset class exposure, acquisition readiness, and platform growth indicators.
          </p>
        </div>
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur">
          <TrendingUp className="h-10 w-10 text-brand-accent" />
          <p className="mt-5 text-4xl font-bold">88.5%</p>
          <p className="mt-2 text-sm text-white/72">2024 occupancy rate across stabilized managed assets.</p>
        </div>
      </div>
    </section>

    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {investorMetrics.map((metric) => (
            <div key={metric.label} className="rounded-3xl bg-white p-6 shadow-card">
              <p className="text-3xl font-bold text-brand-primary">{metric.value}</p>
              <p className="mt-2 font-semibold text-brand-text">{metric.label}</p>
              <p className="mt-2 text-sm leading-6 text-brand-text/64">{metric.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-xl font-bold text-brand-text">Occupancy Growth</h2>
            <p className="mt-2 text-sm text-brand-text/64">Multi-year stabilized occupancy rate.</p>
            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={investorCharts.occupancy}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dce9f2" />
                  <XAxis dataKey="year" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Line type="monotone" dataKey="rate" stroke="#003B65" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-xl font-bold text-brand-text">Portfolio Mix</h2>
            <p className="mt-2 text-sm text-brand-text/64">Asset allocation by managed class.</p>
            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={investorCharts.portfolio}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dce9f2" />
                  <XAxis dataKey="type" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="value" fill="#003B65" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] bg-brand-primary p-8 text-white shadow-soft">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/65">Reports & Opportunities</p>
              <h2 className="mt-2 text-2xl font-bold">Download investor materials and portfolio briefs.</h2>
            </div>
            <a href="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-primary transition hover:bg-brand-background-alt">
              <Download className="h-4 w-4" />
              Request Reports
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default InvestorRelationsPage;
