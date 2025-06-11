#!/bin/bash

# GitHub Token Verification Script for FOSS Vital
# This script checks if your GitHub token is properly configured and working

echo "FOSS Vital - GitHub Token Verification"
echo "========================================"

BASE_URL="http://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if server is running
echo ""
print_status $BLUE "Checking if server is running..."
if ! curl -s "$BASE_URL/health" > /dev/null 2>&1; then
    print_status $RED "Server not running at $BASE_URL"
    echo "   Please start the server with: npm run dev"
    exit 1
fi
print_status $GREEN "Server is running"

# Check initial rate limit status
echo ""
print_status $BLUE "Checking initial rate limit status..."
initial_status=$(curl -s "$BASE_URL/api/rate-limit/status")
initial_limit=$(echo "$initial_status" | jq -r '.limit')
initial_remaining=$(echo "$initial_status" | jq -r '.remaining')

echo "   Limit: $initial_limit requests/hour"
echo "   Remaining: $initial_remaining requests"

# Determine if token is configured
if [ "$initial_limit" -eq 5000 ]; then
    print_status $GREEN "GitHub token is configured! (5000 requests/hour)"
    token_status="configured"
elif [ "$initial_limit" -eq 60 ]; then
    print_status $YELLOW "No GitHub token detected (60 requests/hour)"
    token_status="not_configured"
else
    print_status $RED "Unexpected rate limit: $initial_limit"
    token_status="unknown"
fi

# Test API call
echo ""
print_status $BLUE "Testing GitHub API call..."
api_response=$(curl -s "$BASE_URL/api/projects/octocat/Hello-World")
api_success=$(echo "$api_response" | jq -r '.success')

if [ "$api_success" = "true" ]; then
    print_status $GREEN "API call successful"
    project_name=$(echo "$api_response" | jq -r '.data.name')
    echo "   Retrieved project: $project_name"
else
    print_status $RED "API call failed"
    error_message=$(echo "$api_response" | jq -r '.message // .error // "Unknown error"')
    echo "   Error: $error_message"
fi

# Check updated rate limit status
echo ""
print_status $BLUE "Checking updated rate limit status..."
final_status=$(curl -s "$BASE_URL/api/rate-limit/status")
final_limit=$(echo "$final_status" | jq -r '.limit')
final_remaining=$(echo "$final_status" | jq -r '.remaining')
final_used=$(echo "$final_status" | jq -r '.used')

echo "   Limit: $final_limit requests/hour"
echo "   Remaining: $final_remaining requests"
echo "   Used: $final_used requests"

# Calculate requests consumed
requests_used=$((initial_remaining - final_remaining))
if [ $requests_used -gt 0 ]; then
    print_status $GREEN "Rate limit properly updated ($requests_used requests consumed)"
else
    print_status $YELLOW "Rate limit not updated (possible caching)"
fi

# Summary
echo ""
print_status $BLUE "Verification Summary"
print_status $BLUE "======================="

case $token_status in
    "configured")
        print_status $GREEN "GitHub Token Status: CONFIGURED"
        print_status $GREEN "   • Rate Limit: 5000 requests/hour"
        print_status $GREEN "   • Authentication: Working"
        print_status $GREEN "   • Recommended for production: YES"
        ;;
    "not_configured")
        print_status $YELLOW "GitHub Token Status: NOT CONFIGURED"
        print_status $YELLOW "   • Rate Limit: 60 requests/hour"
        print_status $YELLOW "   • Authentication: IP-based only"
        print_status $YELLOW "   • Recommended for production: NO"
        echo ""
        print_status $BLUE "To configure a GitHub token:"
        echo "   1. Create a token at: https://github.com/settings/tokens"
        echo "   2. Add to .env file: GITHUB_TOKEN=your_token_here"
        echo "   3. Restart the server: npm run dev"
        ;;
    *)
        print_status $RED "GitHub Token Status: UNKNOWN"
        print_status $RED "   • Unexpected configuration detected"
        ;;
esac

# Additional checks
echo ""
print_status $BLUE "Environment Check"
print_status $BLUE "===================="

# Check if GITHUB_TOKEN environment variable is set
if [ -n "$GITHUB_TOKEN" ]; then
    token_preview="${GITHUB_TOKEN:0:10}..."
    print_status $GREEN "GITHUB_TOKEN environment variable is set ($token_preview)"
else
    print_status $YELLOW "GITHUB_TOKEN environment variable is not set"
fi

# Check .env file
if [ -f ".env" ]; then
    if grep -q "GITHUB_TOKEN" .env; then
        print_status $GREEN ".env file contains GITHUB_TOKEN"
    else
        print_status $YELLOW ".env file exists but no GITHUB_TOKEN found"
    fi
else
    print_status $YELLOW "No .env file found"
fi

# Cache statistics
echo ""
print_status $BLUE "Cache Statistics"
print_status $BLUE "=================="
cache_stats=$(curl -s "$BASE_URL/api/health/cache/stats")
cache_size=$(echo "$cache_stats" | jq -r '.data.size // "N/A"')
cache_max=$(echo "$cache_stats" | jq -r '.data.maxSize // "N/A"')
echo "   Cache usage: $cache_size / $cache_max entries"

# Final recommendations
echo ""
print_status $BLUE "Recommendations"
print_status $BLUE "=================="

if [ "$token_status" = "configured" ]; then
    print_status $GREEN "Your setup is optimal for production use"
    print_status $GREEN "High rate limits will prevent API throttling"
    print_status $GREEN "Full access to GitHub API features"
elif [ "$token_status" = "not_configured" ]; then
    print_status $YELLOW "Consider adding a GitHub token for:"
    echo "   • Higher rate limits (5000 vs 60 requests/hour)"
    echo "   • Better performance and reliability"
    echo "   • Access to additional GitHub features"
    echo ""
    print_status $BLUE "Documentation:"
    echo "   • Token setup: ./VERIFY-TOKEN.md"
    echo "   • Deployment guide: ./DEPLOYMENT.md"
fi

echo ""
print_status $GREEN "Verification complete!"
