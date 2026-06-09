import {
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  Handshake,
  MapPinned,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';

export const stats = [
  { value: '92', suffix: '', label: 'Commercial Assets', detail: 'Income-generating and pipeline commercial assets across strategic Philippine locations', icon: Building2 },
  { value: '10', suffix: '', label: 'Residential Estates', detail: 'Managed residential estates, condominium interests, and long-term community holdings', icon: MapPinned },
  { value: '4.4', suffix: 'B', prefix: '₱', label: 'Lease Receivables', detail: 'Contracted receivables from active lease relationships and institutional agreements', icon: ReceiptText },
  { value: '100', suffix: '+', label: 'Active Contracts', detail: 'Commercial, institutional, government, and service tenant agreements', icon: Handshake },
  { value: '88.5', suffix: '%', label: 'Occupancy', detail: '2024 stabilized occupancy across managed and portfolio assets', icon: TrendingUp },
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
    title: 'Corporate Office Expansion',
    location: 'Davao City',
    category: 'Corporate Infrastructure',
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'A premium headquarters and operations center supporting governance, leasing, accounting, and portfolio analytics.',
    progress: 68,
    capital: '₱100M',
  },
  {
    title: 'Keys School Expansion',
    location: 'Institutional Asset Program',
    category: 'Education Property',
    image: 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'An education-linked property initiative expanding the Key School asset base and long-term institutional value.',
    progress: 54,
    capital: '₱100M',
  },
  {
    title: '₱500M Acquisition Program',
    location: 'Luzon, Visayas, Mindanao',
    category: 'Investment Program',
    image: 'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'A multi-region acquisition mandate designed to expand income-producing commercial buildings and strategic landholdings.',
    progress: 41,
    capital: '₱500M',
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
    title: 'Strategic Leasing Growth Across Priority Corridors',
    date: 'May 2026',
    category: 'Strategic Leasing Growth',
    excerpt: 'APMC continues to organize its commercial portfolio around stronger tenant access, institutional lease discipline, and long-term occupancy growth.',
  },
  {
    title: 'Property Management Insights for Institutional Tenants',
    date: 'April 2026',
    category: 'Property Management Insights',
    excerpt: 'Reliable property management helps companies reduce downtime, coordinate maintenance, protect lease value, and keep business operations moving.',
  },
  {
    title: 'Expansion Programs Position APMC for Nationwide Growth',
    date: 'March 2026',
    category: 'Expansion Programs',
    excerpt: 'Project 101 and the ₱500M acquisition program support a disciplined pipeline across Luzon, Visayas, and Mindanao.',
  },
  {
    title: 'Market Perspectives on Regional Commercial Demand',
    date: 'February 2026',
    category: 'Market Perspectives',
    excerpt: 'Banks, service firms, telcos, retailers, and government-linked users continue to seek dependable spaces in high-connectivity provincial hubs.',
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
