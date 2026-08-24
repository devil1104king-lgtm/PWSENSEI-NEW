import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { initDatabase } from './server/db';
import adminRouter from './server/routes/admin';
import batchesRouter from './server/routes/batches';
import contentRouter from './server/routes/content';
import settingsRouter from './server/routes/settings';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize database schema and data if connected to CockroachDB / PostgreSQL
initDatabase().catch(err => console.error('Database initialization error:', err));

// Body & Header Parsers
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API Routes FIRST
app.use('/api/admin', adminRouter);
app.use('/api/batches', batchesRouter);
app.use('/api', contentRouter);
app.use('/api', settingsRouter);

// Static Asset Serving
const publicDir = path.join(process.cwd(), 'public');
app.use(express.static(publicDir));

// Explicit Multi-page HTML Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/study', (req, res) => {
  res.sendFile(path.join(publicDir, 'study.html'));
});

app.get('/batch', (req, res) => {
  res.sendFile(path.join(publicDir, 'batch.html'));
});

app.get('/subject', (req, res) => {
  res.sendFile(path.join(publicDir, 'subject.html'));
});

app.get('/chapter', (req, res) => {
  res.sendFile(path.join(publicDir, 'chapter.html'));
});

app.get('/mybatches', (req, res) => {
  res.sendFile(path.join(publicDir, 'mybatches.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin', 'index.html'));
});

app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin', 'login.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(publicDir, 'auth.html'));
});

// Fallback for HTML5 Navigation / Unknown Routes
app.use((req, res) => {
  const reqPath = req.path;
  if (reqPath.startsWith('/admin')) {
    res.sendFile(path.join(publicDir, 'admin', 'index.html'));
  } else {
    res.sendFile(path.join(publicDir, 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PW SENSEI Server running on http://0.0.0.0:${PORT}`);
});
