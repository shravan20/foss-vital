import { appConfig } from '../config/app.js';
import { cache, CacheService } from './cache.js';
import { rateLimiter } from '../utils/rate-limiter.js';
import { logger } from '../utils/logger.js';
import type {
  Project,
  ProjectMetrics,
  CommitActivity,
  Contributor,
  IssueStats,
  PullRequestStats,
  DocumentationCheck,
  GitHubWorkflow,
  GitHubWorkflowRun,
  GitHubTreeItem,
  GitHubCommit,
  GitHubRelease
} from '../models/project.js';

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
  default_branch: string;
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
  /**
   * GitHub service for fetching project data with caching and authentication
   */
  private readonly baseUrl: string;
  private readonly token?: string;
  private readonly isAuthenticated: boolean;

  constructor() {
    this.baseUrl = appConfig.github.apiUrl;
    this.token = appConfig.github.token;
    this.isAuthenticated = !!this.token;
    
    // Log authentication status (without exposing the token)
    if (this.isAuthenticated) {
      logger.info('GitHub service initialized with authentication token');
    } else {
      logger.warn('GitHub service initialized without authentication token - rate limits will be lower');
    }
    
    // Validate token format if provided
    if (this.token && !this.isValidTokenFormat(this.token)) {
      logger.error('Invalid GitHub token format detected');
      // Don't modify readonly properties, just log the error
    }
  }

  private isValidTokenFormat(token: string): boolean {
    // GitHub Personal Access Tokens start with 'ghp_' and are 40+ characters
    // GitHub App tokens start with 'ghs_' and are 40+ characters
    // Classic tokens are 40 character hex strings
    if (token.startsWith('ghp_') || token.startsWith('ghs_')) {
      return token.length >= 40;
    }
    // Classic token format (40 character hex string)
    return /^[a-f0-9]{40}$/i.test(token);
  }

  public getAuthenticationStatus(): { isAuthenticated: boolean; tokenType?: string; rateLimitInfo?: string } {
    if (!this.isAuthenticated) {
      return { 
        isAuthenticated: false, 
        rateLimitInfo: 'Unauthenticated requests: 60 requests per hour per IP'
      };
    }
    
    let tokenType = 'classic';
    if (this.token?.startsWith('ghp_')) {
      tokenType = 'personal_access_token';
    } else if (this.token?.startsWith('ghs_')) {
      tokenType = 'github_app';
    }
    
    return { 
      isAuthenticated: true, 
      tokenType,
      rateLimitInfo: 'Authenticated requests: 5000 requests per hour'
    };
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    return rateLimiter.executeRequest(async () => {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'FOSS-Vital/1.0',
      };

      if (this.token) {
        headers['Authorization'] = `token ${this.token}`;
      }

      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });

        // Update rate limiter with response headers
        rateLimiter.updateFromHeaders(Object.fromEntries(response.headers.entries()));

        // Enhanced error handling
        if (!response.ok) {
          const errorBody = await response.text().catch(() => 'Unknown error');
          
          // Log different types of authentication errors
          if (response.status === 401) {
            logger.error(`GitHub API authentication failed: ${response.status} ${response.statusText}`, {
              endpoint,
              hasToken: !!this.token,
              error: errorBody
            });
            throw new Error(`GitHub API authentication failed. Please check your GITHUB_TOKEN environment variable.`);
          } else if (response.status === 403) {
            const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
            const rateLimitReset = response.headers.get('x-ratelimit-reset');
            
            if (rateLimitRemaining === '0') {
              const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toISOString() : 'unknown';
              logger.warn(`GitHub API rate limit exceeded. Reset time: ${resetTime}`, {
                endpoint,
                isAuthenticated: this.isAuthenticated
              });
              throw new Error(`GitHub API rate limit exceeded. Reset time: ${resetTime}. ${!this.isAuthenticated ? 'Consider adding a GITHUB_TOKEN for higher limits.' : ''}`);
            } else {
              logger.error(`GitHub API forbidden: ${response.status} ${response.statusText}`, {
                endpoint,
                error: errorBody
              });
              throw new Error(`GitHub API access forbidden: ${response.statusText}`);
            }
          } else {
            logger.error(`GitHub API error: ${response.status} ${response.statusText}`, {
              endpoint,
              error: errorBody
            });
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
          }
        }

        return response.json();
      } catch (error) {
        if (error instanceof Error && error.message.includes('GitHub API')) {
          // Re-throw our custom GitHub API errors
          throw error;
        }
        
        // Handle network errors
        logger.error('Network error while calling GitHub API', {
          endpoint,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw new Error(`Network error while calling GitHub API: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
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

  /**
   * Get GitHub Actions workflows
   */
  async getWorkflows(owner: string, repo: string): Promise<GitHubWorkflow[]> {
    try {
      const response = await this.makeRequest<{ workflows: GitHubWorkflow[] }>(`/repos/${owner}/${repo}/actions/workflows`);
      return response.workflows || [];
    } catch {
      return [];
    }
  }

  /**
   * Get workflow runs
   */
  async getWorkflowRuns(owner: string, repo: string): Promise<GitHubWorkflowRun[]> {
    try {
      const response = await this.makeRequest<{ workflow_runs: GitHubWorkflowRun[] }>(`/repos/${owner}/${repo}/actions/runs?per_page=20`);
      return response.workflow_runs || [];
    } catch {
      return [];
    }
  }

  /**
   * Get repository tree (file structure)
   */
  async getRepositoryTree(owner: string, repo: string): Promise<GitHubTreeItem[]> {
    try {
      // First get the default branch
      const repoData = await this.makeRequest<GitHubRepository>(`/repos/${owner}/${repo}`);
      const defaultBranch = repoData.default_branch || 'main';

      // Get the tree recursively
      const response = await this.makeRequest<{ tree: GitHubTreeItem[] }>(`/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
      return response.tree || [];
    } catch {
      return [];
    }
  }

  /**
   * Get file content
   */
  async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    const response = await this.makeRequest<{ content: string; encoding: string }>(`/repos/${owner}/${repo}/contents/${path}`);

    if (response.encoding === 'base64') {
      return Buffer.from(response.content, 'base64').toString('utf-8');
    }

    return response.content;
  }

  /**
   * Get repository languages
   */
  async getLanguages(owner: string, repo: string): Promise<{ [key: string]: number }> {
    try {
      return await this.makeRequest<{ [key: string]: number }>(`/repos/${owner}/${repo}/languages`);
    } catch {
      return {};
    }
  }

  /**
   * Get repository releases
   */
  async getReleases(owner: string, repo: string): Promise<GitHubRelease[]> {
    try {
      return await this.makeRequest<GitHubRelease[]>(`/repos/${owner}/${repo}/releases?per_page=20`);
    } catch {
      return [];
    }
  }

  /**
   * Get recent commits
   */
  async getRecentCommits(owner: string, repo: string): Promise<GitHubCommit[]> {
    try {
      return await this.makeRequest<GitHubCommit[]>(`/repos/${owner}/${repo}/commits?per_page=20`);
    } catch {
      return [];
    }
  }
}
