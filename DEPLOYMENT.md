# Deployment Guide

This guide covers deploying FOSS Vital to various platforms.

## Prerequisites

FOSS Vital requires the following to be available in the deployment environment:

- **Node.js** (version 20.x or later)
- **Git** (for clone-based repository analysis)
- **Write access** to temporary directories (for repository clones)

## Quick Deploy to Vercel (Recommended)

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shravan20/foss-vital&env=GITHUB_TOKEN&envDescription=Optional%20GitHub%20token%20for%20higher%20rate%20limits&project-name=foss-vital&repository-name=foss-vital)

### Manual Vercel Deployment

1. **Fork this repository** to your GitHub account

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your forked repository
   - Vercel will automatically detect the configuration

3. **Configure Environment Variables** (Optional but recommended):

   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   NODE_ENV=production
   ```

4. **Deploy**:
   - Click "Deploy"
   - Your API will be live at `https://your-project.vercel.app`

### Local Development

```bash
# Clone your fork
git clone https://github.com/shravan20/foss-vital.git
cd foss-vital

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_TOKEN` | No | - | GitHub Personal Access Token for higher rate limits |
| `NODE_ENV` | No | `development` | Environment mode |
| `CORS_ORIGINS` | No | `*` | Allowed CORS origins (comma-separated) |
| `PORT` | No | `3000` | Server port (local development only) |

### Creating a GitHub Token

1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "FOSS Vital API"
4. Select scopes: `public_repo` (for public repositories)
5. Copy the token and add it to your Vercel environment variables

## API Endpoints

Once deployed, your API will have these endpoints:

- `GET /` - API information
- `GET /health` - Health check
- `GET /api/projects/:owner/:repo` - Get project information
- `GET /api/projects/:owner/:repo/complete` - Get project with health data
- `GET /api/projects/:owner/:repo/metrics` - Get detailed metrics
- `GET /api/health/:owner/:repo` - Get project health score
- `POST /api/health/:owner/:repo/refresh` - Refresh health calculation
- `GET /api/health/cache/stats` - Cache statistics

## Example Usage

```bash
# Replace 'your-project.vercel.app' with your actual deployment URL

# Get project info
curl "https://your-project.vercel.app/api/projects/facebook/react"

# Get health score
curl "https://your-project.vercel.app/api/health/facebook/react"

# Get complete project data
curl "https://your-project.vercel.app/api/projects/facebook/react/complete"
```

## Custom Domain (Optional)

1. In your Vercel dashboard, go to your project
2. Click "Domains" tab
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

## Monitoring and Logs

- **Vercel Dashboard**: Monitor deployments, view logs, and analytics
- **Function Logs**: Available in real-time in the Vercel dashboard
- **Health Check**: Use `/health` endpoint for uptime monitoring

## Rate Limits

- **Without GitHub Token**: 60 requests per hour per IP
- **With GitHub Token**: 5,000 requests per hour
- **Recommendation**: Always use a GitHub token for production deployments

## Troubleshooting

### Common Issues

1. **API returning 403 errors**: Add a GitHub token to increase rate limits
2. **CORS errors**: Configure `CORS_ORIGINS` environment variable
3. **Function timeout**: Vercel functions have a 10-second timeout limit

### Getting Help

- Check the [GitHub Issues](https://github.com/shravan20/foss-vital/issues)
- Review Vercel function logs in the dashboard
- Ensure your GitHub token has the correct permissions

## Security Notes

- Never commit your `.env` file or expose your GitHub token
- Use environment variables for all sensitive configuration
- The API is read-only and doesn't store any data
- All caching is done in-memory and resets with each deployment
