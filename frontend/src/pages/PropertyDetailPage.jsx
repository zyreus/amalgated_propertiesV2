import React, { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bath, BedDouble, CalendarDays, Download, Expand, MapPin, MessageCircle, Ruler, X } from 'lucide-react';
import { properties } from '../data/properties.js';
import { useProperty } from '../hooks/useProperties.js';

const PropertyDetailPage = () => {
  const { slug } = useParams();
  const { property, loading } = useProperty(slug);
  const [activeImage, setActiveImage] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!loading && !property) {
    return <Navigate to="/properties" replace />;
  }

  if (loading || !property) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-brand-text-muted">Loading property…</p>
      </div>
    );
  }

  const related = properties
    .filter((item) => item.slug !== property.slug && item.region === property.region)
    .slice(0, 3);
  const gallery = useMemo(() => {
    const base = property.gallery?.length ? property.gallery : [property.image];
    const fallbacks = [
      'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/4484078/pexels-photo-4484078.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ];
    return [...new Set([...base, ...fallbacks])].slice(0, 4);
  }, [property.gallery, property.image]);
  const amenities = property.amenities?.length ? property.amenities : ['24/7 security', 'Parking access', 'Professional property management', 'Flexible lease terms'];
  const nearby = property.nearby?.length ? property.nearby : ['Transport corridors', 'Commercial establishments', 'Banks and service offices', 'Dining and retail options'];
  const leaseTerms = property.leaseTerms || ['Long-term lease options', 'Security deposit required', 'Subject to tenant fit-out approval'];

  return (
    <div className="bg-brand-background-alt">
      <section className="relative overflow-hidden bg-brand-primary py-10 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,42,71,0.96),rgba(0,59,101,0.72))]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Link to="/properties" className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to properties
          </Link>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] bg-white p-3 shadow-card">
            <div className="group relative overflow-hidden rounded-[1.5rem]">
              <img src={gallery[activeImage]} alt={property.name} className="h-[460px] w-full object-cover" loading="eager" />
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-brand-primary shadow-card transition hover:bg-brand-primary hover:text-white"
              >
                <Expand className="h-4 w-4" />
                Fullscreen
              </button>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {gallery.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`overflow-hidden rounded-2xl border-2 transition ${activeImage === index ? 'border-brand-primary' : 'border-transparent opacity-75 hover:opacity-100'}`}
                >
                  <img src={image} alt={`${property.name} view ${index + 1}`} loading="lazy" className="h-24 w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <aside className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">{property.category}</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-brand-text">{property.name}</h1>
            <p className="mt-3 flex items-center gap-2 text-brand-text/68">
              <MapPin className="h-5 w-5 text-brand-primary" />
              {property.location}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-brand-background-alt p-4">
                <p className="text-brand-text/55">Status</p>
                <p className="mt-1 font-semibold text-brand-text">{property.status}</p>
              </div>
              <div className="rounded-2xl bg-brand-background-alt p-4">
                <p className="text-brand-text/55">Price</p>
                <p className="mt-1 font-semibold text-brand-text">{property.price}</p>
              </div>
              <div className="rounded-2xl bg-brand-background-alt p-4">
                <p className="flex items-center gap-2 text-brand-text/55"><BedDouble className="h-4 w-4" /> Beds</p>
                <p className="mt-1 font-semibold text-brand-text">{property.beds}</p>
              </div>
              <div className="rounded-2xl bg-brand-background-alt p-4">
                <p className="flex items-center gap-2 text-brand-text/55"><Ruler className="h-4 w-4" /> Area</p>
                <p className="mt-1 font-semibold text-brand-text">{property.sqft} sqm</p>
              </div>
              <div className="rounded-2xl bg-brand-background-alt p-4">
                <p className="flex items-center gap-2 text-brand-text/55"><Bath className="h-4 w-4" /> Baths</p>
                <p className="mt-1 font-semibold text-brand-text">{property.bathrooms ?? '—'}</p>
              </div>
              <div className="rounded-2xl bg-brand-background-alt p-4">
                <p className="text-brand-text/55">Parking</p>
                <p className="mt-1 font-semibold text-brand-text">{property.parking ?? property.parking_slots ?? 'Available'}</p>
              </div>
            </div>
            <p className="mt-6 leading-8 text-brand-text/72">{property.description}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary-hover">
                <CalendarDays className="h-4 w-4" />
                Schedule Viewing
              </Link>
              <a href="https://wa.me/630000000000" className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-primary px-6 py-3 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white">
                <MessageCircle className="h-4 w-4" />
                WhatsApp CTA
              </a>
            </div>
          </aside>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-8 shadow-card">
              <h2 className="text-2xl font-bold text-brand-text">Property Overview</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  ['Lease Terms', leaseTerms],
                  ['Amenities', amenities],
                  ['Nearby Establishments', nearby],
                ].map(([title, items]) => (
                  <div key={title} className="rounded-3xl bg-brand-background-alt p-5">
                    <h3 className="font-bold text-brand-text">{title}</h3>
                    <ul className="mt-4 space-y-2 text-sm text-brand-text/68">
                      {items.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] bg-white shadow-card">
              <iframe
                title={`${property.name} map`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`}
                className="h-[360px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <aside className="rounded-[2rem] bg-white p-8 shadow-card">
            <h2 className="text-2xl font-bold text-brand-text">Request Property Details</h2>
            <p className="mt-2 text-sm leading-6 text-brand-text/64">Send an inquiry, request a brochure, or ask for a guided viewing schedule.</p>
            <form className="mt-6 space-y-4">
              {['Full name', 'Email address', 'Mobile number'].map((label) => (
                <label key={label} className="block">
                  <span className="text-sm font-semibold text-brand-text">{label}</span>
                  <input className="mt-2 h-12 w-full rounded-2xl border border-brand-secondary/25 bg-brand-background-alt px-4 outline-none focus:border-brand-primary focus:bg-white" />
                </label>
              ))}
              <label className="block">
                <span className="text-sm font-semibold text-brand-text">Inquiry</span>
                <textarea rows="4" className="mt-2 w-full rounded-2xl border border-brand-secondary/25 bg-brand-background-alt px-4 py-3 outline-none focus:border-brand-primary focus:bg-white" defaultValue={`I would like to know more about ${property.name}.`} />
              </label>
              <button type="button" className="w-full rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary-hover">
                Submit Inquiry
              </button>
              <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-primary px-6 py-3 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white">
                <Download className="h-4 w-4" />
                Download Brochure
              </button>
            </form>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="pb-16 sm:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-brand-text">More in {property.region}</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <Link key={item.slug} to={`/properties/${item.slug}`} className="rounded-3xl bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-soft">
                  <img src={item.image} alt={item.name} className="h-40 w-full rounded-2xl object-cover" />
                  <h3 className="mt-4 font-bold text-brand-text">{item.name}</h3>
                  <p className="mt-1 text-sm text-brand-text/60">{item.location}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/90 p-4" role="dialog" aria-modal="true">
          <button type="button" onClick={() => setPreviewOpen(false)} className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Close fullscreen preview">
            <X className="h-6 w-6" />
          </button>
          <img src={gallery[activeImage]} alt={property.name} className="max-h-[88vh] max-w-full rounded-3xl object-contain shadow-2xl" />
        </div>
      )}
    </div>
  );
};

export default PropertyDetailPage;
