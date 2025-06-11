# Rate Limiting

## GitHub Token Verification Guide

This guide explains how to verify if your GitHub token is properly configured and being used by FOSS Vital.

## Quick Token Status Check

### Method 1: Rate Limit Status (Recommended)

The easiest way to check if your token is working:

```bash
curl -s "http://localhost:3000/api/rate-limit/status" | jq
```

**Expected Response:**

```json
{
  "remaining": 4999,     // 4999 = Token working, 59 = No token
  "reset": 1749566198000,
  "limit": 5000,         // 5000 = Token working, 60 = No token  
  "used": 1,
  "timeUntilReset": 3594159,
  "isNearLimit": false,
  "recommendedCacheTTL": 900000,
  "timeUntilResetFormatted": "59 minutes"
}
```

### What to Look For

| Field | With Token | Without Token | Meaning |
|-------|------------|---------------|---------|
| `limit` | **5000** | **60** | GitHub API hourly limit |
| `remaining` | **4999** | **59** | Requests left |
| Rate limit | **5000/hour** | **60/hour** | Your current limit |

## 🧪 Test Your Token

### 1. Start the Server

```bash
npm run dev
```

### 2. Check Initial Rate Limit Status

```bash
curl -s "http://localhost:3000/api/rate-limit/status" | jq
```

### 3. Make a Test API Call

```bash
curl -s "http://localhost:3000/api/projects/microsoft/vscode" | jq '.success'
```

### 4. Check Rate Limit Again

```bash
curl -s "http://localhost:3000/api/rate-limit/status" | jq
```

## Understanding the Results

### Token Working Correctly

- **Limit**: 5000 requests per hour
- **Rate limit headers**: Updated from GitHub API
- **Authentication**: `Authorization: token <your-token>` header sent

### No Token or Token Invalid

- **Limit**: 60 requests per hour  
- **Rate limit**: IP-based limiting
- **Authentication**: No authorization header

### Token Issues

- **403 Forbidden**: Token invalid or expired
- **422 Unprocessable**: Token lacks required permissions
- **Rate limit exceeded**: Too many requests

## Token Configuration

### Environment Variables

**Local Development:**

```bash
# .env file
GITHUB_TOKEN=ghp_your_token_here
```

**Production (Vercel):**

```bash
# Environment Variables in Vercel Dashboard
GITHUB_TOKEN=ghp_your_token_here
```

### Required Token Permissions

For public repositories:

- `public_repo` - Access public repositories

For private repositories:

- `repo` - Full repository access

## Troubleshooting

### Problem: Still showing 60 requests/hour

**Solution:**

1. Check if `GITHUB_TOKEN` environment variable is set:

   ```bash
   echo $GITHUB_TOKEN
   ```

2. Restart the development server:

   ```bash
   npm run dev
   ```

3. Verify token format:
   - Classic tokens: `ghp_xxxxxxxxxxxxxxxxxxxx`
   - Fine-grained tokens: `github_pat_xxxxxxxxx`

### Problem: 403 Forbidden errors

**Solution:**

1. Generate a new token at [GitHub Settings](https://github.com/settings/tokens)
2. Select appropriate scopes (`public_repo` minimum)
3. Update environment variable
4. Restart server

### Problem: Token working but rate limited

**Solution:**

1. Check if you're sharing the token across multiple apps
2. Consider using multiple tokens for different environments
3. Implement additional caching

## Real-time Monitoring

### Monitor Rate Limit Status

```bash
# Check every 30 seconds
watch -n 30 'curl -s http://localhost:3000/api/rate-limit/status | jq'
```

### Check Cache Statistics

```bash
curl -s "http://localhost:3000/api/health/cache/stats" | jq
```

## Production Verification

### Deployed App Check

```bash
# Replace with your Vercel URL
curl -s "https://your-app.vercel.app/api/rate-limit/status" | jq
```

### Verify Token in Production

1. Check Vercel Dashboard → Project → Settings → Environment Variables
2. Ensure `GITHUB_TOKEN` is properly set
3. Redeploy if needed

## Quick Debug Commands

```bash
# All-in-one verification
echo "=== Token Status ===" && \
curl -s "http://localhost:3000/api/rate-limit/status" | jq '{limit, remaining, used}' && \
echo "=== Test API Call ===" && \
curl -s "http://localhost:3000/api/projects/octocat/Hello-World" | jq '.success' && \
echo "=== Updated Status ===" && \
curl -s "http://localhost:3000/api/rate-limit/status" | jq '{limit, remaining, used}'
```

## Expected Behavior

**With Valid Token:**

- Rate limit: 5000/hour
- Successful API calls to public repos
- Real-time rate limit updates
- No authentication errors

**Without Token:**

- Rate limit: 60/hour
- Limited API calls per IP
- Faster rate limit exhaustion
- No private repo access

---

## Related Documentation

- [GitHub Token Creation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub API Rate Limits](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)
- [Deployment Guide](./DEPLOYMENT.md)

---

*Pro Tip: Always use a GitHub token in production to avoid hitting rate limits quickly!*
