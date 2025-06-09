import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';

// Import existing configuration and services
import { appConfig } from '../src/config/app.js';
import { ProjectService } from '../src/services/project.js';
import { cache } from '../src/services/cache.js';
import { logger } from '../src/utils/logger.js';

const app = express();
const projectService = new ProjectService();

// Middleware
app.use(express.json());
app.use(cors({
  origin: appConfig.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.VERCEL ? 'vercel' : 'local',
  });
});

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
      projectHealth: '/api/health/:owner/:repo',
      refreshHealth: 'POST /api/health/:owner/:repo/refresh',
      cacheStats: '/api/health/cache/stats',
    },
  });
});

// API base endpoint - same as root but for /api path
app.get('/api', (req: Request, res: Response) => {
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

// Projects routes
app.get('/api/projects/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const project = await projectService.getProject(owner, repo);
    
    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/projects/:owner/:repo/complete', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const project = await projectService.getProjectWithHealth(owner, repo);
    
    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project with health data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/projects/:owner/:repo/metrics', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const metrics = await projectService.getProjectMetrics(owner, repo);
    
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Health routes
app.get('/api/health/cache/stats', async (req: Request, res: Response) => {
  try {
    const stats = cache.getStats();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cache statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/health/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const health = await projectService.getProjectHealth(owner, repo);
    
    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project health',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/health/:owner/:repo/refresh', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    
    // Clear cached data to force fresh calculation
    cache.delete(`repo:${owner}/${repo}`);
    cache.delete(`metrics:${owner}/${repo}`);
    cache.delete(`health:${owner}/${repo}`);
    
    // Get fresh health data
    const health = await projectService.getProjectHealth(owner, repo);
    
    res.json({
      success: true,
      data: health,
      message: 'Health data refreshed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to refresh project health',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
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
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

export default app;
