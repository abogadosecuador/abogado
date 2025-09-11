#!/usr/bin/env node

/**
 * Script de prueba de conexiones
 * Verifica todas las integraciones del sistema
 */

import https from 'https';
import http from 'http';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

async function testConnection(name, url, options = {}) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    console.log(`${colors.blue}Probando ${name}...${colors.reset}`);
    
    const req = protocol.request(url, options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log(`${colors.green}✅ ${name}: Conexión exitosa (${res.statusCode})${colors.reset}`);
        resolve(true);
      } else {
        console.log(`${colors.yellow}⚠️ ${name}: Respuesta con código ${res.statusCode}${colors.reset}`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log(`${colors.red}❌ ${name}: Error de conexión - ${error.message}${colors.reset}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`${colors.red}❌ ${name}: Timeout${colors.reset}`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function testSupabase() {
  const options = {
    method: 'GET',
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieWJoZ3hxZGVmdXF1eWJzdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjAwODMsImV4cCI6MjA3MzEzNjA4M30.s1knFM9QXd8CH8TC0IOtBBBvb-qm2XYl_VlhVb-CqcE'
    }
  };
  
  return await testConnection(
    'Supabase',
    'https://kbybhgxqdefuquybstqk.supabase.co/rest/v1/',
    options
  );
}

async function testCloudinary() {
  const auth = Buffer.from('673776954212897:MOzrryrl-3w0abD2YftOWYOs3O8').toString('base64');
  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`
    }
  };
  
  return await testConnection(
    'Cloudinary',
    'https://api.cloudinary.com/v1_1/dg3s7tqoj/ping',
    options
  );
}

async function testPayPal() {
  const auth = Buffer.from('AWxKgr5n7ex5Lc3fDBOooaVHLgcAB-KCrYXgCmit9DpNXFIuBa6bUypYFjr-hAqARlILGxk_rRTsBZeS:EO-ghpkDi_L5oQx9dkZPg3gABTs_UuWmsBtaexDyfYfXMhjbcJ3KK0LAuntr4zjoNSViGHZ_rkD7-YCt').toString('base64');
  
  return new Promise((resolve) => {
    const postData = 'grant_type=client_credentials';
    
    const options = {
      hostname: 'api-m.paypal.com',
      port: 443,
      path: '/v1/oauth2/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    console.log(`${colors.blue}Probando PayPal...${colors.reset}`);
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`${colors.green}✅ PayPal: Autenticación exitosa${colors.reset}`);
          resolve(true);
        } else {
          console.log(`${colors.yellow}⚠️ PayPal: Respuesta con código ${res.statusCode}${colors.reset}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`${colors.red}❌ PayPal: Error - ${error.message}${colors.reset}`);
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}

async function testCloudflareWorker() {
  return await testConnection(
    'Cloudflare Worker',
    'https://abogadosecuador.workers.dev/api/health'
  );
}

async function testN8N() {
  return await testConnection(
    'N8N Webhook',
    'https://n8n-latest-hurl.onrender.com'
  );
}

async function runAllTests() {
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.blue}🔍 Iniciando prueba de conexiones${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}\n`);
  
  const results = {
    supabase: await testSupabase(),
    cloudinary: await testCloudinary(),
    paypal: await testPayPal(),
    worker: await testCloudflareWorker(),
    n8n: await testN8N()
  };
  
  console.log(`\n${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.blue}📊 RESUMEN DE RESULTADOS${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}\n`);
  
  let allPassed = true;
  
  for (const [service, status] of Object.entries(results)) {
    const icon = status ? '✅' : '❌';
    const color = status ? colors.green : colors.red;
    console.log(`${color}${icon} ${service.charAt(0).toUpperCase() + service.slice(1)}: ${status ? 'Operativo' : 'Fallo'}${colors.reset}`);
    if (!status) allPassed = false;
  }
  
  console.log(`\n${colors.blue}${'='.repeat(50)}${colors.reset}`);
  
  if (allPassed) {
    console.log(`${colors.green}✅ Todas las conexiones están funcionando correctamente${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️ Algunas conexiones requieren atención${colors.reset}`);
    console.log(`${colors.yellow}Ejecuta el script de diagnóstico para más detalles${colors.reset}`);
  }
  
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}\n`);
}

// Ejecutar las pruebas
runAllTests().catch(console.error);
