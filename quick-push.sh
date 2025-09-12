#!/bin/bash

# Script rápido para push profesional a GitHub
# Este script intenta varios métodos de autenticación automáticamente

echo "=== Push Profesional para AbogadosEcuador ==="

# Verificar cambios pendientes
if [[ -n $(git status -s) ]]; then
  echo "Hay cambios pendientes. Agregando todos los cambios..."
  git add .
  git commit -m "chore: Actualización profesional para despliegue en Cloudflare Workers"
  echo "✅ Cambios confirmados"
fi

echo "📤 Intentando push usando configuración existente..."
if git push origin main; then
  echo "✅ Push completado exitosamente con configuración existente"
  exit 0
fi

# Si falla, intentar con SSH
echo "⚠️ Push falló con la configuración actual"
echo "🔑 Intentando con SSH..."
git remote set-url origin git@github.com:abogadosecuador/abogadosecuador.git

if git push origin main; then
  echo "✅ Push completado exitosamente usando SSH"
  exit 0
fi

# Si SSH también falla, restaurar URL original
echo "⚠️ Push con SSH también falló"
git remote set-url origin https://github.com/abogadosecuador/abogadosecuador.git

echo "❗ No se pudo completar el push automáticamente"
echo "Para completar el push manualmente, ejecuta: ./push-to-github.sh"
exit 1
