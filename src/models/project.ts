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
