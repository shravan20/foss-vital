import express from 'express';
import type { Request, Response } from 'express';
import { ProjectService } from '../../src/services/project.js';
import { EnhancedProjectService } from '../../src/services/project-enhanced.js';

const router = express.Router();
const projectService = new ProjectService();
const enhancedService = new EnhancedProjectService();

// Get basic project info
router.get('/:owner/:repo', async (req: Request, res: Response) => {
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

// Get project with health data
router.get('/:owner/:repo/complete', async (req: Request, res: Response) => {
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

// Get project metrics
router.get('/:owner/:repo/metrics', async (req: Request, res: Response) => {
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

// Get advanced project analysis
router.get('/:owner/:repo/analysis', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    
    const analysis = await enhancedService.getAdvancedAnalysis(owner, repo);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch advanced project analysis',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get project card metrics (SVG)
router.get('/:owner/:repo/card-metrics', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    
    // Get comprehensive analysis
    const analysis = await enhancedService.getAdvancedAnalysis(owner, repo);

    // Generate dynamic SVG based on real data
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
          .card-danger { fill: #fef2f2; stroke: #fecaca; }
          .value-success { fill: #166534; }
          .value-warning { fill: #c2410c; }
          .value-info { fill: #1e40af; }
          .value-danger { fill: #dc2626; }
          .health-score-bg { fill: url(#healthGradient); }
          .health-score-text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: white; }
        ]]></style>
        
        <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${analysis.healthScore.score >= 85 ? '#10b981' : analysis.healthScore.score >= 70 ? '#f59e0b' : '#ef4444'}"/>
          <stop offset="100%" style="stop-color:${analysis.healthScore.score >= 85 ? '#059669' : analysis.healthScore.score >= 70 ? '#d97706' : '#dc2626'}"/>
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
      <text x="60" y="80" class="header-title">${analysis.project.name} Health Dashboard</text>
      <text x="60" y="105" class="header-subtitle">${owner}/${repo} - ${analysis.project.description || 'Comprehensive overview of project metrics and health indicators'}</text>
      
      <!-- Code Quality Section -->
      <use href="#checkIcon" x="60" y="140" width="16" height="16" color="#374151"/>
      <text x="85" y="153" class="section-title">Code Quality &amp; CI Metrics</text>
      
      <!-- Code Quality Cards Row 1 -->
      <g>
        <rect x="60" y="170" width="190" height="80" rx="8" class="${analysis.codeQuality.buildStatus === 'Passing' ? 'card-success' : analysis.codeQuality.buildStatus === 'Failing' ? 'card-danger' : 'card-neutral'}" stroke-width="1"/>
        <text x="75" y="190" class="card-label">Build Status</text>
        <text x="75" y="215" class="card-value ${analysis.codeQuality.buildStatus === 'Passing' ? 'value-success' : analysis.codeQuality.buildStatus === 'Failing' ? 'value-danger' : ''}">${analysis.codeQuality.buildStatus}</text>
        ${analysis.codeQuality.buildStatus === 'Passing' ? '<use href="#checkIcon" x="225" y="180" width="14" height="14" color="#166534"/>' : ''}
      </g>
      
      <g>
        <rect x="265" y="170" width="190" height="80" rx="8" class="${analysis.codeQuality.testCoverage >= 80 ? 'card-success' : analysis.codeQuality.testCoverage >= 60 ? 'card-info' : 'card-warning'}" stroke-width="1"/>
        <text x="280" y="190" class="card-label">Test Coverage</text>
        <text x="280" y="215" class="card-value ${analysis.codeQuality.testCoverage >= 80 ? 'value-success' : analysis.codeQuality.testCoverage >= 60 ? 'value-info' : 'value-warning'}">${analysis.codeQuality.testCoverage}%</text>
      </g>
      
      <g>
        <rect x="470" y="170" width="190" height="80" rx="8" class="${analysis.codeQuality.linting === 'Clean' ? 'card-success' : 'card-neutral'}" stroke-width="1"/>
        <text x="485" y="190" class="card-label">Linting</text>
        <text x="485" y="215" class="card-value ${analysis.codeQuality.linting === 'Clean' ? 'value-success' : ''}">${analysis.codeQuality.linting}</text>
      </g>
      
      <g>
        <rect x="675" y="170" width="190" height="80" rx="8" class="${analysis.codeQuality.codeSmells <= 2 ? 'card-success' : analysis.codeQuality.codeSmells <= 5 ? 'card-warning' : 'card-danger'}" stroke-width="1"/>
        <text x="690" y="190" class="card-label">Code Smells</text>
        <text x="690" y="215" class="card-value ${analysis.codeQuality.codeSmells <= 2 ? 'value-success' : analysis.codeQuality.codeSmells <= 5 ? 'value-warning' : 'value-danger'}">${analysis.codeQuality.codeSmells}</text>
      </g>
      
      <!-- Code Quality Cards Row 2 -->
      <g>
        <rect x="60" y="270" width="190" height="80" rx="8" class="${analysis.codeQuality.techDebt <= 5 ? 'card-success' : analysis.codeQuality.techDebt <= 15 ? 'card-warning' : 'card-danger'}" stroke-width="1"/>
        <text x="75" y="290" class="card-label">Tech Debt</text>
        <text x="75" y="315" class="card-value ${analysis.codeQuality.techDebt <= 5 ? 'value-success' : analysis.codeQuality.techDebt <= 15 ? 'value-warning' : 'value-danger'}">${analysis.codeQuality.techDebt}%</text>
      </g>
      
      <g>
        <rect x="265" y="270" width="190" height="80" rx="8" class="card-neutral" stroke-width="1"/>
        <text x="280" y="290" class="card-label">Complexity</text>
        <text x="280" y="315" class="card-value">${analysis.codeQuality.complexity}</text>
      </g>
      
      <g>
        <rect x="470" y="270" width="190" height="80" rx="8" class="${['A+', 'A'].includes(analysis.codeQuality.staticAnalysis) ? 'card-success' : 'card-info'}" stroke-width="1"/>
        <text x="485" y="290" class="card-label">Static Analysis</text>
        <text x="485" y="315" class="card-value ${['A+', 'A'].includes(analysis.codeQuality.staticAnalysis) ? 'value-success' : 'value-info'}">${analysis.codeQuality.staticAnalysis}</text>
      </g>
      
      <g>
        <rect x="675" y="270" width="190" height="80" rx="8" class="${analysis.codeQuality.security === 'Passed' ? 'card-success' : 'card-warning'}" stroke-width="1"/>
        <text x="690" y="290" class="card-label">Security</text>
        <text x="690" y="315" class="card-value ${analysis.codeQuality.security === 'Passed' ? 'value-success' : 'value-warning'}">${analysis.codeQuality.security}</text>
      </g>
      
      <!-- Project Activity Section -->
      <use href="#activityIcon" x="60" y="380" width="16" height="16" color="#374151"/>
      <text x="85" y="393" class="section-title">Project Activity &amp; Maintenance</text>
      
      <!-- Activity Cards Row 1 -->
      <g>
        <rect x="60" y="410" width="190" height="80" rx="8" class="${analysis.activity.lastCommit.includes('Today') || analysis.activity.lastCommit.includes('1d') ? 'card-success' : analysis.activity.lastCommit.includes('d ago') && parseInt(analysis.activity.lastCommit) <= 7 ? 'card-info' : 'card-warning'}" stroke-width="1"/>
        <text x="75" y="430" class="card-label">Last Commit</text>
        <text x="75" y="455" class="card-value ${analysis.activity.lastCommit.includes('Today') || analysis.activity.lastCommit.includes('1d') ? 'value-success' : analysis.activity.lastCommit.includes('d ago') && parseInt(analysis.activity.lastCommit) <= 7 ? 'value-info' : 'value-warning'}">${analysis.activity.lastCommit}</text>
      </g>
      
      <g>
        <rect x="265" y="410" width="190" height="80" rx="8" class="card-info" stroke-width="1"/>
        <text x="280" y="430" class="card-label">Commits/Week</text>
        <text x="280" y="455" class="card-value value-info">${analysis.activity.commitsPerWeek}</text>
      </g>
      
      <g>
        <rect x="470" y="410" width="190" height="80" rx="8" class="card-info" stroke-width="1"/>
        <text x="485" y="430" class="card-label">Open PRs</text>
        <text x="485" y="455" class="card-value value-info">${analysis.activity.openPRs}</text>
      </g>
      
      <g>
        <rect x="675" y="410" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
        <text x="690" y="430" class="card-label">PRs Merged</text>
        <text x="690" y="455" class="card-value value-success">${analysis.activity.mergedPRs}</text>
      </g>
      
      <!-- Activity Cards Row 2 -->
      <g>
        <rect x="60" y="510" width="190" height="80" rx="8" class="${analysis.activity.openIssues <= 20 ? 'card-success' : analysis.activity.openIssues <= 100 ? 'card-warning' : 'card-danger'}" stroke-width="1"/>
        <text x="75" y="530" class="card-label">Open Issues</text>
        <text x="75" y="555" class="card-value ${analysis.activity.openIssues <= 20 ? 'value-success' : analysis.activity.openIssues <= 100 ? 'value-warning' : 'value-danger'}">${analysis.activity.openIssues}</text>
      </g>
      
      <g>
        <rect x="265" y="510" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
        <text x="280" y="530" class="card-label">Closed Issues</text>
        <text x="280" y="555" class="card-value value-success">${analysis.activity.closedIssues}</text>
      </g>
      
      <g>
        <rect x="470" y="510" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
        <text x="485" y="530" class="card-label">Response Time</text>
        <text x="485" y="555" class="card-value value-success">${analysis.activity.responseTime}</text>
      </g>
      
      <g>
        <rect x="675" y="510" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
        <text x="690" y="530" class="card-label">Fix Time</text>
        <text x="690" y="555" class="card-value value-success">${analysis.activity.fixTime}</text>
      </g>
      
      <!-- Community Section -->
      <use href="#usersIcon" x="60" y="620" width="16" height="16" color="#374151"/>
      <text x="85" y="633" class="section-title">Community &amp; Contributor Health</text>
      
      <!-- Community Cards -->
      <g>
        <rect x="60" y="650" width="190" height="80" rx="8" class="card-neutral" stroke-width="1"/>
        <text x="75" y="670" class="card-label">Contributors</text>
        <text x="75" y="695" class="card-value">${analysis.community.contributors}</text>
      </g>
      
      <g>
        <rect x="265" y="650" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
        <text x="280" y="670" class="card-label">Active Devs</text>
        <text x="280" y="695" class="card-value value-success">${analysis.community.activeDevs}</text>
      </g>
      
      <g>
        <rect x="470" y="650" width="190" height="80" rx="8" class="${analysis.community.retention >= 75 ? 'card-success' : analysis.community.retention >= 60 ? 'card-info' : 'card-warning'}" stroke-width="1"/>
        <text x="485" y="670" class="card-label">Retention</text>
        <text x="485" y="695" class="card-value ${analysis.community.retention >= 75 ? 'value-success' : analysis.community.retention >= 60 ? 'value-info' : 'value-warning'}">${analysis.community.retention}%</text>
      </g>
      
      <g>
        <rect x="675" y="650" width="190" height="80" rx="8" class="${analysis.community.growth > 0 ? 'card-success' : 'card-neutral'}" stroke-width="1"/>
        <text x="690" y="670" class="card-label">Growth</text>
        <text x="690" y="695" class="card-value ${analysis.community.growth > 0 ? 'value-success' : ''}">${analysis.community.growth > 0 ? '+' : ''}${analysis.community.growth}%</text>
      </g>
      
      <!-- User Engagement Section -->
      <use href="#starIcon" x="60" y="760" width="16" height="16" color="#374151"/>
      <text x="85" y="773" class="section-title">User Engagement</text>
      
      <!-- Engagement Cards -->
      <g>
        <rect x="60" y="790" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
        <text x="75" y="810" class="card-label">Stars</text>
        <text x="75" y="835" class="card-value value-success">${analysis.engagement.stars}</text>
        <use href="#starIcon" x="225" y="800" width="12" height="12" color="#166534"/>
      </g>
      
      <g>
        <rect x="265" y="790" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
        <text x="280" y="810" class="card-label">Forks</text>
        <text x="280" y="835" class="card-value value-success">${analysis.engagement.forks}</text>
      </g>
      
      <g>
        <rect x="470" y="790" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
        <text x="485" y="810" class="card-label">Watchers</text>
        <text x="485" y="835" class="card-value value-success">${analysis.engagement.watchers}</text>
      </g>
      
      <g>
        <rect x="675" y="790" width="190" height="80" rx="8" class="card-neutral" stroke-width="1"/>
        <text x="690" y="810" class="card-label">Discussions</text>
        <text x="690" y="835" class="card-value">${analysis.engagement.discussions}</text>
      </g>
      
      <!-- Release Section -->
      <text x="60" y="913" class="section-title">Release &amp; Versioning</text>
      
      <!-- Release Cards -->
      <g>
        <rect x="60" y="930" width="190" height="80" rx="8" class="card-success" stroke-width="1"/>
        <text x="75" y="950" class="card-label">Latest Release</text>
        <text x="75" y="975" class="card-value value-success">${analysis.releases.latest}</text>
      </g>
      
      <g>
        <rect x="265" y="930" width="190" height="80" rx="8" class="card-neutral" stroke-width="1"/>
        <text x="280" y="950" class="card-label">Releases/Month</text>
        <text x="280" y="975" class="card-value">${analysis.releases.releasesPerMonth}</text>
      </g>
      
      <g>
        <rect x="470" y="930" width="190" height="80" rx="8" class="${analysis.releases.changelog === 'Updated' ? 'card-success' : 'card-neutral'}" stroke-width="1"/>
        <text x="485" y="950" class="card-label">Changelog</text>
        <text x="485" y="975" class="card-value ${analysis.releases.changelog === 'Updated' ? 'value-success' : ''}">${analysis.releases.changelog}</text>
      </g>
      
      <g>
        <rect x="675" y="930" width="190" height="80" rx="8" class="${analysis.releases.semverCompliant ? 'card-success' : 'card-warning'}" stroke-width="1"/>
        <text x="690" y="950" class="card-label">SemVer</text>
        <text x="690" y="975" class="card-value ${analysis.releases.semverCompliant ? 'value-success' : 'value-warning'}">${analysis.releases.semverCompliant ? 'Compliant' : 'Non-standard'}</text>
      </g>
      
      <!-- Health Score -->
      <rect x="60" y="1050" width="780" height="80" rx="12" class="health-score-bg"/>
      <text x="80" y="1075" class="health-score-text" style="font-size: 18px; font-weight: 600;">Project Health Score</text>
      <text x="80" y="1095" class="health-score-text" style="font-size: 13px;">${analysis.healthScore.status} overall health with ${analysis.devEnvironment.languages.length > 0 ? analysis.devEnvironment.languages[0].name : 'multi-language'} codebase</text>
      <text x="720" y="1085" class="health-score-text" style="font-size: 36px; font-weight: 700;">${analysis.healthScore.score}/100</text>
      <text x="750" y="1105" class="health-score-text" style="font-size: 11px;">${analysis.healthScore.readinessLevel}</text>
    </svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate dynamic card metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
