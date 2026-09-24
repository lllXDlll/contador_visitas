require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/postgres');
const visitsRouter = require('./routes/visits');

const app = express();
const PORT = process.env.PORT || 3000;
const rawFrontendUrl = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.trim().replace(/^["']|["']$/g, '')
  : 'http://localhost:5173';

const allowedOrigins = rawFrontendUrl
  .split(',')
  .map(url => url.trim().replace(/\/+$/, ''));

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/+$/, '');
    if (allowedOrigins.includes('*') || allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }
    console.warn(`CORS blocked request from origin: ${origin}`);
    return callback(null, false);
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use('/api/visits', visitsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function startServer() {
  await initDb();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
