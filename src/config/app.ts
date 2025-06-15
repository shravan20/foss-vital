/**
 * Application configuration
 */
export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigins: string[];
  github: {
    token?: string;
    apiUrl: string;
  };
  cache: {
    ttl: number; // Time to live in milliseconds
    maxSize: number; // Maximum number of cached items
  };
}

export const appConfig: AppConfig = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  github: {
    token: process.env.GITHUB_TOKEN,
    apiUrl: process.env.GITHUB_API_URL || 'https://api.github.com',
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '259200000'), // 3 days default
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '10000'), // 10000 items max
  },
};

export const isDevelopment = appConfig.nodeEnv === 'development';
export const isProduction = appConfig.nodeEnv === 'production';
