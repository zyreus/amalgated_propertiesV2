import bcrypt from 'bcryptjs';
import db from '../db.js';

const now = () => new Date().toISOString();

db.exec(`
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL,
    property_id INTEGER,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive','suspended')),
    last_login_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'available' CHECK(status IN ('available','leased','maintenance','inactive')),
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Davao City',
    province TEXT DEFAULT 'Davao del Sur',
    description TEXT,
    price REAL DEFAULT 0,
    area_sqm REAL DEFAULT 0,
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    parking_slots INTEGER DEFAULT 0,
    amenities TEXT DEFAULT '[]',
    featured INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS property_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    alt TEXT,
    sort_order INTEGER DEFAULT 0,
    is_primary INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    unit_number TEXT NOT NULL,
    floor TEXT,
    type TEXT,
    status TEXT DEFAULT 'vacant' CHECK(status IN ('vacant','occupied','reserved','maintenance','inactive')),
    rent_amount REAL DEFAULT 0,
    area_sqm REAL DEFAULT 0,
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(property_id, unit_number),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    property_id INTEGER,
    unit_id INTEGER,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    emergency_contact TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive','former')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS leases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    unit_id INTEGER,
    tenant_id INTEGER,
    user_id INTEGER,
    lease_number TEXT UNIQUE NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    rent_amount REAL NOT NULL,
    security_deposit REAL DEFAULT 0,
    payment_frequency TEXT DEFAULT 'monthly',
    status TEXT DEFAULT 'active' CHECK(status IN ('draft','active','expired','terminated','renewed')),
    terms TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lease_id INTEGER,
    tenant_id INTEGER,
    invoice_number TEXT UNIQUE NOT NULL,
    amount REAL NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT DEFAULT 'unpaid' CHECK(status IN ('unpaid','partial','paid','overdue','void')),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER,
    lease_id INTEGER,
    tenant_id INTEGER,
    amount REAL NOT NULL,
    payment_date TEXT NOT NULL,
    method TEXT DEFAULT 'bank_transfer',
    reference_number TEXT,
    status TEXT DEFAULT 'completed' CHECK(status IN ('pending','completed','failed','refunded')),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
    FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    unit_id INTEGER,
    tenant_id INTEGER,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
    status TEXT DEFAULT 'open' CHECK(status IN ('open','assigned','in_progress','completed','cancelled')),
    assigned_to TEXT,
    scheduled_at TEXT,
    completed_at TEXT,
    cost REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS support_tickets_pm (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    property_id INTEGER,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
    status TEXT DEFAULT 'open' CHECK(status IN ('open','pending','resolved','closed')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    lease_id INTEGER,
    user_id INTEGER,
    title TEXT NOT NULL,
    document_type TEXT,
    file_url TEXT NOT NULL,
    visibility TEXT DEFAULT 'admin' CHECK(visibility IN ('admin','client','public')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    audience TEXT DEFAULT 'all' CHECK(audience IN ('all','admin','client')),
    status TEXT DEFAULT 'published' CHECK(status IN ('draft','published','archived')),
    published_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
  CREATE INDEX IF NOT EXISTS idx_users_property ON users(property_id);
  CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
  CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
  CREATE INDEX IF NOT EXISTS idx_units_property ON units(property_id);
  CREATE INDEX IF NOT EXISTS idx_units_status ON units(status);
  CREATE INDEX IF NOT EXISTS idx_leases_property ON leases(property_id);
  CREATE INDEX IF NOT EXISTS idx_leases_user ON leases(user_id);
  CREATE INDEX IF NOT EXISTS idx_leases_status ON leases(status);
  CREATE INDEX IF NOT EXISTS idx_tenants_user ON tenants(user_id);
  CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
  CREATE INDEX IF NOT EXISTS idx_payments_lease ON payments(lease_id);
  CREATE INDEX IF NOT EXISTS idx_maintenance_property ON maintenance_requests(property_id);
  CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
  CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
  CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
  CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
`);

