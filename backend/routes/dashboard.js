import express from 'express';
import { getAdminDashboardStats, getClientDashboardStats, listActivityLogs } from '../db-pm.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin', requireAuth, requireRole('admin'), (_req, res) => {
  res.json(getAdminDashboardStats());
});

router.get('/client', requireAuth, requireRole('client', 'admin'), (req, res) => {
  const userId = req.user.role === 'admin' && req.query.user_id ? Number(req.query.user_id) : req.user.id;
  const stats = getClientDashboardStats(userId);
  if (!stats) return res.status(404).json({ ok: false, message: 'Client not found' });
  return res.json(stats);
});

router.get('/activity', requireAuth, requireRole('admin'), (req, res) => {
  res.json(listActivityLogs(req.query));
});

export default router;
