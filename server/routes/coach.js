const express = require('express');
const router = express.Router();
const { generateContentWithFallback } = require('../aiService');
const db = require('../db');

// 1. Get chat history
router.get('/history/:userId', (req, res) => {
  try {
    const userId = req.params.userId || 1;
    const history = db.prepare('SELECT id, sender, message, created_at FROM coach_chats WHERE user_id = ? ORDER BY id ASC LIMIT 50').all(userId);
    res.json(history);
  } catch (err) {
    console.error('Coach history error:', err);
    res.status(500).json({ error: 'Failed to load chat history.' });
  }
});

// 2. Chat with Coach AI
router.post('/chat', async (req, res) => {
  try {
    const { userId, message, pageContext } = req.body;
    const uid = userId || 1;

    // Gather rich candidate context
    const user = db.prepare('SELECT name, role, experience_level, target_company FROM users WHERE id = ?').get(uid);
    const resume = db.prepare('SELECT score, skills, missing_skills FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(uid);
    const interviews = db.prepare('SELECT overall_score, technical_score, communication_score FROM interviews WHERE user_id = ? ORDER BY created_at DESC LIMIT 3').all(uid);
    const mcqStats = db.prepare('SELECT COUNT(*) as total, AVG(score*100.0/total) as avg_acc FROM mcq_results WHERE user_id = ?').get(uid);
    const codeCount = db.prepare('SELECT COUNT(*) as solved FROM coding_submissions WHERE user_id = ? AND status = ?').get(uid, 'Accepted')?.solved;

    // Save user message
    db.prepare('INSERT INTO coach_chats (user_id, sender, message) VALUES (?, ?, ?)').run(uid, 'user', message);

    const prompt = `
      You are "Coach AI" — a friendly, simple, and supportive interview mentor on the IST (Interview Skill Trainer) platform.
      Your main job is to help the user understand things easily and feel confident.

      ABOUT THIS USER:
      - Name: ${user?.name || 'Friend'}
      - Target Role: ${user?.role || 'Software Developer'}
      - Experience Level: ${user?.experience_level || 'Beginner/Intermediate'}
      - Target Companies: ${user?.target_company || 'Tech Companies'}
      - Resume Score: ${resume?.score || 78}/100
      - Skills they know: ${resume?.skills || 'React, JavaScript, Node.js'}
      - Skills they need to learn: ${resume?.missing_skills || 'System Design, Docker, AWS'}
      - Recent Interview Scores: ${JSON.stringify(interviews || [])}
      - MCQ Test Accuracy: ${Math.round(mcqStats?.avg_acc || 75)}% (${mcqStats?.total || 0} tests taken)
      - Coding Problems Solved: ${codeCount || 0}
      - Current Page: ${pageContext || 'Main App'}

      USER'S QUESTION:
      "${message}"

      HOW TO RESPOND:
      1. Use simple, everyday English — avoid complex jargon.
      2. If the user asks "what is X" or "how does X work" — explain it like you're talking to a student.
      3. Use short bullet points (•) to make things easy to read.
      4. Be warm and encouraging — the user might be nervous or confused.
      5. Give 1 clear action step the user can do RIGHT NOW to improve.
      6. Keep your entire response under 150 words — short and clear is better.
      7. Start with a friendly line like "Great question!" or "Sure, let me help!"
      8. End with a motivating line like "You're doing great — keep going! 💪"

      IMPORTANT: Write like you're texting a friend who needs help, not like a formal report.
    `;

    const aiRes = await generateContentWithFallback(prompt);
    
    // Save Coach AI response
    db.prepare('INSERT INTO coach_chats (user_id, sender, message) VALUES (?, ?, ?)').run(uid, 'coach', aiRes);

    res.json({
      sender: 'coach',
      message: aiRes,
      createdAt: new Date().toISOString()
    });

  } catch (err) {
    console.error('Coach AI chat error:', err);
    res.status(500).json({ error: 'Coach AI is temporarily busy. Ensure backend & Gemini API are configured.' });
  }
});

module.exports = router;
