import { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle2, XCircle, ChevronRight, BarChart2, 
  RotateCcw, Sparkles, AlertCircle, HelpCircle, Check, BookOpen,
  Brain, Cpu, Briefcase, Lightbulb, MessageSquare, Compass
} from 'lucide-react';
import { endpoints } from '../utils/api';
import './MCQ.css';

const assessmentCategories = [
  {
    id: 'tech',
    name: 'Core Technical Skills',
    icon: Cpu,
    topics: [
      'Data Structures & Algorithms',
      'React & Modern Frontend',
      'Node.js & Backend Architecture',
      'Database & SQL Queries',
      'Operating Systems & Networks',
      'Python & Machine Learning',
      'Java & OOPs Principles',
      'System Design & Cloud'
    ]
  },
  {
    id: 'aptitude',
    name: 'Quantitative Aptitude',
    icon: Brain,
    topics: [
      'Arithmetic & Basic Math',
      'Time, Speed & Distance',
      'Time & Work Efficiency',
      'Profit, Loss & Discount',
      'Percentages & Ratio Proportion',
      'Probability & Permutations',
      'Simple & Compound Interest',
      'Averages & Mixtures'
    ]
  },
  {
    id: 'logical',
    name: 'Logical & Analytical Reasoning',
    icon: Lightbulb,
    topics: [
      'Puzzles & Seating Arrangements',
      'Blood Relations & Family Trees',
      'Syllogisms & Deductive Logic',
      'Number & Letter Series',
      'Coding-Decoding Patterns',
      'Direction & Distance Sense',
      'Statement & Assumptions',
      'Data Sufficiency'
    ]
  },
  {
    id: 'verbal',
    name: 'Verbal Ability & English',
    icon: MessageSquare,
    topics: [
      'Grammar & Sentence Correction',
      'Reading Comprehension',
      'Synonyms & Antonyms',
      'Para Jumbles & Sentence Ordering',
      'Spotting Errors & Idioms',
      'Verbal Analogies'
    ]
  },
  {
    id: 'company',
    name: 'Company Placement Tests',
    icon: Briefcase,
    topics: [
      'TCS NQT Full Mock (Aptitude + Tech)',
      'Infosys Placement Test',
      'Wipro Elite Assessment',
      'Accenture Cognitive & Tech',
      'Cognizant GenC Test',
      'Zoho Screening Assessment',
      'Amazon Online Assessment (OA)'
    ]
  }
];

