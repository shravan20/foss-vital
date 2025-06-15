import express from 'express';
import type { Request, Response } from 'express';
import { rateLimiter } from '../../src/utils/rate-limiter.js';

const router = express.Router();

// API information endpoint
router.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'FOSS Vital API',
    description: `Your FOSS project's health report as README card!`,
    version: '1.0.0',
    environment: process.env.VERCEL ? 'vercel' : 'local',
    message: 'API is running successfully!',
    endpoints: {
      health: '/health',
      api: '/api',
      projects: '/api/projects/:owner/:repo',
      projectComplete: '/api/projects/:owner/:repo/complete',
      projectMetrics: '/api/projects/:owner/:repo/metrics',
      projectAnalysis: '/api/projects/:owner/:repo/analysis',
      projectCardMetrics: '/api/projects/:owner/:repo/card-metrics',
      projectHealth: '/api/health/:owner/:repo',
      refreshHealth: 'POST /api/health/:owner/:repo/refresh',
      cacheStats: '/api/health/cache/stats',
      rateLimitStatus: '/api/rate-limit/status',
    },
    examples: {
      "Get project info": "/api/projects/microsoft/vscode",
      "Get project health": "/api/health/microsoft/vscode",
      "Get advanced analysis": "/api/projects/microsoft/vscode/analysis",
      "Get dynamic SVG card": "/api/projects/microsoft/vscode/card-metrics",
      "Get cache stats": "/api/health/cache/stats",
      "Get rate limit status": "/api/rate-limit/status"
    }
  });
});

// Rate limit status endpoint
router.get('/rate-limit/status', (req: Request, res: Response) => {
  const status = rateLimiter.getStatus();
  res.json({
    ...status,
    isNearLimit: rateLimiter.isNearLimit(),
    recommendedCacheTTL: rateLimiter.getRecommendedCacheTTL(),
    timeUntilResetFormatted: status.timeUntilReset > 0
      ? `${Math.ceil(status.timeUntilReset / 1000 / 60)} minutes`
      : 'Reset available now'
  });
});

export default router;
