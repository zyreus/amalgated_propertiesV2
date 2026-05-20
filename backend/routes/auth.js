import express from 'express';
import bcrypt from 'bcryptjs';
import { getUserById, getUserByLogin, markUserLogin } from '../db-pm.js';
import { rateLimit, requireAuth, signUserToken } from '../middleware/auth.js';

const router = express.Router();

function publicUser(user) {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

router.post('/login', rateLimit({ windowMs: 60_000, max: 10 }), async (req, res) => {
  const { username, email, password } = req.body || {};
  const login = username || email;
  if (!login || !password) {
    return res.status(400).json({ ok: false, message: 'Username/email and password are required.' });
  }

  const user = getUserByLogin(login);
  if (!user || user.status !== 'active') {
    return res.status(401).json({ ok: false, message: 'Invalid credentials.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ ok: false, message: 'Invalid credentials.' });
  }

  const updated = markUserLogin(user.id);
  const token = signUserToken(updated);
  return res.json({ ok: true, token, user: publicUser(updated) });
});

router.get('/verify', requireAuth, (req, res) => {
  const user = getUserById(req.user.id);
  if (!user || user.status !== 'active') {
    return res.status(401).json({ ok: false, message: 'User no longer active' });
  }
  return res.json({ ok: true, user: publicUser(user) });
});

export default router;
