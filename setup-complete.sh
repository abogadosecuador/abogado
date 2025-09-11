#!/bin/bash

# Setup Script - Abogados Ecuador Complete System
# Run this script to set up the complete system

echo "🚀 Iniciando configuración del sistema Abogados Ecuador..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node version
echo -e "${BLUE}Verificando versión de Node.js...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Se requiere Node.js 18 o superior${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js v$(node -v)${NC}"

# Install dependencies
echo -e "${BLUE}Instalando dependencias...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error instalando dependencias${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencias instaladas${NC}"

# Create .env.local if not exists
if [ ! -f .env.local ]; then
    echo -e "${BLUE}Creando archivo .env.local...${NC}"
    cp .env.example .env.local
    echo -e "${YELLOW}⚠️  Por favor, edita .env.local con tus credenciales${NC}"
fi

# Build the project
echo -e "${BLUE}Construyendo el proyecto...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en el build${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build completado${NC}"

# Setup Cloudflare Wrangler
echo -e "${BLUE}Configurando Cloudflare Wrangler...${NC}"
if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}Instalando Wrangler...${NC}"
    npm install -g wrangler
fi

# Login to Cloudflare
echo -e "${BLUE}Iniciando sesión en Cloudflare...${NC}"
wrangler login

# Setup secrets
echo -e "${BLUE}Configurando secretos en Cloudflare Workers...${NC}"
echo -e "${YELLOW}Ingresa los siguientes secretos cuando se solicite:${NC}"

read -p "¿Configurar SUPABASE_SERVICE_KEY? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    wrangler secret put SUPABASE_SERVICE_KEY
fi

read -p "¿Configurar PAYPAL_CLIENT_SECRET? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    wrangler secret put PAYPAL_CLIENT_SECRET
fi

read -p "¿Configurar GEMINI_API_KEY? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    wrangler secret put GEMINI_API_KEY
fi

read -p "¿Configurar CLOUDINARY_API_SECRET? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    wrangler secret put CLOUDINARY_API_SECRET
fi

read -p "¿Configurar WHATSAPP_API_TOKEN? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    wrangler secret put WHATSAPP_API_TOKEN
fi

# Create D1 database tables
echo -e "${BLUE}Configurando base de datos D1...${NC}"
wrangler d1 execute abogadosecuador --file=./supabase/migrations/d1_schema.sql --local

# Deploy to Cloudflare
read -p "¿Desplegar a Cloudflare Workers ahora? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Desplegando a Cloudflare Workers...${NC}"
    npm run deploy
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Despliegue exitoso${NC}"
        echo -e "${GREEN}🎉 Tu aplicación está disponible en: https://abogadosecuador.workers.dev${NC}"
        
        # Test deployment
        echo -e "${BLUE}Verificando el despliegue...${NC}"
        curl -s https://abogadosecuador.workers.dev/api/health | jq '.'
    else
        echo -e "${RED}❌ Error en el despliegue${NC}"
        exit 1
    fi
fi

# Setup GitHub repository
read -p "¿Configurar repositorio de GitHub? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Configurando Git...${NC}"
    git init
    git add .
    git commit -m "feat: sistema completo Abogados Ecuador v3.0.0"
    
    echo -e "${YELLOW}Agrega tu repositorio remoto con:${NC}"
    echo "git remote add origin https://github.com/tu-usuario/abogadosecuador.git"
    echo "git branch -M main"
    echo "git push -u origin main"
fi

# Final instructions
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ CONFIGURACIÓN COMPLETADA${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo
echo -e "${BLUE}Próximos pasos:${NC}"
echo "1. Edita .env.local con tus credenciales reales"
echo "2. Ejecuta las migraciones en Supabase:"
echo "   psql -h db.kbybhgxqdefuquybstqk.supabase.co -U postgres -d postgres -f supabase/migrations/20250111_complete_system.sql"
echo "3. Importa los workflows en n8n (archivo n8n-workflows.json)"
echo "4. Configura los webhooks de PayPal en el dashboard"
echo "5. Configura los secrets en GitHub para CI/CD automático"
echo
echo -e "${GREEN}URLs importantes:${NC}"
echo "- Aplicación: https://abogadosecuador.workers.dev"
echo "- API Health: https://abogadosecuador.workers.dev/api/health"
echo "- Documentación: ver DEPLOYMENT_GUIDE.md"
echo
echo -e "${YELLOW}Para desarrollo local:${NC}"
echo "npm run dev"
echo
echo -e "${YELLOW}Para desplegar cambios:${NC}"
echo "git push origin main"
echo
echo -e "${GREEN}¡Listo para producción! 🚀${NC}"
