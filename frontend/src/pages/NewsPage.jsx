import React from 'react';
import { news } from '../data/siteContent.js';

const NewsPage = () => (
  <div className="bg-brand-background-alt">
    <section className="bg-brand-primary py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">News</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
          Company updates and market perspectives.
        </h1>
      </div>
    </section>

    <section className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-3">
        {news.map((item) => (
          <article key={item.title} className="rounded-3xl bg-white p-6 shadow-card">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
              <span>{item.category}</span>
              <span>{item.date}</span>
            </div>
            <h2 className="mt-6 text-2xl font-bold leading-8 text-brand-text">{item.title}</h2>
            <p className="mt-4 text-sm leading-6 text-brand-text/68">{item.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  </div>
);

export default NewsPage;
