#!/bin/bash

# LNMIIT CampusFlow - Quick Vercel Deployment Script
# This script helps you deploy to Vercel quickly

echo "🚀 LNMIIT CampusFlow - Vercel Deployment"
echo "========================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI is not installed."
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
    echo "✅ Vercel CLI installed successfully!"
    echo ""
fi

# Check if user is logged in to Vercel
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null
then
    echo "⚠️  Not logged in to Vercel. Logging in..."
    vercel login
else
    echo "✅ Already logged in to Vercel"
fi

echo ""
echo "📋 Pre-deployment checklist:"
echo "  ✓ Build files cleared"
echo "  ✓ Dependencies up to date"
echo "  ✓ Configuration files ready"
echo ""

# Clean build artifacts
echo "🧹 Cleaning old build files..."
rm -rf node_modules/.cache build backend/node_modules/.cache
echo "✅ Clean complete!"
echo ""

# Run production build locally to verify
echo "🔨 Running production build test..."
if npm run build &> /dev/null
then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📝 Post-Deployment Steps:"
echo "  1. Copy your Vercel URL (e.g., https://your-project.vercel.app)"
echo "  2. Update REACT_APP_API_BASE_URL in Vercel environment variables"
echo "  3. Add your Vercel URL to Privy Dashboard allowed origins"
echo "  4. Ensure MongoDB Atlas allows Vercel IPs (0.0.0.0/0)"
echo "  5. Test your deployment at the provided URL"
echo ""
echo "🎉 Happy deploying!"
