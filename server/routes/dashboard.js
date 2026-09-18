const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/stats', (req, res) => {
  try {
    const userId = 1;

    // 1. MCQ stats
    const mcqStats = db.prepare(`
      SELECT 
        COUNT(*) as total_tests,
        AVG(CAST(score AS FLOAT) / CASE WHEN total = 0 THEN 1 ELSE total END) * 100 as avg_accuracy
      FROM mcq_results
      WHERE user_id = ?
    `).get(userId);

    // 2. Interview stats
    const interviewStats = db.prepare(`
      SELECT 
        COUNT(*) as total_interviews,
        AVG(overall_score) as avg_overall,
        AVG(technical_score) as avg_tech,
        AVG(communication_score) as avg_comm,
        AVG(confidence_score) as avg_confidence,
        AVG(relevance_score) as avg_relevance
      FROM interviews
      WHERE user_id = ?
    `).get(userId);

    // 3. Coding stats
    const codingStats = db.prepare(`
      SELECT 
        COUNT(*) as total_submissions,
        SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) as solved_problems
      FROM coding_submissions
      WHERE user_id = ?
    `).get(userId);

    // 4. Resume stats
    const resumeStats = db.prepare(`
      SELECT score, skills, missing_skills 
      FROM resumes 
      WHERE user_id = ? 
      ORDER BY created_at DESC LIMIT 1
    `).get(userId);

    // 5. Daily Streak
    const dailyStats = db.prepare(`
      SELECT streak_count FROM daily_practice 
      WHERE user_id = ? 
      ORDER BY date DESC LIMIT 1
    `).get(userId);

    // 6. Recent activity timeline
    const recentActivity = db.prepare(`
      SELECT 'mcq' as type, topic as title, (CAST(score AS FLOAT)/CASE WHEN total = 0 THEN 1 ELSE total END)*100 as score, created_at 
      FROM mcq_results WHERE user_id = ?
      UNION ALL
      SELECT 'interview' as type, (type || ' Mock Interview') as title, overall_score as score, created_at
      FROM interviews WHERE user_id = ?
      UNION ALL
      SELECT 'coding' as type, (problem_title || ' (' || status || ')') as title, (tests_passed * 100 / CASE WHEN total_tests = 0 THEN 1 ELSE total_tests END) as score, created_at
      FROM coding_submissions WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 6
    `).all(userId, userId, userId);

    const technicalBase = Math.round(interviewStats.avg_tech) || Math.round(mcqStats.avg_accuracy) || 0;
    
    // Skill-wise performance breakdown
    const skillsRadar = [
      { subject: 'React & Frontend', score: technicalBase, fullMark: 100 },
      { subject: 'System Design', score: technicalBase > 0 ? Math.max(0, technicalBase - 10) : 0, fullMark: 100 },
      { subject: 'DSA & Algorithms', score: codingStats.solved_problems > 0 ? 100 : (technicalBase > 0 ? Math.max(0, technicalBase - 15) : 0), fullMark: 100 },
      { subject: 'Communication', score: Math.round(interviewStats.avg_comm) || 0, fullMark: 100 },
      { subject: 'Backend & DB', score: technicalBase > 0 ? Math.max(0, technicalBase - 5) : 0, fullMark: 100 },
    ];

    // Weekly performance trend data (simplified distribution based on current stats)
    const overall = Math.round(interviewStats.avg_overall) || 0;
    const mcqAvg = Math.round(mcqStats.avg_accuracy) || 0;
    const codingAvg = codingStats.solved_problems > 0 ? 100 : 0;
    
    const weeklyTrend = [
      { day: 'Mon', interview: overall > 0 ? Math.max(0, overall - 10) : 0, mcq: mcqAvg > 0 ? Math.max(0, mcqAvg - 15) : 0, coding: 0 },
      { day: 'Tue', interview: overall > 0 ? Math.max(0, overall - 5) : 0, mcq: mcqAvg > 0 ? Math.max(0, mcqAvg - 10) : 0, coding: codingAvg > 0 ? 50 : 0 },
      { day: 'Wed', interview: overall > 0 ? overall : 0, mcq: mcqAvg > 0 ? Math.max(0, mcqAvg - 5) : 0, coding: 0 },
      { day: 'Thu', interview: overall > 0 ? Math.min(100, overall + 2) : 0, mcq: mcqAvg > 0 ? mcqAvg : 0, coding: codingAvg > 0 ? 80 : 0 },
      { day: 'Fri', interview: overall > 0 ? Math.min(100, overall + 5) : 0, mcq: mcqAvg > 0 ? Math.min(100, mcqAvg + 5) : 0, coding: 0 },
      { day: 'Sat', interview: overall > 0 ? Math.min(100, overall + 8) : 0, mcq: mcqAvg > 0 ? Math.min(100, mcqAvg + 10) : 0, coding: codingAvg },
      { day: 'Sun', interview: overall, mcq: mcqAvg, coding: codingAvg },
    ];

    res.json({
      overallScore: Math.round(interviewStats.avg_overall) || 0,
      technicalScore: Math.round(interviewStats.avg_tech) || 0,
      communicationScore: Math.round(interviewStats.avg_comm) || 0,
      confidenceScore: Math.round(interviewStats.avg_confidence) || 0,
      relevanceScore: Math.round(interviewStats.avg_relevance) || 0,
      codingScore: codingStats.solved_problems > 0 ? 100 : 0,
      codingSolved: codingStats.solved_problems || 0,
      codingSubmissions: codingStats.total_submissions || 0,
      resumeScore: resumeStats?.score || 0,
      mcqAccuracy: Math.round(mcqStats.avg_accuracy) || 0,
      totalMcqs: mcqStats.total_tests || 0,
      totalInterviews: interviewStats.total_interviews || 0,
      dailyStreak: dailyStats?.streak_count || 0,
      weakSkills: resumeStats?.missing_skills ? JSON.parse(resumeStats.missing_skills) : [],
      recentActivity: recentActivity.length > 0 ? recentActivity : [],
      skillsRadar,
      weeklyTrend
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: 'Failed to load dashboard statistics' });
  }
});

module.exports = router;