const seedRole = db.prepare('INSERT OR IGNORE INTO roles (name, description) VALUES (?, ?)');
seedRole.run('admin', 'Property management administrator');
seedRole.run('client', 'Property owner or tenant portal user');

const permissions = [
  ['properties:manage', 'Create and manage properties'],
  ['leases:manage', 'Create and manage leases'],
  ['payments:manage', 'Record and reconcile payments'],
  ['maintenance:manage', 'Manage maintenance work orders'],
  ['dashboard:view', 'View dashboard analytics'],
];
const seedPermission = db.prepare('INSERT OR IGNORE INTO permissions (name, description) VALUES (?, ?)');
permissions.forEach((permission) => seedPermission.run(...permission));

const adminRole = db.prepare("SELECT id FROM roles WHERE name = 'admin'").get();
const clientRole = db.prepare("SELECT id FROM roles WHERE name = 'client'").get();

if (adminRole) {
  const permissionRows = db.prepare('SELECT id FROM permissions').all();
  const seedRolePermission = db.prepare('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)');
  permissionRows.forEach((permission) => seedRolePermission.run(adminRole.id, permission.id));
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function asJson(value, fallback = []) {
  if (value === undefined) return JSON.stringify(fallback);
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function insert(table, data) {
  const keys = Object.keys(data).filter((key) => data[key] !== undefined);
  const columns = keys.join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map((key) => data[key]);
  const result = db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`).run(...values);
  return getById(table, result.lastInsertRowid);
}

function updateById(table, id, data) {
  const keys = Object.keys(data).filter((key) => data[key] !== undefined);
  if (!keys.length) return getById(table, id);
  const assignments = keys.map((key) => `${key} = ?`).join(', ');
  const values = keys.map((key) => data[key]);
  db.prepare(`UPDATE ${table} SET ${assignments}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);
  return getById(table, id);
}

function getById(table, id) {
  return db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
}

function removeById(table, id) {
  return db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id).changes > 0;
}

function buildFilters(baseSql, filter = {}, allowed = []) {
  const clauses = [];
  const values = [];
  allowed.forEach((key) => {
    if (filter[key] !== undefined && filter[key] !== '') {
      clauses.push(`${key} = ?`);
      values.push(filter[key]);
    }
  });
  const sql = clauses.length ? `${baseSql} WHERE ${clauses.join(' AND ')}` : baseSql;
  return { sql, values };
}

export function createUser(data) {
  return insert('users', {
    role_id: data.role_id ?? (data.role === 'admin' ? adminRole?.id : clientRole?.id),
    property_id: data.property_id ?? null,
    name: data.name,
    email: data.email,
    username: data.username ?? data.email,
    password_hash: data.password_hash ?? bcrypt.hashSync(data.password || 'ChangeMe123!', 10),
    phone: data.phone ?? null,
    status: data.status ?? 'active',
  });
}

export function getUserById(id) {
  return db.prepare(`
    SELECT users.*, roles.name AS role
    FROM users
    JOIN roles ON roles.id = users.role_id
    WHERE users.id = ?
  `).get(id);
}

export function getUserByLogin(login) {
  return db.prepare(`
    SELECT users.*, roles.name AS role
    FROM users
    JOIN roles ON roles.id = users.role_id
    WHERE users.email = ? OR users.username = ?
  `).get(login, login);
}

export function listUsers(filter = {}) {
  const { sql, values } = buildFilters(`
    SELECT users.id, users.role_id, users.property_id, users.name, users.email, users.username,
           users.phone, users.status, users.last_login_at, users.created_at, users.updated_at,
           roles.name AS role
    FROM users
    JOIN roles ON roles.id = users.role_id
  `, filter, ['status', 'property_id']);
  return db.prepare(`${sql} ORDER BY users.created_at DESC`).all(...values);
}

export function updateUser(id, data) {
  const payload = { ...data };
  if (payload.password) {
    payload.password_hash = bcrypt.hashSync(payload.password, 10);
    delete payload.password;
  }
  delete payload.role;
  return updateById('users', id, payload);
}

