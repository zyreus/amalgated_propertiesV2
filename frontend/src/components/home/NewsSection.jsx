import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import useNews from '../../hooks/useNews.js';

const NewsSection = () => {
  const { news } = useNews();

  return (
    <section className="bg-brand-background-alt py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">News & Insights</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
              Perspectives from the portfolio.
            </h2>
          </div>
          <Link to="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">
            Read all news
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {news.slice(0, 3).map((item) => (
            <article key={item.id || item.title} className="rounded-3xl border border-brand-secondary/20 bg-white p-6 shadow-card">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                <span>{item.category}</span>
                <span>{item.date}</span>
              </div>
              <h3 className="mt-5 text-xl font-bold leading-7 text-brand-text">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-brand-text/68">{item.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
