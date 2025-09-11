/**
 * Sistema de Diagnóstico y Corrección Automática
 * Monitorea y corrige errores automáticamente
 */

export class DiagnosticSystem {
  constructor() {
    this.errors = [];
    this.corrections = [];
    this.healthStatus = {};
  }

  async diagnose(env) {
    console.log('🔍 Iniciando diagnóstico del sistema...');
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      services: {},
      errors: [],
      corrections: []
    };

    // 1. Verificar KV Namespace
    try {
      await env.ABOGADO_WILSON_KV.put('diagnostic:test', Date.now().toString());
      const testValue = await env.ABOGADO_WILSON_KV.get('diagnostic:test');
      diagnostics.services.kv = testValue ? 'operational' : 'degraded';
      await env.ABOGADO_WILSON_KV.delete('diagnostic:test');
    } catch (error) {
      diagnostics.services.kv = 'failed';
      diagnostics.errors.push({ service: 'KV', error: error.message });
      diagnostics.corrections.push({ 
        service: 'KV', 
        action: 'Verificar configuración de KV namespace en wrangler.toml',
        command: 'wrangler kv:namespace create ABOGADO_WILSON_KV'
      });
    }

    // 2. Verificar D1 Database
    try {
      const result = await env.ABOGADO_WILSON_DB.prepare('SELECT 1 as test').first();
      diagnostics.services.d1 = result ? 'operational' : 'degraded';
      
      // Crear tabla si no existe
      await env.ABOGADO_WILSON_DB.prepare(`
        CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          message TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      
      await env.ABOGADO_WILSON_DB.prepare(`
        CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          message TEXT,
          data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      
    } catch (error) {
      diagnostics.services.d1 = 'failed';
      diagnostics.errors.push({ service: 'D1', error: error.message });
      diagnostics.corrections.push({ 
        service: 'D1', 
        action: 'Verificar configuración de D1 database',
        command: 'wrangler d1 create abogadosecuador'
      });
    }

    // 3. Verificar Supabase
    try {
      const response = await fetch('https://kbybhgxqdefuquybstqk.supabase.co/rest/v1/', {
        headers: {
          'apikey': env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieWJoZ3hxZGVmdXF1eWJzdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjAwODMsImV4cCI6MjA3MzEzNjA4M30.s1knFM9QXd8CH8TC0IOtBBBvb-qm2XYl_VlhVb-CqcE'
        }
      });
      diagnostics.services.supabase = response.ok ? 'operational' : 'degraded';
    } catch (error) {
      diagnostics.services.supabase = 'failed';
      diagnostics.errors.push({ service: 'Supabase', error: error.message });
      diagnostics.corrections.push({ 
        service: 'Supabase', 
        action: 'Verificar API key de Supabase',
        command: 'wrangler secret put SUPABASE_KEY'
      });
    }

    // 4. Verificar Cloudinary
    try {
      const auth = btoa('673776954212897:MOzrryrl-3w0abD2YftOWYOs3O8');
      const response = await fetch('https://api.cloudinary.com/v1_1/dg3s7tqoj/resources/image', {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });
      diagnostics.services.cloudinary = response.ok ? 'operational' : 'degraded';
    } catch (error) {
      diagnostics.services.cloudinary = 'failed';
      diagnostics.errors.push({ service: 'Cloudinary', error: error.message });
    }

    // 5. Verificar PayPal
    try {
      const auth = btoa('AWxKgr5n7ex5Lc3fDBOooaVHLgcAB-KCrYXgCmit9DpNXFIuBa6bUypYFjr-hAqARlILGxk_rRTsBZeS:EO-ghpkDi_L5oQx9dkZPg3gABTs_UuWmsBtaexDyfYfXMhjbcJ3KK0LAuntr4zjoNSViGHZ_rkD7-YCt');
      const response = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });
      diagnostics.services.paypal = response.ok ? 'operational' : 'degraded';
    } catch (error) {
      diagnostics.services.paypal = 'failed';
      diagnostics.errors.push({ service: 'PayPal', error: error.message });
    }

    // Calcular estado general
    const statuses = Object.values(diagnostics.services);
    if (statuses.every(s => s === 'operational')) {
      diagnostics.overall = 'healthy';
    } else if (statuses.some(s => s === 'failed')) {
      diagnostics.overall = 'critical';
    } else {
      diagnostics.overall = 'degraded';
    }

    // Aplicar correcciones automáticas si es necesario
    if (diagnostics.errors.length > 0) {
      console.log('🔧 Aplicando correcciones automáticas...');
      await this.autoCorrect(diagnostics, env);
    }

    return diagnostics;
  }

  async autoCorrect(diagnostics, env) {
    for (const error of diagnostics.errors) {
      console.log(`🔧 Corrigiendo error en ${error.service}...`);
      
      switch(error.service) {
        case 'KV':
          // Intentar reconectar con KV
          try {
            await env.ABOGADO_WILSON_KV.put('autocorrect:test', 'fixed');
            console.log('✅ KV reconectado');
          } catch (e) {
            console.error('❌ No se pudo reconectar KV:', e);
          }
          break;
          
        case 'D1':
          // Intentar recrear tablas
          try {
            await this.initializeDatabase(env.ABOGADO_WILSON_DB);
            console.log('✅ D1 inicializado');
          } catch (e) {
            console.error('❌ No se pudo inicializar D1:', e);
          }
          break;
          
        case 'Supabase':
          // Verificar conectividad
          console.log('⚠️ Verificar credenciales de Supabase');
          break;
          
        default:
          console.log(`⚠️ Corrección manual requerida para ${error.service}`);
      }
    }
  }

  async initializeDatabase(db) {
    const tables = [
      `CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        message TEXT,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE NOT NULL,
        user_data TEXT,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_name TEXT NOT NULL,
        value REAL,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const table of tables) {
      await db.prepare(table).run();
    }
  }

  async logError(error, context, env) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      context: context
    };

    try {
      // Guardar en KV
      await env.ABOGADO_WILSON_KV.put(
        `error:${Date.now()}`,
        JSON.stringify(errorLog),
        { expirationTtl: 86400 * 30 }
      );

      // Guardar en D1
      await env.ABOGADO_WILSON_DB.prepare(
        'INSERT INTO logs (type, message, data) VALUES (?, ?, ?)'
      ).bind('error', error.message, JSON.stringify(errorLog)).run();

      // Si es crítico, enviar notificación
      if (context.critical) {
        await this.sendAlert(errorLog, env);
      }
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  async sendAlert(errorLog, env) {
    // Enviar alerta por webhook
    try {
      await fetch('https://n8n-latest-hurl.onrender.com/webhook/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'critical_error',
          error: errorLog,
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      console.error('Failed to send alert:', e);
    }
  }

  async getHealthReport(env) {
    const report = await this.diagnose(env);
    
    return {
      status: report.overall,
      services: report.services,
      errors: report.errors.length,
      lastCheck: report.timestamp,
      recommendations: report.corrections
    };
  }
}

export default DiagnosticSystem;
