import bcrypt from 'bcryptjs';
import db from '../db.js';
import { catalogToDb, propertiesCatalog } from '../shared/propertiesCatalog.js';
import { catalogToDbLease, leasesCatalog } from '../shared/leasesCatalog.js';
import {
  deletePropertyImageFile,
  persistPropertyImage,
} from './utils/propertyImages.js';

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
    excerpt TEXT,
    category TEXT DEFAULT 'Company Update',
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

try {
  db.prepare("ALTER TABLE announcements ADD COLUMN excerpt TEXT").run();
} catch {}

try {
  db.prepare("ALTER TABLE announcements ADD COLUMN category TEXT DEFAULT 'Company Update'").run();
} catch {}

try {
  db.prepare('ALTER TABLE properties ADD COLUMN archived_at TEXT').run();
} catch {}

try {
  db.prepare('ALTER TABLE leases ADD COLUMN archived_at TEXT').run();
} catch {}

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
  ['status', 'type', 'city', 'province', 'featured'].forEach((key) => {
    if (filter[key] !== undefined && filter[key] !== '') {
      clauses.push(`${key} = ?`);
      values.push(filter[key]);
    }
  });
  if (filter.category && filter.category !== 'All') {
    clauses.push('type = ?');
    values.push(String(filter.category).toLowerCase());
  }
  if (filter.region && filter.region !== 'All') {
    clauses.push('province = ?');
    values.push(filter.region);
  }
  if (filter.min_price) {
    clauses.push('price >= ?');
    values.push(Number(filter.min_price));
  }
  if (filter.max_price) {
    clauses.push('price <= ?');
    values.push(Number(filter.max_price));
  }
  if (filter.min_sqm) {
    clauses.push('area_sqm >= ?');
    values.push(Number(filter.min_sqm));
  }
  if (filter.max_sqm) {
    clauses.push('area_sqm <= ?');
    values.push(Number(filter.max_sqm));
  }
  if (filter.bedrooms) {
    clauses.push('bedrooms >= ?');
    values.push(Number(filter.bedrooms));
  }
  if (filter.bathrooms) {
    clauses.push('bathrooms >= ?');
    values.push(Number(filter.bathrooms));
  }
  if (filter.search) {
    clauses.push('(name LIKE ? OR address LIKE ? OR city LIKE ? OR province LIKE ? OR description LIKE ?)');
    values.push(`%${filter.search}%`, `%${filter.search}%`, `%${filter.search}%`, `%${filter.search}%`, `%${filter.search}%`);
  }
  if (!filter.include_archived) {
    clauses.push('archived_at IS NULL');
  }
  if (clauses.length) sql += ` WHERE ${clauses.join(' AND ')}`;
  const sort = {
    area: 'area_sqm DESC',
    price_asc: 'price ASC',
    price_desc: 'price DESC',
    name: 'name ASC',
    newest: 'created_at DESC',
  }[filter.sort] || 'featured DESC, created_at DESC';
  const properties = db.prepare(`${sql} ORDER BY ${sort}`).all(...values);
  return properties.map((property) => {
    const images = db.prepare(
      'SELECT id, property_id, url, alt, sort_order, is_primary FROM property_images WHERE property_id = ? ORDER BY sort_order ASC, id ASC',
    ).all(property.id);
    const primary = images.find((image) => image.is_primary) || images[0];
    const safeImages = primary && primary.url && !String(primary.url).startsWith('data:')
      ? [primary]
      : primary
        ? [{ ...primary, url: null }]
        : [];

    return {
      ...property,
      images: safeImages,
    };
  });
}

export function getPropertyById(id) {
  const property = getById('properties', id);
  if (!property) return null;
  return {
    ...property,
    images: db.prepare(
      'SELECT id, property_id, url, alt, sort_order, is_primary FROM property_images WHERE property_id = ? ORDER BY sort_order ASC, id ASC',
    ).all(property.id),
  };
}

export function getPropertyBySlug(slug) {
  const property = db.prepare('SELECT * FROM properties WHERE slug = ? AND archived_at IS NULL').get(slug);
  if (!property) return null;
  return {
    ...property,
    images: db.prepare('SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order ASC, id ASC').all(property.id),
    units: db.prepare('SELECT * FROM units WHERE property_id = ? ORDER BY unit_number ASC').all(property.id),
  };
}

