const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all history for a user
router.get('/:userId', (req, res) => {
  try {
    const userId = req.params.userId || 1;

    // 1. Interviews
    const interviews = db.prepare(`
      SELECT * FROM interviews 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(userId);

    // 2. MCQs
    const mcqs = db.prepare(`
      SELECT * FROM mcq_results 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(userId);

    // 3. Coding
    const coding = db.prepare(`
      SELECT * FROM coding_submissions 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(userId);

    res.json({
      success: true,
      data: {
        interviews,
        mcqs,
        coding
      }
    });

  } catch (err) {
    console.error('Failed to fetch history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
