import express from 'express';
import {
  createPayment,
  deletePayment,
  getPaymentById,
  listLeases,
  listPayments,
  logActivity,
  updatePayment,
} from '../db-pm.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

function clientLeaseIds(userId) {
  return new Set(listLeases({ user_id: userId }).map((lease) => lease.id));
}

router.get('/', (req, res) => {
  const payments = listPayments(req.query);
  if (req.user.role !== 'client') return res.json(payments);

  const allowed = clientLeaseIds(req.user.id);
  return res.json(payments.filter((payment) => allowed.has(payment.lease_id)));
});

router.get('/:id', (req, res) => {
  const payment = getPaymentById(Number(req.params.id));
  if (!payment) return res.status(404).json({ ok: false, message: 'Payment not found' });
  if (req.user.role === 'client' && !clientLeaseIds(req.user.id).has(payment.lease_id)) {
    return res.status(403).json({ ok: false, message: 'Forbidden' });
  }
  return res.json(payment);
});

router.post('/', requireRole('admin'), (req, res) => {
  try {
    const payment = createPayment(req.body || {});
    logActivity({ user_id: req.user.id, action: 'payment.created', entity_type: 'payment', entity_id: payment.id });
    return res.status(201).json(payment);
  } catch (err) {
    return res.status(400).json({ ok: false, message: err.message });
  }
});

router.patch('/:id', requireRole('admin'), (req, res) => {
  const payment = updatePayment(Number(req.params.id), req.body || {});
  if (!payment) return res.status(404).json({ ok: false, message: 'Payment not found' });
  logActivity({ user_id: req.user.id, action: 'payment.updated', entity_type: 'payment', entity_id: payment.id });
  return res.json(payment);
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  const deleted = deletePayment(Number(req.params.id));
  if (!deleted) return res.status(404).json({ ok: false, message: 'Payment not found' });
  logActivity({ user_id: req.user.id, action: 'payment.deleted', entity_type: 'payment', entity_id: Number(req.params.id) });
  return res.json({ ok: true });
});

export default router;
