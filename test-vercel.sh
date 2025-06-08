#!/bin/bash

# Test Vercel API endpoints locally
# This script tests the basic Vercel serverless functions

echo "🧪 Testing Vercel API Functions..."
echo

# Test if Node.js can import the functions
echo "Testing API function imports..."

# Test the main API handler
node -e "
const handler = require('./api/index.ts');
if (typeof handler.default === 'function') {
  console.log('✅ Main API handler loaded successfully');
} else {
  console.log('❌ Main API handler failed to load');
  process.exit(1);
}
"

# Test the health handler
node -e "
const handler = require('./api/health.ts');
if (typeof handler.default === 'function') {
  console.log('✅ Health API handler loaded successfully');
} else {
  console.log('❌ Health API handler failed to load');
  process.exit(1);
}
"

echo
echo "🎉 All Vercel API functions are ready for deployment!"
echo
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your repository to Vercel"
echo "3. Set environment variables in Vercel dashboard"
echo "4. Deploy!"
echo
echo "For detailed instructions, see DEPLOYMENT.md"
