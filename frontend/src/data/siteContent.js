import {
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  Handshake,
  Landmark,
  MapPinned,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';

export const stats = [
  { value: '92', suffix: '', label: 'Commercial real estate assets', detail: 'Income-generating and pipeline assets across strategic Philippine locations', icon: Building2 },
  { value: '10', suffix: '', label: 'Residential estates', detail: 'Managed communities, condominium units, and estate holdings', icon: MapPinned },
  { value: '4.4', suffix: 'B', prefix: '₱', label: 'Lease receivables', detail: 'Contracted receivables from active lease relationships', icon: ReceiptText },
  { value: '9', suffix: '', label: 'Group companies', detail: 'Diversified operating companies within the Amalgated group', icon: Landmark },
  { value: '100', suffix: '+', label: 'Active contracts', detail: 'Commercial, institutional, government, and service tenant agreements', icon: Handshake },
  { value: '88.5', suffix: '%', label: 'Occupancy rate', detail: '2024 stabilized portfolio occupancy across managed assets', icon: TrendingUp },
];

export const services = [
  {
    title: 'Property Leasing',
    description: 'End-to-end leasing support for banks, government offices, BPOs, telcos, retail operators, and commercial tenants.',
    icon: Building2,
  },
  {
    title: 'Property Management',
    description: 'Operational care, tenant coordination, maintenance oversight, and portfolio stewardship.',
    icon: ClipboardCheck,
  },
  {
    title: 'Asset Strategy',
    description: 'Data-informed guidance for acquisitions, Project 101 expansion, repositioning, occupancy, and long-term value creation.',
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
    title: '₱500M Nationwide Acquisition Program',
    location: 'Luzon, Visayas, Mindanao',
    category: 'Investment Program',
    image: 'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'A multi-region acquisition mandate designed to expand income-producing commercial buildings and strategic landholdings.',
  },
  {
    title: '₱100M Corporate Office Expansion',
    location: 'Davao City',
    category: 'Corporate Infrastructure',
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'A premium headquarters and operations center supporting governance, leasing, accounting, and portfolio analytics.',
  },
  {
    title: '₱100M Keys School Expansion',
    location: 'Institutional Asset Program',
    category: 'Education Property',
    image: 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'An education-linked property initiative expanding the Key School asset base and long-term institutional value.',
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
