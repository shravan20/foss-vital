/**
 * Health API routes
 */

import { Hono } from 'hono';
import { ProjectService } from '../services/project.js';
import { cache } from '../services/cache.js';

const healthRouter = new Hono();
const projectService = new ProjectService();

// Get cache statistics (must come before parameterized routes)
healthRouter.get('/cache/stats', async (c) => {
  try {
    const stats = cache.getStats();
    
    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch cache statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// Get project health score
healthRouter.get('/:owner/:repo', async (c) => {
  try {
    const owner = c.req.param('owner');
    const repo = c.req.param('repo');
    
    const health = await projectService.getProjectHealth(owner, repo);
    
    return c.json({
      success: true,
      data: health,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch project health',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// Force refresh health calculation (clear cache)
healthRouter.post('/:owner/:repo/refresh', async (c) => {
  try {
    const owner = c.req.param('owner');
    const repo = c.req.param('repo');
    
    // Clear cached data to force fresh calculation
    cache.delete(`repo:${owner}/${repo}`);
    cache.delete(`metrics:${owner}/${repo}`);
    cache.delete(`health:${owner}/${repo}`);
    
    // Get fresh health data
    const health = await projectService.getProjectHealth(owner, repo);
    
    return c.json({
      success: true,
      data: health,
      message: 'Health data refreshed successfully',
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to refresh project health',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

export { healthRouter };
