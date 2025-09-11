# Guía de Despliegue - Abogados Ecuador

## 📋 Índice
1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Secretos](#configuración-de-secretos)
3. [Base de Datos Supabase](#base-de-datos-supabase)
4. [Configuración de PayPal](#configuración-de-paypal)
5. [Configuración de n8n](#configuración-de-n8n)
6. [Despliegue Automático](#despliegue-automático)
7. [Verificación](#verificación)
8. [API Documentation](#api-documentation)
9. [Troubleshooting](#troubleshooting)

## 🔧 Requisitos Previos

### Software Necesario
- Node.js 18+ 
- Git
- npm o yarn
- Cuenta de Cloudflare
- Cuenta de Supabase
- Cuenta de PayPal Business
- Cuenta de n8n (o self-hosted)

### Cuentas y Servicios
```bash
✅ Cloudflare Workers (Account ID: 06ea65e2b51d0f23f0c44f92962ac95d)
✅ Supabase (Project: kbybhgxqdefuquybstqk)
✅ PayPal Live API
✅ n8n Webhooks
✅ Cloudinary (opcional)
✅ Gemini API (opcional)
```

## 🔐 Configuración de Secretos

### 1. GitHub Secrets
En tu repositorio, ve a Settings → Secrets → Actions y añade:

```yaml
CF_API_TOKEN: GL1rUyHBtNSYZXQnZfeOpgs_kMc_BdEJ6mX2pJQW
CF_ACCOUNT_ID: 06ea65e2b51d0f23f0c44f92962ac95d
SUPABASE_URL: https://kbybhgxqdefuquybstqk.supabase.co
SUPABASE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY: [Tu service role key]
SUPABASE_JWT_SECRET: [Tu JWT secret]
PAYPAL_CLIENT_ID: AWxKgr5n7ex5Lc3fDBOooaVHLgcAB-KCrYXgCmit9DpNXFIuBa6bUypYFjr-hAqARlILGxk_rRTsBZeS
PAYPAL_CLIENT_SECRET: EO-ghpkDi_L5oQx9dkZPg3gABTs_UuWmsBtaexDyfYfXMhjbcJ3KK0LAuntr4zjoNSViGHZ_rkD7-YCt
GEMINI_API_KEY: [Tu API key de Gemini]
N8N_WEBHOOK_URL: https://n8n-latest-hurl.onrender.com
CLOUDINARY_API_KEY: 673776954212897
CLOUDINARY_API_SECRET: MOzrryrl-3w0abD2YftOWYOs3O8
WHATSAPP_API_TOKEN: [Tu token de WhatsApp Business]
```

### 2. Cloudflare Workers Secrets
```bash
# Configurar secretos en Cloudflare Workers
wrangler secret put SUPABASE_SERVICE_KEY
wrangler secret put PAYPAL_CLIENT_SECRET
wrangler secret put GEMINI_API_KEY
wrangler secret put CLOUDINARY_API_SECRET
wrangler secret put WHATSAPP_API_TOKEN
```

## 💾 Base de Datos Supabase

### 1. Crear las tablas
```bash
# Ejecutar migración en Supabase
psql -h db.kbybhgxqdefuquybstqk.supabase.co -U postgres -d postgres -f supabase/migrations/20250111_complete_system.sql

# O desde el Dashboard de Supabase:
# SQL Editor → New Query → Pegar contenido del archivo SQL → Run
```

### 2. Configurar Authentication
En Supabase Dashboard:
1. Authentication → Settings → Enable Email confirmations
2. Email Templates → Personalizar plantillas en español
3. URL Configuration:
   - Site URL: `https://abogadosecuador.workers.dev`
   - Redirect URLs: `https://abogadosecuador.workers.dev/*`

### 3. Configurar Storage (opcional)
```sql
-- Crear buckets para documentos
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('documents', 'documents', false),
  ('avatars', 'avatars', true),
  ('backups', 'backups', false);
```

## 💳 Configuración de PayPal

### 1. Configurar Webhooks
En PayPal Developer Dashboard:
1. Apps & Credentials → Tu App → Webhooks
2. Add Webhook: `https://abogadosecuador.workers.dev/api/payments/webhook`
3. Eventos a suscribir:
   - PAYMENT.CAPTURE.COMPLETED
   - PAYMENT.CAPTURE.REFUNDED
   - CHECKOUT.ORDER.APPROVED

### 2. Configurar IPN (opcional)
Account Settings → Notifications → Instant Payment Notifications:
- IPN URL: `https://abogadosecuador.workers.dev/api/payments/ipn`

## 🔄 Configuración de n8n

### 1. Importar Workflows
```bash
# En n8n, importar el archivo:
n8n-workflows.json

# O copiar manualmente cada workflow desde el dashboard
```

### 2. Configurar Credenciales en n8n
- Supabase API: URL y Service Key
- Email SMTP: Configurar servidor de correo
- WhatsApp: API Token
- Slack: Webhook URL (opcional)

### 3. Activar Workflows
Activar cada workflow desde el dashboard de n8n.

## 🚀 Despliegue Automático

### 1. Instalación Local
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/abogadosecuador.git
cd abogadosecuador

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Desarrollo local
npm run dev

# Build para producción
npm run build
```

### 2. Primer Despliegue
```bash
# Login en Wrangler
wrangler login

# Publicar manualmente (primera vez)
npm run deploy

# O usar wrangler directamente
wrangler deploy
```

### 3. CI/CD Automático
```bash
# Hacer push a main activará el despliegue automático
git add .
git commit -m "feat: deploy complete system"
git push origin main

# GitHub Actions ejecutará:
# 1. Tests y linting
# 2. Build
# 3. Deploy a Cloudflare Workers
# 4. Health checks
# 5. Notificación a n8n
```

## ✅ Verificación

### 1. Health Checks
```bash
# Verificar todos los servicios
curl https://abogadosecuador.workers.dev/api/health

# Verificar servicios específicos
curl https://abogadosecuador.workers.dev/api/health/supabase
curl https://abogadosecuador.workers.dev/api/health/paypal
curl https://abogadosecuador.workers.dev/api/health/gemini
curl https://abogadosecuador.workers.dev/api/health/n8n
```

### 2. Test de Funcionalidades
```bash
# Obtener configuración
curl https://abogadosecuador.workers.dev/api/config

# Listar servicios
curl https://abogadosecuador.workers.dev/api/services

# Test de registro (POST)
curl -X POST https://abogadosecuador.workers.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","full_name":"Test User"}'
```

## 📚 API Documentation

### Authentication Endpoints
```bash
POST   /api/auth/register       # Registro de nuevo usuario
POST   /api/auth/login          # Inicio de sesión
POST   /api/auth/logout         # Cerrar sesión
POST   /api/auth/verify-email   # Verificar email
POST   /api/auth/reset-password # Solicitar reset de contraseña
PATCH  /api/auth/update-password # Actualizar contraseña
GET    /api/auth/profile        # Obtener perfil
PATCH  /api/auth/update-profile # Actualizar perfil
```

### Appointments Endpoints
```bash
GET    /api/appointments        # Listar citas
POST   /api/appointments        # Crear cita
GET    /api/appointments/:id    # Obtener cita
PATCH  /api/appointments/:id    # Actualizar cita
PATCH  /api/appointments/:id/cancel     # Cancelar cita
PATCH  /api/appointments/:id/reschedule # Reprogramar cita
GET    /api/availability        # Verificar disponibilidad
```

### Cart & Payments Endpoints
```bash
GET    /api/cart                # Obtener carrito
POST   /api/cart/add            # Añadir al carrito
POST   /api/cart/remove         # Eliminar del carrito
POST   /api/cart/clear          # Vaciar carrito
POST   /api/cart/apply-coupon   # Aplicar cupón
POST   /api/cart/checkout       # Iniciar checkout

POST   /api/payments/create-order  # Crear orden PayPal
POST   /api/payments/capture      # Capturar pago
POST   /api/payments/webhook      # Webhook PayPal
GET    /api/payments              # Listar pagos
GET    /api/payments/:id          # Obtener pago
```

### Documents Endpoints
```bash
GET    /api/documents           # Listar documentos
POST   /api/documents/generate  # Generar con IA
GET    /api/documents/templates # Obtener plantillas
GET    /api/documents/:id       # Obtener documento
PATCH  /api/documents/:id       # Actualizar documento
DELETE /api/documents/:id       # Eliminar documento
```

### Services & Products
```bash
GET    /api/services            # Listar servicios
GET    /api/services/:id        # Obtener servicio
GET    /api/products            # Listar productos
GET    /api/products/:id        # Obtener producto
```

## 🔍 Ejemplos de Uso

### Registro y Login
```javascript
// Registro
const response = await fetch('https://abogadosecuador.workers.dev/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@example.com',
    password: 'Password123!',
    full_name: 'Juan Pérez',
    phone: '+593987654321'
  })
});

// Login
const loginResponse = await fetch('https://abogadosecuador.workers.dev/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@example.com',
    password: 'Password123!'
  })
});

const { data: { session } } = await loginResponse.json();
const token = session.access_token;
```

### Crear Cita
```javascript
const appointment = await fetch('https://abogadosecuador.workers.dev/api/appointments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    service_id: 'uuid-del-servicio',
    provider_id: 'uuid-del-abogado',
    start_at: '2025-01-15T10:00:00Z',
    notes: 'Consulta sobre contrato de compraventa'
  })
});
```

### Procesar Pago
```javascript
// Crear orden de pago
const orderResponse = await fetch('https://abogadosecuador.workers.dev/api/payments/create-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    amount: 50.00,
    description: 'Consulta Legal',
    appointment_id: 'uuid-de-la-cita'
  })
});