export function deleteUser(id) {
  return removeById('users', id);
}

export function markUserLogin(id) {
  db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(id);
  return getUserById(id);
}

export function listProperties(filter = {}) {
  let sql = 'SELECT * FROM properties';
  const values = [];
  const clauses = [];
  ['status', 'type', 'city', 'featured'].forEach((key) => {
    if (filter[key] !== undefined && filter[key] !== '') {
      clauses.push(`${key} = ?`);
      values.push(filter[key]);
    }
  });
  if (filter.search) {
    clauses.push('(name LIKE ? OR address LIKE ? OR description LIKE ?)');
    values.push(`%${filter.search}%`, `%${filter.search}%`, `%${filter.search}%`);
  }
  if (clauses.length) sql += ` WHERE ${clauses.join(' AND ')}`;
  return db.prepare(`${sql} ORDER BY featured DESC, created_at DESC`).all(...values);
}

export function getPropertyById(id) {
  return getById('properties', id);
}

export function getPropertyBySlug(slug) {
  const property = db.prepare('SELECT * FROM properties WHERE slug = ?').get(slug);
  if (!property) return null;
  return {
    ...property,
    images: db.prepare('SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order ASC, id ASC').all(property.id),
    units: db.prepare('SELECT * FROM units WHERE property_id = ? ORDER BY unit_number ASC').all(property.id),
  };
}

export function createProperty(data) {
  return insert('properties', {
    slug: data.slug || slugify(data.name),
    name: data.name,
    type: data.type,
    status: data.status ?? 'available',
    address: data.address,
    city: data.city ?? 'Davao City',
    province: data.province ?? 'Davao del Sur',
    description: data.description ?? null,
    price: data.price ?? 0,
    area_sqm: data.area_sqm ?? 0,
    bedrooms: data.bedrooms ?? 0,
    bathrooms: data.bathrooms ?? 0,
    parking_slots: data.parking_slots ?? 0,
    amenities: asJson(data.amenities),
    featured: data.featured ? 1 : 0,
  });
}

export function updateProperty(id, data) {
  return updateById('properties', id, {
    ...data,
    slug: data.slug ?? (data.name ? slugify(data.name) : undefined),
    amenities: data.amenities !== undefined ? asJson(data.amenities) : undefined,
    featured: data.featured !== undefined ? (data.featured ? 1 : 0) : undefined,
  });
}

export function deleteProperty(id) {
  return removeById('properties', id);
}

export function createUnit(data) {
  return insert('units', {
    property_id: data.property_id,
    unit_number: data.unit_number,
    floor: data.floor ?? null,
    type: data.type ?? null,
    status: data.status ?? 'vacant',
    rent_amount: data.rent_amount ?? 0,
    area_sqm: data.area_sqm ?? 0,
    bedrooms: data.bedrooms ?? 0,
    bathrooms: data.bathrooms ?? 0,
    notes: data.notes ?? null,
  });
}

export function listUnits(filter = {}) {
  const { sql, values } = buildFilters('SELECT * FROM units', filter, ['property_id', 'status', 'type']);
  return db.prepare(`${sql} ORDER BY property_id ASC, unit_number ASC`).all(...values);
}

export function getUnitById(id) {
  return getById('units', id);
}

export function updateUnit(id, data) {
  return updateById('units', id, data);
}

export function deleteUnit(id) {
  return removeById('units', id);
}

export function createLease(data) {
  return insert('leases', {
    property_id: data.property_id,
    unit_id: data.unit_id ?? null,
    tenant_id: data.tenant_id ?? null,
    user_id: data.user_id ?? null,
    lease_number: data.lease_number ?? `LSE-${Date.now()}`,
    start_date: data.start_date,
    end_date: data.end_date,
    rent_amount: data.rent_amount,
    security_deposit: data.security_deposit ?? 0,
    payment_frequency: data.payment_frequency ?? 'monthly',
    status: data.status ?? 'active',
    terms: data.terms ?? null,
  });
}

