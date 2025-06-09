# FOSS Vital

Your FOSS project's health report - A clean, simple API for fetching GitHub repository data with intelligent caching and health scoring. **Successfully migrated from Hono to Express.js for reliable Vercel deployment!**

## ✅ Migration Complete

This project has been successfully converted from Hono.js to Express.js with the following improvements:

- 🔄 **Migrated from Hono to Express.js** - More stable and widely supported
- 🗑️ **Cleaned up dependencies** - Removed unnecessary packages (biome, hono)
- 📁 **Consolidated routes** - All routes moved to single Express app file
- 🚀 **Simplified deployment** - Works with standard Vercel Node.js runtime
- 🧹 **Removed unnecessary files** - Cleaner project structure

## Features

- 🚀 **Fast & Reliable**: Built with Express.js and TypeScript
- 📊 **Health Scoring**: Comprehensive project health calculation based on activity, community, maintenance, and documentation
- ⚡ **Smart Caching**: In-memory caching with TTL to minimize GitHub API calls
- 🔧 **No Database**: System-level caching only, no database dependencies
- 📈 **Rich Metrics**: Fetch detailed project metrics from GitHub API
- 🌐 **REST API**: Clean, documented API endpoints
- ⚡ **Easy Deployment**: One-command deployment to Vercel Functions

## API Endpoints

### Projects
- `GET /api/projects/:owner/:repo` - Get basic project information
- `GET /api/projects/:owner/:repo/complete` - Get project with health data
- `GET /api/projects/:owner/:repo/metrics` - Get detailed project metrics

### Health
- `GET /api/health/:owner/:repo` - Get project health score
- `POST /api/health/:owner/:repo/refresh` - Force refresh health calculation
- `GET /api/health/cache/stats` - Get cache statistics

### System
- `GET /` - API information
- `GET /health` - Health check

## Quick Start

### Deploy to Vercel (Recommended)

1. Clone and setup:
```bash
git clone https://github.com/your-username/foss-vital.git
cd foss-vital
npm install
```

2. Deploy to Vercel:
```bash
npm run deploy
```

### Local Development

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Example Usage

```bash
# Get project information
curl "http://localhost:3000/api/projects/honojs/hono"

# Get project health score
curl "http://localhost:3000/api/health/honojs/hono"

# Get complete project data with health
curl "http://localhost:3000/api/projects/honojs/hono/complete"
```

## Health Scoring Algorithm

Projects are scored across four dimensions:

- **Activity (30%)**: Commit frequency, issue resolution time, PR merge time
- **Community (25%)**: Number of contributors, contribution distribution
- **Maintenance (25%)**: Issue close rate, PR merge rate
- **Documentation (20%)**: README, LICENSE, CONTRIBUTING guide, etc.

Each dimension is scored 0-100, and the overall score is a weighted average.

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins (comma-separated) |
| `GITHUB_TOKEN` | - | GitHub personal access token (optional, for higher rate limits) |
| `GITHUB_API_URL` | `https://api.github.com` | GitHub API base URL |
| `CACHE_TTL` | `300000` | Cache TTL in milliseconds (5 minutes) |
| `CACHE_MAX_SIZE` | `1000` | Maximum number of cached items |

## Project Structure

```
api/                         # Vercel serverless functions
├── index.ts                 # Main API handler (simplified)
├── health.ts               # Health check endpoint
└── projects.ts             # Basic project info endpoint

src/                         # Full application (Docker)
├── index.ts                 # Application entry point
├── config/
│   └── app.ts              # Application configuration
├── models/
│   └── project.ts          # Project data models
├── routes/
│   ├── projects.ts         # Project API routes
│   └── health.ts           # Health API routes
├── services/
│   ├── cache.ts            # In-memory caching service
│   ├── github.ts           # GitHub API integration
│   ├── project.ts          # Project orchestration service
│   └── health-calculator.ts # Health scoring algorithm
└── utils/
    └── logger.ts           # Logging utility
```

## Deployment Options

### 1. Vercel Serverless (Quick Start)

**Features**: Basic repository info, health checks
**Limitations**: No health scoring, no caching, simplified API

```bash
# Automatic via GitHub integration
git push origin main
```

**Endpoints**:
- `GET /api/health` - Health check
- `GET /api/projects/:owner/:repo` - Basic project info

### 2. Docker Deployment (Full Features)

**Features**: Complete API, health scoring, intelligent caching
**Recommended for**: Production use, advanced features

```bash
# Build and run
docker build -t foss-vital .
docker run -p 3000:3000 foss-vital
```

**Endpoints**: All API endpoints with full functionality

## Building for Production

```bash
# Build the project
npm run build

# Start production server
npm start
```

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### Using Docker directly

```bash
# Build the image
docker build -t foss-vital .

# Run the container
docker run -d \
  --name foss-vital \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e GITHUB_TOKEN=your_token_here \
  foss-vital

# View logs
docker logs -f foss-vital
```

## Testing

Run the comprehensive test suite:

```bash
# Make sure the server is running, then:
npm test

# Or run the test script directly:
./test-api.sh
```

## Code Quality

Run Biome to check and format the codebase:

```bash
npm run check
npm run format
```

## Deployment

### Vercel Deployment (Serverless)

1. **Connect to Vercel**:
   - Import your GitHub repository to Vercel
   - Vercel will automatically detect the project configuration

2. **Set Environment Variables** in Vercel Dashboard:
   ```
   NODE_ENV=production
   GITHUB_TOKEN=your_github_token (optional but recommended)
   CORS_ORIGINS=https://your-domain.com
   ```

3. **Deploy**:
   - Push to `main` branch for automatic deployment
   - Or deploy manually: `vercel --prod`

**Vercel Endpoints**:
- Health: `https://your-app.vercel.app/api/health`
- API Info: `https://your-app.vercel.app/api/`

### Docker Deployment (Full Functionality)

For complete API functionality, use Docker:

```bash
# Production deployment
docker build -t foss-vital .
docker run -d -p 3000:3000 --name foss-vital \
  -e NODE_ENV=production \
  -e GITHUB_TOKEN=your_token \
  foss-vital
```

### CI/CD Pipeline

The project includes GitHub Actions workflow that:
- Runs tests on multiple Node.js versions
- Builds and tests Docker images
- Deploys to Vercel on main branch merges

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## License

MIT License - see [LICENSE](LICENSE) file for details.
