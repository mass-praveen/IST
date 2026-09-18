const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'database.sqlite'));

// Auto-migration helper to safely add missing columns
function ensureColumn(table, column, definition) {
  try {
    const info = db.prepare(`PRAGMA table_info(${table})`).all();
    const cols = info.map(c => c.name);
    if (!cols.includes(column)) {
      db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
    }
  } catch (e) {
    // Table might not exist yet
  }
}

// 1. Create Core Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'Full Stack Developer',
    experience_level TEXT DEFAULT 'Intermediate',
    target_company TEXT DEFAULT 'Tech Companies',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    score INTEGER DEFAULT 0,
    skills TEXT,
    missing_skills TEXT,
    suggestions TEXT,
    raw_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS interviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    role TEXT DEFAULT 'Software Engineer',
    difficulty TEXT DEFAULT 'Intermediate',
    overall_score INTEGER DEFAULT 80,
    technical_score INTEGER DEFAULT 80,
    communication_score INTEGER DEFAULT 80,
    confidence_score INTEGER DEFAULT 80,
    relevance_score INTEGER DEFAULT 80,
    star_feedback TEXT,
    strengths TEXT,
    weaknesses TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS mcq_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    topic TEXT,
    score INTEGER,
    total INTEGER,
    weak_topics TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS coding_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    problem_id TEXT,
    problem_title TEXT,
    language TEXT,
    code TEXT,
    status TEXT,
    tests_passed INTEGER,
    total_tests INTEGER,
    runtime TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS daily_practice (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date TEXT,
    interview_done INTEGER DEFAULT 0,
    mcq_done INTEGER DEFAULT 0,
    coding_done INTEGER DEFAULT 0,
    resume_done INTEGER DEFAULT 0,
    coach_done INTEGER DEFAULT 0,
    streak_count INTEGER DEFAULT 1,
    UNIQUE(user_id, date),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS coach_chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    sender TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    message TEXT,
    type TEXT,
    is_read INTEGER DEFAULT 0,
    link TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// 2. Ensure all columns exist across all tables
ensureColumn('users', 'email', 'TEXT');
ensureColumn('users', 'role', 'TEXT DEFAULT "Full Stack Developer"');
ensureColumn('users', 'experience_level', 'TEXT DEFAULT "Intermediate"');
ensureColumn('users', 'target_company', 'TEXT DEFAULT "Tech Companies"');

ensureColumn('interviews', 'role', 'TEXT DEFAULT "Software Engineer"');
ensureColumn('interviews', 'difficulty', 'TEXT DEFAULT "Intermediate"');
ensureColumn('interviews', 'confidence_score', 'INTEGER DEFAULT 80');
ensureColumn('interviews', 'relevance_score', 'INTEGER DEFAULT 80');
ensureColumn('interviews', 'star_feedback', 'TEXT');
ensureColumn('interviews', 'strengths', 'TEXT');
ensureColumn('interviews', 'weaknesses', 'TEXT');

// Ensure notifications table properties
ensureColumn('notifications', 'link', 'TEXT');

// 3. Insert default candidate
const defaultUser = db.prepare('SELECT id FROM users WHERE id = 1').get();
if (!defaultUser) {
  db.prepare(`
    INSERT INTO users (id, name, email, password, role, experience_level, target_company)
    VALUES (1, ?, ?, ?, ?, ?, ?)
  `).run('Alex Morgan', 'candidate@ist.ai', 'password123', 'Full Stack Developer', 'Intermediate', 'Google / Microsoft');
}

// 4. Notification Helper
db.createNotification = (userId, title, message, type, link = null) => {
  try {
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, title, message, type, link);
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};

module.exports = db;