const { data: { approval_url } } = await orderResponse.json();
// Redirigir al usuario a approval_url para completar el pago
```

### Generar Documento con IA
```javascript
const document = await fetch('https://abogadosecuador.workers.dev/api/documents/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    type: 'contract',
    title: 'Contrato de Compraventa',
    prompt: 'Contrato de compraventa de vehículo usado, marca Toyota, modelo Corolla 2020',
    variables: {
      vendedor: 'Juan Pérez',
      comprador: 'María García',
      precio: '15000',
      vehiculo: 'Toyota Corolla 2020'
    }
  })
});
```

## 🛠️ Troubleshooting

### Errores Comunes

#### Error: Supabase connection failed
```bash
# Verificar URL y keys
curl https://kbybhgxqdefuquybstqk.supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY"

# Verificar que las tablas existen
psql -h db.kbybhgxqdefuquybstqk.supabase.co -U postgres -c "\dt"
```

#### Error: PayPal authentication failed
```bash
# Verificar credenciales
curl -v https://api-m.paypal.com/v1/oauth2/token \
  -H "Accept: application/json" \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=client_credentials"
```

#### Error: Worker deployment failed
```bash
# Verificar configuración
wrangler whoami
wrangler deployments list

# Limpiar y reconstruir
rm -rf node_modules dist
npm install
npm run build
wrangler deploy
```

#### Error: n8n webhooks not responding
```bash
# Verificar que n8n está activo
curl https://n8n-latest-hurl.onrender.com/webhook/health

