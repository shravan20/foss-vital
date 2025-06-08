/**
 * Vercel serverless function entry point
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import { appConfig } from './config/app.js';
import { projectsRouter } from './routes/projects.js';
import { healthRouter } from './routes/health.js';

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
    environment: 'vercel',
  });
});

// API information endpoint
app.get('/', (c) => {
  return c.json({
    name: 'FOSS Vital API',
    description: 'GitHub API boilerplate with intelligent caching and health scoring',
    version: '1.0.0',
    environment: 'vercel',
    endpoints: {
      health: '/health',
      projects: '/api/projects/:owner/:repo',
      projectComplete: '/api/projects/:owner/:repo/complete',
      projectMetrics: '/api/projects/:owner/:repo/metrics',
      projectHealth: '/api/health/:owner/:repo',
      refreshHealth: 'POST /api/health/:owner/:repo/refresh',
      cacheStats: '/api/health/cache/stats',
    },
  });
});

// Mount routers
app.route('/api/health', healthRouter);
app.route('/api/projects', projectsRouter);

// Vercel handler function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  
  const request = new Request(url.toString(), {
    method: req.method!,
    headers: req.headers as HeadersInit,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
  });

  const response = await app.fetch(request);
  
  // Set response status and headers
  res.status(response.status);
  
  // Copy headers
  for (const [key, value] of response.headers.entries()) {
    res.setHeader(key, value);
  }
  
  // Send response body
  const body = await response.text();
  res.send(body);
}
