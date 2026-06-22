import express from 'express';
import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  logActivity,
} from '../db-pm.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
const VALID_ROLES = new Set(['admin', 'client']);
const VALID_STATUSES = new Set(['active', 'inactive', 'suspended']);

function publicUser(user) {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

function requireText(value, label) {
  if (!String(value || '').trim()) {
    const error = new Error(`${label} is required.`);
    error.status = 400;
    throw error;
  }
}

router.get('/', requireAuth, requireRole('admin'), (req, res) => {
  const users = listUsers(req.query).map(publicUser);
  return res.json(users);
});

router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  try {
    const payload = req.body || {};
    const role = VALID_ROLES.has(payload.role) ? payload.role : 'client';
    const status = VALID_STATUSES.has(payload.status) ? payload.status : 'active';

    requireText(payload.name, 'Name');
    requireText(payload.email, 'Email');
    requireText(payload.password, 'Temporary password');

    const user = createUser({
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      username: payload.username?.trim() || payload.email.trim().toLowerCase(),
      phone: payload.phone?.trim() || null,
      role,
      property_id: payload.property_id || null,
      password: payload.password || undefined,
      status,
    });

    logActivity({
      user_id: req.user.id,
      action: 'user.created',
      entity_type: 'user',
      entity_id: user.id,
      metadata: { role, status },
    });

    return res.status(201).json(publicUser(getUserById(user.id)));
  } catch (err) {
    return res.status(err.status || 400).json({ ok: false, message: err.message });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const id = Number(req.params.id);
  const user = getUserById(id);
  if (!user) return res.status(404).json({ ok: false, message: 'User not found' });

  const activeAdmins = listUsers({ status: 'active' }).filter((row) => row.role === 'admin').length;
  if (user.role === 'admin' && user.status === 'active' && activeAdmins <= 1) {
    return res.status(400).json({ ok: false, message: 'You cannot delete the last active admin user.' });
  }

  const deleted = deleteUser(id);
  if (!deleted) return res.status(404).json({ ok: false, message: 'User not found' });

  logActivity({
    user_id: req.user.id,
    action: 'user.deleted',
    entity_type: 'user',
    entity_id: id,
    metadata: { email: user.email, role: user.role },
  });

  return res.json({ ok: true });
});

export default router;
