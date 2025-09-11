#!/bin/bash

# Script para configurar todos los secretos en Cloudflare Workers
echo "🔐 Configurando secretos en Cloudflare Workers..."

# Configurar API Token
export CLOUDFLARE_API_TOKEN="GL1rUyHBtNSYZXQnZfeOpgs_kMc_BdEJ6mX2pJQW"
export CLOUDFLARE_ACCOUNT_ID="06ea65e2b51d0f23f0c44f92962ac95d"

# Configurar secretos
echo "📝 Configurando SUPABASE_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieWJoZ3hxZGVmdXF1eWJzdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjAwODMsImV4cCI6MjA3MzEzNjA4M30.s1knFM9QXd8CH8TC0IOtBBBvb-qm2XYl_VlhVb-CqcE" | wrangler secret put SUPABASE_KEY --name abogadosecuador

echo "📝 Configurando CLOUDINARY_API_SECRET..."
echo "MOzrryrl-3w0abD2YftOWYOs3O8" | wrangler secret put CLOUDINARY_API_SECRET --name abogadosecuador

echo "📝 Configurando PAYPAL_SECRET..."
echo "EO-ghpkDi_L5oQx9dkZPg3gABTs_UuWmsBtaexDyfYfXMhjbcJ3KK0LAuntr4zjoNSViGHZ_rkD7-YCt" | wrangler secret put PAYPAL_SECRET --name abogadosecuador

echo "📝 Configurando JWT_SECRET..."
echo "abogadosecuador-jwt-secret-2025" | wrangler secret put JWT_SECRET --name abogadosecuador

echo "📝 Configurando WHATSAPP_API_TOKEN..."
echo "whatsapp-token-placeholder" | wrangler secret put WHATSAPP_API_TOKEN --name abogadosecuador

echo "✅ Todos los secretos configurados correctamente!"
