import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import nodemailer from 'nodemailer';
import Groq from 'groq-sdk';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { mountRoutes } from './app-routes.js';
import { rateLimit, securityHeaders } from './middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import {
  createConversation, getConversation, getAllConversations,
  updateStatus, updateMode, updateVisitor, addMessage, getMessages, touchConversation,
  getArchivedConversations, archiveConversation, deleteConversation,
  createLead, getLeads, getLeadById, getLeadByConversation, updateLeadStatus, updateLead,
  createOrUpdateVisit, getVisitByVisitId, getAllVisits, getVisitsForAnalytics, updateVisitLocation,
  createTicket, getTickets, getTicketById, getTicketsByConvo, updateTicket, setTicketUnread,
  incrementConversationUnread, clearConversationUnread,
} from '../db.js';

const app = express();
const port = process.env.PORT || 8000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: /^http:\/\/localhost:\d+$/, methods: ['GET', 'POST'] },
});

app.use(securityHeaders());
app.use(cors({ origin: /^http:\/\/localhost:\d+$/ }));
app.use(express.json());
mountRoutes(app, io);

// ── Email (Contact form) ──

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

app.post('/api/contact', async (req, res) => {
  const { name, company, email, location, requirements } = req.body || {};
  if (!name || !email || !requirements) {
    return res.status(400).json({ ok: false, message: 'Name, email, and requirements are required.' });
  }
  try {
    await transporter.sendMail({
      from: `"Amalgated Properties Website" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: 'New corporate enquiry via website',
      html: `<h2>New corporate real estate enquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Organization:</strong> ${company || '—'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Preferred market:</strong> ${location || '—'}</p>
        <p><strong>Requirements:</strong></p>
        <p>${(requirements || '').replace(/\n/g, '<br />')}</p>`,
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[contact-api]', err.message);
    return res.status(500).json({ ok: false, message: 'Unable to send message at this time.' });
  }
});

// ── AI Setup ──

const SYSTEM_PROMPT = `You are APMC Assistant, the helpful AI chatbot for Amalgated Properties & Management Corporation (APMC).
APMC is a premium real estate and property management company based in Davao City, Philippines.

Services: Property Acquisition & Development, Leasing Services (Residential, Commercial, Office), Property & Asset Management, Project Management, Risk & Credit Management.
Sales channels: Direct Leasing, Broker & Agent Network, Digital Listings.
Payment terms: Monthly Rental Fees, Rent-to-Own (up to 8 years).
Contact: +63 998 596 9288 | sales@theamalgatedproperties.com
Address: Amalgated Bldg. Doña Carolina Bldg, J.P. Laurel Ave, Bo. Obrero, Davao City, Philippines.

Be professional, friendly, and concise. Help visitors with leasing enquiries, property info, services, and general questions. If you don't know something specific, suggest they contact the team directly.`;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const aiContexts = new Map();

// Lead capture: detect if user is asking about services, pricing, or availability
const LEAD_CAPTURE_KEYWORDS = /\b(service|services|pricing|price|cost|rates?|availability|available|inquire|inquiry|quote|book|schedule|viewing|tour|lease|rent|leasing)\b/i;
function wantsLeadCapture(message) {
  return typeof message === 'string' && LEAD_CAPTURE_KEYWORDS.test(message);
}

const MAINTENANCE_KEYWORDS = /\b(maintenance|repair|broken|leak|issue|problem|concern|damage|fix|urgent)\b/i;
function isMaintenanceConcern(message) {
  return typeof message === 'string' && MAINTENANCE_KEYWORDS.test(message);
}

// Simple User-Agent parsing for device/browser
function parseUserAgent(ua) {
  if (!ua || typeof ua !== 'string') return { device: 'Unknown', browser: 'Unknown' };
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|webOS/i.test(ua);
  let browser = 'Unknown';
  if (/Chrome\/[.\d]+/i.test(ua) && !/Edge/i.test(ua)) browser = 'Chrome';
  else if (/Firefox\/[.\d]+/i.test(ua)) browser = 'Firefox';
  else if (/Safari\/[.\d]+/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Edge\/[.\d]+/i.test(ua)) browser = 'Edge';
  return { device: isMobile ? 'Mobile' : 'Desktop', browser };
}

// Optional: resolve location from IP (fire-and-forget)
function resolveLocationFromIp(visitId, ip, cb) {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return cb();
  const url = `http://ip-api.com/json/${ip}?fields=city,regionName,country`;
  fetch(url).then((r) => r.json()).then((data) => {
    if (data && (data.city || data.country)) {
      const loc = [data.city, data.regionName, data.country].filter(Boolean).join(', ');
      const visit = getVisitByVisitId(visitId);
      if (visit) updateVisitLocation(visitId, loc);
    }
  }).catch(() => {}).finally(cb);
}

async function getAIReply(conversationId, userMessage) {
  if (!process.env.GROQ_API_KEY) return 'AI service is not configured.';

  if (!aiContexts.has(conversationId)) {
    aiContexts.set(conversationId, [{ role: 'system', content: SYSTEM_PROMPT }]);
  }
  const ctx = aiContexts.get(conversationId);
  ctx.push({ role: 'user', content: userMessage });
  if (ctx.length > 21) {
    aiContexts.set(conversationId, [ctx[0], ...ctx.slice(-20)]);
  }

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: ctx,
    max_tokens: 512,
    temperature: 0.7,
  });
  const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  ctx.push({ role: 'assistant', content: reply });
  return reply;
}

// ── Customer Feedback ──

const FEEDBACK_FILE = path.join(__dirname, 'feedback.json');

function readFeedback() {
  try {
    const arr = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
    return Array.isArray(arr) ? arr.map((f) => ({ ...f, is_read: !!f.is_read })) : [];
  } catch { return []; }
}
function writeFeedback(data) {
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
}

app.post('/api/feedback', (req, res) => {
  const { conversationId, rating, name, email, comment } = req.body;
  if (!rating || !comment?.trim()) {
    return res.status(400).json({ ok: false, message: 'Rating and comment are required.' });
  }
  const feedback = readFeedback();
  feedback.push({
    id: crypto.randomUUID(),
    conversationId: conversationId || null,
    rating,
    name: name || 'Anonymous',
    email: email || '',
    comment: comment.trim(),
    is_read: false,
    created_at: new Date().toISOString(),
  });
  writeFeedback(feedback);
  res.json({ ok: true });
});

function verifyAdminTokenFromRequest(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;

  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    return decoded?.role === 'admin' ? decoded : null;
  } catch {
    return null;
  }
}

app.get('/api/admin/feedback', (req, res) => {
  const admin = verifyAdminTokenFromRequest(req);
  if (!admin) {
    return res.status(401).json({ ok: false });
  }

  res.json(readFeedback().reverse());
});

app.delete('/api/admin/feedback/:id', (req, res) => {
  const admin = verifyAdminTokenFromRequest(req);
  if (!admin) {
    return res.status(401).json({ ok: false });
  }

  const feedback = readFeedback().filter((f) => f.id !== req.params.id);
  writeFeedback(feedback);
  res.json({ ok: true });
});

// ── Bulk actions (admin) ──
app.post('/api/admin/bulk', requireAdmin, (req, res) => {
  const { resource, action, ids } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ ok: false, message: 'ids required' });
  if (!['conversations', 'feedback', 'tickets'].includes(resource)) return res.status(400).json({ ok: false, message: 'invalid resource' });
  if (!['delete', 'markRead', 'markUnread'].includes(action)) return res.status(400).json({ ok: false, message: 'invalid action' });

  if (resource === 'conversations') {
    ids.forEach((id) => {
      if (action === 'delete') deleteConversation(id);
      if (action === 'markRead') clearConversationUnread(id);
      if (action === 'markUnread') incrementConversationUnread(id);
    });
    io.to('admin').emit('conversations:refresh');
    return res.json({ ok: true });
  }

  if (resource === 'tickets') {
    ids.forEach((id) => {
      const num = Number(id);
      if (!Number.isFinite(num)) return;
      if (action === 'delete') {
        // no delete endpoint previously; implement here
        // SQLite delete:
        try { db.prepare('DELETE FROM tickets WHERE id = ?').run(num); } catch {}
      }
      if (action === 'markRead') setTicketUnread(num, false);
      if (action === 'markUnread') setTicketUnread(num, true);
    });
    io.to('admin').emit('tickets:refresh');
    return res.json({ ok: true });
  }

  // feedback.json
  const feedback = readFeedback();
  let next = feedback;
  if (action === 'delete') next = feedback.filter((f) => !ids.includes(f.id));
  if (action === 'markRead') next = feedback.map((f) => (ids.includes(f.id) ? { ...f, is_read: true } : f));
  if (action === 'markUnread') next = feedback.map((f) => (ids.includes(f.id) ? { ...f, is_read: false } : f));
  writeFeedback(next);
  return res.json({ ok: true });
});

// ── Admin Authentication ──

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

app.post('/api/admin/login', rateLimit({ windowMs: 60_000, max: 10 }), async (req, res) => {
  const { username, email, password, remember } = req.body;
  const login = username || email;
  if (!login || !password) {
    return res.status(400).json({ ok: false, message: 'Admin email and password are required.' });
  }

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  const normalizedLogin = String(login).trim().toLowerCase();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedAdmin = String(adminUsername || '').trim().toLowerCase();

  if (!adminUsername || !adminHash || (normalizedLogin !== normalizedAdmin && normalizedEmail !== normalizedAdmin)) {
    return res.status(401).json({ ok: false, message: 'Invalid credentials.' });
  }

  const valid = await bcrypt.compare(password, adminHash);
  if (!valid) {
    return res.status(401).json({ ok: false, message: 'Invalid credentials.' });
  }

  const token = jwt.sign(
    {
      username: adminUsername,
      email: normalizedEmail || null,
      role: 'admin',
      guard: 'admin',
    },
    JWT_SECRET,
    { expiresIn: remember ? '7d' : '8h' }
  );
  res.json({ ok: true, token, admin: { username: adminUsername, email: normalizedEmail || null } });
});

app.get('/api/admin/verify', (req, res) => {
  const decoded = verifyAdminTokenFromRequest(req);
  if (!decoded) {
    return res.status(401).json({ ok: false });
  }

  res.json({ ok: true, admin: { username: decoded.username, email: decoded.email || null } });
});

function requireAdmin(req, res, next) {
  const admin = verifyAdminTokenFromRequest(req);
  if (!admin) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }

  req.admin = admin;
  return next();
}

