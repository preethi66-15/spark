const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'spark_super_secret_key_2024_xyz';

// ─── POST /register ──────────────────────────────────────────────────────────
router.post('/register', (req, res) => {
  try {
    const { name, email, password, age } = req.body;

    // Validate required fields
    if (!name || !email || !password || !age) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, email, password, age'
      });
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    const result = db.prepare(`
      INSERT INTO users (name, email, password, age, role)
      VALUES (?, ?, ?, ?, 'user')
    `).run(name, email, hashedPassword, age);

    const userId = result.lastInsertRowid;

    // Generate JWT
    const token = jwt.sign(
      { id: userId, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      token,
      user: { id: userId, name, email, age, role: 'user' }
    });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// ─── POST /login ─────────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, age: user.age, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// ─── POST /forgot-password ──────────────────────────────────────────────────
router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if user exists
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    // Generate 6-digit reset code from UUID
    const resetCode = uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase();

    // Set expiration to 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Store reset token
    db.prepare(`
      INSERT INTO reset_tokens (email, token, expires_at)
      VALUES (?, ?, ?)
    `).run(email, resetCode, expiresAt);

    return res.json({
      success: true,
      message: 'Reset code generated',
      resetCode // In production, this would be emailed instead
    });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── POST /reset-password ───────────────────────────────────────────────────
router.post('/reset-password', (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, resetCode, and newPassword are required'
      });
    }

    // Find valid reset token
    const tokenRecord = db.prepare(`
      SELECT * FROM reset_tokens
      WHERE email = ? AND token = ? AND used = 0 AND expires_at > datetime('now')
      ORDER BY id DESC
      LIMIT 1
    `).get(email, resetCode);

    if (!tokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    // Hash new password and update user
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, email);

    // Mark token as used
    db.prepare('UPDATE reset_tokens SET used = 1 WHERE id = ?').run(tokenRecord.id);

    return res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
});

module.exports = router;
