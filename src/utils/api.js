// Centralized API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const endpoints = {
  // Health
  health: `${API_BASE_URL}/health`,

  // Auth & Profile
  login: `${API_BASE_URL}/auth/login`,
  signup: `${API_BASE_URL}/auth/signup`,
  profile: (id = 1) => `${API_BASE_URL}/auth/profile/${id}`,

  // Resume Intelligence
  resumeAnalyze: `${API_BASE_URL}/resume/analyze`,

  // MCQ Practice
  mcqGenerate: `${API_BASE_URL}/mcq/generate`,
  mcqSaveResult: `${API_BASE_URL}/mcq/save-result`,

  // AI Mock Interview
  interviewStart: `${API_BASE_URL}/interview/start`,
  interviewEvaluate: `${API_BASE_URL}/interview/evaluate`,
  interviewFinalize: `${API_BASE_URL}/interview/finalize`,
  interviewSave: `${API_BASE_URL}/interview/save-interview`,

  // HackerRank-style Coding Arena
  codingProblems: `${API_BASE_URL}/coding/problems`,
  codingProblemDetails: (id) => `${API_BASE_URL}/coding/problems/${id}`,
  codingRun: `${API_BASE_URL}/coding/run`,
  codingRunCustom: `${API_BASE_URL}/coding/run-custom`,
  codingSubmit: `${API_BASE_URL}/coding/submit`,
  codingGenerate: `${API_BASE_URL}/coding/generate`,
  codingAiAssist: `${API_BASE_URL}/coding/ai-assist`,
  codingHistory: `${API_BASE_URL}/coding/history`,

  // AI Career Coach
  coachChat: `${API_BASE_URL}/coach/chat`,
  coachHistory: (userId = 1) => `${API_BASE_URL}/coach/history/${userId}`,

  // Daily Practice & Streaks
  dailyToday: (userId = 1) => `${API_BASE_URL}/daily/today/${userId}`,
  dailyCompleteTask: `${API_BASE_URL}/daily/complete-task`,

  // History
  historyAll: (userId = 1) => `${API_BASE_URL}/history/${userId}`,

  // Dashboard & Analytics
  dashboardStats: `${API_BASE_URL}/dashboard/stats`,

  // Notifications
  notifications: `${API_BASE_URL}/notifications`,
  notificationRead: (id) => `${API_BASE_URL}/notifications/${id}/read`,
  notificationsReadAll: `${API_BASE_URL}/notifications/read-all`,
};

export default API_BASE_URL;
