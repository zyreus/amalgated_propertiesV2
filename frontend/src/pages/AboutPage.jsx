import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BriefcaseBusiness, CheckCircle2, Globe2, GraduationCap, X } from 'lucide-react';
import { stats } from '../data/siteContent.js';
import { companyMilestones, companyProfile, leadershipGroups, regionalReach } from '../data/enterpriseContent.js';

const values = ['Compassion', 'Leadership', 'Integrity', 'Excellence', 'Nurtureship', 'Teamwork', 'Sense of Urgency'];

const AboutPage = () => {
  const [activeMember, setActiveMember] = useState(null);
  const allMembers = useMemo(
    () => leadershipGroups.flatMap((group) => group.members.map((member) => ({ ...member, group: group.group }))),
    []
  );
  const combinedExperience = useMemo(
    () => allMembers.reduce((sum, member) => sum + member.experience, 0),
    [allMembers]
  );

  return (
    <div className="bg-brand-background-alt">
    <section className="relative overflow-hidden bg-brand-primary py-20 text-white sm:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(117,162,191,0.36),transparent_30%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.78fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">Company</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
            A property partner shaped by the Amalgated Way.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">{companyProfile.positioning}</p>
        </div>
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Origin Story</p>
          <p className="mt-4 text-lg leading-8 text-white/82">{companyProfile.founding}</p>
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-3xl bg-white p-8 shadow-card">
          <h2 className="text-2xl font-bold text-brand-text">Who We Are</h2>
          <p className="mt-4 leading-8 text-brand-text/75">{companyProfile.mission}</p>
          <p className="mt-4 leading-8 text-brand-text/75">{companyProfile.vision}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {['Property acquisition and leasing', 'Tenant and portfolio management', 'Property development and ventures', 'Business management consultancy', 'Project 101 nationwide expansion', 'Investor-ready reporting discipline'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-semibold text-brand-text">
                <CheckCircle2 className="h-5 w-5 text-brand-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-white p-8 shadow-card">
          <h2 className="text-2xl font-bold text-brand-text">Core Values</h2>
          <p className="mt-4 leading-8 text-brand-text/75">
            Our culture is anchored by CLIENTS and a service commitment to Partners, Employees,
            Tenants, and Suppliers.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {values.map((value) => (
              <span key={value} className="rounded-full bg-brand-primary/10 px-4 py-2 text-sm font-semibold text-brand-primary">
                {value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
          {companyMilestones.map((milestone) => (
            <div key={milestone.year} className="rounded-3xl border border-brand-secondary/20 bg-brand-background-alt p-5">
              <p className="text-2xl font-black text-brand-primary">{milestone.year}</p>
              <p className="mt-2 text-sm font-bold text-brand-text">{milestone.title}</p>
              <p className="mt-2 text-xs leading-5 text-brand-text/65">{milestone.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-brand-secondary/20 p-6">
              <p className="text-4xl font-bold text-brand-primary">{stat.prefix}{stat.value}{stat.suffix}</p>
              <p className="mt-3 text-sm font-semibold text-brand-text">{stat.label}</p>
              <p className="mt-2 text-sm text-brand-text/65">{stat.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-[2rem] bg-white p-8 shadow-card">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">
            <Globe2 className="h-4 w-4" />
            Nationwide Reach
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {regionalReach.map((region) => (
              <div key={region.region} className="rounded-3xl bg-brand-background-alt p-5">
                <p className="text-xl font-bold text-brand-text">{region.region}</p>
                <p className="mt-2 text-sm font-semibold text-brand-primary">{region.assets} active assets</p>
                <p className="mt-3 text-sm leading-6 text-brand-text/68">{region.focus}</p>
              </div>
            ))}
          </div>
        </div>
        <Link to="/contact" className="mt-10 inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white">
          Connect With Us
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>

    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">Leadership</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-text sm:text-5xl">
              Executive Committee and Management Committee
            </h2>
            <p className="mt-5 text-base leading-8 text-brand-text/72">
              APMC is guided by experienced decision makers across capital strategy, leasing,
              property operations, finance, facilities, and digital platforms.
            </p>
          </div>
          <div className="rounded-[2rem] bg-brand-primary p-8 text-white shadow-brand-primary">
            <p className="text-5xl font-black">{combinedExperience >= 300 ? '300+' : `${combinedExperience}+`}</p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Years Combined Experience</p>
            <p className="mt-4 text-sm leading-7 text-white/75">
              Institutional property judgment backed by multi-disciplinary operating leadership.
            </p>
          </div>
        </div>

        {leadershipGroups.map((group) => (
          <div key={group.group} className="mt-12">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-brand-text">{group.group}</h3>
              <span className="rounded-full bg-brand-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
                {group.members.length} members
              </span>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {group.members.map((member) => (
                <button
                  key={member.name}
                  type="button"
                  onClick={() => setActiveMember(member)}
                  className="group overflow-hidden rounded-[2rem] border border-brand-secondary/20 bg-white text-left shadow-card transition hover:-translate-y-1 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img src={member.image} alt={member.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-transparent to-transparent" />
                    <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-primary">
                      {member.experience}+ years
                    </span>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-brand-text">{member.name}</h4>
                    <p className="mt-1 text-sm font-semibold text-brand-primary">{member.position}</p>
                    <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-brand-text/68">
                      <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                      {member.expertise}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>

    {activeMember && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/70 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
        <div className="relative max-h-[92vh] w-full max-w-3xl overflow-auto rounded-[2rem] bg-white shadow-2xl">
          <button
            type="button"
            onClick={() => setActiveMember(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-brand-text shadow-card transition hover:bg-brand-primary hover:text-white"
            aria-label="Close profile"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="grid md:grid-cols-[0.8fr_1.2fr]">
            <img src={activeMember.image} alt={activeMember.name} className="h-full min-h-80 w-full object-cover" />
            <div className="p-8">
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">
                <Award className="h-4 w-4" />
                {activeMember.experience}+ years
              </p>
              <h2 className="mt-5 text-3xl font-bold text-brand-text">{activeMember.name}</h2>
              <p className="mt-2 font-semibold text-brand-primary">{activeMember.position}</p>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-brand-text/50">Expertise</p>
              <p className="mt-2 leading-7 text-brand-text/76">{activeMember.expertise}</p>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-brand-text/50">Educational Background</p>
              <p className="mt-2 flex items-start gap-2 leading-7 text-brand-text/76">
                <GraduationCap className="mt-1 h-4 w-4 shrink-0 text-brand-primary" />
                {activeMember.education}
              </p>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-brand-text/50">Biography</p>
              <p className="mt-2 leading-8 text-brand-text/76">{activeMember.bio}</p>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default AboutPage;
