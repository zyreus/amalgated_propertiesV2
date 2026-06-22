import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'chat.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    visitor_name TEXT DEFAULT 'Visitor',
    visitor_email TEXT,
    status TEXT DEFAULT 'open' CHECK(status IN ('open','in_progress','resolved','archived')),
    mode TEXT DEFAULT 'ai' CHECK(mode IN ('ai','human')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    sender TEXT NOT NULL CHECK(sender IN ('user','ai','admin')),
    admin_name TEXT,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    inquiry_message TEXT,
    conversation_id TEXT,
    source_page TEXT,
    status TEXT DEFAULT 'new' CHECK(status IN ('new','contacted','qualified','converted','lost')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
  );

  CREATE TABLE IF NOT EXISTS visitor_visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id TEXT NOT NULL,
    conversation_id TEXT,
    ip TEXT,
    location TEXT,
    device TEXT,
    browser TEXT,
    pages_visited TEXT,
    visit_duration_seconds INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    started_at TEXT DEFAULT (datetime('now')),
    last_activity_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT UNIQUE NOT NULL,
    conversation_id TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
    status TEXT DEFAULT 'open' CHECK(status IN ('open','pending','closed')),
    assigned_staff TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
  );
`);

function ensureColumn(table, column, sqlTypeAndDefault) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!cols.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${sqlTypeAndDefault}`);
  }
}

// Add-on columns for read/unread + bulk actions (safe migrations)
ensureColumn('conversations', 'admin_unread_count', 'INTEGER DEFAULT 0');
ensureColumn('conversations', 'admin_last_read_at', 'TEXT');
ensureColumn('tickets', 'is_unread', 'INTEGER DEFAULT 1');

const stmts = {
  createConvo: db.prepare(`INSERT OR IGNORE INTO conversations (id) VALUES (?)`),
  getConvo: db.prepare(`SELECT * FROM conversations WHERE id = ?`),
  getAllConvos: db.prepare(`SELECT * FROM conversations WHERE status != 'archived' ORDER BY updated_at DESC`),
  getArchivedConvos: db.prepare(`SELECT * FROM conversations WHERE status = 'archived' ORDER BY updated_at DESC`),
  deleteMessages: db.prepare(`DELETE FROM messages WHERE conversation_id = ?`),
  deleteConvo: db.prepare(`DELETE FROM conversations WHERE id = ?`),
  updateConvoStatus: db.prepare(`UPDATE conversations SET status = ?, updated_at = datetime('now') WHERE id = ?`),
  updateConvoMode: db.prepare(`UPDATE conversations SET mode = ?, updated_at = datetime('now') WHERE id = ?`),
  updateConvoVisitor: db.prepare(`UPDATE conversations SET visitor_name = ?, visitor_email = ?, updated_at = datetime('now') WHERE id = ?`),
  touchConvo: db.prepare(`UPDATE conversations SET updated_at = datetime('now') WHERE id = ?`),
  incrementConvoUnread: db.prepare(`UPDATE conversations SET admin_unread_count = COALESCE(admin_unread_count, 0) + 1, updated_at = datetime('now') WHERE id = ?`),
  clearConvoUnread: db.prepare(`UPDATE conversations SET admin_unread_count = 0, admin_last_read_at = datetime('now') WHERE id = ?`),
  addMessage: db.prepare(`INSERT INTO messages (conversation_id, sender, admin_name, content) VALUES (?, ?, ?, ?)`),
  getMessages: db.prepare(`SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`),
  getRecentMessages: db.prepare(`SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?`),
  // Leads
  createLead: db.prepare(`INSERT INTO leads (name, email, phone, company, inquiry_message, conversation_id, source_page) VALUES (?, ?, ?, ?, ?, ?, ?)`),
  getLeads: db.prepare(`SELECT * FROM leads ORDER BY created_at DESC`),
  getLeadById: db.prepare(`SELECT * FROM leads WHERE id = ?`),
  getLeadsByConvo: db.prepare(`SELECT * FROM leads WHERE conversation_id = ? ORDER BY created_at DESC`),
  updateLeadStatus: db.prepare(`UPDATE leads SET status = ?, updated_at = datetime('now') WHERE id = ?`),
  updateLead: db.prepare(`UPDATE leads SET name = ?, email = ?, phone = ?, company = ?, inquiry_message = ?, status = ?, updated_at = datetime('now') WHERE id = ?`),
  // Visitor visits
  createVisit: db.prepare(`INSERT INTO visitor_visits (visit_id, conversation_id, ip, location, device, browser, pages_visited, message_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`),
  getVisitByVisitId: db.prepare(`SELECT * FROM visitor_visits WHERE visit_id = ?`),
  updateVisit: db.prepare(`UPDATE visitor_visits SET pages_visited = ?, visit_duration_seconds = ?, message_count = ?, last_activity_at = datetime('now') WHERE visit_id = ?`),
  updateVisitLocation: db.prepare(`UPDATE visitor_visits SET location = ? WHERE visit_id = ?`),
  getAllVisits: db.prepare(`SELECT * FROM visitor_visits ORDER BY started_at DESC`),
  getVisitsForAnalytics: db.prepare(`SELECT * FROM visitor_visits WHERE started_at >= datetime('now', ?)`),
  // Tickets
  createTicket: db.prepare(`INSERT INTO tickets (ticket_id, conversation_id, priority, status, assigned_staff, notes, is_unread) VALUES (?, ?, ?, ?, ?, ?, 1)`),
  getTickets: db.prepare(`SELECT * FROM tickets ORDER BY created_at DESC`),
  getTicketById: db.prepare(`SELECT * FROM tickets WHERE id = ?`),
  getTicketByTicketId: db.prepare(`SELECT * FROM tickets WHERE ticket_id = ?`),
  getTicketsByConvo: db.prepare(`SELECT * FROM tickets WHERE conversation_id = ? ORDER BY created_at DESC`),
  updateTicket: db.prepare(`UPDATE tickets SET priority = ?, status = ?, assigned_staff = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`),
  setTicketUnread: db.prepare(`UPDATE tickets SET is_unread = ?, updated_at = datetime('now') WHERE id = ?`),
};

