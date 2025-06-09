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


app.get(
  "/api/projects/:owner/:repo/card-metrics",
  async (req: Request, res: Response) => {
    let response = `<?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="900" height="1150" viewBox="0 0 900 1150">
        <defs>
          <style><![CDATA[
            .header-title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 28px; font-weight: 600; fill: #1a1a1a; }
            .header-subtitle { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; fill: #666; }
            .section-title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; font-weight: 600; fill: #374151; }
            .card-label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; font-weight: 500; fill: #6b7280; }
            .card-value { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 18px; font-weight: 600; fill: #1f2937; }
            .card-success { fill: #f0fdf4; stroke: #bbf7d0; }
            .card-warning { fill: #fffbeb; stroke: #fed7aa; }
            .card-info { fill: #eff6ff; stroke: #bfdbfe; }
            .card-neutral { fill: #f9fafb; stroke: #e5e7eb; }
            .value-success { fill: #166534; }
            .value-warning { fill: #c2410c; }
            .value-info { fill: #1e40af; }
            .health-score-bg { fill: url(#healthGradient); }
            .health-score-text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: white; }
          ]]></style>
          
          <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#10b981"/>
            <stop offset="100%" style="stop-color:#059669"/>
          </linearGradient>
          
          <!-- Icons -->
          <g id="checkIcon">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="1.5" fill="none"/>
          </g>
          <g id="activityIcon">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="1.5" fill="none"/>
          </g>
          <g id="usersIcon">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" stroke-width="1.5" fill="none"/>
          </g>
          <g id="starIcon">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" fill="currentColor"/>
          </g>
        </defs>
        
        <!-- Background -->
        <rect width="900" height="1600" fill="#fafafa"/>
        
        <!-- Header -->
        <text x="60" y="80" class="header-title">Project Health Dashboard</text>
        <text x="60" y="105" class="header-subtitle">Comprehensive overview of project metrics and health indicators</text>
        
        <!-- Code Quality Section -->
        <use href="#checkIcon" x="60" y="140" width="16" height="16" color="#374151"/>
        <text x="85" y="153" class="section-title">Code Quality &amp; CI Metrics</text>
        
        <!-- Code Quality Cards Row 1 -->
        <g>
          <rect x="60" y="170" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="75" y="190" class="card-label">Build Status</text>
          <text x="75" y="215" class="card-value value-success" id="buildStatus">Passing</text>
          <use href="#checkIcon" x="225" y="180" width="14" height="14" color="#166534"/>
        </g>
        
        <g>
          <rect x="265" y="170" width="190" height="80" rx="8" class="card-info" stroke-width="1"/>
          <text x="280" y="190" class="card-label">Test Coverage</text>
          <text x="280" y="215" class="card-value value-info">85%</text>
        </g>
        
        <g>
          <rect x="470" y="170" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="485" y="190" class="card-label">Linting</text>
          <text x="485" y="215" class="card-value value-success">Clean</text>
        </g>
        
        <g>
          <rect x="675" y="170" width="190" height="80" rx="8" class="card-warning" stroke-width="1"/>
          <text x="690" y="190" class="card-label">Code Smells</text>
          <text x="690" y="215" class="card-value value-warning">3</text>
        </g>
        
        <!-- Code Quality Cards Row 2 -->
        <g>
          <rect x="60" y="270" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="75" y="290" class="card-label">Tech Debt</text>
          <text x="75" y="315" class="card-value value-success">2.1%</text>
        </g>
        
        <g>
          <rect x="265" y="270" width="190" height="80" rx="8" class="card-neutral" stroke-width="1"/>
          <text x="280" y="290" class="card-label">Complexity</text>
          <text x="280" y="315" class="card-value">3.2</text>
        </g>
        
        <g>
          <rect x="470" y="270" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="485" y="290" class="card-label">Static Analysis</text>
          <text x="485" y="315" class="card-value value-success">A+</text>
        </g>
        
        <g>
          <rect x="675" y="270" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="690" y="290" class="card-label">Security</text>
          <text x="690" y="315" class="card-value value-success">Passed</text>
        </g>
        
        <!-- Project Activity Section -->
        <use href="#activityIcon" x="60" y="380" width="16" height="16" color="#374151"/>
        <text x="85" y="393" class="section-title">Project Activity &amp; Maintenance</text>
        
        <!-- Activity Cards Row 1 -->
        <g>
          <rect x="60" y="410" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="75" y="430" class="card-label">Last Commit</text>
          <text x="75" y="455" class="card-value value-success">3d ago</text>
        </g>
        
        <g>
          <rect x="265" y="410" width="190" height="80" rx="8" class="card-info" stroke-width="1"/>
          <text x="280" y="430" class="card-label">Commits/Week</text>
          <text x="280" y="455" class="card-value value-info" id="commitsWeek">28</text>
        </g>
        
        <g>
          <rect x="470" y="410" width="190" height="80" rx="8" class="card-info" stroke-width="1"/>
          <text x="485" y="430" class="card-label">Open PRs</text>
          <text x="485" y="455" class="card-value value-info">4</text>
        </g>
        
        <g>
          <rect x="675" y="410" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="690" y="430" class="card-label">PRs Merged</text>
          <text x="690" y="455" class="card-value value-success" id="prsMerged">74</text>
        </g>
        
        <!-- Activity Cards Row 2 -->
        <g>
          <rect x="60" y="510" width="190" height="80" rx="8" class="card-warning" stroke-width="1"/>
          <text x="75" y="530" class="card-label">Open Issues</text>
          <text x="75" y="555" class="card-value value-warning" id="openIssues">1089</text>
        </g>
        
        <g>
          <rect x="265" y="510" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="280" y="530" class="card-label">Closed Issues</text>
          <text x="280" y="555" class="card-value value-success">23</text>
        </g>
        
        <g>
          <rect x="470" y="510" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="485" y="530" class="card-label">Response Time</text>
          <text x="485" y="555" class="card-value value-success">8h</text>
        </g>
        
        <g>
          <rect x="675" y="510" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="690" y="530" class="card-label">Fix Time</text>
          <text x="690" y="555" class="card-value value-success">3d</text>
        </g>
        
        <!-- Community Section -->
        <use href="#usersIcon" x="60" y="620" width="16" height="16" color="#374151"/>
        <text x="85" y="633" class="section-title">Community &amp; Contributor Health</text>
        
        <!-- Community Cards -->
        <g>
          <rect x="60" y="650" width="190" height="80" rx="8" class="card-neutral" stroke-width="1"/>
          <text x="75" y="670" class="card-label">Contributors</text>
          <text x="75" y="695" class="card-value" id="contributors">1933</text>
        </g>
        
        <g>
          <rect x="265" y="650" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="280" y="670" class="card-label">Active Devs</text>
          <text x="280" y="695" class="card-value value-success">6</text>
        </g>
        
        <g>
          <rect x="470" y="650" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="485" y="670" class="card-label">Retention</text>
          <text x="485" y="695" class="card-value value-success">78%</text>
        </g>
        
        <g>
          <rect x="675" y="650" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="690" y="670" class="card-label">Growth</text>
          <text x="690" y="695" class="card-value value-success">+5%</text>
        </g>
        
        <!-- User Engagement Section -->
        <use href="#starIcon" x="60" y="760" width="16" height="16" color="#374151"/>
        <text x="85" y="773" class="section-title">User Engagement</text>
        
        <!-- Engagement Cards -->
        <g>
          <rect x="60" y="790" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="75" y="810" class="card-label">Stars</text>
          <text x="75" y="835" class="card-value value-success" id="stars">236k</text>
          <use href="#starIcon" x="225" y="800" width="12" height="12" color="#166534"/>
        </g>
        
        <g>
          <rect x="265" y="790" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="280" y="810" class="card-label">Forks</text>
          <text x="280" y="835" class="card-value value-success" id="forks">48,697</text>
        </g>
        
        <g>
          <rect x="470" y="790" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="485" y="810" class="card-label">Watchers</text>
          <text x="485" y="835" class="card-value value-success" id="watchers">6,733</text>
        </g>
        
        <g>
          <rect x="675" y="790" width="190" height="80" rx="8" class="card-neutral" stroke-width="1"/>
          <text x="690" y="810" class="card-label">Discussions</text>
          <text x="690" y="835" class="card-value">20</text>
        </g>
        
        <!-- Release Section -->
        <text x="60" y="913" class="section-title">Release &amp; Versioning</text>
        
        <!-- Release Cards -->
        <g>
          <rect x="60" y="930" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="75" y="950" class="card-label">Latest Release</text>
          <text x="75" y="975" class="card-value value-success">v2.3.1</text>
        </g>
        
        <g>
          <rect x="265" y="930" width="190" height="80" rx="8" class="card-neutral" stroke-width="1"/>
          <text x="280" y="950" class="card-label">Releases/Month</text>
          <text x="280" y="975" class="card-value">2</text>
        </g>
        
        <g>
          <rect x="470" y="930" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="485" y="950" class="card-label">Changelog</text>
          <text x="485" y="975" class="card-value value-success">Updated</text>
        </g>
        
        <g>
          <rect x="675" y="930" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
          <text x="690" y="950" class="card-label">SemVer</text>
          <text x="690" y="975" class="card-value value-success">Compliant</text>
        </g>
        
        <!-- Health Score -->
        <rect x="60" y="1050" width="780" height="80" rx="12" class="health-score-bg"/>
        <text x="80" y="1075" class="health-score-text" style="font-size: 18px; font-weight: 600;">Project Health Score</text>
        <text x="80" y="1095" class="health-score-text" style="font-size: 13px;">Excellent overall health with strong community engagement</text>
        <text x="720" y="1085" class="health-score-text" style="font-size: 36px; font-weight: 700;">96/100</text>
        <text x="760" y="1105" class="health-score-text" style="font-size: 11px;">Production Ready</text>

        <script><![CDATA[
          async function fetchGitHubData() {
            const repo = 'facebook/react';
            const apiBase = 'https://api.github.com/repos/' + repo;
            
            const fallbackData = {
              stars: 236137,
              forks: 48697,
              openIssues: 1089,
              watchers: 6733,
              contributors: 1933,
              buildStatus: 'Passing',
              commitsWeek: 28,
              prsMerged: 74
            };
            
            try {
              const repoRes = await fetch(apiBase);
              if (!repoRes.ok) throw new Error('API Error');
              const repoData = await repoRes.json();
              
              document.getElementById('stars').textContent = (repoData.stargazers_count / 1000).toFixed(0) + 'k';
              document.getElementById('forks').textContent = repoData.forks_count.toLocaleString();
              document.getElementById('openIssues').textContent = repoData.open_issues_count;
              document.getElementById('watchers').textContent = repoData.subscribers_count.toLocaleString();
              document.getElementById('buildStatus').textContent = repoData.archived ? 'Archived' : 'Passing';

              const contribRes = await fetch(apiBase + '/contributors?per_page=1&anon=true');
              const contribLink = contribRes.headers.get('Link');
              let contributors = '-';
              if (contribLink) {
                const match = contribLink.match(/&page=(\d+)>; rel="last"/);
                if (match) contributors = match[1];
              } else {
                const contribData = await contribRes.json();
                contributors = contribData.length;
              }
              document.getElementById('contributors').textContent = contributors;

              const commitsRes = await fetch(apiBase + '/stats/commit_activity');
              const commitsData = await commitsRes.json();
              const last6Weeks = commitsData.slice(-6);
              const avgCommits = Math.round(last6Weeks.reduce((sum, week) => sum + week.total, 0) / 6);
              document.getElementById('commitsWeek').textContent = avgCommits;

              const prsRes = await fetch(apiBase + '/pulls?state=closed&per_page=100');
              const prsData = await prsRes.json();
              const now = new Date();
              const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              const mergedPRs = prsData.filter(pr => pr.merged_at && new Date(pr.merged_at) > thirtyDaysAgo).length;
              document.getElementById('prsMerged').textContent = mergedPRs;

            } catch (e) {
              console.log('API failed, using fallback data');
              document.getElementById('stars').textContent = (fallbackData.stars / 1000).toFixed(0) + 'k';
              document.getElementById('forks').textContent = fallbackData.forks.toLocaleString();
              document.getElementById('openIssues').textContent = fallbackData.openIssues;
              document.getElementById('watchers').textContent = fallbackData.watchers.toLocaleString();
              document.getElementById('contributors').textContent = fallbackData.contributors.toLocaleString();
              document.getElementById('buildStatus').textContent = fallbackData.buildStatus;
              document.getElementById('commitsWeek').textContent = fallbackData.commitsWeek;
              document.getElementById('prsMerged').textContent = fallbackData.prsMerged;
            }
          }
          
          // Auto-load data when SVG loads
          fetchGitHubData();
        ]]></script>
      </svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(response)

  }
);

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
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;

