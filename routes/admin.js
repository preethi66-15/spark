const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes in this file require authentication + admin role
router.use(authenticateToken);
router.use(requireAdmin);

// ─── GET /users ──────────────────────────────────────────────────────────────
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT
        u.id, u.name, u.email, u.age, u.role, u.skin_type, u.hair_type, u.created_at,
        COUNT(a.id) AS analysis_count
      FROM users u
      LEFT JOIN analyses a ON a.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).all();

    return res.json({ success: true, users });
  } catch (err) {
    console.error('Admin get users error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET /ratings ────────────────────────────────────────────────────────────
router.get('/ratings', (req, res) => {
  try {
    const ratings = db.prepare(`
      SELECT r.id, r.score, r.feedback, r.created_at,
             u.name AS user_name, u.email AS user_email
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      ORDER BY r.created_at DESC
    `).all();

    return res.json({ success: true, ratings });
  } catch (err) {
    console.error('Admin get ratings error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET /stats ──────────────────────────────────────────────────────────────
router.get('/stats', (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    const totalAnalyses = db.prepare('SELECT COUNT(*) AS count FROM analyses').get().count;
    const totalRatings = db.prepare('SELECT COUNT(*) AS count FROM ratings').get().count;

    const avgRow = db.prepare('SELECT AVG(score) AS avg FROM ratings').get();
    const averageRating = avgRow.avg ? Math.round(avgRow.avg * 10) / 10 : 0;

    const recentUsers = db.prepare(`
      SELECT id, name, email, age, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalAnalyses,
        totalRatings,
        averageRating,
        recentUsers
      }
    });
  } catch (err) {
    console.error('Admin get stats error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
