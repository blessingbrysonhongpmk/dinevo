const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dinevo-secret-key-2026';

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Check in-memory fallback first
    if (email.toLowerCase() === 'admin@dinevo.com' && password === 'dinevo123') {
      const token = jwt.sign(
        { id: 'admin-default', email: 'admin@dinevo.com', role: 'admin', name: 'DINEVO Admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({
        success: true,
        token,
        user: { id: 'admin-default', email: 'admin@dinevo.com', role: 'admin', name: 'DINEVO Admin' }
      });
    }

    // Try MongoDB user lookup
    try {
      const user = await UserModel.findOne({ email: email.toLowerCase() });
      if (user && (await user.comparePassword(password))) {
        const token = jwt.sign(
          { id: user._id, email: user.email, role: user.role, name: user.name },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          success: true,
          token,
          user: { id: user._id, email: user.email, role: user.role, name: user.name }
        });
      }
    } catch (dbErr) {
      // DB not connected, fallback handled above
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Middleware: requireAuth
exports.requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Middleware: requireAdmin
exports.requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff')) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};
