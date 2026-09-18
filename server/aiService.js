require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite-preview',
  'gemini-3.7-flash',
];

/**
 * Robust generateContent with automatic model fallback
 */
async function generateContentWithFallback(prompt) {
  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn(`Model ${modelName} failed (${err.status || err.message}). Trying fallback...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All candidate AI models failed.');
}

module.exports = {
  generateContentWithFallback,
};
