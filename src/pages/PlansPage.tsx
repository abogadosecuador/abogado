import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { dataService } from '../services/supabaseService';

const PlanCard = ({ plan }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({ ...plan, type: 'plan' });
  };

  return (
    <div className={`flex flex-col rounded-lg shadow-lg transition-all duration-300 ${plan.is_featured ? 'border-2 border-blue-600 scale-105 bg-white' : 'bg-white'}`}>
      <div className="p-6">
        <h3 className={`text-2xl font-bold ${plan.is_featured ? 'text-blue-600' : 'text-gray-900'}`}>{plan.name}</h3>
        <p className="mt-2 text-gray-600 h-12">{plan.description}</p>
        <p className="mt-6"><span className="text-4xl font-extrabold text-gray-900">${plan.price}</span><span className="text-base font-medium text-gray-500">/mes</span></p>
        <button onClick={handleAddToCart} className={`mt-6 w-full py-3 rounded-md font-semibold ${plan.is_featured ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}>Añadir al Carrito</button>
      </div>
      <div className="p-6 border-t flex-grow">
        <h4 className="font-semibold text-gray-700">Incluye:</h4>
        <ul className="mt-4 space-y-3">
          {plan.features?.map((feature, index) => (
            <li key={index} className="flex space-x-3"><Check className="flex-shrink-0 h-5 w-5 text-green-500" /><span>{feature}</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await dataService.getAll('plans', { order: { column: 'price', asc: true } });
        if (error) throw error;
        setPlans(data || []);
      } catch (err) {
        console.error('Error al cargar los planes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (loading) return <div className="text-center py-20">Cargando planes...</div>;

  return (
    <div className="bg-gray-50 py-12 lg:py-20">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-gray-900">Planes a tu Medida</h1>
        <p className="mt-4 text-xl text-gray-600">Asesoría legal experta y continua con nuestros planes de suscripción.</p>
      </div>
      <div className="grid max-w-screen-xl mx-auto gap-8 lg:grid-cols-4 items-start mt-16 px-4">
        {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
      </div>
    </div>
  );
};

export default PlansPage;
