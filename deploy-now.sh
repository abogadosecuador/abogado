#!/bin/bash

# Deploy script with correct API token
export CLOUDFLARE_API_TOKEN="GL1rUyHBtNSYZXQnZfeOpgs_kMc_BdEJ6mX2pJQW"
export CLOUDFLARE_ACCOUNT_ID="06ea65e2b51d0f23f0c44f92962ac95d"

echo "🚀 Deploying to Cloudflare Workers..."

# Use npx to run wrangler without global install
npx wrangler deploy \
  --name abogadosecuador \
  --compatibility-date 2025-01-01 \
  --no-bundle \
  --minify \
  src/worker.js

echo "✅ Deployment complete!"
