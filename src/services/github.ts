/**
 * GitHub service for fetching project data with caching
 */

import { appConfig } from '../config/app.js';
import { cache, CacheService } from './cache.js';
import type { Project, ProjectMetrics, CommitActivity, Contributor, IssueStats, PullRequestStats, DocumentationCheck } from '../models/project.js';

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  license: {
    name: string;
    spdx_id: string;
  } | null;
  pushed_at: string;
  created_at: string;
  updated_at: string;
  owner: {
    login: string;
  };
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  closed_at: string | null;
  pull_request?: {
    url: string;
  };
}

export class GitHubService {
  private readonly baseUrl: string;
  private readonly token?: string;

  constructor() {
    this.baseUrl = appConfig.github.apiUrl;
    this.token = appConfig.github.token;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'FOSS-Vital/1.0',
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getProject(owner: string, repo: string): Promise<Project> {
    const cacheKey = CacheService.getRepoKey(owner, repo);
    
    // Try to get from cache first
    const cached = cache.get<Project>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from GitHub API
    const repoData = await this.makeRequest<GitHubRepository>(`/repos/${owner}/${repo}`);
    
    const project: Project = {
      id: repoData.id,
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description || undefined,
      url: repoData.html_url,
      owner: repoData.owner.login,
      repository: repoData.name,
      language: repoData.language || undefined,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      openIssues: repoData.open_issues_count,
      lastCommit: new Date(repoData.pushed_at),
      license: repoData.license?.name,
      createdAt: new Date(repoData.created_at),
      updatedAt: new Date(repoData.updated_at),
    };

    // Cache the result
    cache.set(cacheKey, project);
    
    return project;
  }

  async getProjectMetrics(owner: string, repo: string): Promise<ProjectMetrics> {
    const cacheKey = CacheService.getMetricsKey(owner, repo);
    
    // Try to get from cache first
    const cached = cache.get<ProjectMetrics>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch metrics from various GitHub endpoints
    const [commitActivity, contributors, issues, pulls, documentation] = await Promise.all([
      this.getCommitActivity(owner, repo),
      this.getContributors(owner, repo),
      this.getIssueStats(owner, repo),
      this.getPullRequestStats(owner, repo),
      this.getDocumentationCheck(owner, repo),
    ]);

    const metrics: ProjectMetrics = {
      owner,
      repository: repo,
      commitActivity,
      contributors,
      issueStats: issues,
      pullRequestStats: pulls,
      documentation,
      measuredAt: new Date(),
    };

    // Cache the result
    cache.set(cacheKey, metrics);
    
    return metrics;
  }

  private async getCommitActivity(owner: string, repo: string): Promise<CommitActivity[]> {
    try {
      const result = await this.makeRequest<CommitActivity[] | null>(`/repos/${owner}/${repo}/stats/commit_activity`);
      return result || [];
    } catch {
      return [];
    }
  }

  private async getContributors(owner: string, repo: string): Promise<Contributor[]> {
    try {
      const result = await this.makeRequest<Contributor[] | null>(`/repos/${owner}/${repo}/contributors`);
      return result || [];
    } catch {
      return [];
    }
  }

  private async getIssueStats(owner: string, repo: string): Promise<IssueStats> {
    try {
      const [openIssues, closedIssues] = await Promise.all([
        this.makeRequest<GitHubIssue[]>(`/repos/${owner}/${repo}/issues?state=open&per_page=100`),
        this.makeRequest<GitHubIssue[]>(`/repos/${owner}/${repo}/issues?state=closed&per_page=100`),
      ]);

      // Filter out pull requests (GitHub includes PRs in issues endpoint)
      const openIssuesOnly = openIssues.filter(issue => !issue.pull_request);
      const closedIssuesOnly = closedIssues.filter(issue => !issue.pull_request);

      // Calculate average close time for closed issues
      let averageCloseTime = 0;
      if (closedIssuesOnly.length > 0) {
        const totalCloseTime = closedIssuesOnly.reduce((sum, issue) => {
          if (issue.closed_at) {
            const createdAt = new Date(issue.created_at);
            const closedAt = new Date(issue.closed_at);
            const diffInDays = (closedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return sum + diffInDays;
          }
          return sum;
        }, 0);
        averageCloseTime = totalCloseTime / closedIssuesOnly.length;
      }

      return {
        total: openIssuesOnly.length + closedIssuesOnly.length,
        open: openIssuesOnly.length,
        closed: closedIssuesOnly.length,
        averageCloseTime,
      };
    } catch {
      return { total: 0, open: 0, closed: 0, averageCloseTime: 0 };
    }
  }

  private async getPullRequestStats(owner: string, repo: string): Promise<PullRequestStats> {
    try {
      const [openPRs, closedPRs] = await Promise.all([
        this.makeRequest<GitHubIssue[]>(`/repos/${owner}/${repo}/pulls?state=open&per_page=100`),
        this.makeRequest<GitHubIssue[]>(`/repos/${owner}/${repo}/pulls?state=closed&per_page=100`),
      ]);

      // For closed PRs, we need to check which ones were merged
      const mergedPRs = closedPRs.filter(pr => pr.closed_at);

      // Calculate average merge time
      let averageMergeTime = 0;
      if (mergedPRs.length > 0) {
        const totalMergeTime = mergedPRs.reduce((sum, pr) => {
          if (pr.closed_at) {
            const createdAt = new Date(pr.created_at);
            const mergedAt = new Date(pr.closed_at);
            const diffInDays = (mergedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return sum + diffInDays;
          }
          return sum;
        }, 0);
        averageMergeTime = totalMergeTime / mergedPRs.length;
      }

      return {
        total: openPRs.length + closedPRs.length,
        open: openPRs.length,
        closed: closedPRs.length,
        merged: mergedPRs.length,
        averageMergeTime,
      };
    } catch {
      return { total: 0, open: 0, closed: 0, merged: 0, averageMergeTime: 0 };
    }
  }

  private async getDocumentationCheck(owner: string, repo: string): Promise<DocumentationCheck> {
    const files = ['README.md', 'LICENSE', 'CONTRIBUTING.md', 'CHANGELOG.md', 'CODE_OF_CONDUCT.md'];
    const checks = await Promise.all(
      files.map(async (file) => {
        try {
          await this.makeRequest(`/repos/${owner}/${repo}/contents/${file}`);
          return true;
        } catch {
          return false;
        }
      })
    );

    return {
      hasReadme: checks[0],
      hasLicense: checks[1],
      hasContributing: checks[2],
      hasChangelog: checks[3],
      hasCodeOfConduct: checks[4],
    };
  }
}
