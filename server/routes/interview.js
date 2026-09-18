const express = require('express');
const router = express.Router();
const { generateContentWithFallback } = require('../aiService');
const db = require('../db');

// 1. Start Interview Session
router.post('/start', async (req, res) => {
  try {
    const { role, interviewType, difficulty, experienceLevel, resumeSkills } = req.body;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({ error: 'Coach AI service is not configured.' });
    }

    const prompt = `
      You are a professional human-style interviewer conducting a realistic mock job interview.
      Interview Details:
      - Job Role: "${role || 'Full Stack Developer'}"
      - Interview Type: "${interviewType || 'Technical'}"
      - Difficulty: "${difficulty || 'Intermediate'}"
      - Experience Level: "${experienceLevel || 'Mid-Level'}"
      - Candidate Skills from Resume: ${resumeSkills ? JSON.stringify(resumeSkills) : 'Not provided'}

      Your job is to act like a real hiring manager. Start with a greeting and self-introduction, then ask the FIRST question.
      The FIRST question MUST always be a variation of "Could you please introduce yourself?" or "Tell me about yourself."
      
      Return strictly in this JSON format:
      {
        "greeting": "Hi, welcome to your interview. I'm your AI interviewer today. Before we begin, I'll ask you a series of questions covering your background, projects, technical knowledge, and behavioral skills.",
        "question": "Could you please introduce yourself?"
      }
    `;

    const aiRes = await generateContentWithFallback(prompt);
    const cleaned = aiRes.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleaned);
    res.json(data);

  } catch (err) {
    console.error('Interview start generation error:', err);
    res.status(500).json({ error: 'Failed to initialize interview session.' });
  }
});

// 2. Evaluate Candidate's Answer & Generate Next Question
router.post('/evaluate', async (req, res) => {
  try {
    const { question, answer, role, interviewType, stage, history, questionCount, currentIndex, difficulty } = req.body;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({ error: 'Coach AI service is not configured.' });
    }

    const prompt = `
      You are a professional human-style interviewer conducting a realistic mock job interview.
      
      Context:
      - Target Role: "${role || 'Software Engineer'}"
      - Candidate Level (Difficulty): "${difficulty || 'Intermediate'}"
      - Current Stage: "${stage || 'INTRODUCTION'}"
      - Target Question Count: ${questionCount || 5} (We are on question ${currentIndex + 1})
      - Question Asked: "${question || 'Tell me about yourself'}"
      - Candidate's Answer: "${answer || ''}"
      - Conversation History: ${history ? JSON.stringify(history.slice(-4)) : 'None'}
      
      Instructions:
      1. Analyze the candidate's answer based on the current question and the CANDIDATE LEVEL. 
         - A "Beginner" or "Fresher" should not be punished for lacking senior-level architectural depth.
         - An "Advanced" candidate must demonstrate deep practical experience and trade-off analysis.
      2. Evaluate the answer strictly and honestly across 7 dimensions on a 0-10 scale. DO NOT inflate scores. If the answer is weak or wrong, the score must reflect it.
      3. Calculate an overall answer score (0-100) based on weighted dimensions appropriate for the question type (e.g. Technical vs Behavioral).
      4. Decide what the NEXT question should be based on their answer. DO NOT ask a random question.
         - Good answer -> Ask a deeper follow-up.
         - Partial answer -> Ask for clarification.
         - Wrong answer -> Don't reveal the answer immediately; ask them to explain their thought process.
      5. Progress the interview stages logically (Introduction -> Background -> Projects/Resume -> Technical -> Problem Solving -> Behavioral -> Situational -> Closing). If we have reached or exceeded the Target Question Count, MUST transition to the CLOSING stage (e.g. "Do you have any questions for me?").
      6. Provide a natural spoken transition (e.g., "Thanks for explaining that.", "That's interesting.", etc.).
      
      Provide your response in this strict JSON schema:
      {
        "evaluation": {
          "questionType": "technical", 
          "difficulty": "medium",
          "candidateLevel": "${difficulty || 'Intermediate'}",
          "communicationScore": 82,
          "technicalScore": 75,
          "confidenceScore": 80,
          "relevanceScore": 85,
          "score": 75,
          "feedback": "You correctly identified X, but missed Y. The explanation lacked depth expected for this level."
        },
        "nextQuestion": "What was the biggest challenge you faced while building that?",
        "nextStage": "PROJECTS",
        "spokenFeedback": "Thanks for sharing that. What was the biggest challenge you faced while building it?"
      }
    `;

    const aiResponse = await generateContentWithFallback(prompt);
    const cleaned = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const evaluationData = JSON.parse(cleaned);
    res.json(evaluationData);

  } catch (error) {
    console.error("Evaluation error:", error);
    res.status(500).json({ error: 'Failed to evaluate answer and generate next question.' });
  }
});

