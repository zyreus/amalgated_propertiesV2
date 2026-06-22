import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const database = process.env.MYSQL_DATABASE || 'amalgated_properties';

if (!/^[A-Za-z0-9_$]+$/.test(database)) {
  throw new Error('MYSQL_DATABASE may only contain letters, numbers, underscores, and dollar signs.');
}

const serverConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  multipleStatements: false,
};

const tableStatements = [
  `CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(191) PRIMARY KEY,
    visitor_name VARCHAR(191) DEFAULT 'Visitor',
    visitor_email VARCHAR(191),
    status ENUM('open','in_progress','resolved','archived') DEFAULT 'open',
    mode ENUM('ai','human') DEFAULT 'ai',
    admin_unread_count INT DEFAULT 0,
    admin_last_read_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_conversations_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(191) NOT NULL,
    sender ENUM('user','ai','admin') NOT NULL,
    admin_name VARCHAR(191),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_messages_conversation (conversation_id),
    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    email VARCHAR(191) NOT NULL,
    phone VARCHAR(80),
    company VARCHAR(191),
    inquiry_message TEXT,
    conversation_id VARCHAR(191),
    source_page VARCHAR(191),
    status ENUM('new','contacted','qualified','converted','lost') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_leads_conversation (conversation_id),
    CONSTRAINT fk_leads_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS visitor_visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visit_id VARCHAR(191) NOT NULL,
    conversation_id VARCHAR(191),
    ip VARCHAR(80),
    location VARCHAR(191),
    device VARCHAR(191),
    browser VARCHAR(191),
    pages_visited JSON,
    visit_duration_seconds INT DEFAULT 0,
    message_count INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_visitor_visits_visit (visit_id),
    KEY idx_visitor_visits_conversation (conversation_id),
    CONSTRAINT fk_visitor_visits_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id VARCHAR(191) UNIQUE NOT NULL,
    conversation_id VARCHAR(191) NOT NULL,
    priority ENUM('low','medium','high','urgent') DEFAULT 'medium',
    status ENUM('open','pending','closed') DEFAULT 'open',
    assigned_staff VARCHAR(191),
    notes TEXT,
    is_unread TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_tickets_conversation (conversation_id),
    CONSTRAINT fk_tickets_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(191) UNIQUE NOT NULL,
    name VARCHAR(191) NOT NULL,
    type VARCHAR(80) NOT NULL,
    status ENUM('available','leased','maintenance','inactive') DEFAULT 'available',
    address VARCHAR(255) NOT NULL,
    city VARCHAR(120) DEFAULT 'Davao City',
    province VARCHAR(120) DEFAULT 'Davao del Sur',
    description TEXT,
    price DECIMAL(12,2) DEFAULT 0,
    area_sqm DECIMAL(10,2) DEFAULT 0,
    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    parking_slots INT DEFAULT 0,
    amenities JSON,
    featured TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_properties_slug (slug),
    KEY idx_properties_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) UNIQUE NOT NULL,
    description TEXT
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    property_id INT,
    name VARCHAR(191) NOT NULL,
    email VARCHAR(191) UNIQUE NOT NULL,
    username VARCHAR(191) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(80),
    status ENUM('active','inactive','suspended') DEFAULT 'active',
    last_login_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_users_role (role_id),
    KEY idx_users_property (property_id),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id),
    CONSTRAINT fk_users_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS property_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    url TEXT NOT NULL,
    alt VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_primary TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_property_images_property (property_id),
    CONSTRAINT fk_property_images_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    unit_number VARCHAR(120) NOT NULL,
    floor VARCHAR(80),
    type VARCHAR(80),
    status ENUM('vacant','occupied','reserved','maintenance','inactive') DEFAULT 'vacant',
    rent_amount DECIMAL(12,2) DEFAULT 0,
    area_sqm DECIMAL(10,2) DEFAULT 0,
    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_units_property_number (property_id, unit_number),
    KEY idx_units_property (property_id),
    KEY idx_units_status (status),
    CONSTRAINT fk_units_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    property_id INT,
    unit_id INT,
    name VARCHAR(191) NOT NULL,
    email VARCHAR(191),
    phone VARCHAR(80),
    emergency_contact VARCHAR(191),
    status ENUM('active','inactive','former') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_tenants_user (user_id),
    CONSTRAINT fk_tenants_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_tenants_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
    CONSTRAINT fk_tenants_unit FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS leases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    unit_id INT,
    tenant_id INT,
    user_id INT,
    lease_number VARCHAR(191) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rent_amount DECIMAL(12,2) NOT NULL,
    security_deposit DECIMAL(12,2) DEFAULT 0,
    payment_frequency VARCHAR(80) DEFAULT 'monthly',
    status ENUM('draft','active','expired','terminated','renewed') DEFAULT 'active',
    terms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_leases_property (property_id),
    KEY idx_leases_user (user_id),
    KEY idx_leases_status (status),
    CONSTRAINT fk_leases_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT fk_leases_unit FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL,
    CONSTRAINT fk_leases_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    CONSTRAINT fk_leases_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lease_id INT,
    tenant_id INT,
    invoice_number VARCHAR(191) UNIQUE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('unpaid','partial','paid','overdue','void') DEFAULT 'unpaid',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_invoices_status (status),
    CONSTRAINT fk_invoices_lease FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE SET NULL,
    CONSTRAINT fk_invoices_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT,
    lease_id INT,
    tenant_id INT,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    method VARCHAR(80) DEFAULT 'bank_transfer',
    reference_number VARCHAR(191),
    status ENUM('pending','completed','failed','refunded') DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_payments_lease (lease_id),
    CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
    CONSTRAINT fk_payments_lease FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE SET NULL,
    CONSTRAINT fk_payments_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    unit_id INT,
    tenant_id INT,
    title VARCHAR(191) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low','medium','high','urgent') DEFAULT 'medium',
    status ENUM('open','assigned','in_progress','completed','cancelled') DEFAULT 'open',
    assigned_to VARCHAR(191),
    scheduled_at DATETIME,
    completed_at DATETIME,
    cost DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_maintenance_property (property_id),
    KEY idx_maintenance_status (status),
    CONSTRAINT fk_maintenance_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT fk_maintenance_unit FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL,
    CONSTRAINT fk_maintenance_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS support_tickets_pm (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    property_id INT,
    subject VARCHAR(191) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('low','medium','high','urgent') DEFAULT 'medium',
    status ENUM('open','pending','resolved','closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_support_tickets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_support_tickets_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT,
    lease_id INT,
    user_id INT,
    title VARCHAR(191) NOT NULL,
    document_type VARCHAR(120),
    file_url TEXT NOT NULL,
    visibility ENUM('admin','client','public') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_documents_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT fk_documents_lease FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE,
    CONSTRAINT fk_documents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(191) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(80) DEFAULT 'info',
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(191) NOT NULL,
    excerpt TEXT,
    category VARCHAR(120) DEFAULT 'Company Update',
    body TEXT NOT NULL,
    audience ENUM('all','admin','client') DEFAULT 'all',
    status ENUM('draft','published','archived') DEFAULT 'published',
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_announcements_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(191) NOT NULL,
    entity_type VARCHAR(120),
    entity_id INT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_activity_logs_user (user_id),
    KEY idx_activity_logs_entity (entity_type, entity_id),
    CONSTRAINT fk_activity_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

const migrationStatements = [
  "ALTER TABLE announcements ADD COLUMN excerpt TEXT",
  "ALTER TABLE announcements ADD COLUMN category VARCHAR(120) DEFAULT 'Company Update'",
  'ALTER TABLE properties ADD COLUMN archived_at TIMESTAMP NULL DEFAULT NULL',
];

import { catalogToDb, propertiesCatalog } from '../shared/propertiesCatalog.js';

const sampleAnnouncements = [
  [
    'APMC Expands Portfolio Visibility Across Key Regional Markets',
    'Company Update',
    'The group continues to organize its real estate portfolio around better leasing access and stronger tenant support.',
    'The group continues to organize its real estate portfolio around better leasing access and stronger tenant support.',
    '2026-05-01 00:00:00',
  ],
  [
    'Why Strategic Property Management Matters for Growing Tenants',
    'Insight',
    'Reliable property management helps businesses reduce downtime, plan occupancy, and protect long-term value.',
    'Reliable property management helps businesses reduce downtime, plan occupancy, and protect long-term value.',
    '2026-04-01 00:00:00',
  ],
  [
    'Commercial Leasing Demand Remains Active in Provincial Hubs',
    'Market Notes',
    'Banks, service firms, and retail operators continue to seek dependable spaces in high-connectivity locations.',
    'Banks, service firms, and retail operators continue to seek dependable spaces in high-connectivity locations.',
    '2026-03-01 00:00:00',
  ],
];

async function seedData(connection) {
  await connection.execute('INSERT IGNORE INTO roles (name, description) VALUES (?, ?), (?, ?)', [
    'admin',
    'Property management administrator',
    'client',
    'Property owner or tenant portal user',
  ]);

  const permissions = [
    ['properties:manage', 'Create and manage properties'],
    ['leases:manage', 'Create and manage leases'],
    ['payments:manage', 'Record and reconcile payments'],
    ['maintenance:manage', 'Manage maintenance work orders'],
    ['dashboard:view', 'View dashboard analytics'],
  ];

  for (const permission of permissions) {
    await connection.execute('INSERT IGNORE INTO permissions (name, description) VALUES (?, ?)', permission);
  }

  await connection.execute(`
    INSERT IGNORE INTO role_permissions (role_id, permission_id)
    SELECT roles.id, permissions.id
    FROM roles
    CROSS JOIN permissions
    WHERE roles.name = 'admin'
  `);

  const [[propertyCount]] = await connection.execute('SELECT COUNT(*) AS count FROM properties');
  if (propertyCount.count === 0) {
    for (const item of propertiesCatalog) {
      const property = catalogToDb(item);
      await connection.execute(
        `INSERT INTO properties
          (slug, name, type, status, address, city, province, description, price, area_sqm, bedrooms, amenities, featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          property.slug,
          property.name,
          property.type,
          property.status,
          property.address,
          property.city,
          property.province,
          property.description,
          property.price,
          property.area_sqm,
          property.bedrooms,
          JSON.stringify(property.amenities),
          property.featured ? 1 : 0,
        ]
      );
    }
  }

  const [[announcementCount]] = await connection.execute('SELECT COUNT(*) AS count FROM announcements');
  if (announcementCount.count === 0) {
    for (const announcement of sampleAnnouncements) {
      await connection.execute(
        `INSERT INTO announcements
          (title, category, excerpt, body, audience, status, published_at)
         VALUES (?, ?, ?, ?, 'all', 'published', ?)`,
        announcement
      );
    }
  }

  const [[userCount]] = await connection.execute('SELECT COUNT(*) AS count FROM users');
  if (userCount.count === 0) {
    const [[adminRole]] = await connection.execute("SELECT id FROM roles WHERE name = 'admin'");
    const [[clientRole]] = await connection.execute("SELECT id FROM roles WHERE name = 'client'");
    const adminHash = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
    const clientHash = process.env.CLIENT_PASSWORD_HASH || bcrypt.hashSync(process.env.CLIENT_PASSWORD || 'client123', 10);

    await connection.execute(
      'INSERT INTO users (role_id, name, email, username, password_hash) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
      [
        adminRole.id,
        'APMC Administrator',
        process.env.ADMIN_EMAIL || 'admin@theamalgatedproperties.com',
        process.env.ADMIN_USERNAME || 'admin',
        adminHash,
        clientRole.id,
        'Demo Client',
        process.env.CLIENT_EMAIL || 'client@example.com',
        process.env.CLIENT_USERNAME || 'client',
        clientHash,
      ]
    );
  }
}

async function main() {
  const serverConnection = await mysql.createConnection(serverConfig);
  await serverConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await serverConnection.end();

  const connection = await mysql.createConnection({
    ...serverConfig,
    database,
  });

  try {
    for (const statement of tableStatements) {
      await connection.query(statement);
    }

    for (const statement of migrationStatements) {
      try {
        await connection.query(statement);
      } catch (error) {
        if (error.code !== 'ER_DUP_FIELDNAME') throw error;
      }
    }

    await seedData(connection);
    console.log(`MySQL database "${database}" is ready.`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('Failed to initialize MySQL database:');
  console.error(error.message);
  process.exitCode = 1;
});
