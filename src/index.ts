/**
 * FOSS Vital - GitHub API boilerplate with intelligent caching
 */

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import { appConfig } from './config/app.js';
import { projectsRouter } from './routes/projects.js';
import { healthRouter } from './routes/health.js';
import { logger as appLogger } from './utils/logger.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: appConfig.corsOrigins,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

// API information endpoint
app.get('/', (c) => {
  return c.json({
    name: 'FOSS Vital API',
    description: 'GitHub API boilerplate with intelligent caching and health scoring',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      projects: '/api/projects/:owner/:repo',
      projectComplete: '/api/projects/:owner/:repo/complete',
      projectMetrics: '/api/projects/:owner/:repo/metrics',
      projectHealth: '/api/health/:owner/:repo',
      refreshHealth: 'POST /api/health/:owner/:repo/refresh',
      cacheStats: '/api/health/cache/stats',
    },
    documentation: 'https://github.com/your-username/foss-vital',
  });
});

// API routes
app.route('/api/projects', projectsRouter);
app.route('/api/health', healthRouter);

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  }, 404);
});

// Error handler
app.onError((err, c) => {
  appLogger.error('Unhandled error:', err);
  
  return c.json({
    success: false,
    error: 'Internal Server Error',
    message: appConfig.nodeEnv === 'development' ? err.message : 'Something went wrong',
  }, 500);
});

// Start server
serve({
  fetch: app.fetch,
  port: appConfig.port,
}, (info) => {
  appLogger.info(`🚀 FOSS Vital API is running on http://localhost:${info.port}`);
  appLogger.info(`📊 Cache TTL: ${appConfig.cache.ttl}ms, Max Size: ${appConfig.cache.maxSize}`);
  appLogger.info(`🔑 GitHub Token: ${appConfig.github.token ? 'Configured' : 'Not configured (rate limited)'}`);
  appLogger.info(`🌍 Environment: ${appConfig.nodeEnv}`);
});
