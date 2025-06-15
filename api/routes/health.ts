import express from 'express';
import type { Request, Response } from 'express';
import { cache } from '../../src/services/cache.js';
import { ProjectService } from '../../src/services/project.js';
import { GitHubService } from '../../src/services/github.js';

const router = express.Router();
const projectService = new ProjectService();
const githubService = new GitHubService();

// Health check endpoint
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.VERCEL ? 'vercel' : 'local',
  });
});

// Cache statistics
router.get('/cache/stats', async (req: Request, res: Response) => {
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

// GitHub authentication status
router.get('/github/auth', async (req: Request, res: Response) => {
  try {
    const authStatus = githubService.getAuthenticationStatus();

    res.json({
      success: true,
      data: {
        ...authStatus,
        recommendation: !authStatus.isAuthenticated 
          ? 'Add GITHUB_TOKEN environment variable for higher rate limits and access to private repositories'
          : 'GitHub authentication is properly configured'
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check GitHub authentication status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Project health routes
router.get('/:owner/:repo', async (req: Request, res: Response) => {
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

router.post('/:owner/:repo/refresh', async (req: Request, res: Response) => {
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

export default router;