function verifySocketAdmin(socket) {
  const token = socket.handshake?.auth?.token;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded?.role === 'admin' ? decoded : null;
  } catch {
    return null;
  }
}

// ── Admin REST endpoints (protected) ──

app.get('/api/admin/conversations', requireAdmin, (_req, res) => {
  res.json(getAllConversations());
});

app.get('/api/admin/conversations/archived', requireAdmin, (_req, res) => {
  res.json(getArchivedConversations());
});

app.get('/api/admin/conversations/:id/messages', requireAdmin, (req, res) => {
  // Opening a conversation implies the admin has read it
  clearConversationUnread(req.params.id);
  res.json(getMessages(req.params.id));
});

app.patch('/api/admin/conversations/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!['open', 'in_progress', 'resolved'].includes(status)) {
    return res.status(400).json({ ok: false });
  }
  updateStatus(req.params.id, status);
  io.to(`admin`).emit('conversation:updated', getConversation(req.params.id));
  io.to(req.params.id).emit('conversation:statusChanged', { status });
  res.json({ ok: true });
});

app.patch('/api/admin/conversations/:id/archive', requireAdmin, (req, res) => {
  archiveConversation(req.params.id);
  io.to(`admin`).emit('conversations:refresh');
  io.to(req.params.id).emit('conversation:statusChanged', { status: 'archived' });
  res.json({ ok: true });
});

