const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes in this file require authentication
router.use(authenticateToken);

// ─── GET /profile ────────────────────────────────────────────────────────────
router.get('/profile', (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, name, email, age, role, skin_type, hair_type, created_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error('Get profile error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── PUT /profile ────────────────────────────────────────────────────────────
router.put('/profile', (req, res) => {
  try {
    const { skin_type, hair_type } = req.body;

    db.prepare(`
      UPDATE users SET skin_type = ?, hair_type = ? WHERE id = ?
    `).run(skin_type || null, hair_type || null, req.user.id);

    const user = db.prepare(`
      SELECT id, name, email, age, role, skin_type, hair_type, created_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    return res.json({ success: true, message: 'Profile updated', user });
  } catch (err) {
    console.error('Update profile error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── POST /analysis ──────────────────────────────────────────────────────────
router.post('/analysis', (req, res) => {
  try {
    const { type, results, recommendations } = req.body;

    if (!type) {
      return res.status(400).json({ success: false, message: 'Analysis type is required' });
    }

    const resultsStr = typeof results === 'string' ? results : JSON.stringify(results);
    const recsStr = typeof recommendations === 'string' ? recommendations : JSON.stringify(recommendations);

    const result = db.prepare(`
      INSERT INTO analyses (user_id, type, results, recommendations)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, type, resultsStr, recsStr);

    const analysis = db.prepare('SELECT * FROM analyses WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({ success: true, analysis });
  } catch (err) {
    console.error('Create analysis error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET /analyses ───────────────────────────────────────────────────────────
router.get('/analyses', (req, res) => {
  try {
    const analyses = db.prepare(`
      SELECT * FROM analyses WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user.id);

    return res.json({ success: true, analyses });
  } catch (err) {
    console.error('Get analyses error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── POST /rating ────────────────────────────────────────────────────────────
router.post('/rating', (req, res) => {
  try {
    const { score, feedback } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: 'Score is required and must be between 1 and 5'
      });
    }

    db.prepare(`
      INSERT INTO ratings (user_id, score, feedback)
      VALUES (?, ?, ?)
    `).run(req.user.id, score, feedback || null);

    return res.status(201).json({ success: true, message: 'Thank you for your feedback!' });
  } catch (err) {
    console.error('Create rating error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET /rating ─────────────────────────────────────────────────────────────
router.get('/rating', (req, res) => {
  try {
    const rating = db.prepare(`
      SELECT * FROM ratings WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(req.user.id);

    return res.json({ success: true, rating: rating || null });
  } catch (err) {
    console.error('Get rating error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
