import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import logo from '../assets/apmc.png';

const footerLinks = {
  Company: [
    { label: 'About', to: '/about' },
    { label: 'Projects', to: '/projects' },
    { label: 'News', to: '/news' },
    { label: 'Careers', to: '/careers' },
  ],
  Portfolio: [
    { label: 'Properties', to: '/properties' },
    { label: 'Services', to: '/services' },
    { label: 'Why Choose Us', to: '/why-us' },
    { label: 'Contact', to: '/contact' },
  ],
  Access: [
    { label: 'Client Portal', to: '/portal/login' },
    { label: 'Admin', to: '/admin/login' },
  ],
};

const Footer = () => {
  return (
    <footer className="mt-auto bg-brand-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1.4fr]">
          <div>
            <img
              src={logo}
              alt="Amalgated Properties &amp; Management Corporation"
              className="h-12 w-12 object-contain"
            />
            <p className="mt-5 text-lg font-semibold leading-none tracking-wide text-white">
              Amalgated Properties &amp; Management Corporation
            </p>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
              Premium leasing, property management, asset strategy, and business consultancy for
              companies seeking dependable spaces and long-term value.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/65">
              <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-brand-accent" /> Philippines</p>
              <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-brand-accent" /> Leasing and management inquiries</p>
              <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-brand-accent" /> Contact us through the website form</p>
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">{group}</h3>
                <div className="mt-5 grid gap-3 text-sm text-white/65">
                  {links.map((link) => (
                    <Link key={link.to} to={link.to} className="transition hover:text-white">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Amalgated Properties. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
