import fetch from 'node-fetch';
import { logger } from '../src/utils/logger.js';

const BASE_URL = 'http://localhost:3001';

async function testEndpoint(endpoint, description) {
  logger.info(`\nTesting: ${description}`);
  logger.info(`Endpoint: ${endpoint}`);

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    if (response.ok) {
      logger.info('Success!');

      // Show relevant parts of the response
      if (endpoint.includes('rate-limit/status')) {
        logger.info(`   Rate Limit: ${data.remaining}/${data.limit} remaining`);
        logger.info(`   Time until reset: ${data.timeUntilResetFormatted}`);
        logger.info(`   Near limit: ${data.isNearLimit ? 'Yes' : 'No'}`);
      } else if (endpoint.includes('cache/stats')) {
        logger.info(`   Cache size: ${data.size}/${data.maxSize}`);
        logger.info(`   Default TTL: ${data.defaultTtl}ms`);
      } else if (endpoint.includes('analysis')) {
        logger.info(`   Project: ${data.project?.name || 'N/A'}`);
        logger.info(`   Build Status: ${data.codeQuality?.buildStatus || 'N/A'}`);
        logger.info(`   Test Coverage: ${data.codeQuality?.testCoverage || 'N/A'}%`);
        logger.info(`   Dependencies: ${data.dependencies?.totalDependencies || 'N/A'}`);
      } else if (endpoint.includes('card-metrics')) {
        logger.info(`   SVG Card generated successfully (${response.headers.get('content-type')})`);
      } else {
        logger.info(`   Response keys: ${Object.keys(data).join(', ')}`);
      }
    } else {
      logger.error(`Error: ${response.status} ${response.statusText}`);
      logger.error(`   Message: ${data.message || data.error || 'Unknown error'}`);
    }
  } catch (error) {
    logger.error(`Request failed: ${error.message}`);
  }
}

async function runTests() {
  logger.info('FOSS Vital Enhanced Features Test Suite');
  logger.info('==========================================');

  // Test basic API info
  await testEndpoint(`${BASE_URL}/api`, 'API Information & Endpoints');

  // Test rate limiting status
  await testEndpoint(`${BASE_URL}/api/rate-limit/status`, 'GitHub API Rate Limit Status');

  // Test cache statistics
  await testEndpoint(`${BASE_URL}/api/health/cache/stats`, 'Cache Statistics');

  // Test enhanced analysis (may fail due to rate limiting)
  await testEndpoint(`${BASE_URL}/api/projects/facebook/react/analysis`, 'Enhanced Project Analysis');

  // Test dynamic SVG card generation
  await testEndpoint(`${BASE_URL}/api/projects/facebook/react/card-metrics`, 'Dynamic SVG Card Generation');

}

runTests().catch(logger.error);
