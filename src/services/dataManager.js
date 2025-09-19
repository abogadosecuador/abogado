import { supabase } from '../config/supabase';

export const dataManager = {
  // GUARDAR CONTACTOS
  saveContact: async (data) => {
    return await supabase.from('contacts').insert([data]);
  },
  
  // GUARDAR USUARIOS
  saveUser: async (data) => {
    return await supabase.from('profiles').insert([data]);
  },
  
  // GUARDAR PRODUCTOS
  saveProduct: async (data) => {
    return await supabase.from('products').insert([data]);
  },
  
  // GUARDAR VENTAS
  saveOrder: async (data) => {
    return await supabase.from('orders').insert([data]);
  },
  
  // GUARDAR SUSCRIPTORES
  saveSubscriber: async (email) => {
    return await supabase.from('subscribers').insert([{email}]);
  }
};
