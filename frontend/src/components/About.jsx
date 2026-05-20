import React from 'react';

const About = () => {
  return (
    <section
      id="company"
      className="border-t border-brand-secondary/30 bg-brand-background py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Who is Amalgated Properties */}
        <div className="border-l-4 border-brand-green pl-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-green">
            Company
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-text sm:text-3xl">
            Who is Amalgated Properties?
          </h2>
        </div>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-brand-text/90">
          The Amalgated Group is a diversified Philippine business group engaged in real estate
          leasing, property management, development, lending, and distribution. The group is
          composed of nine companies, with its real estate operations led by:
        </p>
        <ul className="mt-4 list-none space-y-2 text-[15px] text-brand-text/90">
          <li>
            <strong className="text-brand-text">Amalgated Capital Inc. (ACI)</strong> – Property
            acquisition, leasing, and asset management
          </li>
          <li>
            <strong className="text-brand-text">Amalgated Properties &amp; Management Corporation (APMC)</strong> – Property
            management and business consultancy
          </li>
          <li>
            <strong className="text-brand-text">Amalgated Land &amp; Development Corporation (ALDC)</strong> – Property
            development and joint ventures
          </li>
        </ul>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-brand-text/90">
          Together, ACI–APMC–ALDC form the real estate arm of the Amalgated Group, serving banks,
          BPOs, corporate offices, commercial tenants, and institutions nationwide.
        </p>

        {/* Vision & Mission */}
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-brand-secondary/30 bg-brand-background-alt p-6">
            <h3 className="text-base font-bold uppercase tracking-wider text-brand-dark">
              Our Vision
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-brand-text/90">
              To be the most trusted real estate partner in the Philippines, providing expert
              leasing, proactive property management, and insightful business consultancy that
              drives long-term prosperity and operational efficiency.
            </p>
          </div>
          <div className="rounded-2xl border border-brand-secondary/30 bg-brand-background-alt p-6">
            <h3 className="text-base font-bold uppercase tracking-wider text-brand-dark">
              Our Mission
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-brand-text/90">
              To deliver outstanding real estate solutions that support and enhance the operations
              of: banks and financial institutions; BPOs and call centers; corporate and commercial
              tenants; multinational companies and government institutions—through reliable leasing,
              property management, and strategic consultancy services.
            </p>
          </div>
        </div>

        {/* Company Goals */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold tracking-tight text-brand-text">
            Company Goals
          </h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-brand-secondary/30 bg-brand-background-alt p-5">
              <p className="text-2xl font-bold text-brand-green">01</p>
              <p className="mt-2 text-sm font-semibold text-brand-text">
                Expansion Across Mindanao
              </p>
              <p className="mt-1 text-[15px] leading-relaxed text-brand-text/80">
                Establish multiple partner branches and grow the real estate footprint across key
                cities.
              </p>
            </div>
            <div className="rounded-2xl border border-brand-secondary/30 bg-brand-background-alt p-5">
              <p className="text-2xl font-bold text-brand-green">02</p>
              <p className="mt-2 text-sm font-semibold text-brand-text">
                Value Creation for Stakeholders
              </p>
              <p className="mt-1 text-[15px] leading-relaxed text-brand-text/80">
                Convenience and success for clients; above-market returns for investors.
              </p>
            </div>
            <div className="rounded-2xl border border-brand-secondary/30 bg-brand-background-alt p-5">
              <p className="text-2xl font-bold text-brand-green">03</p>
              <p className="mt-2 text-sm font-semibold text-brand-text">
                People &amp; Partner Empowerment
              </p>
              <p className="mt-1 text-[15px] leading-relaxed text-brand-text/80">
                Foster a productive, family-oriented work culture while empowering employees and
                agents.
              </p>
            </div>
          </div>
        </div>

        {/* Company Growth Timeline */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold tracking-tight text-brand-text">
            Company Growth Timeline
          </h3>
          <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-brand-text/90">
            The company was primarily engaged in lending and leasing businesses. Recently, the said
            company has focused on acquisition and leasing of properties.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { year: '2010', label: 'Commercial & Residential Leasing' },
              { year: '2015', label: 'Microlending & Financing' },
              { year: '2016', label: 'LPG & Other Gases (PRYCE); Furniture, Appliances, Musical Instruments, Equipment, Small Appliances (FAMES)' },
              { year: '2016', label: 'Management & Services' },
              { year: '2018', label: 'Import & Export Services' },
              { year: '2023', label: 'Real Estate & Construction Services' },
              { year: '2024', label: 'Retail & Wholesale; IT Tech & Services' }
            ].map((item) => (
              <div
                key={`${item.year}-${item.label}`}
                className="rounded-2xl border border-brand-secondary/30 bg-brand-background-alt p-4"
              >
                <span className="text-lg font-bold text-brand-green">{item.year}</span>
                <p className="mt-2 text-sm font-medium text-brand-text">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Core Values */}
        <div className="mt-12 rounded-2xl border border-brand-secondary/30 bg-brand-background-alt p-6">
          <h3 className="text-base font-bold uppercase tracking-wider text-brand-dark">
            Our Core Values
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-brand-text/90">
            Throughout the years, the Amalgated Group has remained committed to its core values of{' '}
            <strong className="text-brand-text">Compassion, Leadership, Integrity, Excellence, Nurtureship, Teamwork and Sense of Urgency (CLIENTS)</strong>.
            Its success is fueled not only by the passion of its people to provide the best service
            to its <strong className="text-brand-text">Partners, Employees, Tenants and Suppliers (PETS)</strong>, but also
            by implementing our tradition and culture in conducting all business the{' '}
            <strong className="text-brand-text">“Amalgated Way”</strong>. This attitude is required
            of all of us so we can make our vision and mission a reality.
          </p>
        </div>

        {/* At a glance */}
        <div className="mt-12 rounded-2xl border border-brand-secondary/30 bg-brand-background-alt p-8 shadow-[0_2px_12px_rgba(58,63,69,0.06)]">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-text/70">
            At a glance
          </h3>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-[15px] text-brand-text/90 sm:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-[0.18em] text-brand-text/60">
                Group companies
              </dt>
              <dd className="mt-1 font-semibold text-brand-text">9</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.18em] text-brand-text/60">
                Commercial real estate
              </dt>
              <dd className="mt-1 font-semibold text-brand-text">92</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.18em] text-brand-text/60">
                Residential estate
              </dt>
              <dd className="mt-1 font-semibold text-brand-text">10</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.18em] text-brand-text/60">
                Total lease receivables
              </dt>
              <dd className="mt-1 font-semibold text-brand-text">4.4B (with contract)</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
};

export default About;
