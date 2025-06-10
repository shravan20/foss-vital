import express from 'express';
import type { Request, Response } from 'express';

const router = express.Router();

// API information endpoint
router.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'FOSS Vital API',
    description: 'GitHub API boilerplate with intelligent caching and health scoring',
    version: '1.0.0',
    environment: process.env.VERCEL ? 'vercel' : 'local',
    message: 'API is running successfully!',
    endpoints: {
      health: '/health',
      api: '/api',
      projects: '/api/projects/:owner/:repo',
      projectComplete: '/api/projects/:owner/:repo/complete',
      projectMetrics: '/api/projects/:owner/:repo/metrics',
      projectHealth: '/api/health/:owner/:repo',
      refreshHealth: 'POST /api/health/:owner/:repo/refresh',
      cacheStats: '/api/health/cache/stats',
    },
    examples: {
      "Get project info": "/api/projects/microsoft/vscode",
      "Get project health": "/api/health/microsoft/vscode",
      "Get cache stats": "/api/health/cache/stats"
    }
  });
});

export default router;