export function createConversation(id) {
  stmts.createConvo.run(id);
  return stmts.getConvo.get(id);
}

export function getConversation(id) {
  return stmts.getConvo.get(id);
}

export function getAllConversations() {
  return stmts.getAllConvos.all();
}

export function updateStatus(id, status) {
  stmts.updateConvoStatus.run(status, id);
}

export function updateMode(id, mode) {
  stmts.updateConvoMode.run(mode, id);
}

export function updateVisitor(id, name, email) {
  stmts.updateConvoVisitor.run(name, email, id);
}

export function touchConversation(id) {
  stmts.touchConvo.run(id);
}

export function addMessage(conversationId, sender, content, adminName = null) {
  stmts.addMessage.run(conversationId, sender, adminName, content);
  stmts.touchConvo.run(conversationId);
}

export function incrementConversationUnread(conversationId) {
  stmts.incrementConvoUnread.run(conversationId);
}

export function clearConversationUnread(conversationId) {
  stmts.clearConvoUnread.run(conversationId);
}

export function getMessages(conversationId) {
  return stmts.getMessages.all(conversationId);
}

export function getArchivedConversations() {
  return stmts.getArchivedConvos.all();
}

export function archiveConversation(id) {
  stmts.updateConvoStatus.run('archived', id);
}

export function deleteConversation(id) {
  stmts.deleteMessages.run(id);
  stmts.deleteConvo.run(id);
}

// ── Leads ──
export function createLead(data) {
  const { name, email, phone, company, inquiry_message, conversation_id, source_page } = data;
  stmts.createLead.run(name || '', email || '', phone || '', company || '', inquiry_message || '', conversation_id || null, source_page || '');
  return db.prepare(`SELECT * FROM leads WHERE id = last_insert_rowid()`).get();
}

export function getLeads(filter = {}) {
  let rows = stmts.getLeads.all();
  if (filter.status) rows = rows.filter((r) => r.status === filter.status);
  if (filter.search) {
    const s = filter.search.toLowerCase();
    rows = rows.filter((r) =>
      (r.name && r.name.toLowerCase().includes(s)) ||
      (r.email && r.email.toLowerCase().includes(s)) ||
      (r.company && r.company.toLowerCase().includes(s))
    );
  }
  return rows;
}

function leadsInRange(leads, start, end) {
  return leads.filter((lead) => {
    const createdAt = new Date(lead.created_at);
    return !Number.isNaN(createdAt.getTime()) && createdAt >= start && createdAt < end;
  });
}

