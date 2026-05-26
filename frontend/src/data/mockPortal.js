export const adminKpis = [
  { label: 'Portfolio Value', value: 'PHP 2.4B', change: '+8.4%', trend: 'up' },
  { label: 'Open Requests', value: '37', change: '-6.5%', trend: 'down' },
];

export const revenueTrend = [
  { month: 'Jan', revenue: 14200000, occupancy: 88 },
  { month: 'Feb', revenue: 15100000, occupancy: 90 },
  { month: 'Mar', revenue: 15800000, occupancy: 91 },
  { month: 'Apr', revenue: 16900000, occupancy: 92 },
  { month: 'May', revenue: 18100000, occupancy: 94 },
  { month: 'Jun', revenue: 18700000, occupancy: 94 },
];

export const propertyMix = [
  { type: 'Commercial', units: 42 },
  { type: 'Residential', units: 68 },
  { type: 'Industrial', units: 18 },
  { type: 'Retail', units: 26 },
];

export const activityFeed = [
  { title: 'Lease renewal approved', detail: 'Cebu Creative Labs renewed for 24 months.', time: '12 min ago' },
  { title: 'Portfolio note added', detail: 'Northpoint Foods Inc. account review was updated.', time: '42 min ago' },
  { title: 'Maintenance escalated', detail: 'Elevator service request moved to urgent.', time: '2 hrs ago' },
  { title: 'New lead captured', detail: 'Visitor requested a warehouse viewing.', time: '4 hrs ago' },
];

export const adminTables = {
  properties: [
    { name: 'APMC Corporate Center', type: 'Commercial', location: 'Makati City', occupancy: '96%', revenue: 'PHP 8.4M', status: 'Active' },
    { name: 'Mactan Business Park', type: 'Office', location: 'Lapu-Lapu City', occupancy: '91%', revenue: 'PHP 3.2M', status: 'Active' },
    { name: 'South Hub Warehouses', type: 'Industrial', location: 'Laguna', occupancy: '88%', revenue: 'PHP 4.9M', status: 'Active' },
    { name: 'The Meridian Suites', type: 'Residential', location: 'Taguig City', occupancy: '97%', revenue: 'PHP 2.2M', status: 'Active' },
  ],
  leases: [
    { tenant: 'Northpoint Foods Inc.', property: 'APMC Corporate Center', term: '36 months', renewal: 'Nov 2026', value: 'PHP 42M', status: 'Current' },
    { tenant: 'Cebu Creative Labs', property: 'Mactan Business Park', term: '24 months', renewal: 'May 2028', value: 'PHP 10.1M', status: 'Renewed' },
    { tenant: 'Harbor Logistics', property: 'South Hub Warehouses', term: '48 months', renewal: 'Jan 2027', value: 'PHP 35M', status: 'Review' },
  ],
  maintenance: [
    { ticket: 'MNT-2201', property: 'APMC Corporate Center', issue: 'Elevator inspection', priority: 'High', assignee: 'Facilities Team', status: 'In Progress' },
    { ticket: 'MNT-2200', property: 'The Meridian Suites', issue: 'Water pressure check', priority: 'Medium', assignee: 'Plumbing Vendor', status: 'Scheduled' },
    { ticket: 'MNT-2199', property: 'South Hub Warehouses', issue: 'Dock door repair', priority: 'High', assignee: 'Ops Team', status: 'Open' },
  ],
  crm: [
    { lead: 'Prime Retail Group', contact: 'Mia Garcia', interest: 'Retail frontage', value: 'PHP 18M', stage: 'Proposal', source: 'Website chat' },
    { lead: 'Atlas Logistics', contact: 'Ren Ramos', interest: 'Warehouse lease', value: 'PHP 28M', stage: 'Viewing', source: 'Referral' },
    { lead: 'Horizon BPO', contact: 'Pat Lim', interest: 'Office expansion', value: 'PHP 14M', stage: 'Qualified', source: 'Campaign' },
  ],
  analytics: [
    { metric: 'Website Leads', value: '148', change: '+18%', owner: 'Marketing' },
    { metric: 'Tour Conversion', value: '32%', change: '+6%', owner: 'Leasing' },
    { metric: 'Avg. Resolution Time', value: '14h', change: '-9%', owner: 'Operations' },
    { metric: 'Collection Rate', value: '97.6%', change: '+1.3%', owner: 'Finance' },
  ],
  users: [
    { name: 'Ana Reyes', role: 'Portfolio Manager', email: 'ana.reyes@apmc.test', status: 'Active', lastSeen: 'Today' },
    { name: 'Marco Tan', role: 'Finance Admin', email: 'marco.tan@apmc.test', status: 'Active', lastSeen: 'Yesterday' },
    { name: 'Liza Cruz', role: 'Maintenance Lead', email: 'liza.cruz@apmc.test', status: 'Invited', lastSeen: 'Pending' },
  ],
  settings: [
    { setting: 'Brand Theme', value: 'Corporate Blue', area: 'Appearance', status: 'Enabled' },
    { setting: 'Lease Reminders', value: '30 days before renewal', area: 'Leasing', status: 'Enabled' },
    { setting: 'Maintenance SLA', value: '24 hour response', area: 'Operations', status: 'Enabled' },
  ],
};

export const clientKpis = [
  { label: 'Active Leases', value: '3', change: 'All current' },
  { label: 'Open Requests', value: '2', change: '1 scheduled' },
  { label: 'Documents', value: '18', change: '4 new' },
  { label: 'Announcements', value: '3', change: 'Published notices' },
];

export const clientTables = {
  properties: [
    { property: 'The Meridian Suites', unit: '12A', lease: 'Residential', manager: 'Ana Reyes', status: 'Active' },
    { property: 'APMC Corporate Center', unit: '18F-02', lease: 'Office', manager: 'Marco Tan', status: 'Active' },
  ],
  maintenance: [
    { ticket: 'REQ-391', property: 'The Meridian Suites', issue: 'Aircon preventive maintenance', schedule: 'May 24, 2026', status: 'Scheduled' },
    { ticket: 'REQ-390', property: 'APMC Corporate Center', issue: 'Access card replacement', schedule: 'Pending', status: 'Open' },
  ],
  documents: [
    { name: 'Lease Agreement 2026.pdf', type: 'Lease', property: 'The Meridian Suites', updated: 'May 12, 2026' },
    { name: 'Move-in Checklist.pdf', type: 'Checklist', property: 'APMC Corporate Center', updated: 'May 3, 2026' },
    { name: 'House Rules.pdf', type: 'Policy', property: 'The Meridian Suites', updated: 'Apr 28, 2026' },
  ],
  support: [
    { caseId: 'SUP-1204', topic: 'Document access', owner: 'Client Success', status: 'Answered', updated: 'Today' },
    { caseId: 'SUP-1201', topic: 'Move-in permits', owner: 'Client Success', status: 'Closed', updated: 'May 11, 2026' },
  ],
  profile: [
    { field: 'Primary Contact', value: 'Jamie Santos', section: 'Account' },
    { field: 'Email', value: 'jamie.santos@example.com', section: 'Account' },
    { field: 'Mailing Address', value: 'Taguig City, Metro Manila', section: 'Account' },
    { field: 'Notification Preference', value: 'Email and SMS', section: 'Preferences' },
  ],
};
