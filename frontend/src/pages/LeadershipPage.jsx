import React, { useMemo, useState } from 'react';
import { Award, BriefcaseBusiness, GraduationCap, X } from 'lucide-react';
import { leadershipGroups } from '../data/enterpriseContent.js';

const allMembers = leadershipGroups.flatMap((group) => group.members.map((member) => ({ ...member, group: group.group })));

const LeadershipPage = () => {
  const [activeMember, setActiveMember] = useState(null);
  const combinedExperience = useMemo(
    () => allMembers.reduce((sum, member) => sum + member.experience, 0),
    []
  );

  return (
    <div className="bg-brand-background-alt">
      <section className="relative overflow-hidden bg-brand-primary py-20 text-white sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(117,162,191,0.35),transparent_35%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Leadership</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
            Executive stewardship for an enterprise property platform.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">
            APMC’s leadership combines asset strategy, leasing operations, finance, facilities, and digital transformation discipline.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['Committee Members', allMembers.length],
              ['Combined Experience', combinedExperience >= 300 ? '300+' : `${combinedExperience}+`],
              ['Governance Groups', leadershipGroups.length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-3xl font-bold">{value}</p>
                <p className="mt-2 text-sm text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {leadershipGroups.map((group) => (
        <section key={group.group} className="py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">{group.group}</p>
                <h2 className="mt-2 text-3xl font-bold text-brand-text">Experienced decision makers</h2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {group.members.map((member) => (
                <button
                  key={member.name}
                  type="button"
                  onClick={() => setActiveMember(member)}
                  className="group overflow-hidden rounded-[2rem] bg-white text-left shadow-card transition hover:-translate-y-1 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <div className="relative h-72 overflow-hidden">
                    <img src={member.image} alt={member.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-transparent to-transparent" />
                    <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-primary">
                      {member.experience}+ years
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-brand-text">{member.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-brand-primary">{member.position}</p>
                    <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-brand-text/68">
                      <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                      {member.expertise}
                    </p>
                    <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-brand-text/68">
                      <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                      {member.education}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      ))}

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
                <p className="mt-2 leading-7 text-brand-text/76">{activeMember.education}</p>
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

export default LeadershipPage;