export default function MCQ() {
  const [selectedCatId, setSelectedCatId] = useState('tech');
  const [topic, setTopic] = useState('Data Structures & Algorithms');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [numQuestions, setNumQuestions] = useState(10);

  // Active Test State
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [timerActive, setTimerActive] = useState(false);

  const activeCategory = assessmentCategories.find(c => c.id === selectedCatId) || assessmentCategories[0];

  // Update default topic when category changes
  useEffect(() => {
    if (activeCategory.topics.length > 0) {
      setTopic(activeCategory.topics[0]);
    }
  }, [selectedCatId]);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      handleSubmitQuiz();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(endpoints.mcqGenerate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category: activeCategory.name,
          topic, 
          difficulty, 
          count: numQuestions 
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate assessment questions.';
        try {
          const errData = await response.json();
          if (errData.error) errorMessage = errData.error;
        } catch (e) {}
        throw new Error(errorMessage);
      }
      
      const generated = await response.json();
      setQuestions(generated);
      setIsStarted(true);
      setCurrentQuestion(0);
      setUserAnswers({});
      setShowResults(false);
      setTimeLeft(numQuestions * 90); // 1.5 mins per question
      setTimerActive(true);

    } catch (error) {
      console.error(error);
      alert(error.message || 'Error generating questions. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    setTimerActive(false);
    setShowResults(true);

    let correctCount = 0;
    const weakList = [];
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correctCount++;
      } else {
        weakList.push(q.question.substring(0, 35) + '...');
      }
    });

    try {
      await fetch(endpoints.mcqSaveResult, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `${activeCategory.name} - ${topic}`,
          score: correctCount,
          total: questions.length,
          weakTopics: weakList.slice(0, 3)
        })
      });
    } catch (err) {
      console.error("Failed to save score:", err);
    }
  };

  // 1. INTRO / CATEGORY & TOPIC CONFIGURATION SCREEN
  if (!isStarted) {
    return (
      <div className="mcq-intro-container animate-fade-in">
        <div className="mcq-setup-card glass-panel-premium">
          <div className="setup-badge">
            <Sparkles size={16} /> Skill & Aptitude Assessment Arena
          </div>
          <h1>Technical & Aptitude Test Practice</h1>
          <p>Practice Quantitative Aptitude, Logical Reasoning, Verbal Ability, Core Engineering, and Company Placement tests with AI evaluation.</p>
          
          <div className="mcq-config-grid">
            <div className="input-group">
              <label className="input-label">Assessment Category</label>
              <select 
                className="input-field" 
                value={selectedCatId} 
                onChange={(e) => {
                  setSelectedCatId(e.target.value);
                  const newCat = assessmentCategories.find(c => c.id === e.target.value);
                  if (newCat) setTopic(newCat.topics[0]);
                }}
              >
                {assessmentCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Select Practice Topic</label>
              <select className="input-field" value={topic} onChange={(e) => setTopic(e.target.value)}>
                {activeCategory.topics.map((t, idx) => (
                  <option key={idx} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Difficulty Level</label>
              <select className="input-field" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option>Beginner (Campus Foundation)</option>
                <option>Intermediate (Standard Tech Screen)</option>
                <option>Advanced (Top Tier FAANG / Product)</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Number of Questions</label>
              <select className="input-field" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))}>
                <option value={5}>5 Questions (Quick Drill)</option>
                <option value={10}>10 Questions (Standard Assessment)</option>
                <option value={15}>15 Questions (Full Mock)</option>
              </select>
            </div>
          </div>

          <div className="assessment-perks">
            <div className="perk-item"><Check size={16} className="text-success" /> Adaptive questions tailored to {activeCategory.name}</div>
            <div className="perk-item"><Check size={16} className="text-success" /> Real-time countdown timer & score calculation</div>
            <div className="perk-item"><Check size={16} className="text-success" /> Comprehensive step-by-step mathematical & technical derivations</div>
          </div>

          <button className="btn btn-primary premium-btn start-mcq-btn flex-center" onClick={handleStart} disabled={isLoading}>
            {isLoading ? 'Generating Assessment Questions...' : `Start ${numQuestions}-Question ${activeCategory.name} Test`}
          </button>
        </div>
      </div>
    );
  }

  // 2. DETAILED POST-QUIZ REVIEW
  if (showResults) {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) score++;
    });
    const accuracy = Math.round((score / questions.length) * 100);

    return (
      <div className="mcq-review-container animate-slide-up">
        <div className="review-hero-card glass-panel-premium">
          <div className="review-header space-between">
            <div>
              <span className="badge mb-1">{activeCategory.name}</span>
              <h1>{topic} Results</h1>
              <p className="text-secondary">Difficulty: {difficulty} • Total Questions: {questions.length}</p>
            </div>
            <button className="btn btn-primary premium-btn flex-center" onClick={() => setIsStarted(false)}>
              <RotateCcw size={18} /> Practice Another Topic
            </button>
          </div>

          <div className="score-stat-banner">
            <div className="score-stat-box">
              <span className="stat-num text-gradient">{score} / {questions.length}</span>
              <span className="stat-title">Correct Answers</span>
            </div>
            <div className="score-stat-box">
              <span className={`stat-num ${accuracy >= 75 ? 'text-success' : 'text-warning'}`}>{accuracy}%</span>
              <span className="stat-title">Accuracy Rate</span>
            </div>
            <div className="score-stat-box">
              <span className="stat-num text-accent">{accuracy >= 80 ? 'Placement Ready' : accuracy >= 60 ? 'Passing' : 'Needs Practice'}</span>
              <span className="stat-title">Readiness Status</span>
            </div>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="question-review-list mt-4">
          <h2 className="mb-3 flex-center" style={{justifyContent: 'flex-start', gap: '0.5rem'}}>
            <BookOpen size={22} className="text-gradient" /> In-Depth Question Explanations
          </h2>

          {questions.map((q, idx) => {
            const userChoice = userAnswers[idx];
            const isCorrect = userChoice === q.correctAnswer;

            return (
              <div key={idx} className={`review-q-card glass-panel ${isCorrect ? 'card-correct' : 'card-wrong'}`}>
                <div className="q-badge-row space-between">
                  <span className="q-number-tag">Question {idx + 1}</span>
                  <span className={`tag ${isCorrect ? 'tag-success' : 'tag-danger'}`}>
                    {isCorrect ? <><CheckCircle2 size={14} /> Correct</> : <><XCircle size={14} /> Incorrect</>}
                  </span>
                </div>

                <h3 className="review-q-text">{q.question}</h3>

                <div className="review-options-grid">
                  {q.options.map((opt, oIdx) => {
                    let optClass = "review-opt ";
                    if (oIdx === q.correctAnswer) optClass += "opt-correct";
                    else if (oIdx === userChoice) optClass += "opt-user-wrong";

                    return (
                      <div key={oIdx} className={optClass}>
                        <span className="opt-letter">{String.fromCharCode(65 + oIdx)}</span>
                        <span>{opt}</span>
                        {oIdx === q.correctAnswer && <span className="correct-mark">✓ Correct Answer</span>}
                        {oIdx === userChoice && oIdx !== q.correctAnswer && <span className="wrong-mark">✕ Your Choice</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="review-explanation-box">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. ACTIVE QUIZ RUNNER
  const q = questions[currentQuestion] || {};
  const selectedOpt = userAnswers[currentQuestion];

  return (
    <div className="mcq-active-container">
      {/* Assessment Header */}
      <div className="mcq-quiz-header glass-panel-premium space-between">
        <div>
          <h2>{topic}</h2>
          <span className="text-secondary text-sm">{activeCategory.name} • Question {currentQuestion + 1} of {questions.length}</span>
        </div>
        <div className="quiz-meta-group flex-center">
          <div className={`countdown-timer flex-center ${timeLeft < 180 ? 'timer-urgent' : ''}`}>
            <Clock size={18} /> {formatTime(timeLeft)}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleSubmitQuiz}>
            Submit Test
          </button>
        </div>
      </div>

      {/* Progress Dots Bar */}
      <div className="quiz-pagination-bar glass-panel-premium">
        {questions.map((_, i) => (
          <button
            key={i}
            className={`page-dot ${i === currentQuestion ? 'active' : ''} ${userAnswers[i] !== undefined ? 'answered' : ''}`}
            onClick={() => setCurrentQuestion(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question Card */}
      <div className="active-question-card glass-panel-premium animate-fade-in">
        <h2 className="active-question-title">{q.question}</h2>

        <div className="active-options-list">
          {q.options?.map((option, optIdx) => {
            const isSelected = selectedOpt === optIdx;
            return (
              <div 
                key={optIdx}
                className={`active-opt-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectOption(optIdx)}
              >
                <div className="opt-circle">{String.fromCharCode(65 + optIdx)}</div>
                <div className="opt-text">{option}</div>
              </div>
            );
          })}
        </div>

        <div className="active-question-actions space-between mt-4">
          <button 
            className="btn btn-ghost" 
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </button>

          {currentQuestion < questions.length - 1 ? (
            <button 
              className="btn btn-primary premium-btn flex-center"
              onClick={() => setCurrentQuestion(prev => prev + 1)}
            >
              Next Question <ChevronRight size={18} />
            </button>
          ) : (
            <button className="btn btn-primary premium-btn flex-center" onClick={handleSubmitQuiz}>
              Finish & Review Test <CheckCircle2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
