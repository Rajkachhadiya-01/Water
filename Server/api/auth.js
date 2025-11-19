// server/auth.js
// simple JWT auth & role middleware
const jwt = require('jsonwebtoken');
const SECRET = 'change-this-secret-in-prod';
const { User } = require('../models');

async function generateToken(user) {
  const payload = { id: user.id, role: user.role, email: user.email };
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function roleGuard(requiredRole) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== requiredRole) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

module.exports = { generateToken, authMiddleware, roleGuard };