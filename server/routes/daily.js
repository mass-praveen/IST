const express = require('express');
const router = express.Router();
const db = require('../db');

// Get today's practice state & streak
router.get('/today/:userId', (req, res) => {
  try {
    const userId = req.params.userId || 1;
    const today = new Date().toISOString().split('T')[0];

    let practice = db.prepare('SELECT * FROM daily_practice WHERE user_id = ? AND date = ?').get(userId, today);
    
    if (!practice) {
      // Calculate continuous streak
      const lastPractice = db.prepare('SELECT streak_count, date FROM daily_practice WHERE user_id = ? ORDER BY date DESC LIMIT 1').get(userId);
      const streak = lastPractice ? lastPractice.streak_count : 1;

      db.prepare(`
        INSERT INTO daily_practice (user_id, date, interview_done, mcq_done, coding_done, resume_done, coach_done, streak_count)
        VALUES (?, ?, 0, 0, 0, 0, 0, ?)
      `).run(userId, today, streak);

      practice = db.prepare('SELECT * FROM daily_practice WHERE user_id = ? AND date = ?').get(userId, today);
    }

    const tasks = [
      { id: 'interview', title: 'Complete 1 Mock Interview', count: '1 Session', done: Boolean(practice.interview_done), xp: 150, link: '/interview' },
      { id: 'mcq', title: 'Solve 10 Technical MCQs', count: '10 Questions', done: Boolean(practice.mcq_done), xp: 100, link: '/mcq' },
      { id: 'coding', title: 'Solve 1 Coding Challenge', count: '1 Problem', done: Boolean(practice.coding_done), xp: 120, link: '/coding' },
      { id: 'resume', title: 'Review & Polish Resume', count: '1 Check', done: Boolean(practice.resume_done), xp: 80, link: '/resume' },
      { id: 'coach', title: 'Consult AI Career Coach', count: '1 Question', done: Boolean(practice.coach_done), xp: 50, link: '/coach' },
    ];

    const completedCount = tasks.filter(t => t.done).length;

    res.json({
      date: today,
      streak: practice.streak_count || 1,
      completionPercentage: Math.round((completedCount / tasks.length) * 100),
      completedCount,
      totalCount: tasks.length,
      tasks
    });
  } catch (err) {
    console.error('Daily practice error:', err);
    res.status(500).json({ error: 'Failed to load daily practice.' });
  }
});

// Toggle / Complete a task
router.post('/complete-task', (req, res) => {
  try {
    const { userId, taskId } = req.body;
    const uid = userId || 1;
    const today = new Date().toISOString().split('T')[0];

    const columnMap = {
      interview: 'interview_done',
      mcq: 'mcq_done',
      coding: 'coding_done',
      resume: 'resume_done',
      coach: 'coach_done'
    };

    const col = columnMap[taskId];
    if (!col) return res.status(400).json({ error: 'Invalid task' });

    db.prepare(`UPDATE daily_practice SET ${col} = 1 WHERE user_id = ? AND date = ?`).run(uid, today);

    res.json({ success: true });
  } catch (err) {
    console.error('Daily task completion error:', err);
    res.status(500).json({ error: 'Failed to complete task.' });
  }
});

module.exports = router;
