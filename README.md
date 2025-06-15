# FOSS Vital

Your FOSS project's health report as README card!

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shravan20/foss-vital&env=GITHUB_TOKEN&envDescription=Optional%20GitHub%20token%20for%20higher%20rate%20limits&project-name=foss-vital&repository-name=foss-vital)

</div>

<p align="center">
    <img src="https://madewithlove.now.sh/in?heart=true&colorA=%23ff671f&colorB=%23046a38&text=the+Quantum+Realm+of+Open+Source" alt="Made with love with Open Source"/>
</p>

## Features

- **GitHub Integration**: Fetch project data from GitHub API
- **Health Scoring**: Comprehensive project health calculation
- **Smart Caching**: In-memory caching with TTL to minimize GitHub API calls
- **Rich Metrics**: Fetch detailed project metrics from GitHub API
- **REST API**: Clean, documented API endpoints
- **Easy Deployment**: One-click deployment to Vercel
- **Open Source**: MIT licensed, free for all

## Roadmap

- [x] GitHub integration
- [x] Health scoring
- [x] In memory caching
- [x] REST API
- [x] One-click deployment
- [ ] Cache with Free Cloudflare Cache
- [ ] Documentation
- [ ] Visual indicators with Icons, colors, and gradients that reflect project status - Needs improvements
- [ ] Gitlab integration
- [ ] More Insights (will add in discussions sections for the same)
- [ ] UI dashboard to preview the project health and metrics
- [ ] Add theming to the dashboard ([ref](https://github.com/shravan20/github-readme-quotes/tree/main/src/themes))
- [ ] Apply different fonts to theming optionally taking it as input from the user
- [ ] Add more layouts to preview the dashboard
- [ ] Github Action Integration to use our API and provide static UI instead of dynamically fetching everytime
- [ ] Allow users to selectively retrieve specific metric categories using query parameters
- [ ] Add support for detecting additional frameworks, platforms, and toolchains across diverse ecosystems

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
| `/api/projects/:owner/:repo/analysis` | GET |  Comprehensive project analysis |
| `/api/projects/:owner/:repo/card-metrics` | GET | Dynamic SVG health card |
| `/api/health/:owner/:repo` | GET | Project health score |
| `/api/health/:owner/:repo/refresh` | POST | Force refresh health calculation |
| `/api/health/cache/stats` | GET | Cache statistics |
| `/api/rate-limit/status` | GET |  GitHub API rate limit status |

### Metrics considered

- **Language-agnostic analysis** - Supports JavaScript, Python, Ruby, Go, Rust, PHP, Java, and more
- **CI/CD detection** - GitHub Actions, Travis CI, CircleCI, Jenkins
- **Testing framework detection** - Jest, Mocha, PyTest, RSpec, PHPUnit, etc.
- **Linting setup analysis** - ESLint, Pylint, Prettier, RuboCop, golangci-lint
- **Dependency analysis** - package.json, requirements.txt, Gemfile, go.mod, Cargo.toml, etc.
- **Security vulnerability estimation** - Based on dependency analysis
- **Test coverage estimation** - Heuristic analysis of test files vs source files
- **Pulls live data** – Uses fresh info directly from GitHub

## Example Usage

```bash
# Get project information
curl "https://your-deployment.vercel.app/api/projects/shravan20/github-readme-quotes"

# Get project health score
curl "https://your-deployment.vercel.app/api/health/shravan20/github-readme-quotes"

# Get complete project data with health
curl "https://your-deployment.vercel.app/api/projects/shravan20/github-readme-quotes/complete"
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

```text
api/
├── index.ts                 # Main API handler for Vercel
├── routes
│       └── projects.ts      # project routes
│       └── health.ts        # health check routes
│       └── api.ts           # general routes
src/
├── config/
│   └── app.ts               # Application configuration
├── models/
│   └── project.ts           # Project data models
├── services/
│   ├── cache.ts             # In-memory caching service
│   ├── github.ts            # GitHub API integration
│   ├── project.ts           # Project orchestration service
│   ├── project-enhanced.ts  # Custom Project metrics service
│   └── health-calculator.ts # Health scoring algorithm
└── utils/
│   ├── rater-limiter.ts     # GitHub API rate limiter utility to ensure rate-limit breaches are not exceeded
    └── logger.ts            # Logging utility
```

## Deployment

### Vercel (Recommended)

1. **One-click deploy**: Use the button at the top of this README
2. **Manual deploy**: Follow the [Deployment Guide](DEPLOYMENT.md)

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

[to understand how to contribute, refer](CONTRIBUTING.md)

## License

MIT License - see [LICENSE](LICENSE) file for details.