function leadConversionRate(leads) {
  if (!leads.length) return 0;
  const converted = leads.filter((lead) => ['qualified', 'converted'].includes(lead.status)).length;
  return (converted / leads.length) * 100;
}

export function getLeadAnalytics() {
  const leads = stmts.getLeads.all();
  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setDate(now.getDate() - 30);
  const previousStart = new Date(now);
  previousStart.setDate(now.getDate() - 60);

  const currentLeads = leadsInRange(leads, currentStart, now);
  const previousLeads = leadsInRange(leads, previousStart, currentStart);

  return {
    websiteLeads: {
      current: currentLeads.length,
      previous: previousLeads.length,
    },
    tourConversion: {
      current: leadConversionRate(currentLeads),
      previous: leadConversionRate(previousLeads),
    },
  };
}

export function getLeadById(id) {
  return stmts.getLeadById.get(id);
}

export function updateLeadStatus(id, status) {
  stmts.updateLeadStatus.run(status, id);
  return stmts.getLeadById.get(id);
}

export function updateLead(id, data) {
  const row = stmts.getLeadById.get(id);
  if (!row) return null;
  const { name, email, phone, company, inquiry_message, status } = data;
  stmts.updateLead.run(
    name ?? row.name,
    email ?? row.email,
    phone ?? row.phone,
    company ?? row.company,
    inquiry_message ?? row.inquiry_message,
    status ?? row.status,
    id
  );
  return stmts.getLeadById.get(id);
}

export function getLeadByConversation(conversationId) {
  return stmts.getLeadsByConvo.get(conversationId);
}

// ── Visitor visits (analytics) ──
export function createOrUpdateVisit(visitId, conversationId, data) {
  const existing = stmts.getVisitByVisitId.get(visitId);
  const { ip, location, device, browser, pages_visited, message_count, visit_duration_seconds } = data || {};
  if (existing) {
    stmts.updateVisit.run(
      pages_visited ?? existing.pages_visited,
      visit_duration_seconds ?? existing.visit_duration_seconds,
      message_count ?? existing.message_count,
      visitId
    );
    return stmts.getVisitByVisitId.get(visitId);
  }
  stmts.createVisit.run(visitId, conversationId || null, ip || '', location || '', device || '', browser || '', pages_visited || '[]', message_count || 0);
  return stmts.getVisitByVisitId.get(visitId);
}

export function getVisitByVisitId(visitId) {
  return stmts.getVisitByVisitId.get(visitId);
}

export function updateVisitLocation(visitId, location) {
  stmts.updateVisitLocation.run(location, visitId);
}

export function getAllVisits() {
  return stmts.getAllVisits.all();
}

export function getVisitsForAnalytics(since = '-7 days') {
  return stmts.getVisitsForAnalytics.all(since);
}

// ── Tickets ──
export function createTicket(conversationId, data = {}) {
  const ticketId = 'TKT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const { priority, status, assigned_staff, notes } = data;
  stmts.createTicket.run(
    ticketId,
    conversationId,
    priority || 'medium',
    status || 'open',
    assigned_staff || null,
    notes || null
  );
  return db.prepare(`SELECT * FROM tickets WHERE id = last_insert_rowid()`).get();
}

export function getTickets(filter = {}) {
  let rows = stmts.getTickets.all();
  if (filter.status) rows = rows.filter((r) => r.status === filter.status);
  if (filter.conversationId) rows = rows.filter((r) => r.conversation_id === filter.conversationId);
  return rows;
}

export function getTicketById(id) {
  return stmts.getTicketById.get(id);
}

export function getTicketsByConvo(conversationId) {
  return stmts.getTicketsByConvo.all(conversationId);
}

export function updateTicket(id, data) {
  const row = stmts.getTicketById.get(id);
  if (!row) return null;
  const { priority, status, assigned_staff, notes } = data;
  stmts.updateTicket.run(
    priority ?? row.priority,
    status ?? row.status,
    assigned_staff !== undefined ? assigned_staff : row.assigned_staff,
    notes !== undefined ? notes : row.notes,
    id
  );
  return stmts.getTicketById.get(id);
}

export function setTicketUnread(id, isUnread) {
  stmts.setTicketUnread.run(isUnread ? 1 : 0, id);
  return stmts.getTicketById.get(id);
}

export default db;
