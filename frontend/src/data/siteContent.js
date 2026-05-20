import {
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  Handshake,
  MapPinned,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';

export const stats = [
  { value: '92', label: 'Commercial real estate assets', detail: 'Across strategic Philippine locations' },
  { value: '10', label: 'Residential estates', detail: 'Managed communities and units' },
  { value: '4.4B', label: 'Lease receivables', detail: 'With active contracts' },
  { value: '9', label: 'Group companies', detail: 'A diversified business network' },
];

export const services = [
  {
    title: 'Property Leasing',
    description: 'End-to-end leasing support for banks, BPOs, offices, retail operators, and commercial tenants.',
    icon: Building2,
  },
  {
    title: 'Property Management',
    description: 'Operational care, tenant coordination, maintenance oversight, and portfolio stewardship.',
    icon: ClipboardCheck,
  },
  {
    title: 'Asset Strategy',
    description: 'Data-informed guidance for acquisitions, repositioning, occupancy, and long-term value creation.',
    icon: TrendingUp,
  },
  {
    title: 'Business Consultancy',
    description: 'Practical management support for partners seeking efficient, growth-ready operations.',
    icon: BriefcaseBusiness,
  },
];

export const projects = [
  {
    title: 'Mindanao Commercial Portfolio',
    location: 'Davao, Tagum, General Santos',
    category: 'Commercial Leasing',
    image: 'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'A growing network of income-generating commercial properties serving institutional tenants.',
  },
  {
    title: 'Caticlan Gateway Sites',
    location: 'Aklan, Visayas',
    category: 'Destination Commercial',
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Strategically located leasing assets near tourism and transport corridors.',
  },
  {
    title: 'Pryce Tower Units',
    location: 'Davao City',
    category: 'Condominium Assets',
    image: 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Managed condominium and parking assets built for convenience and recurring value.',
  },
];

export const testimonials = [
  {
    quote: 'APMC understands the needs of institutional tenants and moves quickly when operational concerns arise.',
    name: 'Corporate Tenant',
    role: 'Financial Services',
  },
  {
    quote: 'Their team brings a practical, long-term view to leasing and property care across our sites.',
    name: 'Regional Partner',
    role: 'Commercial Operations',
  },
  {
    quote: 'The Amalgated team combines local market familiarity with the discipline expected from a professional landlord.',
    name: 'Business Client',
    role: 'Office Leasing',
  },
];

export const news = [
  {
    title: 'APMC Expands Portfolio Visibility Across Key Regional Markets',
    date: 'May 2026',
    category: 'Company Update',
    excerpt: 'The group continues to organize its real estate portfolio around better leasing access and stronger tenant support.',
  },
  {
    title: 'Why Strategic Property Management Matters for Growing Tenants',
    date: 'April 2026',
    category: 'Insight',
    excerpt: 'Reliable property management helps businesses reduce downtime, plan occupancy, and protect long-term value.',
  },
  {
    title: 'Commercial Leasing Demand Remains Active in Provincial Hubs',
    date: 'March 2026',
    category: 'Market Notes',
    excerpt: 'Banks, service firms, and retail operators continue to seek dependable spaces in high-connectivity locations.',
  },
];

export const reasons = [
  {
    title: 'Institutional mindset',
    description: 'Disciplined leasing, documentation, and tenant support for serious business occupiers.',
    icon: ShieldCheck,
  },
  {
    title: 'Regional reach',
    description: 'Properties and local coordination across Luzon, Visayas, and Mindanao markets.',
    icon: MapPinned,
  },
  {
    title: 'Partner-first service',
    description: 'A culture shaped around clients, partners, employees, tenants, and suppliers.',
    icon: Handshake,
  },
  {
    title: 'People-led delivery',
    description: 'Accessible teams that understand the daily realities of property operations.',
    icon: Users,
  },
];
