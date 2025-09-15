import React from 'react';
import { FaPaypal } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import PayPalButton from './PayPalButton';

const PaymentSystem = ({ amount, onPaymentComplete, productName = 'Servicio Legal' }) => {
  if (!amount || Number(amount) <= 0) {
    toast.error('Monto inválido');
    return null;
  }
  
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Completar Pago</h2>
        <p className="text-gray-600">{productName}</p>
        <div className="text-3xl font-bold text-green-600 mt-2">${Number(amount).toFixed(2)}</div>
      </div>

      <div className="mb-6 text-center">
        <FaPaypal className="mx-auto h-12 w-12 text-blue-600 mb-3" />
        <p className="text-gray-600">Pago seguro con PayPal</p>
      </div>

      <PayPalButton amount={Number(amount)} />

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          🔒 Su información está protegida con encriptación SSL de 256 bits
        </p>
      </div>
    </div>
  );
};

export default PaymentSystem;