app.delete('/api/admin/conversations/:id', requireAdmin, (req, res) => {
  deleteConversation(req.params.id);
  io.to(`admin`).emit('conversations:refresh');
  res.json({ ok: true });
});

// ── CRM Leads (admin) ──
app.get('/api/admin/leads', requireAdmin, (req, res) => {
  const { status, search } = req.query;
  const leads = getLeads({ status: status || undefined, search: search || undefined });
  res.json(leads);
});

app.get('/api/admin/leads/export', requireAdmin, (req, res) => {
  const { format } = req.query;
  const { status, search } = req.query;
  const leads = getLeads({ status: status || undefined, search: search || undefined });
  if (format === 'csv') {
    const header = 'Name,Email,Phone,Company,Inquiry Message,Conversation ID,Source Page,Status,Created At\n';
    const rows = leads.map((l) => {
      const escape = (v) => (v != null ? String(v).replace(/"/g, '""') : '');
      return [escape(l.name), escape(l.email), escape(l.phone), escape(l.company), escape(l.inquiry_message), escape(l.conversation_id), escape(l.source_page), escape(l.status), escape(l.created_at)].map((c) => `"${c}"`).join(',');
    }).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    return res.send(header + rows);
  }
  res.json(leads);
});

app.patch('/api/admin/leads/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status, name, email, phone, company, inquiry_message } = req.body || {};
  const lead = getLeadById(Number(id));
  if (!lead) return res.status(404).json({ ok: false, message: 'Lead not found' });
  if (status !== undefined) {
    updateLeadStatus(Number(id), status);
  } else if (name !== undefined || email !== undefined || phone !== undefined || company !== undefined || inquiry_message !== undefined) {
    updateLead(Number(id), { name, email, phone, company, inquiry_message, status: lead.status });
  }
  res.json(getLeadById(Number(id)));
});

// ── Visitor Analytics (admin) ──
app.get('/api/admin/analytics', requireAdmin, (req, res) => {
  const { since = '-7 days' } = req.query;
  const visits = getVisitsForAnalytics(since);
  const allVisits = getAllVisits();
  const byDevice = {};
  const byBrowser = {};
  const byLocation = {};
  let totalMessages = 0;
  let totalDuration = 0;
  visits.forEach((v) => {
    byDevice[v.device || 'Unknown'] = (byDevice[v.device || 'Unknown'] || 0) + 1;
    byBrowser[v.browser || 'Unknown'] = (byBrowser[v.browser || 'Unknown'] || 0) + 1;
    byLocation[v.location || 'Unknown'] = (byLocation[v.location || 'Unknown'] || 0) + 1;
    totalMessages += v.message_count || 0;
    totalDuration += v.visit_duration_seconds || 0;
  });
  res.json({
    visits: visits.length,
    totalVisits: allVisits.length,
    totalMessages,
    avgDurationSeconds: visits.length ? Math.round(totalDuration / visits.length) : 0,
    byDevice,
    byBrowser,
    byLocation,
    recentVisits: visits.slice(0, 50),
  });
});

// ── Tickets (admin) ──
app.get('/api/admin/tickets', requireAdmin, (req, res) => {
  const { status, conversationId } = req.query;
  res.json(getTickets({ status: status || undefined, conversationId: conversationId || undefined }));
});

app.post('/api/admin/tickets', requireAdmin, (req, res) => {
  const { conversation_id, priority, status, assigned_staff, notes } = req.body || {};
  if (!conversation_id) return res.status(400).json({ ok: false, message: 'conversation_id required' });
  const ticket = createTicket(conversation_id, { priority, status, assigned_staff, notes });
  io.to('admin').emit('tickets:refresh');
  res.json(ticket);
});

app.patch('/api/admin/tickets/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { priority, status, assigned_staff, notes } = req.body || {};
  const ticket = getTicketById(Number(id));
  if (!ticket) return res.status(404).json({ ok: false, message: 'Ticket not found' });
  const updated = updateTicket(Number(id), { priority, status, assigned_staff, notes });
  // Any admin interaction counts as read
  setTicketUnread(Number(id), false);
  io.to('admin').emit('tickets:refresh');
  res.json(updated);
});

