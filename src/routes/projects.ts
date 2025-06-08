/**
 * Projects API routes
 */

import { Hono } from 'hono';
import { ProjectService } from '../services/project.js';

const projectsRouter = new Hono();
const projectService = new ProjectService();

// Get project information
projectsRouter.get('/:owner/:repo', async (c) => {
  try {
    const owner = c.req.param('owner');
    const repo = c.req.param('repo');
    
    const project = await projectService.getProject(owner, repo);
    
    return c.json({
      success: true,
      data: project,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch project',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// Get project with health data
projectsRouter.get('/:owner/:repo/complete', async (c) => {
  try {
    const owner = c.req.param('owner');
    const repo = c.req.param('repo');
    
    const project = await projectService.getProjectWithHealth(owner, repo);
    
    return c.json({
      success: true,
      data: project,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch project with health data',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// Get project metrics
projectsRouter.get('/:owner/:repo/metrics', async (c) => {
  try {
    const owner = c.req.param('owner');
    const repo = c.req.param('repo');
    
    const metrics = await projectService.getProjectMetrics(owner, repo);
    
    return c.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch project metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

export { projectsRouter };
