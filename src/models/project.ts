/**
 * Project model representing a FOSS project from GitHub
 */

export interface Project {
  id: number;
  name: string;
  fullName: string;
  description?: string;
  url: string;
  owner: string;
  repository: string;
  language?: string;
  stars: number;
  forks: number;
  openIssues: number;
  lastCommit: Date;
  license?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMetrics {
  owner: string;
  repository: string;
  commitActivity: CommitActivity[];
  contributors: Contributor[];
  issueStats: IssueStats;
  pullRequestStats: PullRequestStats;
  documentation: DocumentationCheck;
  measuredAt: Date;
}

export interface CommitActivity {
  week: number; // Unix timestamp
  total: number;
  days: number[]; // 7 days array
}

export interface Contributor {
  login: string;
  contributions: number;
  type: string;
}

export interface IssueStats {
  total: number;
  open: number;
  closed: number;
  averageCloseTime: number; // in days
}

export interface PullRequestStats {
  total: number;
  open: number;
  closed: number;
  merged: number;
  averageMergeTime: number; // in days
}

export interface DocumentationCheck {
  hasReadme: boolean;
  hasLicense: boolean;
  hasContributing: boolean;
  hasChangelog: boolean;
  hasCodeOfConduct: boolean;
}

export interface ProjectHealth {
  owner: string;
  repository: string;
  overallScore: number;
  scores: {
    activity: number;
    community: number;
    maintenance: number;
    documentation: number;
  };
  recommendations: string[];
  calculatedAt: Date;
}

export interface AdvancedProjectAnalysis {
  // Basic Project Info
  project: Project;
  
  // Quality Metrics
  codeQuality: {
    buildStatus: 'Passing' | 'Failing' | 'Unknown';
    testCoverage: number;
    linting: 'Clean' | 'Issues' | 'None';
    codeSmells: number;
    techDebt: number;
    complexity: number;
    staticAnalysis: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
    security: 'Passed' | 'Issues' | 'Unknown';
  };

  // Activity Metrics
  activity: {
    lastCommit: string;
    commitsPerWeek: number;
    openPRs: number;
    mergedPRs: number;
    openIssues: number;
    closedIssues: number;
    responseTime: string;
    fixTime: string;
  };

  // Community Metrics
  community: {
    contributors: number;
    activeDevs: number;
    retention: number;
    growth: number;
  };

  // User Engagement
  engagement: {
    stars: string;
    forks: string;
    watchers: string;
    discussions: number;
  };

  // Release Information
  releases: {
    latest: string;
    releasesPerMonth: number;
    changelog: 'Updated' | 'Outdated' | 'None';
    semverCompliant: boolean;
  };

  // Development Environment Analysis
  devEnvironment: {
    cicd: CICDInfo;
    testing: TestingInfo;
    linting: LintingInfo;
    dependencies: DependencyInfo;
    languages: LanguageInfo[];
  };

  // Overall Health Score
  healthScore: {
    score: number;
    status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    readinessLevel: 'Production Ready' | 'Development' | 'Experimental';
  };
}

export interface CICDInfo {
  hasGitHubActions: boolean;
  hasTravisCI: boolean;
  hasCircleCI: boolean;
  hasJenkins: boolean;
  hasOther: boolean;
  buildStatus: 'Passing' | 'Failing' | 'Unknown';
  workflows: string[];
}

export interface TestingInfo {
  hasTests: boolean;
  testDirectories: string[];
  testFrameworks: string[];
  estimatedCoverage: number;
  testFiles: number;
}

export interface LintingInfo {
  hasESLint: boolean;
  hasPylint: boolean;
  hasPrettier: boolean;
  hasRubocop: boolean;
  hasGolangci: boolean;
  hasOther: string[];
  configFiles: string[];
}

export interface DependencyInfo {
  packageManager: string;
  totalDependencies: number;
  devDependencies: number;
  outdatedDependencies: number;
  vulnerabilities: number;
  dependencyFiles: string[];
  detectedLanguages?: string[];
}

export interface LanguageInfo {
  name: string;
  percentage: number;
  bytes: number;
}

export interface GitHubWorkflow {
  id: number;
  name: string;
  path: string;
  state: string;
}

export interface GitHubWorkflowRun {
  id: number;
  status: string;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  published_at: string;
  prerelease: boolean;
}
