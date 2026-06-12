const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'spark_super_secret_key_2024_xyz';

/**
 * Authenticate JWT token from the Authorization header.
 * Attaches decoded user ({ id, email, role }) to req.user.
 */
function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
}

/**
 * Require the authenticated user to have the 'admin' role.
 * Must be used AFTER authenticateToken.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin };
