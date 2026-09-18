const { generateContentWithFallback } = require('./aiService');

async function testAll() {
  console.log('Testing generateContentWithFallback for MCQ...');
  const mcqPrompt = `
    You are an expert technical interviewer. 
    Generate 3 multiple choice questions for the topic: "React" at a "Intermediate" difficulty level.
    Return the output strictly in the following JSON array format:
    [
      {
        "question": "The question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Detailed explanation."
      }
    ]
  `;
  const mcqText = await generateContentWithFallback(mcqPrompt);
  const cleanMcq = mcqText.replace(/```json/g, '').replace(/```/g, '').trim();
  const mcqs = JSON.parse(cleanMcq);
  console.log('MCQ Generated successfully! Count:', mcqs.length);

  console.log('Testing generateContentWithFallback for Interview Evaluation...');
  const evalPrompt = `
    You are an expert technical interviewer evaluating a candidate's answer.
    Question: "Explain React useEffect"
    Candidate's Answer: "It runs side effects after rendering, like data fetching."
    Evaluate the answer and provide the output strictly in this JSON format:
    {
      "score": 85,
      "relevance": "Good",
      "clarity": "Good",
      "missingStar": "None",
      "comment": "Brief feedback.",
      "nextQuestion": "Followup question."
    }
  `;
  const evalText = await generateContentWithFallback(evalPrompt);
  const cleanEval = evalText.replace(/```json/g, '').replace(/```/g, '').trim();
  const evaluation = JSON.parse(cleanEval);
  console.log('Evaluation Generated successfully! Score:', evaluation.score, 'Feedback:', evaluation.comment);

  console.log('\n>>> ALL AI SERVICE TESTS PASSED 100%! <<<');
}

testAll().catch(console.error);