export function listLeases(filter = {}) {
  const { sql, values } = buildFilters('SELECT * FROM leases', filter, ['property_id', 'unit_id', 'tenant_id', 'user_id', 'status']);
  return db.prepare(`${sql} ORDER BY created_at DESC`).all(...values);
}

export function getLeaseById(id) {
  return getById('leases', id);
}

export function updateLease(id, data) {
  return updateById('leases', id, data);
}

export function deleteLease(id) {
  return removeById('leases', id);
}

export function createPayment(data) {
  return insert('payments', {
    invoice_id: data.invoice_id ?? null,
    lease_id: data.lease_id ?? null,
    tenant_id: data.tenant_id ?? null,
    amount: data.amount,
    payment_date: data.payment_date ?? now(),
    method: data.method ?? 'bank_transfer',
    reference_number: data.reference_number ?? null,
    status: data.status ?? 'completed',
    notes: data.notes ?? null,
  });
}

export function listPayments(filter = {}) {
  const { sql, values } = buildFilters('SELECT * FROM payments', filter, ['invoice_id', 'lease_id', 'tenant_id', 'status']);
  return db.prepare(`${sql} ORDER BY payment_date DESC, created_at DESC`).all(...values);
}

export function getPaymentById(id) {
  return getById('payments', id);
}

export function updatePayment(id, data) {
  return updateById('payments', id, data);
}

export function deletePayment(id) {
  return removeById('payments', id);
}

export function createMaintenanceRequest(data) {
  return insert('maintenance_requests', {
    property_id: data.property_id,
    unit_id: data.unit_id ?? null,
    tenant_id: data.tenant_id ?? null,
    title: data.title,
    description: data.description,
    priority: data.priority ?? 'medium',
    status: data.status ?? 'open',
    assigned_to: data.assigned_to ?? null,
    scheduled_at: data.scheduled_at ?? null,
    completed_at: data.completed_at ?? null,
    cost: data.cost ?? 0,
  });
}

export function listMaintenanceRequests(filter = {}) {
  const { sql, values } = buildFilters('SELECT * FROM maintenance_requests', filter, ['property_id', 'unit_id', 'tenant_id', 'status', 'priority']);
  return db.prepare(`${sql} ORDER BY created_at DESC`).all(...values);
}

export function getMaintenanceRequestById(id) {
  return getById('maintenance_requests', id);
}

export function updateMaintenanceRequest(id, data) {
  return updateById('maintenance_requests', id, data);
}

export function deleteMaintenanceRequest(id) {
  return removeById('maintenance_requests', id);
}

export function createAnnouncement(data) {
  return insert('announcements', {
    title: data.title,
    body: data.body,
    audience: data.audience ?? 'all',
    status: data.status ?? 'published',
    published_at: data.published_at ?? now(),
  });
}

export function listAnnouncements(filter = {}) {
  const { sql, values } = buildFilters('SELECT * FROM announcements', filter, ['audience', 'status']);
  return db.prepare(`${sql} ORDER BY published_at DESC, created_at DESC`).all(...values);
}

export function getAnnouncementById(id) {
  return getById('announcements', id);
}

export function updateAnnouncement(id, data) {
  return updateById('announcements', id, data);
}

export function deleteAnnouncement(id) {
  return removeById('announcements', id);
}

export function logActivity({ user_id, action, entity_type, entity_id, metadata }) {
  return insert('activity_logs', {
    user_id: user_id ?? null,
    action,
    entity_type: entity_type ?? null,
    entity_id: entity_id ?? null,
    metadata: asJson(metadata, {}),
  });
}

export function listActivityLogs(filter = {}) {
  const { sql, values } = buildFilters('SELECT * FROM activity_logs', filter, ['user_id', 'entity_type', 'entity_id']);
  return db.prepare(`${sql} ORDER BY created_at DESC LIMIT ?`).all(...values, Number(filter.limit) || 100);
}

