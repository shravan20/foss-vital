/**
 * In-memory cache service for GitHub API responses
 */

import { appConfig } from '../config/app.js';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheService {
  private cache: Map<string, CacheItem<any>>;
  private readonly maxSize: number;
  private readonly defaultTtl: number;

  constructor() {
    this.cache = new Map();
    this.maxSize = appConfig.cache.maxSize;
    this.defaultTtl = appConfig.cache.ttl;
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    // If cache is at max size, remove oldest item
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const item: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl,
    };

    this.cache.set(key, item);
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Delete a value from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      defaultTtl: this.defaultTtl,
    };
  }

  /**
   * Clean up expired items
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Generate a cache key for repository data
   */
  static getRepoKey(owner: string, repo: string): string {
    return `repo:${owner}/${repo}`;
  }

  /**
   * Generate a cache key for repository metrics
   */
  static getMetricsKey(owner: string, repo: string): string {
    return `metrics:${owner}/${repo}`;
  }

  /**
   * Generate a cache key for health data
   */
  static getHealthKey(owner: string, repo: string): string {
    return `health:${owner}/${repo}`;
  }
}

// Global cache instance
export const cache = new CacheService();

// Clean up expired items every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);
