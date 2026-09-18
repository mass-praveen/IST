const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all notifications for user
router.get('/', (req, res) => {
  try {
    const userId = 1; // Default single-user id
    const notifications = db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 100
    `).all(userId);
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
});

// Mark a single notification as read
router.put('/:id/read', (req, res) => {
  try {
    const userId = 1;
    const { id } = req.params;
    const info = db.prepare(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE id = ? AND user_id = ?
    `).run(id, userId);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', (req, res) => {
  try {
    const userId = 1;
    db.prepare(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE user_id = ? AND is_read = 0
    `).run(userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all read:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
