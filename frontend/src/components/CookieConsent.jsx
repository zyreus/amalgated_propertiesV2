import React, { useEffect, useState } from 'react';

const CONSENT_COOKIE = 'ap_cookie_consent';
const LAST_VISIT_COOKIE = 'ap_last_visit';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function getCookie(name) {
  if (typeof document === 'undefined') return '';

  return document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=') || '';
}

function setCookie(name, value, maxAge = ONE_YEAR_SECONDS) {
  if (typeof document === 'undefined') return;

  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'SameSite=Lax',
  ].join('; ');
}

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getCookie(CONSENT_COOKIE);

    if (consent === 'accepted') {
      setCookie(LAST_VISIT_COOKIE, new Date().toISOString());
      return;
    }

    setVisible(true);
  }, []);

  const acceptCookies = () => {
    setCookie(CONSENT_COOKIE, 'accepted');
    setCookie(LAST_VISIT_COOKIE, new Date().toISOString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-2xl border border-brand-secondary/40 bg-white p-4 shadow-card sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div>
        <p className="text-sm font-semibold text-brand-text">Cookie Notice</p>
        <p className="mt-1 text-sm leading-6 text-brand-text/70">
          We use a small cookie to remember your preference and improve your browsing experience.
        </p>
      </div>
      <button
        type="button"
        onClick={acceptCookies}
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary-hover sm:mt-0 sm:w-auto"
      >
        Accept cookies
      </button>
    </div>
  );
};

export default CookieConsent;
