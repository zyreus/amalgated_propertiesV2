import { useEffect, useState } from 'react';
import { news as fallbackNews } from '../data/siteContent.js';
import { apiRequest } from './useApi.js';

export const NEWS_UPDATED_EVENT = 'apmc-news-updated';

function formatNewsDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function summarize(body = '') {
  const text = String(body).replace(/\s+/g, ' ').trim();
  if (text.length <= 150) return text;
  return `${text.slice(0, 147).trim()}...`;
}

export function mapApiNews(item) {
  if (!item) return null;

  return {
    id: item.id,
    title: item.title,
    date: formatNewsDate(item.published_at || item.created_at),
    category: item.category || 'Company Update',
    excerpt: item.excerpt || summarize(item.body),
    body: item.body || '',
  };
}

export function useNews() {
  const [items, setItems] = useState(fallbackNews);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadNews = () => {
      setLoading(true);
      apiRequest(`/announcements/public?ts=${Date.now()}`)
      .then((rows) => {
        if (cancelled || !Array.isArray(rows) || rows.length === 0) return;
        setItems(rows.map(mapApiNews).filter(Boolean));
      })
      .catch(() => {
        if (!cancelled) setItems(fallbackNews);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    };

    loadNews();

    if (typeof window !== 'undefined') {
      window.addEventListener(NEWS_UPDATED_EVENT, loadNews);
    }

    return () => {
      cancelled = true;
      if (typeof window !== 'undefined') {
        window.removeEventListener(NEWS_UPDATED_EVENT, loadNews);
      }
    };
  }, []);

  return { news: items, loading };
}

export default useNews;
