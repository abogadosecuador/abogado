import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const TestSupabase = () => {
  const [message, setMessage] = useState('Testing Supabase connection...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(1);

        if (error) throw error;
        
        setMessage('✅ Successfully connected to Supabase!');
        console.log('Supabase data:', data);
      } catch (err) {
        console.error('Supabase error:', err);
        setError(`❌ Error connecting to Supabase: ${err.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>
      <div className="p-4 bg-gray-100 rounded">
        <p className={error ? 'text-red-600' : 'text-green-600'}>
          {error || message}
        </p>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Not set'}</p>
        <p>Supabase Anon Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</p>
      </div>
    </div>
  );
};

export default TestSupabase;
