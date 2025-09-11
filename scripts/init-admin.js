#!/usr/bin/env node

/**
 * Script para inicializar el usuario administrador
 * Credenciales: willyipiales12@gmail.com / willy12
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kbybhgxqdefuquybstqk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY no está configurado');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createAdminUser() {
  console.log('🔧 Inicializando usuario administrador...');
  
  const adminEmail = 'willyipiales12@gmail.com';
  const adminPassword = 'willy12';
  
  try {
    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', adminEmail)
      .single();
    
    if (existingUser) {
      console.log('✅ El usuario administrador ya existe');
      
      // Actualizar rol a admin si no lo es
      if (existingUser.role !== 'admin') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('email', adminEmail);
        
        if (updateError) {
          console.error('❌ Error actualizando rol:', updateError.message);
        } else {
          console.log('✅ Rol actualizado a admin');
        }
      }
      
      return;
    }
    
    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Wilson Ipiales',
        role: 'admin'
      }
    });
    
    if (authError) {
      // Si el error es que el usuario ya existe, intentar actualizar
      if (authError.message.includes('already exists')) {
        console.log('⚠️ Usuario ya existe en Auth, actualizando perfil...');
        
        // Obtener el ID del usuario
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const user = users.find(u => u.email === adminEmail);
        
        if (user) {
          // Actualizar o crear perfil
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              email: adminEmail,
              full_name: 'Wilson Ipiales',
              role: 'admin',
              phone: '+59398835269',
              email_verified: true,
              created_at: new Date().toISOString()
            });
          
          if (profileError) {
            console.error('❌ Error creando perfil:', profileError.message);
          } else {
            console.log('✅ Perfil de administrador actualizado');
          }
        }
      } else {
        throw authError;
      }
    } else if (authData && authData.user) {
      // Crear perfil en la tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: adminEmail,
          full_name: 'Wilson Ipiales',
          role: 'admin',
          phone: '+59398835269',
          email_verified: true,
          created_at: new Date().toISOString()
        });
      
      if (profileError) {
        console.error('❌ Error creando perfil:', profileError.message);
      } else {
        console.log('✅ Usuario administrador creado exitosamente');
        console.log('📧 Email:', adminEmail);
        console.log('🔑 Contraseña:', adminPassword);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar
createAdminUser()
  .then(() => {
    console.log('✨ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
