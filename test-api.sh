#!/bin/bash

# FOSS Vital API Test Script
# This script demonstrates all the API endpoints and functionality

BASE_URL="http://localhost:3000"
echo "=== FOSS Vital API Test Suite ==="
echo "Testing API at: $BASE_URL"
echo ""

# Test 1: API Info
echo "1. Testing API Info endpoint..."
curl -s "$BASE_URL/" | jq '.'
echo -e "\n"

# Test 2: Health Check
echo "2. Testing Health Check..."
curl -s "$BASE_URL/health" | jq '.'
echo -e "\n"

# Test 3: Cache Stats (Initial)
echo "3. Initial Cache Stats..."
curl -s "$BASE_URL/api/health/cache/stats" | jq '.'
echo -e "\n"

# Test 4: Get Project Info
echo "4. Testing Project Info (honojs/hono)..."
curl -s "$BASE_URL/api/projects/honojs/hono" | jq '.'
echo -e "\n"

# Test 5: Get Project Metrics
echo "5. Testing Project Metrics..."
curl -s "$BASE_URL/api/projects/honojs/hono/metrics" | jq '.data | keys'
echo -e "\n"

# Test 6: Get Project Health
echo "6. Testing Project Health Score..."
curl -s "$BASE_URL/api/health/honojs/hono" | jq '.data.scores'
echo -e "\n"

# Test 7: Get Complete Project Data
echo "7. Testing Complete Project Data..."
curl -s "$BASE_URL/api/projects/honojs/hono/complete" | jq '.data | {name, stars, health: .health.overallScore}'
echo -e "\n"

# Test 8: Cache Stats (After requests)
echo "8. Cache Stats After Requests..."
curl -s "$BASE_URL/api/health/cache/stats" | jq '.'
echo -e "\n"

# Test 9: Cache Refresh
echo "9. Testing Cache Refresh..."
curl -X POST -s "$BASE_URL/api/health/honojs/hono/refresh" | jq '.message'
echo -e "\n"

# Test 10: Error Handling
echo "10. Testing Error Handling (non-existent repo)..."
curl -s "$BASE_URL/api/projects/nonexistent/repo" | jq '.'
echo -e "\n"

# Test 11: Performance Test (Cache vs API)
echo "11. Performance Test - First Request (API Call):"
time curl -s "$BASE_URL/api/projects/facebook/react" > /dev/null

echo "12. Performance Test - Second Request (Cache Hit):"
time curl -s "$BASE_URL/api/projects/facebook/react" > /dev/null

echo -e "\n=== Test Suite Complete ==="
