const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// Create / open the SQLite database
const dbPath = path.join(__dirname, '..', 'spark.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Create Tables ───────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    age INTEGER,
    role TEXT DEFAULT 'user',
    skin_type TEXT,
    hair_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    results TEXT,
    recommendations TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    score INTEGER CHECK(score >= 1 AND score <= 5),
    feedback TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0
  );
`);

// ─── Seed Admin User ─────────────────────────────────────────────────────────

try {
  const adminEmail = process.env.ADMIN_EMAIL || 'preethirudra66@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Spark@Admin123';

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

  if (!existing) {
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    db.prepare(`
      INSERT INTO users (name, email, password, age, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('Admin', adminEmail, hashedPassword, 25, 'admin');
    console.log('🔑 Admin user seeded successfully');
  }
} catch (err) {
  console.error('⚠️  Error seeding admin user:', err.message);
}

module.exports = db;