export function createProperty(data) {
  const property = insert('properties', {
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

  const imageUrl = data.image_url || data.image;
  if (imageUrl) {
    const storedUrl = persistPropertyImage(imageUrl, property.id);
    insert('property_images', {
      property_id: property.id,
      url: storedUrl,
      alt: data.image_alt || property.name,
      sort_order: 0,
      is_primary: 1,
    });
  }

  return getPropertyBySlug(property.slug);
}

export function updateProperty(id, data) {
  const { image_url, image, image_alt, ...propertyData } = data;
  const property = updateById('properties', id, {
    ...propertyData,
    slug: data.slug ?? (data.name ? slugify(data.name) : undefined),
    amenities: data.amenities !== undefined ? asJson(data.amenities) : undefined,
    featured: data.featured !== undefined ? (data.featured ? 1 : 0) : undefined,
  });

  const imageUrl = image_url || image;
  if (property && imageUrl) {
    const existing = db.prepare(
      'SELECT id, url FROM property_images WHERE property_id = ? AND is_primary = 1 ORDER BY sort_order ASC, id ASC',
    ).get(id);
    const storedUrl = persistPropertyImage(imageUrl, id);
    if (existing) {
      if (existing.url !== storedUrl) deletePropertyImageFile(existing.url);
      db.prepare('UPDATE property_images SET url = ?, alt = ? WHERE id = ?').run(storedUrl, image_alt || property.name, existing.id);
    } else {
      insert('property_images', {
        property_id: id,
        url: storedUrl,
        alt: image_alt || property.name,
        sort_order: 0,
        is_primary: 1,
      });
    }
  }

  return property ? getPropertyBySlug(property.slug) : null;
}

export function deleteProperty(id) {
  const property = getById('properties', id);
  if (!property) return false;

  const images = db.prepare('SELECT url FROM property_images WHERE property_id = ?').all(id);
  images.forEach((image) => deletePropertyImageFile(image.url));

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

function upsertTenantByName(name, propertyId) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return null;

  const existing = db.prepare('SELECT id FROM tenants WHERE name = ? AND (property_id = ? OR property_id IS NULL)').get(trimmed, propertyId ?? null);
  if (existing) return existing.id;

  const tenant = insert('tenants', {
    property_id: propertyId ?? null,
    name: trimmed,
    status: 'active',
  });
  return tenant.id;
}

function syncPropertyLeaseStatus(propertyId) {
  if (!propertyId) return;
  const active = db.prepare(`
    SELECT COUNT(*) AS count
    FROM leases
    WHERE property_id = ? AND status = 'active' AND archived_at IS NULL
  `).get(propertyId);
  updateById('properties', propertyId, { status: active.count > 0 ? 'leased' : 'available' });
}

function leaseSelectSql(whereClause = '') {
  return `
    SELECT leases.*,
           properties.name AS property_name,
           tenants.name AS tenant_name,
           users.name AS user_name
    FROM leases
    LEFT JOIN properties ON properties.id = leases.property_id
    LEFT JOIN tenants ON tenants.id = leases.tenant_id
    LEFT JOIN users ON users.id = leases.user_id
    ${whereClause}
  `;
}

export function createLease(data) {
  const tenant_id = data.tenant_id ?? upsertTenantByName(data.tenant_name || data.tenant, data.property_id);
  const lease = insert('leases', {
    property_id: data.property_id,
    unit_id: data.unit_id ?? null,
    tenant_id,
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

  syncPropertyLeaseStatus(data.property_id);
  return db.prepare(`${leaseSelectSql('WHERE leases.id = ?')}`).get(lease.id);
}

export function listLeases(filter = {}) {
  let sql = leaseSelectSql();
  const values = [];
  const clauses = ['leases.archived_at IS NULL', '(properties.archived_at IS NULL OR properties.id IS NULL)'];
  ['property_id', 'unit_id', 'tenant_id', 'user_id', 'status'].forEach((key) => {
    if (filter[key] !== undefined && filter[key] !== '') {
      clauses.push(`leases.${key} = ?`);
      values.push(filter[key]);
    }
  });
  if (clauses.length) sql += ` WHERE ${clauses.join(' AND ')}`;
  return db.prepare(`${sql} ORDER BY leases.created_at DESC`).all(...values);
}

export function getLeaseById(id) {
  return db.prepare(`${leaseSelectSql('WHERE leases.id = ?')}`).get(id);
}

export function updateLease(id, data) {
  const existing = getById('leases', id);
  if (!existing) return null;

  const tenant_id = data.tenant_id
    ?? (data.tenant_name || data.tenant ? upsertTenantByName(data.tenant_name || data.tenant, data.property_id ?? existing.property_id) : undefined);

  const { tenant_name, tenant, ...leaseData } = data;
  updateById('leases', id, {
    ...leaseData,
    ...(tenant_id !== undefined ? { tenant_id } : {}),
  });

  const propertyId = data.property_id ?? existing.property_id;
  syncPropertyLeaseStatus(propertyId);
  if (existing.property_id && existing.property_id !== propertyId) {
    syncPropertyLeaseStatus(existing.property_id);
  }

  return getLeaseById(id);
}

export function deleteLease(id) {
  const lease = getById('leases', id);
  if (!lease) return false;

  const propertyId = lease.property_id;
  const deleted = removeById('leases', id);
  if (deleted) syncPropertyLeaseStatus(propertyId);
  return deleted;
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

function maintenanceSelectSql(whereClause = '') {
  return `
    SELECT maintenance_requests.*,
           properties.name AS property_name
    FROM maintenance_requests
    LEFT JOIN properties ON properties.id = maintenance_requests.property_id
    ${whereClause}
  `;
}

export function createMaintenanceRequest(data) {
  const request = insert('maintenance_requests', {
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
  return getMaintenanceRequestById(request.id);
}

export function listMaintenanceRequests(filter = {}) {
  const clauses = [];
  const values = [];
  ['property_id', 'unit_id', 'tenant_id', 'status', 'priority'].forEach((key) => {
    if (filter[key] !== undefined && filter[key] !== '') {
      clauses.push(`maintenance_requests.${key} = ?`);
      values.push(filter[key]);
    }
  });
  const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return db.prepare(`${maintenanceSelectSql(whereClause)} ORDER BY maintenance_requests.created_at DESC`).all(...values);
}

export function getMaintenanceRequestById(id) {
  return db.prepare(`${maintenanceSelectSql('WHERE maintenance_requests.id = ?')}`).get(id);
}

export function updateMaintenanceRequest(id, data) {
  const updated = updateById('maintenance_requests', id, data);
  if (!updated) return null;
  return getMaintenanceRequestById(id);
}

export function deleteMaintenanceRequest(id) {
  return removeById('maintenance_requests', id);
}

export function createAnnouncement(data) {
  return insert('announcements', {
    title: data.title,
    excerpt: data.excerpt ?? null,
    category: data.category ?? 'Company Update',
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
    properties: one('SELECT COUNT(*) AS count FROM properties WHERE archived_at IS NULL').count,
    availableProperties: one("SELECT COUNT(*) AS count FROM properties WHERE status = 'available' AND archived_at IS NULL").count,
    units: one('SELECT COUNT(*) AS count FROM units').count,
    occupiedUnits: one("SELECT COUNT(*) AS count FROM units WHERE status = 'occupied'").count,
    activeLeases: one("SELECT COUNT(*) AS count FROM leases WHERE status = 'active' AND archived_at IS NULL").count,
    openMaintenance: one("SELECT COUNT(*) AS count FROM maintenance_requests WHERE status IN ('open','assigned','in_progress')").count,
    monthlyRevenue: one("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'completed' AND payment_date >= date('now', 'start of month')").total,
    recentPayments: db.prepare('SELECT * FROM payments ORDER BY payment_date DESC, created_at DESC LIMIT 10').all(),
    recentMaintenance: db.prepare('SELECT * FROM maintenance_requests ORDER BY created_at DESC LIMIT 10').all(),
  };
}

function normalizePropertyMixLabel(type) {
  const value = String(type || 'commercial').toLowerCase();
  if (value === 'residential' || value === 'condominium') return 'Residential';
  if (value === 'industrial' || value === 'warehouse') return 'Industrial';
  if (value === 'retail') return 'Retail';
  return 'Commercial';
}

function getCollectionRate(startExpr, endExpr = null) {
  const dateClause = endExpr
    ? `created_at >= ${startExpr} AND created_at < ${endExpr}`
    : `created_at >= ${startExpr}`;
  const row = db.prepare(`
    SELECT
      COALESCE(SUM(amount), 0) AS total,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS paid
    FROM invoices
    WHERE status != 'void' AND ${dateClause}
  `).get();

  if (!row?.total) return null;
  return (row.paid / row.total) * 100;
}

function getAverageResolutionHours(startExpr, endExpr = null) {
  const dateClause = endExpr
    ? `completed_at >= ${startExpr} AND completed_at < ${endExpr}`
    : `completed_at >= ${startExpr}`;
  const row = db.prepare(`
    SELECT AVG((julianday(completed_at) - julianday(created_at)) * 24) AS avg_hours
    FROM maintenance_requests
    WHERE status = 'completed'
      AND completed_at IS NOT NULL
      AND created_at IS NOT NULL
      AND ${dateClause}
  `).get();

  return row?.avg_hours ? Number(row.avg_hours) : null;
}

export function getAdminAnalyticsStats() {
  const mixRows = db.prepare(`
    SELECT type, COUNT(*) AS count
    FROM properties
    WHERE archived_at IS NULL
    GROUP BY type
  `).all();

  const buckets = new Map();
  mixRows.forEach((row) => {
    const label = normalizePropertyMixLabel(row.type);
    buckets.set(label, (buckets.get(label) || 0) + row.count);
  });

  const propertyMix = ['Commercial', 'Residential', 'Industrial', 'Retail']
    .map((type) => ({ type, units: buckets.get(type) || 0 }))
    .filter((item) => item.units > 0);

  return {
    propertyMix,
    avgResolutionHours: {
      current: getAverageResolutionHours("date('now', 'start of month')"),
      previous: getAverageResolutionHours("date('now', '-1 month', 'start of month')", "date('now', 'start of month')"),
    },
    collectionRate: {
      current: getCollectionRate("date('now', 'start of month')"),
      previous: getCollectionRate("date('now', '-1 month', 'start of month')", "date('now', 'start of month')"),
    },
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

export function cleanupArchivedProperties() {
  return db.prepare(`
    DELETE FROM properties
    WHERE archived_at IS NOT NULL OR slug LIKE '%-archived-%'
  `).run().changes;
}

export function cleanupArchivedLeases() {
  return db.prepare(`
    DELETE FROM leases
    WHERE archived_at IS NOT NULL
  `).run().changes;
}

export function restorePropertiesCatalog() {
  const removed = cleanupArchivedProperties();
  const result = syncPropertiesCatalog({ updateExisting: true });
  return { removed, ...result };
}

export function restoreLeasesCatalog() {
  const removed = cleanupArchivedLeases();
  const result = syncLeasesCatalog({ updateExisting: true });
  return { removed, ...result };
}

export function syncPropertiesCatalog({ updateExisting = true } = {}) {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  const run = db.transaction(() => {
    for (const item of propertiesCatalog) {
      const payload = catalogToDb(item);
      const existing = db.prepare(`
        SELECT id
        FROM properties
        WHERE slug = ? AND archived_at IS NULL
      `).get(payload.slug);
      if (existing) {
        if (!updateExisting) {
          skipped += 1;
          continue;
        }
        updateProperty(existing.id, payload);
        updated += 1;
      } else {
        createProperty(payload);
        created += 1;
      }
    }
  });

  run();
  return { created, updated, skipped, total: propertiesCatalog.length };
}

export function ensurePropertiesCatalog() {
  return syncPropertiesCatalog({ updateExisting: false });
}

export function syncLeasesCatalog({ updateExisting = true } = {}) {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  const run = db.transaction(() => {
    for (const item of leasesCatalog) {
      const property = db.prepare('SELECT id FROM properties WHERE slug = ? AND archived_at IS NULL').get(item.property_slug);
      if (!property) {
        skipped += 1;
        continue;
      }

      const payload = catalogToDbLease(item, property.id);
      const existing = db.prepare('SELECT id FROM leases WHERE lease_number = ? AND archived_at IS NULL').get(payload.lease_number);

      if (existing) {
        if (!updateExisting) {
          skipped += 1;
          continue;
        }
        updateLease(existing.id, payload);
        updated += 1;
      } else {
        createLease(payload);
        created += 1;
      }
    }
  });

  run();
  return { created, updated, skipped, total: leasesCatalog.length };
}

export function seedLeases() {
  const existing = db.prepare('SELECT COUNT(*) AS count FROM leases WHERE archived_at IS NULL').get().count;
  if (existing > 0) return { inserted: 0, skipped: true };
  const result = syncLeasesCatalog({ updateExisting: true });
  return { inserted: result.created, skipped: false };
}

export function seedProperties() {
  const existing = db.prepare('SELECT COUNT(*) AS count FROM properties').get().count;
  if (existing > 0) return { inserted: 0, skipped: true };

  const result = syncPropertiesCatalog();
  return { inserted: result.created, skipped: false };
}

export function seedMaintenanceRequests() {
  const existing = db.prepare('SELECT COUNT(*) AS count FROM maintenance_requests').get().count;
  if (existing > 0) return { inserted: 0, skipped: true };

  const propertyBySlug = (slug) => db.prepare('SELECT id FROM properties WHERE slug = ?').get(slug);
  const seeds = [
    {
      slug: 'amalgated-paco',
      title: 'Elevator inspection',
      description: 'Annual elevator safety inspection and certification for the building lift system.',
      priority: 'high',
      status: 'in_progress',
      assigned_to: 'Facilities Team',
      scheduled_at: '2026-05-20T09:00:00.000Z',
    },
    {
      slug: 'aci-paragon-plaza-3310',
      title: 'Water pressure check',
      description: 'Inspect booster pump performance and verify water pressure across occupied floors.',
      priority: 'medium',
      status: 'assigned',
      assigned_to: 'Plumbing Vendor',
      scheduled_at: '2026-05-24T14:00:00.000Z',
    },
    {
      slug: 'apokon-commercial-site',
      title: 'Dock door repair',
      description: 'Repair loading dock door alignment and replace worn roller hardware.',
      priority: 'high',
      status: 'open',
      assigned_to: 'Ops Team',
    },
  ];

  let inserted = 0;
  seeds.forEach((seed) => {
    const property = propertyBySlug(seed.slug);
    if (!property) return;
    createMaintenanceRequest({
      property_id: property.id,
      title: seed.title,
      description: seed.description,
      priority: seed.priority,
      status: seed.status,
      assigned_to: seed.assigned_to,
      scheduled_at: seed.scheduled_at ?? null,
    });
    inserted += 1;
  });

  return { inserted, skipped: false };
}

export function seedAnnouncements() {
  const existing = db.prepare('SELECT COUNT(*) AS count FROM announcements').get().count;
  if (existing > 0) return { inserted: 0, skipped: true };

  const announcements = [
    {
      title: 'APMC Expands Portfolio Visibility Across Key Regional Markets',
      category: 'Company Update',
      excerpt: 'The group continues to organize its real estate portfolio around better leasing access and stronger tenant support.',
      body: 'The group continues to organize its real estate portfolio around better leasing access and stronger tenant support.',
      published_at: '2026-05-01T00:00:00.000Z',
    },
    {
      title: 'Why Strategic Property Management Matters for Growing Tenants',
      category: 'Insight',
      excerpt: 'Reliable property management helps businesses reduce downtime, plan occupancy, and protect long-term value.',
      body: 'Reliable property management helps businesses reduce downtime, plan occupancy, and protect long-term value.',
      published_at: '2026-04-01T00:00:00.000Z',
    },
    {
      title: 'Commercial Leasing Demand Remains Active in Provincial Hubs',
      category: 'Market Notes',
      excerpt: 'Banks, service firms, and retail operators continue to seek dependable spaces in high-connectivity locations.',
      body: 'Banks, service firms, and retail operators continue to seek dependable spaces in high-connectivity locations.',
      published_at: '2026-03-01T00:00:00.000Z',
    },
  ];

  announcements.forEach((announcement) => createAnnouncement(announcement));
  return { inserted: announcements.length, skipped: false };
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

export function seedDatabase({ updateProperties = true, updateLeases = true } = {}) {
  return {
    properties: seedProperties(),
    propertySync: updateProperties
      ? restorePropertiesCatalog()
      : ensurePropertiesCatalog(),
    leases: seedLeases(),
    leaseSync: updateLeases
      ? restoreLeasesCatalog()
      : syncLeasesCatalog({ updateExisting: false }),
    announcements: seedAnnouncements(),
    maintenance: seedMaintenanceRequests(),
    users: seedDefaultUsers(),
  };
}

export function bootstrapDatabase() {
  if (db.prepare('SELECT COUNT(*) AS count FROM properties').get().count === 0) {
    syncPropertiesCatalog({ updateExisting: true });
  }
  if (db.prepare('SELECT COUNT(*) AS count FROM leases').get().count === 0) {
    syncLeasesCatalog({ updateExisting: true });
  }
  seedAnnouncements();
  seedMaintenanceRequests();
  seedDefaultUsers();
}

bootstrapDatabase();

export default db;
