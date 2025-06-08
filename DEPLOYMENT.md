# Deployment Guide

## Vercel Deployment

This project is configured for deployment on Vercel with the following setup:

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Integration**: Connect your Vercel account to GitHub
3. **Environment Variables**: Set up the following in Vercel dashboard:
   - `GITHUB_TOKEN` (optional) - GitHub Personal Access Token for higher rate limits
   - `NODE_ENV` - Set to `production`
   - `CORS_ORIGINS` - Comma-separated list of allowed origins
   - `CACHE_TTL` - Cache time-to-live in milliseconds (default: 300000)
   - `CACHE_MAX_SIZE` - Maximum cache size (default: 1000)

### GitHub Secrets for CI/CD

Add these secrets to your GitHub repository settings:

```bash
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_organization_id
VERCEL_PROJECT_ID=your_project_id
```

To get these values:
1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel login` and authenticate
3. Run `vercel link` in your project directory
4. Check `.vercel/project.json` for org and project IDs
5. Create a token at https://vercel.com/account/tokens

### Deployment Configuration

The project includes:

- **`vercel.json`**: Vercel configuration file
- **`api/index.ts`**: Serverless function entry point
- **`api/health.ts`**: Health check endpoint
- **GitHub Actions**: Automated deployment on main branch merge

### Deployment Process

1. **Automatic Deployment**: 
   - Push to `main` branch triggers automatic deployment
   - GitHub Actions runs tests, builds Docker image, and deploys to Vercel

2. **Manual Deployment**:
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

### API Endpoints (Vercel)

- **Health Check**: `https://your-app.vercel.app/api/health`
- **API Info**: `https://your-app.vercel.app/api/`

Note: Full API functionality is available via Docker deployment. Vercel deployment provides basic endpoints for demonstration.

### Local Testing

Test the Vercel functions locally:

```bash
npm install -g vercel
vercel dev
```

## Docker Deployment (Full Functionality)

For complete API functionality, use Docker deployment:

```bash
# Build the image
docker build -t foss-vital .

# Run the container
docker run -p 3000:3000 -e GITHUB_TOKEN=your_token foss-vital

# Using docker-compose
docker-compose up
```

### Production Docker Deployment

1. **Build and push to registry**:
   ```bash
   docker build -t your-registry/foss-vital:latest .
   docker push your-registry/foss-vital:latest
   ```

2. **Deploy on your server**:
   ```bash
   docker run -d \
     --name foss-vital \
     -p 3000:3000 \
     -e NODE_ENV=production \
     -e GITHUB_TOKEN=your_token \
     -e CORS_ORIGINS=https://yourdomain.com \
     --restart unless-stopped \
     your-registry/foss-vital:latest
   ```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Environment | `development` | No |
| `GITHUB_TOKEN` | GitHub API token | - | Recommended |
| `GITHUB_API_URL` | GitHub API URL | `https://api.github.com` | No |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` | No |
| `CACHE_TTL` | Cache TTL in ms | `300000` | No |
| `CACHE_MAX_SIZE` | Max cache items | `1000` | No |

## Troubleshooting

### Vercel Build Issues

1. **"No Output Directory named 'public' found"**:
   - This is resolved by the `vercel.json` configuration
   - Ensure `api/` directory exists with TypeScript files

2. **Module import errors**:
   - Check that all dependencies are in `package.json`
   - Verify TypeScript compilation works: `npm run build`

3. **Timeout issues**:
   - Vercel has a 10-second timeout for serverless functions
   - Consider using Docker deployment for long-running processes

### Docker Build Issues

1. **Build context too large**:
   - Check `.dockerignore` file
   - Exclude `node_modules/`, `dist/`, and `.git/`

2. **TypeScript compilation errors**:
   - Run `npm run build` locally first
   - Check `tsconfig.json` configuration

## Monitoring

- **Vercel**: Use Vercel dashboard for function logs and analytics
- **Docker**: Use `docker logs container-name` for application logs
- **Health Check**: Monitor `/health` endpoint for service status
