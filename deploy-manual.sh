#!/bin/bash

echo "🚀 Iniciando despliegue manual a Cloudflare..."

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Cloudflare Pages (for static assets)
echo "📄 Deploying static assets to Cloudflare Pages..."
npx wrangler pages deploy dist \
  --project-name=abogadosecuador \
  --branch=main \
  --commit-dirty=false

# Deploy Worker separately
echo "⚙️ Deploying Worker API..."
npx wrangler deploy \
  --name abogadosecuador-api \
  --no-bundle \
  src/worker.js

echo "✅ Deployment attempt complete!"
echo "🔗 Check your Cloudflare dashboard for deployment status"