// 3. Finalize Interview & Generate Report
router.post('/finalize', async (req, res) => {
  try {
    const { role, interviewType, difficulty, history } = req.body;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({ error: 'Coach AI service is not configured.' });
    }

    const prompt = `
      You are a professional hiring manager evaluating a candidate after a complete mock interview.
      
      Interview Details:
      - Role: "${role}"
      - Type: "${interviewType}"
      - Candidate Level (Difficulty): "${difficulty}"
      
      Transcript and Evaluations:
      ${JSON.stringify(history)}
      
      Based on the ENTIRE conversation and the individual question scores provided in the history, generate a final comprehensive evaluation report.
      1. Ensure the overall score and sub-scores are calculated accurately based on the evidence. Do not inflate scores.
      2. Provide an "evaluationConfidence" (High/Medium/Low) based on the number of questions answered and depth of the transcript.
      
      Return strictly in this JSON format:
      {
        "evaluationConfidence": "High",
        "overallScore": 82,
        "technicalScore": 78,
        "communicationScore": 85,
        "confidenceScore": 81,
        "problemSolving": 84,
        "answerRelevance": 86,
        "completenessScore": 71,
        "strengths": [
          "Clear self-introduction and strong project explanation.",
          "Good understanding of fundamental concepts.",
          "Communicated effectively and confidently."
        ],
        "areasToImprove": [
          "Could go deeper into technical implementation details.",
          "Some answers were brief and lacked structure.",
          "Needs improvement in algorithmic problem solving."
        ],
        "recommendations": [
          "Practice using the STAR method for behavioral questions.",
          "Review advanced concepts for the target role.",
          "Take 2 mock interviews focusing on weak areas."
        ]
      }
    `;

    const aiResponse = await generateContentWithFallback(prompt);
    const cleaned = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const finalReport = JSON.parse(cleaned);
    res.json(finalReport);

  } catch (error) {
    console.error("Finalize error:", error);
    res.status(500).json({ error: 'Failed to generate final report.' });
  }
});

// 4. Save Final Interview Session Report
router.post('/save-interview', (req, res) => {
  try {
    const {
      interviewType,
      type,
      role,
      difficulty,
      overallScore,
      technicalScore,
      communicationScore,
      confidenceScore,
      relevanceScore,
      starFeedback,
      strengths,
      weaknesses
    } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO interviews (
        user_id, type, role, difficulty,
        overall_score, technical_score, communication_score, confidence_score, relevance_score,
        star_feedback, strengths, weaknesses
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      1,
      interviewType || type || 'Full Stack Mock',
      role || 'Software Engineer',
      difficulty || 'Intermediate',
      overallScore || 80,
      technicalScore || 82,
      communicationScore || 78,
      confidenceScore || 80,
      relevanceScore || 85,
      starFeedback || 'Good STAR coverage',
      JSON.stringify(strengths || ['Clear architectural clarity', 'Structured thought process']),
      JSON.stringify(weaknesses || ['Provide more metrics', 'Reduce filler words'])
    );
    
    const today = new Date().toISOString().split('T')[0];
    try {
      db.prepare(`UPDATE daily_practice SET interview_done = 1 WHERE user_id = 1 AND date = ?`).run(today);
    } catch(e){}

    // Trigger Notification
    db.createNotification(
      1, 
      'Interview Completed', 
      'Your AI interview evaluation is ready to review.', 
      'INTERVIEW',
      '/progress'
    );

    res.json({ success: true, message: 'Interview report saved successfully.' });
  } catch (error) {
    console.error("Error saving interview result:", error);
    res.status(500).json({ error: 'Failed to save results.' });
  }
});

module.exports = router;
