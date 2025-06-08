/**
 * Main API entry point for Vercel
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Import dynamically to handle ES modules
  try {
    const { Hono } = await import('hono');
    const { cors } = await import('hono/cors');
    const { prettyJSON } = await import('hono/pretty-json');

    const app = new Hono();

    // Middleware
    app.use('*', cors({
      origin: ['*'], // Allow all origins for Vercel deployment
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    }));
    app.use('*', prettyJSON());

    // Health check endpoint
    app.get('/health', (c) => {
      return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        environment: 'vercel',
      });
    });

    // API information endpoint
    app.get('/', (c) => {
      return c.json({
        name: 'FOSS Vital API',
        description: 'GitHub API boilerplate with intelligent caching and health scoring',
        version: '1.0.0',
        environment: 'vercel',
        endpoints: {
          health: '/api/health',
          info: '/api/',
        },
        note: 'Full API functionality available via Docker deployment'
      });
    });

    // Handle any other route
    app.all('*', (c) => {
      return c.json({
        message: 'FOSS Vital API - Vercel Deployment',
        path: c.req.path,
        method: c.req.method,
        note: 'For full API functionality, use the Docker deployment'
      });
    });

    // Create a proper URL for the request
    const url = new URL(req.url || '/', `https://${req.headers.host}`);
    
    // Remove /api prefix from pathname for internal routing
    const pathname = url.pathname.replace(/^\/api/, '') || '/';
    url.pathname = pathname;
    
    const request = new Request(url.toString(), {
      method: req.method || 'GET',
      headers: req.headers as HeadersInit,
      body: req.method !== 'GET' && req.method !== 'HEAD' && req.body 
        ? JSON.stringify(req.body) 
        : undefined,
    });

    const response = await app.fetch(request);
    
    // Set response status
    res.status(response.status);
    
    // Copy headers
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, value);
      }
    }
    
    // Send response body
    const body = await response.text();
    res.send(body);
  } catch (error) {
    console.error('Vercel handler error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      environment: 'vercel'
    });
  }
}
