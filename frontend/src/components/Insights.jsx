import React from 'react';

const whyStandOut = [
  'Proven Track Record',
  'Risk-Managed Operations',
  'Scalable Growth Capability',
  'Competitive Market Positioning'
];

const whyPartner = [
  {
    title: 'Established & Credible Client Base',
    body: 'Trusted by government agencies, financial institutions, multinational companies, and leading local brands—demonstrating confidence in our properties and management capabilities.'
  },
  {
    title: 'Professional In-House Management',
    body: 'End-to-end leasing, property, and tenant management ensure consistent service quality and asset performance.'
  },
  {
    title: 'Client-Centered Outcome',
    body: 'Our values enable Amalgated Properties to build long-standing relationships with our tenants, resulting in high occupancy, strong retention, and stable lease performance.'
  }
];

const Insights = () => {
  return (
    <section
      id="why-us"
      className="border-t border-brand-secondary/30 bg-brand-background py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Why we stand out */}
        <div className="border-l-4 border-brand-green pl-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-green">
            Advantages
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-text sm:text-3xl">
            Why we stand out
          </h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyStandOut.map((item, i) => (
            <div
              key={item}
              className="rounded-2xl border border-brand-secondary/40 bg-brand-background-alt p-5"
            >
              <span className="text-lg font-bold text-brand-green">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="mt-2 font-semibold text-brand-text">{item}</p>
            </div>
          ))}
        </div>

        {/* Why partner with Amalgated */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold tracking-tight text-brand-text">
            Why partner with Amalgated?
          </h3>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {whyPartner.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-brand-secondary/40 bg-brand-background-alt p-6 shadow-sm"
              >
                <h4 className="text-base font-bold text-brand-dark">
                  {item.title}
                </h4>
                <p className="mt-3 text-[15px] leading-relaxed text-brand-text/90">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Insights;
