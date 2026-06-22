import express from 'express';
import { createLease, deleteLease, getLeaseById, listLeases, logActivity, updateLease } from '../db-pm.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const filter = req.user.role === 'client' ? { ...req.query, user_id: req.user.id } : req.query;
  res.json(listLeases(filter));
});

router.get('/:id', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const lease = getLeaseById(Number(req.params.id));
  if (!lease) return res.status(404).json({ ok: false, message: 'Lease not found' });
  if (req.user.role === 'client' && lease.user_id !== req.user.id) {
    return res.status(403).json({ ok: false, message: 'Forbidden' });
  }
  return res.json(lease);
});

router.post('/', requireRole('admin'), (req, res) => {
  try {
    const lease = createLease(req.body || {});
    logActivity({ user_id: req.user.id, action: 'lease.created', entity_type: 'lease', entity_id: lease.id });
    return res.status(201).json(lease);
  } catch (err) {
    return res.status(400).json({ ok: false, message: err.message });
  }
});

router.patch('/:id', requireRole('admin'), (req, res) => {
  const lease = updateLease(Number(req.params.id), req.body || {});
  if (!lease) return res.status(404).json({ ok: false, message: 'Lease not found' });
  logActivity({ user_id: req.user.id, action: 'lease.updated', entity_type: 'lease', entity_id: lease.id });
  return res.json(lease);
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  const deleted = deleteLease(Number(req.params.id));
  if (!deleted) return res.status(404).json({ ok: false, message: 'Lease not found' });
  logActivity({ user_id: req.user.id, action: 'lease.deleted', entity_type: 'lease', entity_id: Number(req.params.id) });
  return res.json({ ok: true });
});

export default router;