export function getActivityLogById(id) {
  return getById('activity_logs', id);
}

export function deleteActivityLog(id) {
  return removeById('activity_logs', id);
}

export function getAdminDashboardStats() {
  const one = (sql, params = []) => db.prepare(sql).get(...params);
  return {
    properties: one('SELECT COUNT(*) AS count FROM properties').count,
    availableProperties: one("SELECT COUNT(*) AS count FROM properties WHERE status = 'available'").count,
    units: one('SELECT COUNT(*) AS count FROM units').count,
    occupiedUnits: one("SELECT COUNT(*) AS count FROM units WHERE status = 'occupied'").count,
    activeLeases: one("SELECT COUNT(*) AS count FROM leases WHERE status = 'active'").count,
    openMaintenance: one("SELECT COUNT(*) AS count FROM maintenance_requests WHERE status IN ('open','assigned','in_progress')").count,
    monthlyRevenue: one("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'completed' AND payment_date >= date('now', 'start of month')").total,
    recentPayments: db.prepare('SELECT * FROM payments ORDER BY payment_date DESC, created_at DESC LIMIT 10').all(),
    recentMaintenance: db.prepare('SELECT * FROM maintenance_requests ORDER BY created_at DESC LIMIT 10').all(),
  };
}

export function getClientDashboardStats(userId) {
  const user = getUserById(userId);
  if (!user) return null;
  const leaseClause = user.property_id ? 'property_id = ?' : 'user_id = ?';
  const leaseValue = user.property_id || userId;
  const maintenance = user.property_id
    ? db.prepare("SELECT COUNT(*) AS count FROM maintenance_requests WHERE property_id = ? AND status != 'completed'").get(user.property_id).count
    : 0;
  return {
    user,
    leases: db.prepare(`SELECT * FROM leases WHERE ${leaseClause} ORDER BY created_at DESC`).all(leaseValue),
    payments: db.prepare(`
      SELECT payments.*
      FROM payments
      LEFT JOIN leases ON leases.id = payments.lease_id
      WHERE leases.${leaseClause}
      ORDER BY payments.payment_date DESC
      LIMIT 10
    `).all(leaseValue),
    openMaintenance: maintenance,
    announcements: listAnnouncements({ status: 'published' }).filter((item) => item.audience === 'all' || item.audience === 'client'),
  };
}

