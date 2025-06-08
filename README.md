# FOSS Vital

Your FOSS project's health report - A clean API boilerplate for fetching GitHub repository data with intelligent caching and health scoring.

## Features

- 🚀 **Fast & Modern**: Built with Hono.js and TypeScript
- 📊 **Health Scoring**: Comprehensive project health calculation based on activity, community, maintenance, and documentation
- ⚡ **Smart Caching**: In-memory caching with TTL to minimize GitHub API calls
- 🔧 **No Database**: System-level caching only, no database dependencies
- 📈 **Rich Metrics**: Fetch detailed project metrics from GitHub API
- 🌐 **REST API**: Clean, documented API endpoints

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

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/foss-vital.git
cd foss-vital

# Install dependencies
npm install
```

### Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. (Optional) Add your GitHub token for higher rate limits:
```bash
GITHUB_TOKEN=your_github_personal_access_token_here
```

### Development

Start the development server:
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
src/
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

## License

MIT License - see [LICENSE](LICENSE) file for details.
