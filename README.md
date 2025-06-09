# FOSS Vital

Your FOSS project's health report - A clean, simple API for fetching GitHub repository data with intelligent caching and health scoring.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shravan20/foss-vital&env=GITHUB_TOKEN&envDescription=Optional%20GitHub%20token%20for%20higher%20rate%20limits&project-name=foss-vital&repository-name=foss-vital)

## Features

- **Fast & Reliable**: Built with Express.js and TypeScript
- **Health Scoring**: Comprehensive project health calculation
- **Smart Caching**: In-memory caching with TTL to minimize GitHub API calls
- **No Database**: Simple deployment with no database dependencies
- **Rich Metrics**: Fetch detailed project metrics from GitHub API
- **REST API**: Clean, documented API endpoints
- **Easy Deployment**: One-click deployment to Vercel

## Quick Start

### Deploy in 30 seconds

1. Click the deploy button above
2. Connect your GitHub account
3. Configure environment variables (optional)
4. Your API is live!

### Local Development

```bash
git clone https://github.com/shravan20/foss-vital.git
cd foss-vital
npm install
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/api/projects/:owner/:repo` | GET | Basic project information |
| `/api/projects/:owner/:repo/complete` | GET | Project with health data |
| `/api/projects/:owner/:repo/metrics` | GET | Detailed project metrics |
| `/api/health/:owner/:repo` | GET | Project health score |
| `/api/health/:owner/:repo/refresh` | POST | Force refresh health calculation |
| `/api/health/cache/stats` | GET | Cache statistics |

## Example Usage

```bash
# Get project information
curl "https://your-deployment.vercel.app/api/projects/facebook/react"

# Get project health score
curl "https://your-deployment.vercel.app/api/health/facebook/react"

# Get complete project data with health
curl "https://your-deployment.vercel.app/api/projects/facebook/react/complete"
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
| `GITHUB_TOKEN` | - | GitHub personal access token (recommended for higher rate limits) |
| `NODE_ENV` | `development` | Environment mode |
| `CORS_ORIGINS` | `*` | Allowed CORS origins (comma-separated) |
| `PORT` | `3000` | Server port (local development only) |

## Project Structure

```
api/
├── index.ts                 # Main API handler for Vercel
src/
├── config/
│   └── app.ts              # Application configuration
├── models/
│   └── project.ts          # Project data models
├── services/
│   ├── cache.ts            # In-memory caching service
│   ├── github.ts           # GitHub API integration
│   ├── project.ts          # Project orchestration service
│   └── health-calculator.ts # Health scoring algorithm
└── utils/
    └── logger.ts           # Logging utility
```

## Deployment

### Vercel (Recommended)

1. **One-click deploy**: Use the button at the top of this README
2. **Manual deploy**: Follow the [Deployment Guide](DEPLOYMENT.md)

### Local Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview with Vercel CLI
```

## Rate Limits

- **Without GitHub Token**: 60 requests/hour per IP
- **With GitHub Token**: 5,000 requests/hour
- **Recommendation**: Always use a GitHub token for production

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Need help?** Check out the [Deployment Guide](DEPLOYMENT.md) or [open an issue](https://github.com/shravan20/foss-vital/issues).
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
