import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import config from './config/index.js';

// Route imports
import authRoutes from './routes/auth.js';
import themeRoutes from './routes/themes.js';
import rfpRoutes from './routes/rfps.js';
import knowledgeRoutes from './routes/knowledge.js';
import exportRoutes from './routes/export.js';
import activityRoutes from './routes/activity.js';

// Middleware imports
import { apiLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();

// ─── Global Middleware ───────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      config.clientUrl, 
      'http://localhost:5173', 
      'https://propsal-iq.vercel.app'
    ];
    // Remove trailing slashes from config.clientUrl if user added it by accident
    const cleanClientUrl = config.clientUrl ? config.clientUrl.replace(/\/$/, '') : '';
    
    if (!origin || allowedOrigins.includes(origin) || origin === cleanClientUrl) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Global rate limiting
app.use('/api/', apiLimiter);

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/rfps', rfpRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/activity', activityRoutes);

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ProposalIQ API is running',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ─── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: config.nodeEnv === 'development' ? err.message : 'Internal server error.',
  });
});

// ─── Start Server ────────────────────────────────────────────
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║    🚀 ProposalIQ API Server              ║
  ║                                          ║
  ║    Port:    ${PORT}                         ║
  ║    Mode:    ${config.nodeEnv.padEnd(24)}║
  ║    Health:  http://localhost:${PORT}/api/health ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
  `);
});

export default app;
