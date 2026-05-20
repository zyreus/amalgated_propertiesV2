import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

export function signUserToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      property_id: user.property_id ?? null,
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }

  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ ok: false, message: 'Token expired or invalid' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok: false, message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, message: 'Forbidden' });
    }
    return next();
  };
}

export function securityHeaders() {
  return (_req, res, next) => {
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' http: ws: wss:; frame-src https://www.google.com;"
    );
    next();
  };
}

export function rateLimit({ windowMs = 60_000, max = 60 } = {}) {
  const hits = new Map();

  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const timestamp = Date.now();
    const record = hits.get(key) || { count: 0, resetAt: timestamp + windowMs };

    if (timestamp > record.resetAt) {
      record.count = 0;
      record.resetAt = timestamp + windowMs;
    }

    record.count += 1;
    hits.set(key, record);

    if (record.count > max) {
      return res.status(429).json({ ok: false, message: 'Too many requests' });
    }

    return next();
  };
}
