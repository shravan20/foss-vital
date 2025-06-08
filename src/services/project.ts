/**
 * Project service for fetching GitHub project data with health calculation
 */

import type { Project, ProjectMetrics, ProjectHealth } from '../models/project.js';
import { GitHubService } from './github.js';
import { HealthCalculatorService } from './health-calculator.js';
import { cache, CacheService } from './cache.js';

export class ProjectService {
  private githubService: GitHubService;
  private healthCalculator: HealthCalculatorService;

  constructor() {
    this.githubService = new GitHubService();
    this.healthCalculator = new HealthCalculatorService();
  }

  async getProject(owner: string, repo: string): Promise<Project> {
    return await this.githubService.getProject(owner, repo);
  }

  async getProjectMetrics(owner: string, repo: string): Promise<ProjectMetrics> {
    return await this.githubService.getProjectMetrics(owner, repo);
  }

  async getProjectHealth(owner: string, repo: string): Promise<ProjectHealth> {
    const cacheKey = CacheService.getHealthKey(owner, repo);
    
    // Try to get from cache first
    const cached = cache.get<ProjectHealth>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get metrics and calculate health
    const metrics = await this.getProjectMetrics(owner, repo);
    const health = this.healthCalculator.calculateHealth(metrics);

    // Cache the result
    cache.set(cacheKey, health);
    
    return health;
  }

  async getProjectWithHealth(owner: string, repo: string): Promise<Project & { health?: ProjectHealth }> {
    const [project, health] = await Promise.all([
      this.getProject(owner, repo),
      this.getProjectHealth(owner, repo).catch(() => null), // Don't fail if health calculation fails
    ]);

    return {
      ...project,
      health: health || undefined,
    };
  }
}
