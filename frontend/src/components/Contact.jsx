import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-contact-info]', {
        x: -60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        force3D: true,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
        },
      });

      gsap.from('[data-contact-form]', {
        x: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        force3D: true,
        delay: 0.15,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
        },
      });

      gsap.from('[data-contact-field]', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.08,
        force3D: true,
        delay: 0.4,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
        },
      });

      gsap.from('[data-contact-map]', {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        force3D: true,
        scrollTrigger: {
          trigger: '[data-contact-map]',
          start: 'top 85%',
          once: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    location: '',
    requirements: ''
  });
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const updateField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.requirements) {
      setStatus({
        state: 'error',
        message: 'Please provide your name, email, and a brief overview of your requirements.'
      });
      return;
    }

    try {
      setStatus({ state: 'loading', message: '' });
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Unable to send message.');
      }

      setStatus({
        state: 'success',
        message: 'Thank you. A member of our team will reach out within one business day.'
      });
      setForm({
        name: '',
        company: '',
        email: '',
        location: '',
        requirements: ''
      });
    } catch (error) {
      setStatus({
        state: 'error',
        message: 'We were unable to submit your enquiry. Please try again shortly or contact us directly.'
      });
    }
  };

  const isLoading = status.state === 'loading';

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="border-t border-brand-secondary/30 bg-brand-background-alt py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[minmax(0,_1.1fr)_minmax(0,_1fr)] md:items-start">
          <div data-contact-info>
            <div className="border-l-4 border-brand-green pl-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-green">
                Contact
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-text sm:text-3xl">
                Send us your inquiry
              </h2>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-brand-text/90">
              Share your leasing requirements, preferred location, and timeline. Our team will
              respond within one business day.
            </p>
            <div className="mt-6 grid gap-3 rounded-2xl border border-brand-secondary/30 bg-brand-background p-5 text-[15px] text-brand-text/90 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-text/60">
                  Main Office Location
                </p>
                <p className="mt-1 font-semibold text-brand-text">
                  Amalgated Building, J.P. Laurel Avenue, Bo. Obrero, Davao City, Philippines
                </p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Amalgated+Building+J.P.+Laurel+Avenue+Bo.+Obrero+Davao+City+Philippines"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-primary-hover"
                >
                  Get directions
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-text/60">
                  Phone
                </p>
                <p className="mt-1 font-semibold text-brand-text">+63 998 596 9288</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-text/60">
                  Email
                </p>
                <p className="mt-1 font-semibold text-brand-text">sales@theamalgatedproperties.com</p>
              </div>
            </div>
            {status.message && (
              <p
                className={`mt-4 text-sm ${
                  status.state === 'success' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {status.message}
              </p>
            )}
          </div>
          <form
            data-contact-form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-brand-secondary/40 bg-brand-background p-6 shadow-[0_2px_12px_rgba(58,63,69,0.06)]"
          >
            <div data-contact-field className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-xs font-medium uppercase tracking-[0.18em] text-brand-text/80">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="First and last name"
                  value={form.name}
                  onChange={updateField('name')}
                  required
                  className="mt-2 w-full rounded-xl border border-brand-secondary/50 bg-brand-background-alt/60 px-4 py-2.5 text-sm text-brand-text outline-none transition placeholder:text-brand-text/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
              <div>
                <label htmlFor="company-input" className="text-xs font-medium uppercase tracking-[0.18em] text-brand-text/80">
                  Organization
                </label>
                <input
                  id="company-input"
                  type="text"
                  placeholder="Company or institution"
                  value={form.company}
                  onChange={updateField('company')}
                  className="mt-2 w-full rounded-xl border border-brand-secondary/50 bg-brand-background-alt/60 px-4 py-2.5 text-sm text-brand-text outline-none transition placeholder:text-brand-text/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
            </div>
            <div data-contact-field className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="text-xs font-medium uppercase tracking-[0.18em] text-brand-text/80">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={updateField('email')}
                  required
                  className="mt-2 w-full rounded-xl border border-brand-secondary/50 bg-brand-background-alt/60 px-4 py-2.5 text-sm text-brand-text outline-none transition placeholder:text-brand-text/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
              <div>
                <label htmlFor="location" className="text-xs font-medium uppercase tracking-[0.18em] text-brand-text/80">
                  Preferred market
                </label>
                <input
                  id="location"
                  type="text"
                  placeholder="City or district"
                  value={form.location}
                  onChange={updateField('location')}
                  className="mt-2 w-full rounded-xl border border-brand-secondary/50 bg-brand-background-alt/60 px-4 py-2.5 text-sm text-brand-text outline-none transition placeholder:text-brand-text/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
            </div>
            <div data-contact-field>
              <label htmlFor="requirements" className="text-xs font-medium uppercase tracking-[0.18em] text-brand-text/80">
                Requirements
              </label>
              <textarea
                id="requirements"
                rows={4}
                placeholder="Please outline your anticipated requirements, timelines, and decision-makers."
                value={form.requirements}
                onChange={updateField('requirements')}
                required
                className="mt-2 w-full rounded-xl border border-brand-secondary/50 bg-brand-background-alt/60 px-4 py-2.5 text-sm text-brand-text outline-none transition placeholder:text-brand-text/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div data-contact-field className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-brand-primary transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Sending…' : 'Submit enquiry'}
              </button>
              <p className="text-xs text-brand-text/60">
                By submitting, you agree to confidential follow-up from our team. No marketing lists.
              </p>
            </div>
          </form>
        </div>

        <div data-contact-map className="mt-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-text/60">
            Main Office Location
          </p>
          <div className="overflow-hidden rounded-2xl border border-brand-secondary/30 shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d989.8407761173271!2d125.61391663653968!3d7.083836921086417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32f96da651e42635%3A0x5bd7a84c2784dcf!2sAmalgated%20Capital%2C%20Inc.!5e0!3m2!1sen!2sph!4v1772769019699!5m2!1sen!2sph"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Amalgated Capital Inc. - Main Office Location"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

