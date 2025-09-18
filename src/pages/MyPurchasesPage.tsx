import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/supabaseService';
import { ShoppingCart, Download, BookOpen, Briefcase, Award } from 'lucide-react';

const iconMap = {
  course: <BookOpen className="h-6 w-6 text-blue-500" />,
  service: <Briefcase className="h-6 w-6 text-green-500" />,
  plan: <Award className="h-6 w-6 text-purple-500" />,
  ebook: <BookOpen className="h-6 w-6 text-orange-500" />,
  default: <ShoppingCart className="h-6 w-6 text-gray-500" />
};

const MyPurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user) return;
      try {
        const { data, error } = await dataService.getAll('purchases', { filters: [{ column: 'user_id', value: user.id }] });
        if (error) throw error;
        setPurchases(data || []);
      } catch (err) {
        console.error('Error al cargar las compras:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [user]);

  if (loading) return <div className="text-center py-20">Cargando historial de compras...</div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center text-gray-800"><ShoppingCart className="h-8 w-8 mr-3 text-blue-600"/> Mis Compras</h1>
        <p className="mt-1 text-gray-600">Tu historial de productos y servicios adquiridos.</p>
      </header>

      {purchases.length > 0 ? (
        <div className="space-y-4">
          {purchases.map(purchase => (
            <div key={purchase.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {iconMap[purchase.item_type] || iconMap.default}
                <div>
                  <p className="font-semibold text-gray-900">{purchase.item_name}</p>
                  <p className="text-sm text-gray-500">{new Date(purchase.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-800">${purchase.amount.toFixed(2)}</p>
                {['ebook', 'masterclass'].includes(purchase.item_type) && (
                  <a href={purchase.download_url || '#'} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline inline-flex items-center mt-1">
                    <Download size={14} className="mr-1" /> Descargar
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm"><p className="text-gray-500">No has realizado ninguna compra todavía.</p></div>
      )}
    </div>
  );
};

export default MyPurchasesPage;