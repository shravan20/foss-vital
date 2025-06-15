/**
 * rate limiter utility for GitHub API calls
 */

import { appConfig } from '../config/app.js';
import { logger } from './logger.js';

interface RateLimitState {
  remaining: number;
  reset: number;
  limit: number;
  used: number;
}

class RateLimiter {
  private state: RateLimitState;
  private lastCheck: number;
  private requestQueue: Array<() => void> = [];
  private isProcessingQueue = false;

  constructor() {
    this.state = {
      remaining: appConfig.github.token ? 5000 : 60, // GitHub API limits
      reset: Date.now() + 3600000, // 1 hour from now
      limit: appConfig.github.token ? 5000 : 60,
      used: 0
    };
    this.lastCheck = Date.now();
  }

  /**
   * Update rate limit state from GitHub API response headers
   */
  updateFromHeaders(headers: Record<string, string>): void {
    if (headers['x-ratelimit-remaining']) {
      this.state.remaining = parseInt(headers['x-ratelimit-remaining']);
    }
    if (headers['x-ratelimit-reset']) {
      this.state.reset = parseInt(headers['x-ratelimit-reset']) * 1000; // Convert to milliseconds
    }
    if (headers['x-ratelimit-limit']) {
      this.state.limit = parseInt(headers['x-ratelimit-limit']);
    }
    if (headers['x-ratelimit-used']) {
      this.state.used = parseInt(headers['x-ratelimit-used']);
    }
    this.lastCheck = Date.now();
  }

  /**
   * Check if we can make a request now
   */
  canMakeRequest(): boolean {
    // Reset if time has passed
    if (Date.now() > this.state.reset) {
      this.state.remaining = this.state.limit;
      this.state.used = 0;
      this.state.reset = Date.now() + 3600000;
    }

    return this.state.remaining > 0;
  }

  /**
   * Wait for rate limit to reset if needed
   */
  async waitIfNecessary(): Promise<void> {
    if (this.canMakeRequest()) {
      return;
    }

    const waitTime = Math.max(0, this.state.reset - Date.now());
    if (waitTime > 0) {
      logger.info(`Rate limit exceeded, waiting ${Math.ceil(waitTime / 1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Execute a request with rate limiting
   */
  async executeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          await this.waitIfNecessary();
          const result = await requestFn();
          this.state.remaining--;
          this.state.used++;
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await request();
        
        // Small delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Get current rate limit status
   */
  getStatus(): RateLimitState & { timeUntilReset: number } {
    return {
      ...this.state,
      timeUntilReset: Math.max(0, this.state.reset - Date.now())
    };
  }

  /**
   * Check if we're close to hitting rate limits
   */
  isNearLimit(): boolean {
    const percentage = (this.state.limit - this.state.remaining) / this.state.limit;
    return percentage > 0.8; // 80% of limit used
  }

  /**
   * Get recommended cache TTL based on rate limit status
   */
  getRecommendedCacheTTL(): number {
    if (this.isNearLimit()) {
      return 30 * 60 * 1000; // 30 minutes if near limit
    }
    if (this.state.remaining < 100) {
      return 20 * 60 * 1000; // 20 minutes if low
    }
    return 15 * 60 * 1000; // 15 minutes default
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

/**
 * Decorator to add rate limiting to GitHub API methods
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: any[]) => {
    return rateLimiter.executeRequest(() => fn(...args));
  }) as T;
}
