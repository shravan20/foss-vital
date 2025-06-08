/**
 * Health calculator service for determining project health scores
 */

import type { ProjectMetrics, ProjectHealth } from '../models/project.js';

export interface HealthWeights {
  activity: number;
  community: number;
  maintenance: number;
  documentation: number;
}

export class HealthCalculatorService {
  private readonly weights: HealthWeights = {
    activity: 0.30,
    community: 0.25,
    maintenance: 0.25,
    documentation: 0.20,
  };

  calculateHealth(metrics: ProjectMetrics): ProjectHealth {
    const scores = {
      activity: this.calculateActivityScore(metrics),
      community: this.calculateCommunityScore(metrics),
      maintenance: this.calculateMaintenanceScore(metrics),
      documentation: this.calculateDocumentationScore(metrics),
    };

    const overallScore = this.calculateOverallScore(scores);
    const recommendations = this.generateRecommendations(scores, metrics);

    return {
      owner: metrics.owner,
      repository: metrics.repository,
      overallScore,
      scores,
      recommendations,
      calculatedAt: new Date(),
    };
  }

  private calculateActivityScore(metrics: ProjectMetrics): number {
    const { commitActivity, issueStats, pullRequestStats } = metrics;
    
    let score = 0;

    // Commit activity (40% of activity score)
    const recentCommits = Array.isArray(commitActivity) ? 
      commitActivity.slice(-12).reduce((sum, week) => sum + week.total, 0) : 0;
    if (recentCommits > 100) score += 40;
    else if (recentCommits > 50) score += 30;
    else if (recentCommits > 20) score += 20;
    else if (recentCommits > 5) score += 10;
    else score += 5;

    // Issue resolution (30% of activity score)
    if (issueStats.averageCloseTime < 7) score += 30;
    else if (issueStats.averageCloseTime < 30) score += 20;
    else if (issueStats.averageCloseTime < 90) score += 10;
    else score += 5;

    // PR merge time (30% of activity score)
    if (pullRequestStats.averageMergeTime < 3) score += 30;
    else if (pullRequestStats.averageMergeTime < 7) score += 20;
    else if (pullRequestStats.averageMergeTime < 14) score += 10;
    else score += 5;

    return Math.min(100, score);
  }

  private calculateCommunityScore(metrics: ProjectMetrics): number {
    const { contributors } = metrics;
    
    let score = 0;

    // Contributor count (60% of community score)
    const contributorCount = contributors.length;
    if (contributorCount > 50) score += 60;
    else if (contributorCount > 20) score += 45;
    else if (contributorCount > 10) score += 35;
    else if (contributorCount > 5) score += 25;
    else if (contributorCount > 1) score += 15;
    else score += 5;

    // Contributor diversity (40% of community score)
    if (contributors.length > 0) {
      const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0);
      const topContributorRatio = contributors[0]?.contributions / totalContributions || 1;
      
      if (topContributorRatio < 0.5) score += 40;
      else if (topContributorRatio < 0.7) score += 30;
      else if (topContributorRatio < 0.8) score += 20;
      else score += 10;
    }

    return Math.min(100, score);
  }

  private calculateMaintenanceScore(metrics: ProjectMetrics): number {
    const { issueStats, pullRequestStats } = metrics;
    
    let score = 0;

    // Issue maintenance (50% of maintenance score)
    const issueCloseRate = issueStats.total > 0 ? issueStats.closed / issueStats.total : 0;
    if (issueCloseRate > 0.8) score += 50;
    else if (issueCloseRate > 0.6) score += 35;
    else if (issueCloseRate > 0.4) score += 25;
    else if (issueCloseRate > 0.2) score += 15;
    else score += 5;

    // PR maintenance (50% of maintenance score)
    const prMergeRate = pullRequestStats.total > 0 ? pullRequestStats.merged / pullRequestStats.total : 0;
    if (prMergeRate > 0.8) score += 50;
    else if (prMergeRate > 0.6) score += 35;
    else if (prMergeRate > 0.4) score += 25;
    else if (prMergeRate > 0.2) score += 15;
    else score += 5;

    return Math.min(100, score);
  }

  private calculateDocumentationScore(metrics: ProjectMetrics): number {
    const { hasReadme, hasLicense, hasContributing, hasChangelog, hasCodeOfConduct } = metrics.documentation;

    let score = 0;

    if (hasReadme) score += 35;
    if (hasLicense) score += 25;
    if (hasContributing) score += 20;
    if (hasChangelog) score += 10;
    if (hasCodeOfConduct) score += 10;

    return score;
  }

  private calculateOverallScore(scores: HealthWeights): number {
    return Math.round(
      scores.activity * this.weights.activity +
      scores.community * this.weights.community +
      scores.maintenance * this.weights.maintenance +
      scores.documentation * this.weights.documentation
    );
  }

  private generateRecommendations(scores: HealthWeights, metrics: ProjectMetrics): string[] {
    const recommendations: string[] = [];

    if (scores.activity < 60) {
      recommendations.push('Increase commit frequency and reduce issue/PR resolution time');
    }

    if (scores.community < 60) {
      recommendations.push('Encourage more contributors and improve project visibility');
    }

    if (scores.maintenance < 60) {
      recommendations.push('Improve issue and pull request management');
    }

    if (scores.documentation < 60) {
      const missing: string[] = [];
      if (!metrics.documentation.hasReadme) missing.push('README');
      if (!metrics.documentation.hasLicense) missing.push('LICENSE');
      if (!metrics.documentation.hasContributing) missing.push('CONTRIBUTING guide');
      if (!metrics.documentation.hasChangelog) missing.push('CHANGELOG');
      if (!metrics.documentation.hasCodeOfConduct) missing.push('Code of Conduct');
      
      if (missing.length > 0) {
        recommendations.push(`Add missing documentation: ${missing.join(', ')}`);
      }
    }

    return recommendations;
  }
}
