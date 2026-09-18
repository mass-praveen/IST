require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS.'));
  },
}));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'IST Backend is running' });
});

// Register all modular routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/mcq', require('./routes/mcq'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/coding', require('./routes/coding'));
app.use('/api/coach', require('./routes/coach'));
app.use('/api/daily', require('./routes/daily'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/history', require('./routes/history'));
app.use('/api/notifications', require('./routes/notifications'));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('\n---------------------------------');
    console.log('IST Master Backend started successfully');
    console.log(`Server: http://localhost:${PORT}`);
    console.log('Health: /api/health');
    console.log('---------------------------------\n');
  });
}

module.exports = app;
