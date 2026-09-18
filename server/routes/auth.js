const express = require('express');
const router = express.Router();
const db = require('../db');

// Sign up
router.post('/signup', (req, res) => {
  try {
    const { name, email, password, role, experienceLevel } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const stmt = db.prepare(`
      INSERT INTO users (name, email, password, role, experience_level)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, email, password, role || 'Full Stack Developer', experienceLevel || 'Intermediate');

    const user = {
      id: result.lastInsertRowid,
      name,
      email,
      role: role || 'Full Stack Developer',
      experienceLevel: experienceLevel || 'Intermediate',
    };

    res.json({ success: true, user });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        experienceLevel: user.experience_level,
        targetCompany: user.target_company,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to log in.' });
  }
});

// Get current user profile
router.get('/profile/:id', (req, res) => {
  try {
    const userId = req.params.id || 1;
    const user = db.prepare('SELECT id, name, email, role, experience_level, target_company, created_at FROM users WHERE id = ?').get(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const interviewCount = db.prepare('SELECT COUNT(*) as count FROM interviews WHERE user_id = ?').get(userId).count;
    const mcqCount = db.prepare('SELECT COUNT(*) as count FROM mcq_results WHERE user_id = ?').get(userId).count;
    const codeCount = db.prepare('SELECT COUNT(*) as count FROM coding_submissions WHERE user_id = ? AND status = ?').get(userId, 'Accepted').count;
    const latestResume = db.prepare('SELECT score, skills FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId);

    res.json({
      ...user,
      stats: {
        interviews: interviewCount,
        mcqs: mcqCount,
        codingProblems: codeCount,
        resumeScore: latestResume?.score || 0,
        skills: latestResume?.skills ? JSON.parse(latestResume.skills) : ['React', 'JavaScript', 'Node.js', 'Python'],
      },
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to load profile.' });
  }
});

// Update profile
router.put('/profile/:id', (req, res) => {
  try {
    const userId = req.params.id || 1;
    const { name, role, experienceLevel, targetCompany } = req.body;

    db.prepare(`
      UPDATE users 
      SET name = ?, role = ?, experience_level = ?, target_company = ?
      WHERE id = ?
    `).run(name, role, experienceLevel, targetCompany, userId);

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;
