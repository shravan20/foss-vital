// Load environment variables first
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';

// Import existing configuration and services
import { appConfig } from '../src/config/app.js';
import { logger } from '../src/utils/logger.js';

// Import routes
import healthRoutes from './routes/health.js';
import projectRoutes from './routes/projects.js';
import apiRoutes from './routes/api.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: appConfig.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Mount routes
app.use('/health', healthRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/health', healthRoutes);
app.use('/api', apiRoutes);

// API information endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'FOSS Vital API',
    description: 'GitHub API boilerplate with intelligent caching and health scoring',
    version: '1.0.0',
    environment: process.env.VERCEL ? 'vercel' : 'local',
    endpoints: {
      health: '/health',
      api: '/api',
      projects: '/api/projects/:owner/:repo',
      projectComplete: '/api/projects/:owner/:repo/complete',
      projectMetrics: '/api/projects/:owner/:repo/metrics',
      projectAnalysis: '/api/projects/:owner/:repo/analysis',
      projectCardSVG: '/api/projects/:owner/:repo/card-metrics',
      projectHealth: '/api/health/:owner/:repo',
      refreshHealth: 'POST /api/health/:owner/:repo/refresh',
      cacheStats: '/api/health/cache/stats',
    },
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    requested_path: req.originalUrl,
    available_endpoints: {
      health: '/health',
      info: '/',
      api: '/api',
      projects: '/api/projects/:owner/:repo',
      projectComplete: '/api/projects/:owner/:repo/complete',
      projectMetrics: '/api/projects/:owner/:repo/metrics',
      projectAnalysis: '/api/projects/:owner/:repo/analysis',
      projectCardSVG: '/api/projects/:owner/:repo/card-metrics',
      projectHealth: '/api/health/:owner/:repo',
      refreshHealth: 'POST /api/health/:owner/:repo/refresh',
      cacheStats: '/api/health/cache/stats',
    },
    examples: {
      "Get project info": "/api/projects/microsoft/vscode",
      "Get project analysis": "/api/projects/microsoft/vscode/analysis",
      "Get dynamic SVG card": "/api/projects/microsoft/vscode/card-metrics",
      "Get project health": "/api/health/microsoft/vscode",
      "Get cache stats": "/api/health/cache/stats"
    }
  });
});



// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  logger.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: appConfig.nodeEnv === 'development' ? err.message : 'Something went wrong',
  });
});

// For local development
if (!process.env.VERCEL) {
  const port = appConfig.port || 3000;
  app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
  });
}

export default app;

