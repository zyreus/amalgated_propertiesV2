import express from 'express';
import {
  createProperty,
  deleteProperty,
  getPropertyById,
  getPropertyBySlug,
  listProperties,
  logActivity,
  updateProperty,
} from '../db-pm.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(listProperties(req.query));
});

router.get('/admin/:id', requireAuth, requireRole('admin'), (req, res) => {
  const property = getPropertyById(Number(req.params.id));
  if (!property) return res.status(404).json({ ok: false, message: 'Property not found' });
  return res.json(property);
});

router.get('/:slug', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const property = getPropertyBySlug(req.params.slug);
  if (!property) return res.status(404).json({ ok: false, message: 'Property not found' });
  return res.json(property);
});

router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  try {
    const property = createProperty(req.body || {});
    logActivity({ user_id: req.user.id, action: 'property.created', entity_type: 'property', entity_id: property.id });
    return res.status(201).json(property);
  } catch (err) {
    return res.status(400).json({ ok: false, message: err.message });
  }
});

router.patch('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const property = updateProperty(Number(req.params.id), req.body || {});
  if (!property) return res.status(404).json({ ok: false, message: 'Property not found' });
  logActivity({ user_id: req.user.id, action: 'property.updated', entity_type: 'property', entity_id: property.id });
  return res.json(property);
});

router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const deleted = deleteProperty(Number(req.params.id));
  if (!deleted) return res.status(404).json({ ok: false, message: 'Property not found' });
  logActivity({ user_id: req.user.id, action: 'property.deleted', entity_type: 'property', entity_id: Number(req.params.id) });
  return res.json({ ok: true });
});

export default router;
