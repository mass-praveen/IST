const express = require('express');
const router = express.Router();
const { generateContentWithFallback } = require('../aiService');
const db = require('../db');

// Built-in curated question bank fallbacks across Aptitude, Logical, Verbal, and Tech
const defaultBanks = {
  aptitude: [
    {
      question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
      options: ["120 metres", "180 metres", "150 metres", "324 metres"],
      correctAnswer: 2,
      explanation: "Speed = 60 * (5/18) = 50/3 m/sec. Length = Speed * Time = (50/3) * 9 = 150 metres."
    },
    {
      question: "If a person sells an article for $650 and gains 30%, what was the cost price of the article?",
      options: ["$450", "$500", "$520", "$550"],
      correctAnswer: 1,
      explanation: "Cost Price = (Selling Price * 100) / (100 + Gain%) = (650 * 100) / 130 = $500."
    },
    {
      question: "A and B can do a piece of work in 12 days, B and C in 15 days, and C and A in 20 days. How long will A alone take?",
      options: ["30 days", "24 days", "40 days", "20 days"],
      correctAnswer: 0,
      explanation: "2(A + B + C)'s 1 day work = 1/12 + 1/15 + 1/20 = 12/60 = 1/5. (A+B+C) = 1/10. A's 1 day work = 1/10 - 1/15 = 1/30. So A takes 30 days."
    },
    {
      question: "What is the probability of getting a sum 9 from two throws of a standard dice?",
      options: ["1/6", "1/8", "1/9", "1/12"],
      correctAnswer: 2,
      explanation: "Favorable pairs for sum 9 are (3,6), (4,5), (5,4), (6,3) = 4 outcomes out of 36. 4/36 = 1/9."
    }
  ],
  technical: [
    {
      question: "Which data structure is primarily used to implement breadth-first search (BFS) on a graph?",
      options: ["Stack", "Queue", "Priority Queue", "Binary Search Tree"],
      correctAnswer: 1,
      explanation: "Queue operates on First-In-First-Out (FIFO) which naturally explores nodes level by level in BFS."
    },
    {
      question: "What is the worst-case time complexity of searching an element in a balanced Binary Search Tree (AVL/Red-Black)?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correctAnswer: 1,
      explanation: "Because the tree is strictly balanced, height is guaranteed to be O(log n), making search O(log n)."
    },
    {
      question: "In relational databases, which normal form eliminates transitive functional dependencies?",
      options: ["1NF", "2NF", "3NF", "BCNF"],
      correctAnswer: 2,
      explanation: "Third Normal Form (3NF) requires 2NF and ensures no non-prime attribute is transitively dependent on the primary key."
    },
    {
      question: "In React, what hook should you use to store a mutable value that does NOT trigger a component re-render when mutated?",
      options: ["useState", "useMemo", "useRef", "useCallback"],
      correctAnswer: 2,
      explanation: "useRef returns a mutable ref object whose .current property can be updated without triggering a re-render."
    }
  ]
};

// 1. Generate Aptitude & Technical MCQs
router.post('/generate', async (req, res) => {
  try {
    const { category, topic, difficulty, count = 10 } = req.body;

    const selectedCategory = category || 'Technical Skills';
    const selectedTopic = topic || 'General Programming & Problem Solving';
    const selectedDifficulty = difficulty || 'Intermediate';

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      const fallbackList = selectedCategory.toLowerCase().includes('aptitude') || selectedCategory.toLowerCase().includes('reasoning')
        ? defaultBanks.aptitude
        : defaultBanks.technical;
      return res.json(fallbackList);
    }

    const prompt = `
      You are an expert technical and quantitative assessment creator for campus placements and hiring drives.
      Create exactly ${count} multiple choice questions.
      
      Assessment Category: "${selectedCategory}" (Quantitative Aptitude / Logical Reasoning / Verbal Ability / Core Technical / Company Placement)
      Topic: "${selectedTopic}"
      Difficulty: "${selectedDifficulty}" (Beginner / Intermediate / Advanced)

      Return strictly a JSON array of ${count} questions in this format:
      [
        {
          "question": "Clear problem statement or code snippet",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Clear step-by-step mathematical derivation or technical explanation."
        }
      ]
    `;

    try {
      const aiResponse = await generateContentWithFallback(prompt);
      let cleaned = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const questions = JSON.parse(cleaned);

      if (Array.isArray(questions) && questions.length > 0) {
        return res.json(questions);
      }
      throw new Error("Invalid questions structure");
    } catch (aiErr) {
      console.error("MCQ generation fallback:", aiErr);
      const fallbackList = selectedCategory.toLowerCase().includes('aptitude')
        ? defaultBanks.aptitude
        : defaultBanks.technical;
      res.json(fallbackList);
    }

  } catch (error) {
    console.error("MCQ generation error:", error);
    res.status(500).json({ error: 'Failed to generate assessment questions.' });
  }
});

// 2. Save assessment results
router.post('/save-result', (req, res) => {
  try {
    const { topic, score, total, weakTopics } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO mcq_results (user_id, topic, score, total, weak_topics)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(1, topic || 'Assessment', score || 0, total || 10, JSON.stringify(weakTopics || []));
    
    // Mark daily practice mcq task as complete
    try {
      const today = new Date().toISOString().split('T')[0];
      db.prepare(`UPDATE daily_practice SET mcq_done = 1 WHERE user_id = 1 AND date = ?`).run(today);
    } catch (e) {}

    res.json({ success: true, message: 'Assessment result saved.' });
  } catch (error) {
    console.error("Error saving assessment result:", error);
    res.status(500).json({ error: 'Failed to save results.' });
  }
});

module.exports = router;
