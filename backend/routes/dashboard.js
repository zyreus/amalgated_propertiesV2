import express from 'express';
import { getLeadAnalytics } from '../../db.js';
import { getAdminAnalyticsStats, getAdminDashboardStats, getClientDashboardStats, listActivityLogs } from '../db-pm.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin', requireAuth, requireRole('admin'), (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(getAdminDashboardStats());
});

router.get('/analytics', requireAuth, requireRole('admin'), (_req, res) => {
  res.set('Cache-Control', 'no-store');

  const portfolio = getAdminAnalyticsStats();
  let leads = {
    websiteLeads: { current: 0, previous: 0 },
    tourConversion: { current: 0, previous: 0 },
  };

  try {
    leads = getLeadAnalytics();
  } catch {
    // Visitor/lead database may be unavailable in some environments.
  }

  res.json({
    propertyMix: portfolio.propertyMix,
    websiteLeads: leads.websiteLeads,
    tourConversion: leads.tourConversion,
    avgResolutionHours: portfolio.avgResolutionHours,
    collectionRate: portfolio.collectionRate,
  });
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
