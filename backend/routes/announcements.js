import express from 'express';
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  listAnnouncements,
  logActivity,
  updateAnnouncement,
} from '../db-pm.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/public', (_req, res) => {
  const announcements = listAnnouncements({ status: 'published', audience: 'all' });
  return res.json(announcements);
});

router.use(requireAuth);

router.get('/', (req, res) => {
  const announcements = listAnnouncements(req.query);
  if (req.user.role === 'admin') return res.json(announcements);
  return res.json(announcements.filter((item) => item.status === 'published' && ['all', 'client'].includes(item.audience)));
});

router.get('/:id', (req, res) => {
  const announcement = getAnnouncementById(Number(req.params.id));
  if (!announcement) return res.status(404).json({ ok: false, message: 'Announcement not found' });
  if (req.user.role === 'client' && (announcement.status !== 'published' || !['all', 'client'].includes(announcement.audience))) {
    return res.status(403).json({ ok: false, message: 'Forbidden' });
  }
  return res.json(announcement);
});

router.post('/', requireRole('admin'), (req, res) => {
  try {
    const announcement = createAnnouncement(req.body || {});
    logActivity({ user_id: req.user.id, action: 'announcement.created', entity_type: 'announcement', entity_id: announcement.id });
    return res.status(201).json(announcement);
  } catch (err) {
    return res.status(400).json({ ok: false, message: err.message });
  }
});

router.patch('/:id', requireRole('admin'), (req, res) => {
  const announcement = updateAnnouncement(Number(req.params.id), req.body || {});
  if (!announcement) return res.status(404).json({ ok: false, message: 'Announcement not found' });
  logActivity({ user_id: req.user.id, action: 'announcement.updated', entity_type: 'announcement', entity_id: announcement.id });
  return res.json(announcement);
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  const deleted = deleteAnnouncement(Number(req.params.id));
  if (!deleted) return res.status(404).json({ ok: false, message: 'Announcement not found' });
  logActivity({ user_id: req.user.id, action: 'announcement.deleted', entity_type: 'announcement', entity_id: Number(req.params.id) });
  return res.json({ ok: true });
});

export default router;