export function seedProperties() {
  const existing = db.prepare('SELECT COUNT(*) AS count FROM properties').get().count;
  if (existing > 0) return { inserted: 0, skipped: true };

  const properties = [
    ['amalgated-corporate-center', 'Amalgated Corporate Center', 'office', 'J.P. Laurel Avenue, Bajada', 'Premium office spaces near Davao business districts.', 145000, 420, 0, 4, 12, ['24/7 security', 'backup power', 'parking']],
    ['obrero-commercial-hub', 'Obrero Commercial Hub', 'commercial', 'Bo. Obrero, Davao City', 'Street-facing retail and service spaces with strong foot traffic.', 95000, 260, 0, 3, 8, ['storefront', 'CCTV', 'loading area']],
    ['lanang-executive-suites', 'Lanang Executive Suites', 'residential', 'Lanang, Davao City', 'Furnished executive residences close to airport and malls.', 78000, 110, 3, 2, 2, ['pool', 'gym', 'concierge']],
    ['matina-garden-residences', 'Matina Garden Residences', 'residential', 'Matina, Davao City', 'Quiet mid-rise residences with landscaped common areas.', 52000, 86, 2, 2, 1, ['garden', 'play area', 'security']],
    ['davao-logistics-park', 'Davao Logistics Park', 'industrial', 'Bunawan, Davao City', 'Warehouse and logistics lots with truck access.', 210000, 1200, 0, 2, 20, ['loading bays', 'wide roads', 'perimeter fence']],
    ['ecoland-retail-row', 'Ecoland Retail Row', 'commercial', 'Ecoland Drive, Davao City', 'Compact retail units near transport and residential clusters.', 68000, 155, 0, 2, 5, ['high visibility', 'parking', 'signage']],
    ['bajada-business-lofts', 'Bajada Business Lofts', 'office', 'Bajada, Davao City', 'Flexible office lofts for growing professional teams.', 88000, 190, 0, 2, 4, ['fiber internet', 'meeting room', 'access control']],
    ['toril-townhomes', 'Toril Townhomes', 'residential', 'Toril, Davao City', 'Family townhomes with easy access to schools and markets.', 43000, 96, 3, 2, 1, ['gated community', 'parking', 'service area']],
    ['agdao-marketplace-units', 'Agdao Marketplace Units', 'commercial', 'Agdao, Davao City', 'Affordable commercial units for neighborhood businesses.', 38000, 72, 0, 1, 2, ['market access', 'roll-up doors', 'water line']],
    ['mintal-student-residences', 'Mintal Student Residences', 'residential', 'Mintal, Davao City', 'Efficient rental residences near university communities.', 26000, 42, 1, 1, 1, ['study lounge', 'laundry area', 'security']],
    ['maa-professional-plaza', 'Maa Professional Plaza', 'office', 'Maa Road, Davao City', 'Professional clinic and office spaces along a key corridor.', 74000, 150, 0, 2, 4, ['elevator', 'reception lobby', 'parking']],
    ['cabaguio-storage-compound', 'Cabaguio Storage Compound', 'industrial', 'Cabaguio Avenue, Davao City', 'Secure storage and light industrial compound.', 120000, 680, 0, 2, 10, ['guard house', 'yard space', 'loading access']],
    ['sasa-airport-commercial', 'Sasa Airport Commercial', 'commercial', 'Sasa, Davao City', 'Commercial spaces serving airport-adjacent traffic.', 82000, 180, 0, 2, 6, ['road frontage', 'parking', 'CCTV']],
    ['catalunan-grande-villas', 'Catalunan Grande Villas', 'residential', 'Catalunan Grande, Davao City', 'Spacious villas for long-term corporate housing.', 98000, 240, 4, 3, 2, ['garden', 'maid room', 'covered parking']],
    ['apmc-laurel-showroom', 'APMC Laurel Showroom', 'commercial', 'J.P. Laurel Avenue, Davao City', 'Flagship showroom space for premium brands.', 165000, 350, 0, 3, 10, ['glass frontage', 'high ceiling', 'backup power']],
  ];

  const create = db.transaction(() => {
    properties.forEach(([slug, name, type, address, description, price, area_sqm, bedrooms, bathrooms, parking_slots, amenities], index) => {
      createProperty({
        slug,
        name,
        type,
        address,
        description,
        price,
        area_sqm,
        bedrooms,
        bathrooms,
        parking_slots,
        amenities,
        featured: index < 5,
        status: index % 7 === 0 ? 'leased' : 'available',
      });
    });
  });
  create();
  return { inserted: properties.length, skipped: false };
}

export function seedDefaultUsers() {
  const existing = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (existing > 0 || !adminRole || !clientRole) return { inserted: 0, skipped: true };
  const adminHash = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
  const clientHash = process.env.CLIENT_PASSWORD_HASH || bcrypt.hashSync(process.env.CLIENT_PASSWORD || 'client123', 10);
  createUser({
    role_id: adminRole.id,
    name: 'APMC Administrator',
    email: process.env.ADMIN_EMAIL || 'admin@theamalgatedproperties.com',
    username: process.env.ADMIN_USERNAME || 'admin',
    password_hash: adminHash,
  });
  createUser({
    role_id: clientRole.id,
    name: 'Demo Client',
    email: process.env.CLIENT_EMAIL || 'client@example.com',
    username: process.env.CLIENT_USERNAME || 'client',
    password_hash: clientHash,
  });
  return { inserted: 2, skipped: false };
}

seedProperties();
seedDefaultUsers();

export default db;