# Revisar logs en n8n dashboard
```

### Logs y Monitoreo

#### Cloudflare Workers Logs
```bash
# Tail logs en tiempo real
wrangler tail

# O desde el dashboard:
# Cloudflare Dashboard → Workers → abogadosecuador → Logs
```

#### Supabase Logs
Dashboard → Logs → Edge Functions / Database

#### PayPal Activity
Developer Dashboard → Notifications → Webhooks Events

## 📈 Monitoreo y Métricas

### Configurar Monitoring (Opcional)
```javascript
// Añadir Sentry para error tracking
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: "production",
  tracesSampleRate: 0.1
});
```

### Métricas Importantes
- Response time < 500ms
- Error rate < 1%
- Uptime > 99.9%
- Successful payment rate > 95%

## 🔄 Backup y Recuperación

### Backup Automático (n8n)
- Se ejecuta diariamente a las 3 AM
- Guarda en Cloudinary/backups
- Retención: 30 días

### Backup Manual
```bash
# Exportar datos de Supabase
pg_dump -h db.kbybhgxqdefuquybstqk.supabase.co \
        -U postgres \
        -d postgres \
        > backup_$(date +%Y%m%d).sql
```

### Rollback
```bash
# Revertir a versión anterior en Cloudflare
wrangler rollback

# O desde GitHub:
git revert HEAD
git push origin main
```

## 📞 Soporte

- **Email**: Wifirmalegal@gmail.com
- **WhatsApp**: +593 98 835 269
- **Documentación**: https://github.com/tu-usuario/abogadosecuador/wiki
- **Issues**: https://github.com/tu-usuario/abogadosecuador/issues

## 📝 Licencia

Este proyecto está bajo licencia propietaria. Todos los derechos reservados.

---

**Última actualización**: Enero 2025
**Versión**: 3.0.0
