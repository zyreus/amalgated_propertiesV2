import express from 'express';
import {
  createMaintenanceRequest,
  deleteMaintenanceRequest,
  getMaintenanceRequestById,
  listMaintenanceRequests,
  logActivity,
  updateMaintenanceRequest,
} from '../db-pm.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

function clientFilter(req) {
  if (req.user.role !== 'client') return req.query;
  if (!req.user.property_id) return { property_id: -1 };
  return { ...req.query, property_id: req.user.property_id };
}

router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(listMaintenanceRequests(clientFilter(req)));
});

router.get('/:id', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const request = getMaintenanceRequestById(Number(req.params.id));
  if (!request) return res.status(404).json({ ok: false, message: 'Maintenance request not found' });
  if (req.user.role === 'client' && request.property_id !== req.user.property_id) {
    return res.status(403).json({ ok: false, message: 'Forbidden' });
  }
  return res.json(request);
});

router.post('/', (req, res) => {
  try {
    const payload = req.user.role === 'client'
      ? { ...req.body, property_id: req.user.property_id }
      : req.body;
    const request = createMaintenanceRequest(payload || {});
    logActivity({ user_id: req.user.id, action: 'maintenance.created', entity_type: 'maintenance_request', entity_id: request.id });
    return res.status(201).json(request);
  } catch (err) {
    return res.status(400).json({ ok: false, message: err.message });
  }
});

router.patch('/:id', requireRole('admin'), (req, res) => {
  const request = updateMaintenanceRequest(Number(req.params.id), req.body || {});
  if (!request) return res.status(404).json({ ok: false, message: 'Maintenance request not found' });
  logActivity({ user_id: req.user.id, action: 'maintenance.updated', entity_type: 'maintenance_request', entity_id: request.id });
  return res.json(request);
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  const deleted = deleteMaintenanceRequest(Number(req.params.id));
  if (!deleted) return res.status(404).json({ ok: false, message: 'Maintenance request not found' });
  logActivity({ user_id: req.user.id, action: 'maintenance.deleted', entity_type: 'maintenance_request', entity_id: Number(req.params.id) });
  return res.json({ ok: true });
});

export default router;
