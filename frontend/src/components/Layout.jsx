import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import ChatWidget from './ChatWidget.jsx';
import CookieConsent from './CookieConsent.jsx';

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ap-section-visible');
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px 40px 0px' }
    );
    const els = document.querySelectorAll('[data-animate]');
    const revealIfInView = (el) => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.bottom > 0 && rect.top < vh) {
        el.classList.add('ap-section-visible');
      }
    };
    els.forEach((el) => {
      revealIfInView(el);
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-brand-background-alt text-brand-text">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
      <CookieConsent />
    </div>
  );
};

export default Layout;
