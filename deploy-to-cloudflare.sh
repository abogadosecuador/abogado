#!/bin/bash

# Script de despliegue completo para Cloudflare Workers
# Abogados Ecuador - Producción

echo "🚀 Iniciando despliegue a Cloudflare Workers..."
echo "================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "wrangler.toml" ]; then
    echo -e "${RED}❌ Error: No se encontró wrangler.toml${NC}"
    echo "Por favor ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# 1. Instalar dependencias si es necesario
echo -e "${YELLOW}📦 Verificando dependencias...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
fi

# 2. Limpiar build anterior
echo -e "${YELLOW}🧹 Limpiando build anterior...${NC}"
rm -rf dist/
rm -rf .wrangler/

# 3. Construir la aplicación
echo -e "${YELLOW}🔨 Construyendo aplicación para producción...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error durante el build${NC}"
    exit 1
fi

# 4. Verificar que el build fue exitoso
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: Directorio dist no encontrado${NC}"
    exit 1
fi

# 5. Copiar archivos necesarios
echo -e "${YELLOW}📋 Copiando archivos de configuración...${NC}"
cp _routes.json dist/ 2>/dev/null || true

# 6. Configurar secretos de Cloudflare (si no están configurados)
echo -e "${YELLOW}🔐 Verificando secretos de Cloudflare...${NC}"

# Lista de secretos necesarios
SECRETS=(
    "SUPABASE_KEY"
    "SUPABASE_SERVICE_KEY"
    "PAYPAL_CLIENT_SECRET"
    "GEMINI_API_KEY"
)

echo "Los siguientes secretos deben estar configurados:"
for secret in "${SECRETS[@]}"; do
    echo "  - $secret"
done

echo -e "${YELLOW}Si necesitas configurar secretos, usa:${NC}"
echo "wrangler secret put NOMBRE_SECRETO"

# 7. Crear base de datos D1 si no existe
echo -e "${YELLOW}💾 Verificando base de datos D1...${NC}"
wrangler d1 list | grep -q "abogadosecuador" || {
    echo "Creando base de datos D1..."
    wrangler d1 create abogadosecuador
    
    # Aplicar migraciones
    if [ -f "migrations/0001_init_d1.sql" ]; then
        echo "Aplicando migraciones a D1..."
        wrangler d1 execute abogadosecuador --file=migrations/0001_init_d1.sql
    fi
}

# 8. Crear KV namespace si no existe
echo -e "${YELLOW}📚 Verificando KV namespace...${NC}"
wrangler kv:namespace list | grep -q "ABOGADO_WILSON_KV" || {
    echo "Creando KV namespace..."
    wrangler kv:namespace create "ABOGADO_WILSON_KV"
}

# 9. Verificar configuración
echo -e "${YELLOW}✅ Verificando configuración...${NC}"
echo "Dominio: https://abogadosecuador.workers.dev"
echo "Supabase URL: https://kbybhgxqdefuquybstqk.supabase.co"
echo "Version: 3.0.0"

# 10. Preguntar confirmación
echo ""
echo -e "${YELLOW}⚠️  ¿Deseas continuar con el despliegue a producción? (s/n)${NC}"
read -r respuesta

if [[ ! "$respuesta" =~ ^[Ss]$ ]]; then
    echo -e "${RED}❌ Despliegue cancelado${NC}"
    exit 0
fi

# 11. Desplegar a Cloudflare Workers
echo -e "${YELLOW}🚀 Desplegando a Cloudflare Workers...${NC}"
wrangler deploy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Despliegue exitoso!${NC}"
    echo ""
    echo "🌐 Tu aplicación está disponible en:"
    echo "   https://abogadosecuador.workers.dev"
    echo ""
    echo "📊 Para ver los logs en tiempo real:"
    echo "   wrangler tail"
    echo ""
    echo "🔧 Para hacer cambios:"
    echo "   1. Modifica el código"
    echo "   2. Ejecuta: npm run deploy"
    echo ""
    
    # 12. Test de la aplicación
    echo -e "${YELLOW}🧪 Realizando test básico...${NC}"
    response=$(curl -s -o /dev/null -w "%{http_code}" https://abogadosecuador.workers.dev)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ La aplicación responde correctamente (HTTP $response)${NC}"
    else
        echo -e "${YELLOW}⚠️  La aplicación devolvió HTTP $response${NC}"
        echo "Verifica los logs con: wrangler tail"
    fi
    
    # 13. Crear usuario admin si es primera vez
    echo ""
    echo -e "${YELLOW}👤 Configuración del usuario administrador:${NC}"
    echo "Email: willyipiales12@gmail.com"
    echo "Contraseña: willy12"
    echo ""
    echo "Si es la primera vez, ejecuta:"
    echo "  node scripts/init-admin.js"
    
else
    echo -e "${RED}❌ Error durante el despliegue${NC}"
    echo "Verifica los errores anteriores y vuelve a intentar."
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 ¡Proceso completado!${NC}"
echo "================================================"
