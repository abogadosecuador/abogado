import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  CORS_ORIGIN: string;
}

const prisma = new PrismaClient();
let supabase: ReturnType<typeof createClient>;

// Add authentication check middleware
const checkAuth = async (request: Request) => {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Initialize Supabase with environment variables
    if (!supabase) {
      supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    }

    const url = new URL(request.url);
    const { pathname } = url;
    const headers = {
      'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    try {
      // PayPal helpers
      const getPayPalAccessToken = async (): Promise<string> => {
        const clientId = (env as any).PAYPAL_CLIENT_ID;
        const clientSecret = (env as any).PAYPAL_CLIENT_SECRET;
        if (!clientId || !clientSecret) throw new Error('Missing PayPal credentials');
        const auth = btoa(`${clientId}:${clientSecret}`);
        const res = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        });
        const json: any = await res.json();
        if (!res.ok) throw new Error(json?.error_description || 'Failed to get PayPal token');
        return json.access_token as string;
      };

      const createPayPalOrder = async (amount: number, description: string) => {
        const token = await getPayPalAccessToken();
        const res = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
              {
                amount: { currency_code: 'USD', value: amount.toFixed(2) },
                description,
              },
            ],
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Failed to create PayPal order');
        return json;
      };

      const capturePayPalOrder = async (orderId: string) => {
        const token = await getPayPalAccessToken();
        const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Failed to capture PayPal order');
        return json;
      };
      // Add authentication endpoints
      if (pathname.startsWith('/api/auth')) {
        if (pathname === '/api/auth/check') {
          const user = await checkAuth(request);
          return new Response(
            JSON.stringify({ isAuthenticated: !!user, user }), 
            { headers, status: 200 }
          );
        }
      }

      // Cloudinary: list images by prefix/folder
      if (pathname === '/api/cloudinary/list' && request.method === 'GET') {
        const params = new URL(request.url).searchParams;
        const prefix = params.get('prefix') || '';
        const max = Number(params.get('max_results') || '50');
        const cloudName = (env as any).CLOUDINARY_CLOUD_NAME;
        const apiKey = (env as any).CLOUDINARY_API_KEY;
        const apiSecret = (env as any).CLOUDINARY_API_SECRET;
        if (!cloudName || !apiKey || !apiSecret) {
          return new Response(JSON.stringify({ error: 'Missing Cloudinary credentials' }), { headers, status: 500 });
        }
        const auth = 'Basic ' + btoa(`${apiKey}:${apiSecret}`);
        const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/resources/image` + (prefix ? `?prefix=${encodeURIComponent(prefix)}&max_results=${max}` : `?max_results=${max}`);
        const resC = await fetch(url, { headers: { Authorization: auth } });
        const jsonC = await resC.json();
        if (!resC.ok) {
          return new Response(JSON.stringify({ error: jsonC?.error?.message || 'Cloudinary error' }), { headers, status: 500 });
        }
        const items = Array.isArray(jsonC?.resources) ? jsonC.resources.map((r: any) => ({
          public_id: r.public_id,
          format: r.format,
          url: r.secure_url,
          bytes: r.bytes,
          width: r.width,
          height: r.height,
          created_at: r.created_at,
        })) : [];
        return new Response(JSON.stringify({ data: items }), { headers, status: 200 });
      }

      // Public config endpoint
      if (pathname === '/api/config' && request.method === 'GET') {
        return new Response(
          JSON.stringify({
            data: {
              paypal_client_id: (env as any).PAYPAL_CLIENT_ID || null,
            },
          }),
          { headers, status: 200 }
        );
      }

      // Protect dashboard routes
      if (pathname.startsWith('/api/dashboard')) {
        const user = await checkAuth(request);
        if (!user) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }), 
            { headers, status: 401 }
          );
        }
      }

      // Add quick consultation endpoint
      if (pathname === '/api/quick-consultation') {
        if (request.method === 'POST') {
          const data = await request.json();
          const consultation = await prisma.consultation.create({
            data: {
              ...data,
              status: 'pending'
            }
          });
          return new Response(JSON.stringify(consultation), { headers, status: 201 });
        }
      }

      // Payments: create PayPal order
      if (pathname === '/api/payments/create-order' && request.method === 'POST') {
        const { amount, description } = await request.json();
        if (!amount) {
          return new Response(JSON.stringify({ error: 'Amount required' }), { headers, status: 400 });
        }
        const order = await createPayPalOrder(Number(amount), description || 'Order');
        // You could persist order.id with prisma here if needed
        return new Response(
          JSON.stringify({
            data: {
              paypal_order_id: order.id,
              payment_id: order.id,
              status: order.status,
            },
          }),
          { headers, status: 200 }
        );
      }

      // Payments: capture PayPal order
      if (pathname === '/api/payments/capture' && request.method === 'POST') {
        const { order_id } = await request.json();
        if (!order_id) {
          return new Response(JSON.stringify({ error: 'order_id required' }), { headers, status: 400 });
        }
        const captured = await capturePayPalOrder(order_id);
        const captureUnit = captured?.purchase_units?.[0];
        const capture = captureUnit?.payments?.captures?.[0];
        return new Response(
          JSON.stringify({
            data: {
              transaction_id: capture?.id || order_id,
              amount: capture?.amount?.value ? Number(capture.amount.value) : undefined,
              status: capture?.status || captured?.status,
            },
          }),
          { headers, status: 200 }
        );
      }


      if (pathname.startsWith('/api/items')) {
        if (request.method === 'GET') {
          // Obtener todos los items
          const items = await prisma.item.findMany();
          return new Response(JSON.stringify(items), { headers, status: 200 });
        } else if (request.method === 'POST') {
          // Crear un nuevo item
          const data = await request.json();
          const newItem = await prisma.item.create({ data });
          return new Response(JSON.stringify(newItem), { headers, status: 201 });
        } else if (request.method === 'PUT') {
          // Actualizar un item existente; se espera que el JSON incluya "id"
          const data = await request.json();
          const updatedItem = await prisma.item.update({
            where: { id: data.id },
            data,
          });
          return new Response(JSON.stringify(updatedItem), { headers, status: 200 });
        } else if (request.method === 'DELETE') {
          // Borrar un item; se espera un objeto JSON con "id"
          const { id } = await request.json();
          await prisma.item.delete({ where: { id } });
          return new Response(JSON.stringify({ deleted: true }), { headers, status: 200 });
        }
      }

      if (pathname.startsWith('/api/supabase')) {
        const { data, error } = await supabase.from('table_name').select('*');
        if (error) {
          throw error;
        }
        return new Response(JSON.stringify(data), { headers, status: 200 });
      }

      return new Response(JSON.stringify({ message: 'Not Found' }), { 
        headers, 
        status: 404 
      });

    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { 
        headers, 
        status: 500 
      });
    }
  }
};