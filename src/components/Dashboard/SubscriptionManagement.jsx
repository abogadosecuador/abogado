import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const SubscriptionManagement = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch available plans and user's current subscription in parallel
        const [plansRes, subRes] = await Promise.all([
          fetch('/api/subscriptions/plans', { headers }),
          fetch('/api/subscriptions', { headers }),
        ]);

        if (!plansRes.ok) throw new Error('No se pudieron cargar los planes.');
        if (!subRes.ok) throw new Error('No se pudo cargar tu suscripción actual.');

        const plansData = await plansRes.json();
        const subData = await subRes.json();

        setPlans(plansData.data || []);
        setCurrentSubscription(subData.data || null);

      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleChoosePlan = (planId) => {
    // Logic to redirect to checkout with the selected plan
    toast.success(`Has seleccionado el plan. Redirigiendo al pago...`);
    // navigate(`/checkout?plan=${planId}`);
  };

  if (loading) {
    return <div className="text-center p-8">Cargando tu información de suscripción...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800">Suscripciones y Tokens</h1>
        <p className="text-gray-500 mt-1">Gestiona tu plan y accede a beneficios exclusivos.</p>
      </div>

      {currentSubscription ? (
        <div className="bg-brand text-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold">Tu Plan Actual: {currentSubscription.plan.name}</h2>
          <p className="opacity-80 mt-2">Tu suscripción está activa hasta el {new Date(currentSubscription.end_date).toLocaleDateString()}</p>
          <button className="mt-4 px-6 py-2 bg-white text-brand font-bold rounded-lg">Gestionar Suscripción</button>
        </div>
      ) : (
        <div className="bg-yellow-100 text-yellow-800 rounded-2xl p-6">
          <h2 className="font-bold">No tienes una suscripción activa. ¡Elige un plan para empezar!</h2>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map(plan => (
          <div key={plan.id} className={`bg-white rounded-2xl shadow-lg p-8 border-t-4 ${plan.name === 'Intermedio' ? 'border-accent' : 'border-brand'}`}>
            {plan.name === 'Intermedio' && <FaStar className="text-accent text-2xl mb-4" />}
            <h3 className="text-2xl font-bold text-gray-800">{plan.name}</h3>
            <p className="text-gray-500 my-4">{plan.description}</p>
            <div className="text-4xl font-bold text-gray-900 mb-4">${plan.price}<span className="text-base font-normal">/mes</span></div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> {plan.tokens_granted} Tokens al mes</li>
              {/* Add other plan features here */}
            </ul>
            <button 
              onClick={() => handleChoosePlan(plan.id)}
              className={`w-full py-3 rounded-lg font-bold ${plan.name === 'Intermedio' ? 'bg-accent text-white' : 'bg-brand text-white'}`}>
              {currentSubscription?.plan_id === plan.id ? 'Plan Actual' : 'Elegir Plan'}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SubscriptionManagement;