app.get('/api/admin/tickets/by-conversation/:conversationId', requireAdmin, (req, res) => {
  res.json(getTicketsByConvo(req.params.conversationId));
});

// ── Socket.io ──

function getClientIp(socket) {
  const req = socket.request;
  return req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || req?.connection?.remoteAddress || socket.handshake?.address || '';
}

io.on('connection', (socket) => {
  const ua = socket.handshake?.headers?.['user-agent'];
  const { device, browser } = parseUserAgent(ua);
  const ip = getClientIp(socket);

  // Visitor joins their conversation room
  socket.on('visitor:join', (payload) => {
    const conversationId = typeof payload === 'string' ? payload : payload?.conversationId;
    const source_page = typeof payload === 'object' ? payload?.source_page : undefined;
    if (!conversationId) return;
    createConversation(conversationId);
    socket.join(conversationId);
    socket.data.conversationId = conversationId;
    socket.data.role = 'visitor';

    const pages = source_page ? [source_page] : [];
    createOrUpdateVisit(conversationId, conversationId, {
      ip, location: 'Unknown', device, browser,
      pages_visited: JSON.stringify(pages),
      message_count: 0,
    });
    resolveLocationFromIp(conversationId, ip, () => {});

    const msgs = getMessages(conversationId);
    socket.emit('chat:history', msgs);
  });

  // Admin joins the admin room + a specific conversation
  socket.on('admin:join', () => {
    const admin = verifySocketAdmin(socket);
    if (!admin) {
      socket.emit('admin:unauthorized');
      return;
    }
    socket.join('admin');
    socket.data.role = 'admin';
    socket.data.admin = admin;
  });

  socket.on('admin:joinConversation', (conversationId) => {
    if (socket.data.role !== 'admin') return;
    socket.join(conversationId);
  });

  socket.on('admin:leaveConversation', (conversationId) => {
    if (socket.data.role !== 'admin') return;
    socket.leave(conversationId);
  });

  // Visitor sends a message
  socket.on('visitor:message', async (payload) => {
    const { conversationId, content, source_page } = typeof payload === 'object' ? payload : { conversationId: payload?.conversationId, content: payload?.content };
    if (!content?.trim()) return;

    createConversation(conversationId);
    addMessage(conversationId, 'user', content.trim());
    incrementConversationUnread(conversationId);

    let lead = getLeadByConversation(conversationId);
    if (!lead) {
      lead = createLead({
        name: 'Website Visitor',
        email: `visitor-${conversationId.slice(0, 8)}@chat.apmc.local`,
        phone: '',
        company: '',
        inquiry_message: content.trim(),
        conversation_id: conversationId,
        source_page: source_page || '',
      });
      io.to('admin').emit('admin:newLead', lead);
    } else if (!lead.inquiry_message) {
      lead = updateLead(lead.id, { inquiry_message: content.trim(), source_page: source_page || lead.source_page });
      io.to('admin').emit('admin:newLead', lead);
    }

    if (isMaintenanceConcern(content.trim()) && !getTicketsByConvo(conversationId).length) {
      createTicket(conversationId, {
        priority: 'medium',
        status: 'open',
        notes: content.trim(),
      });
      io.to('admin').emit('tickets:refresh');
    }

    // Update visit analytics: message count, optional page, duration
    const visit = getVisitByVisitId(conversationId);
    if (visit) {
      let pages = [];
      try { pages = JSON.parse(visit.pages_visited || '[]'); } catch { }
      if (source_page && !pages.includes(source_page)) pages.push(source_page);
      const started = visit.started_at ? new Date(visit.started_at).getTime() : Date.now();
      const durationSec = Math.floor((Date.now() - started) / 1000);
      createOrUpdateVisit(conversationId, conversationId, {
        pages_visited: JSON.stringify(pages),
        message_count: (visit.message_count || 0) + 1,
        visit_duration_seconds: durationSec,
      });
    } else {
      createOrUpdateVisit(conversationId, conversationId, {
        ip: getClientIp(socket),
        device,
        browser,
        pages_visited: source_page ? JSON.stringify([source_page]) : '[]',
        message_count: 1,
      });
    }

    const userMsg = {
      conversation_id: conversationId,
      sender: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    io.to(conversationId).emit('chat:message', userMsg);
    io.to('admin').emit('chat:newMessage', { conversationId, message: userMsg });

    const convo = getConversation(conversationId);
    if (convo?.mode === 'ai') {
      // Lead capture: if user asks about services, pricing, or availability, ask for contact details first
      if (wantsLeadCapture(content.trim())) {
        const askMsg = 'To help you with that, please share your contact details so our team can get back to you.';
        addMessage(conversationId, 'ai', askMsg);
        const aiMsg = {
          conversation_id: conversationId,
          sender: 'ai',
          content: askMsg,
          created_at: new Date().toISOString(),
        };
        io.to(conversationId).emit('chat:message', aiMsg);
        io.to(conversationId).emit('chat:requestLeadDetails', { inquiry_message: content.trim() });
        io.to('admin').emit('chat:newMessage', { conversationId, message: aiMsg });
      } else {
        io.to(conversationId).emit('chat:typing', { sender: 'ai' });
        try {
          const reply = await getAIReply(conversationId, content.trim());
          addMessage(conversationId, 'ai', reply);
          const aiMsg = {
            conversation_id: conversationId,
            sender: 'ai',
            content: reply,
            created_at: new Date().toISOString(),
          };
          io.to(conversationId).emit('chat:message', aiMsg);
          io.to('admin').emit('chat:newMessage', { conversationId, message: aiMsg });
        } catch (err) {
          console.error('[ai]', err.message);
          const errMsg = {
            conversation_id: conversationId,
            sender: 'ai',
            content: 'Sorry, something went wrong. Please try again.',
            created_at: new Date().toISOString(),
          };
          io.to(conversationId).emit('chat:message', errMsg);
        }
        io.to(conversationId).emit('chat:typingStop');
      }
    }

    io.to('admin').emit('conversations:refresh');
  });

  // Visitor submits lead capture form (name, email, phone, etc.)
  socket.on('visitor:leadDetails', ({ conversationId, name, email, phone, company, inquiry_message, source_page }) => {
    if (!conversationId || !name?.trim() || !email?.trim()) return;
    const existingLead = getLeadByConversation(conversationId);
    const lead = existingLead
      ? updateLead(existingLead.id, {
          name: name.trim(),
          email: email.trim(),
          phone: (phone || '').trim() || null,
          company: (company || '').trim() || null,
          inquiry_message: (inquiry_message || existingLead.inquiry_message || '').trim() || null,
          source_page: (source_page || existingLead.source_page || '').trim() || null,
          status: 'qualified',
        })
      : createLead({
          name: name.trim(),
          email: email.trim(),
          phone: (phone || '').trim() || null,
          company: (company || '').trim() || null,
          inquiry_message: (inquiry_message || '').trim() || null,
          conversation_id: conversationId,
          source_page: (source_page || '').trim() || null,
        });
    updateVisitor(conversationId, name.trim(), email.trim());
    const thankMsg = 'Thank you! We have your details and our team will get back to you shortly.';
    addMessage(conversationId, 'ai', thankMsg);
    const aiMsg = {
      conversation_id: conversationId,
      sender: 'ai',
      content: thankMsg,
      created_at: new Date().toISOString(),
    };
    io.to(conversationId).emit('chat:message', aiMsg);
    io.to(conversationId).emit('chat:leadCaptured');
    io.to('admin').emit('chat:newMessage', { conversationId, message: aiMsg });
    io.to('admin').emit('admin:newLead', lead);
    io.to('admin').emit('conversations:refresh');
  });

  // Visitor requests human agent
  socket.on('visitor:requestAgent', ({ conversationId, name, email, concern }) => {
    createConversation(conversationId);
    updateMode(conversationId, 'human');
    updateStatus(conversationId, 'open');
    if (name) updateVisitor(conversationId, name, email || '');

    addMessage(conversationId, 'user', `[Agent Request] Name: ${name || 'N/A'} | Email: ${email || 'N/A'} | Concern: ${concern || 'N/A'}`);

    const sysMsg = {
      conversation_id: conversationId,
      sender: 'ai',
      content: 'You\'ve been connected to our support queue. A customer service representative will be with you shortly.',
      created_at: new Date().toISOString(),
    };
    addMessage(conversationId, 'ai', sysMsg.content);
    io.to(conversationId).emit('chat:message', sysMsg);
    io.to('admin').emit('conversations:refresh');
  });

  // Admin sends a message
  socket.on('admin:message', ({ conversationId, content, adminName }) => {
    if (socket.data.role !== 'admin') return;
    if (!content?.trim()) return;

    addMessage(conversationId, 'admin', content.trim(), adminName || 'Support Agent');
    updateStatus(conversationId, 'in_progress');
    clearConversationUnread(conversationId);

    const adminMsg = {
      conversation_id: conversationId,
      sender: 'admin',
      admin_name: adminName || 'Support Agent',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    io.to(conversationId).emit('chat:message', adminMsg);
    io.to('admin').emit('chat:newMessage', { conversationId, message: adminMsg });
    io.to('admin').emit('conversations:refresh');
  });

  // Admin typing indicator
  socket.on('admin:typing', ({ conversationId }) => {
    if (socket.data.role !== 'admin') return;
    io.to(conversationId).emit('chat:typing', { sender: 'admin' });
  });

  socket.on('admin:typingStop', ({ conversationId }) => {
    if (socket.data.role !== 'admin') return;
    io.to(conversationId).emit('chat:typingStop');
  });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

// ── Serve frontend (Vite build) on the same origin ──
const clientDir = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(clientDir)) {
  app.use(express.static(clientDir));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return res.status(404).end();
    }
    res.sendFile(path.join(clientDir, 'index.html'));
  });
}

httpServer.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
