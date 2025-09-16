# Abogados Ecuador – Guía de despliegue seguro (Producción)

Este proyecto está listo para producción con:

- Autenticación real con Supabase (register/login/user).
- API unificada en Cloudflare Workers.
- Persistencia en Cloudflare D1 y KV (formularios, catálogos, órdenes).
- Pagos PayPal (create/capture) y webhook mínimo.
- Rutas protegidas por sesión y páginas públicas.

Importante: Nunca publiques credenciales en el repositorio o en chats. Usa Secrets/Variables de entorno.

## 1. Requisitos

- Node 18+ y pnpm/npm.
- Cuenta Cloudflare con acceso a Workers, KV y D1.
- Cuenta Supabase y proyecto creado.
- Cuenta PayPal (Live) con Client ID/Secret.

## 2. Variables de Entorno (Frontend y Worker)

Copia `.env.example` a `.env` (para frontend) y establece los valores según tu entorno:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

En el Worker (Cloudflare), configura Secrets (no se almacenan en el repo):

- SUPABASE_ANON_KEY
- PAYPAL_CLIENT_ID
- PAYPAL_CLIENT_SECRET
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

## 3. Configuración de Wrangler (Workers, KV, D1)

Ejemplo de `wrangler.toml` (no subas secretos aquí):

```toml
name = "abogados-ecuador"
main = "src/worker.js"
compatibility_date = "2024-10-01"

[[kv_namespaces]]
binding = "ABOGADO_WILSON_KV"
id = "<KV_NAMESPACE_ID>"

[[d1_databases]]
binding = "ABOGADO_WILSON_DB"
database_name = "abogadosecuador"
database_id = "<D1_DATABASE_ID>"

[observability]
enabled = true
```

Configura Secrets (en tu máquina o CI):

```
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put PAYPAL_CLIENT_ID
wrangler secret put PAYPAL_CLIENT_SECRET
wrangler secret put CLOUDINARY_CLOUD_NAME
wrangler secret put CLOUDINARY_API_KEY
wrangler secret put CLOUDINARY_API_SECRET
```

## 4. Despliegue

```
wrangler deploy
```

Inicializa tablas D1 (una vez por entorno):

```
GET https://<tu-subdominio>.workers.dev/api/setup/init
```

Semilla de datos de demostración (opcional):

```
GET https://<tu-subdominio>.workers.dev/api/setup/seed
```

## 5. Endpoints principales (API)

- Salud: `GET /api/status`
- Autenticación Supabase:
  - `POST /api/auth/register` { email, password, name? }
  - `POST /api/auth/login` { email, password }
  - `GET /api/auth/user` (Authorization: Bearer <access_token>)
- Datos (D1/KV):
  - `GET/POST/PUT/DELETE /api/data/{contacts|searches|newsletter_subscriptions|products|services|courses|consultations|blog_posts|ebooks}`
  - `POST /api/data/judicial_processes/search` → [] (frontend usa mock)
- Pagos PayPal:
  - `POST /api/payments/create-order` { amount, description? }
  - `POST /api/payments/capture` { orderId } (persiste en D1: orders)
  - `POST /api/payments/webhook` (mínimo viable; se recomienda verificación de firma)

## 6. Flujo de prueba (Usuario Final)

1) Registro/Login: UI de `/registro` y `/login` → verifica `GET /api/auth/user`.
2) Rutas protegidas: `/dashboard` requiere sesión válida.
3) Contacto: `/contacto` → guarda en D1 `contacts`.
4) Newsletter (Footer): guarda en D1 `newsletter_subscriptions`.
5) Consultas: `/consultas` → recientes en `searches` (D1/KV) y mock para judicial.
6) Pagos: Checkout → `/api/payments/create-order` y `/api/payments/capture` → registra en `orders`.

## 7. Seguridad y buenas prácticas

- Nunca publiques tokens o claves en el repo.
- Usa tokens con mínimos permisos (principio de menor privilegio).
- Valida firma del webhook de PayPal para producción.
- Activa RLS en Supabase si procede y crea políticas adecuadas.

## 8. Soporte

Ante cualquier incidencia de despliegue, revisa logs de Workers, estado de D1/KV y variables de entorno. Asegura que `/api/setup/init` haya sido ejecutado con éxito.

