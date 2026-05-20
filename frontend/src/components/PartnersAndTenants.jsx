import React from 'react';

const bankPartnersText =
  'Amalgated Capital Inc., holds good relationships with banks all over the Philippines.';

const tenantCategories = [
  { key: 'A', label: 'Banking' },
  { key: 'B', label: 'Internet Services' },
  { key: 'C', label: 'BPOs' },
  { key: 'D', label: 'Retails, Food, and Consumer Business', note: '* 2 branches under APMC' },
  { key: 'E', label: 'Transportation Service' },
  { key: 'F', label: 'Government and Public Sectors' },
  { key: 'G', label: 'Energy, Mining, and Agriculture' },
  { key: 'H', label: 'Photography' },
  { key: 'I', label: 'Insurance Services' },
  { key: 'J', label: 'Engineering Consultancy' },
  { key: 'K', label: 'Corporate Group' },
  { key: 'L', label: 'Consultancy' },
  { key: 'M', label: 'Academics' },
  { key: 'N', label: 'Collection Services' },
  { key: 'O', label: 'Systems Services' }
];

const PartnersAndTenants = () => {
  return (
    <section
      id="partners-tenants"
      className="border-t border-brand-secondary/30 bg-brand-background-alt py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Our Bank Partners */}
        <div className="border-l-4 border-brand-green pl-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-green">
            Relationships
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-text sm:text-3xl">
            Our Bank Partners
          </h2>
        </div>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-brand-text/90">
          {bankPartnersText}
        </p>

        {/* Our Tenants */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold tracking-tight text-brand-text">
            Our Tenants
          </h3>
          <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-brand-text/90">
            Amalgated Capital Inc., has a diverse range of tenants that occupy our various real
            estate properties.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {tenantCategories.map((item) => (
              <div
                key={item.key}
                className="flex items-start gap-3 rounded-2xl border border-brand-secondary/30 bg-brand-background p-4"
              >
                <span className="text-lg font-bold text-brand-green">{item.key}.</span>
                <div>
                  <p className="text-sm font-medium text-brand-text">{item.label}</p>
                  {item.note && (
                    <p className="mt-1 text-xs text-brand-text/70">{item.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Service & Agent Management */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-brand-secondary/30 bg-brand-background p-6">
            <h3 className="text-base font-bold uppercase tracking-wider text-brand-dark">
              Customer Service
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-brand-text/90">
              With our excellent Customer Service to our Partners, Employees, Tenants and Suppliers.
            </p>
          </div>
          <div className="rounded-2xl border border-brand-secondary/30 bg-brand-background p-6">
            <h3 className="text-base font-bold uppercase tracking-wider text-brand-dark">
              Agent Management
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-brand-text/90">
              With our excellent Customer Service to our Partners, Employees, Tenants and Suppliers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersAndTenants;
