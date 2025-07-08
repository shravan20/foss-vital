<p align="center">
  <h2 align="center">FOSS Vital</h2>
</p>

<p align="center">
    <img src="https://madewithlove.now.sh/in?heart=true&colorA=%23ff671f&colorB=%23046a38&text=the+Quantum+Realm+of+Open+Source" alt="Made with love with Open Source"/>
</p>

<p align="center">
    <a href="https://vercel.com/new/clone?repository-url=https://github.com/shravan20/foss-vital&env=GITHUB_TOKEN&envDescription=Optional%20GitHub%20token%20for%20higher%20rate%20limits&project-name=foss-vital&repository-name=foss-vital">
        <img src="https://vercel.com/button" alt="Deploy with Vercel"/>
    </a>
</p>

<p align="center">
    Get comprehensive health reports for your FOSS projects with detailed metrics and scoring.
</p>

<p align="center">
    <img src="https://foss-vital.vercel.app/api/projects/facebook/react/card-metrics" alt="FOSS Vital Sample Card" width="400"/>
</p>

## Features

- GitHub API integration for live project data
- Comprehensive health scoring algorithm
- Clone-based repository analysis for deeper insights
- Smart caching system to minimize API calls
- REST API with multiple endpoints
- One-click Vercel deployment
- MIT licensed

## Quick Start

Deploy in seconds or run locally:

```bash
# Clone and run locally
git clone https://github.com/shravan20/foss-vital.git
cd foss-vital
npm install
npm run dev
```

API will be available at `http://localhost:3000`

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/projects/:owner/:repo` | Basic project information |
| `/api/projects/:owner/:repo/complete` | Project with health score |
| `/api/projects/:owner/:repo/metrics` | Detailed project metrics |
| `/api/projects/:owner/:repo/analysis` | Comprehensive analysis |
| `/api/health/:owner/:repo` | Health score only |
| `/api/health/:owner/:repo/refresh` | Force refresh cache |

## Health Scoring

Projects are scored across four key areas:

- **Activity (30%)** - Commit frequency, issue resolution, PR merge time
- **Community (25%)** - Contributors, contribution distribution
- **Maintenance (25%)** - Issue close rate, PR merge rate  
- **Documentation (20%)** - README, LICENSE, contributing guides

Overall score is weighted average of these dimensions (0-100).

## What We Analyze

### Language Support

JavaScript, Python, Ruby, Go, Rust, PHP, Java, and more

### CI/CD Detection

GitHub Actions, Travis CI, CircleCI, Jenkins

### Testing Frameworks

Jest, Mocha, PyTest, RSpec, PHPUnit, etc.

### Linting Tools

ESLint, Pylint, Prettier, RuboCop, golangci-lint

### Dependency Analysis

package.json, requirements.txt, Gemfile, go.mod, Cargo.toml, etc.

### Security & Coverage

- Vulnerability estimation based on dependencies
- Test coverage estimation via heuristic analysis
- Live data from GitHub API

## Performance Features

**Clone-Based Analysis** - For detailed metrics, we use optimized repository cloning:

- Shallow clone (`--depth 1`) to temporary directory
- Local file analysis for configs and dependencies
- Comprehensive dependency file parsing
- 7-day caching to minimize repeated clones
- Automatic cleanup after analysis
- Significantly reduces API calls

## Example Usage

```bash
# Basic project info
curl "https://your-deployment.vercel.app/api/projects/owner/repo"

# Health score
curl "https://your-deployment.vercel.app/api/health/owner/repo"

# Complete analysis
curl "https://your-deployment.vercel.app/api/projects/owner/repo/complete"
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `GITHUB_TOKEN` | - | GitHub token for higher rate limits |
| `NODE_ENV` | `development` | Environment mode |
| `CORS_ORIGINS` | `*` | Allowed CORS origins |
| `PORT` | `3000` | Server port (local only) |

## Rate Limits

- Without token: 60 requests/hour per IP
- With token: 5,000 requests/hour
- Recommendation: Use GitHub token for production

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

Read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

MIT License - see [LICENSE](LICENSE) file for details.
