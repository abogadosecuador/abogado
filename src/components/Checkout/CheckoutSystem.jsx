import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCreditCard, FaPaypal, FaBitcoin, FaLock, FaCheckCircle,
  FaShippingFast, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaArrowLeft, FaArrowRight, FaShoppingCart, FaPercent,
  FaWallet, FaMobileAlt, FaQrcode, FaUniversity, FaTimes
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import PayPalButton from '../Payment/PayPalButton.jsx';

const CheckoutSystem = () => {
  const navigate = useNavigate();
  const { items: cartItems, clearCart, total } = useCart();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  
  const [billingInfo, setBillingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    identification: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Ecuador'
  });
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardInfo, setCardInfo] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const steps = [
    { id: 1, name: 'Carrito', icon: FaShoppingCart },
    { id: 2, name: 'Información', icon: FaUser },
    { id: 3, name: 'Pago', icon: FaCreditCard },
    { id: 4, name: 'Confirmación', icon: FaCheckCircle }
  ];

  const paymentMethods = [
    { id: 'card', name: 'Tarjeta de Crédito/Débito', icon: FaCreditCard, color: 'blue' },
    { id: 'paypal', name: 'PayPal', icon: FaPaypal, color: 'indigo' },
    { id: 'crypto', name: 'Bitcoin/Crypto', icon: FaBitcoin, color: 'orange' },
    { id: 'bank', name: 'Transferencia Bancaria', icon: FaUniversity, color: 'green' },
    { id: 'mobile', name: 'Pago Móvil', icon: FaMobileAlt, color: 'purple' },
    { id: 'qr', name: 'Código QR', icon: FaQrcode, color: 'pink' }
  ];

  const promoCodes = {
    'WELCOME10': 10,
    'LEGAL20': 20,
    'VIP30': 30,
    'FIRST50': 50
  };

  const calculateSubtotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.12; // 12% IVA
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const discountAmount = (subtotal * discount) / 100;
    return subtotal + tax - discountAmount;
  };

  const applyPromoCode = () => {
    const code = promoCode.toUpperCase();
    if (promoCodes[code]) {
      setDiscount(promoCodes[code]);
      toast.success(`¡Código aplicado! ${promoCodes[code]}% de descuento`);
    } else {
      toast.error('Código inválido');
    }
  };

  const validateBillingInfo = () => {
    const required = ['fullName', 'email', 'phone', 'identification', 'address', 'city'];
    for (let field of required) {
      if (!billingInfo[field]) {
        toast.error(`Por favor complete: ${field}`);
        return false;
      }
    }
    if (!/\S+@\S+\.\S+/.test(billingInfo.email)) {
      toast.error('Email inválido');
      return false;
    }
    return true;
  };

  const validateCardInfo = () => {
    if (paymentMethod !== 'card') return true;
    
    if (!cardInfo.number || cardInfo.number.length < 16) {
      toast.error('Número de tarjeta inválido');
      return false;
    }
    if (!cardInfo.name) {
      toast.error('Ingrese el nombre del titular');
      return false;
    }
    if (!cardInfo.expiry || !cardInfo.expiry.match(/^\d{2}\/\d{2}$/)) {
      toast.error('Fecha de expiración inválida (MM/YY)');
      return false;
    }
    if (!cardInfo.cvv || cardInfo.cvv.length < 3) {
      toast.error('CVV inválido');
      return false;
    }
    return true;
  };

  const processPayment = async () => {
    setIsProcessing(true);
    
    // Si el método es PayPal, no procesamos aquí. El botón PayPal gestiona la orden/captura.
    if (paymentMethod === 'paypal') {
      setIsProcessing(false);
      toast('Use el botón de PayPal para completar el pago de forma segura.', { icon: '🛡️' });
      return;
    }

    // Simular procesamiento (tarjeta, banco, otros). Reemplace con integración real.
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Éxito
    setOrderComplete(true);
    setCurrentStep(4);
    clearCart();
    
    // Celebración
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    toast.success('¡Pago procesado exitosamente!');
    setIsProcessing(false);
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (cartItems.length === 0) {
        toast.error('El carrito está vacío');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateBillingInfo()) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Para PayPal no validamos tarjeta; para tarjeta sí
      if (paymentMethod === 'card' && !validateCardInfo()) return;
      await processPayment();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1 && !orderComplete) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step 1: Carrito
  const CartStep = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Resumen del Pedido</h3>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Tu carrito está vacío</p>
          <button
            onClick={() => navigate('/tienda')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Ir a la Tienda
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Código Promocional */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Código promocional"
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button
                onClick={applyPromoCode}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Aplicar
              </button>
            </div>
            {discount > 0 && (
              <p className="text-green-600 mt-2">
                <FaCheckCircle className="inline mr-1" />
                {discount}% de descuento aplicado
              </p>
            )}
          </div>

          {/* Totales */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento ({discount}%):</span>
                <span>-${((calculateSubtotal() * discount) / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>IVA (12%):</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Step 2: Información
  const BillingStep = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Información de Facturación</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre Completo *</label>
          <input
            type="text"
            value={billingInfo.fullName}
            onChange={(e) => setBillingInfo({...billingInfo, fullName: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            value={billingInfo.email}
            onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Teléfono *</label>
          <input
            type="tel"
            value={billingInfo.phone}
            onChange={(e) => setBillingInfo({...billingInfo, phone: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Cédula/RUC *</label>
          <input
            type="text"
            value={billingInfo.identification}
            onChange={(e) => setBillingInfo({...billingInfo, identification: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Dirección *</label>
          <input
            type="text"
            value={billingInfo.address}
            onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Ciudad *</label>
          <input
            type="text"
            value={billingInfo.city}
            onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Provincia</label>
          <input
            type="text"
            value={billingInfo.province}
            onChange={(e) => setBillingInfo({...billingInfo, province: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Código Postal</label>
          <input
            type="text"
            value={billingInfo.postalCode}
            onChange={(e) => setBillingInfo({...billingInfo, postalCode: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">País</label>
          <select
            value={billingInfo.country}
            onChange={(e) => setBillingInfo({...billingInfo, country: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Ecuador">Ecuador</option>
            <option value="Colombia">Colombia</option>
            <option value="Peru">Perú</option>
            <option value="USA">Estados Unidos</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Step 3: Pago
  const PaymentStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-4">Método de Pago</h3>
      
      {/* Métodos de Pago */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => setPaymentMethod(method.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              paymentMethod === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <method.icon className={`text-2xl mb-2 text-${method.color}-500`} />
            <p className="text-sm font-medium">{method.name}</p>
          </button>
        ))}
      </div>

      {/* Formulario de Tarjeta */}
      {paymentMethod === 'card' && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Número de Tarjeta</label>
            <input
              type="text"
              value={cardInfo.number}
              onChange={(e) => setCardInfo({...cardInfo, number: e.target.value.replace(/\s/g, '')})}
              placeholder="1234 5678 9012 3456"
              maxLength="16"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Nombre del Titular</label>
            <input
              type="text"
              value={cardInfo.name}
              onChange={(e) => setCardInfo({...cardInfo, name: e.target.value})}
              placeholder="JUAN PEREZ"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Exp.</label>
              <input
                type="text"
                value={cardInfo.expiry}
                onChange={(e) => setCardInfo({...cardInfo, expiry: e.target.value})}
                placeholder="MM/YY"
                maxLength="5"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">CVV</label>
              <input
                type="text"
                value={cardInfo.cvv}
                onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value})}
                placeholder="123"
                maxLength="4"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Otros métodos de pago */}
      {paymentMethod === 'paypal' && (
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="text-center mb-4">
            <FaPaypal className="text-6xl text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-900">Paga de forma segura con PayPal. La orden y captura se validan en el servidor.</p>
          </div>
          <PayPalButton 
            amount={Number(calculateTotal().toFixed(2))}
            metadata={{
              billing: billingInfo,
              cart: cartItems?.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, type: i.type })),
              totals: {
                subtotal: Number(calculateSubtotal().toFixed(2)),
                tax: Number(calculateTax().toFixed(2)),
                total: Number(calculateTotal().toFixed(2)),
                discountPercent: discount
              }
            }}
          />
        </div>
      )}

      {paymentMethod === 'crypto' && (
        <div className="bg-orange-50 p-6 rounded-lg text-center">
          <FaBitcoin className="text-6xl text-orange-600 mx-auto mb-4" />
          <p>Se generará una dirección de Bitcoin para el pago</p>
        </div>
      )}

      {paymentMethod === 'bank' && (
        <div className="bg-green-50 p-6 rounded-lg">
          <h4 className="font-semibold mb-2">Datos para Transferencia:</h4>
          <p className="text-sm">Banco: Banco Pichincha</p>
          <p className="text-sm">Cuenta: 2200123456</p>
          <p className="text-sm">Tipo: Ahorros</p>
          <p className="text-sm">Beneficiario: Abogado Wilson Ipiales</p>
        </div>
      )}

      {/* Seguridad */}
      <div className="flex items-center justify-center text-gray-500 text-sm">
        <FaLock className="mr-2" />
        <span>Pago seguro con encriptación SSL de 256-bit</span>
      </div>
    </div>
  );

  // Step 4: Confirmación
  const ConfirmationStep = () => (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
      </motion.div>
      
      <h2 className="text-2xl font-bold mb-2">¡Pedido Confirmado!</h2>
      <p className="text-gray-600 mb-6">
        Tu pedido #ORD-{Date.now().toString().slice(-6)} ha sido procesado exitosamente
      </p>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-6 max-w-md mx-auto">
        <p className="text-sm text-gray-600 mb-2">Total pagado:</p>
        <p className="text-3xl font-bold text-blue-600">${calculateTotal().toFixed(2)}</p>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Ir a Mi Dashboard
        </button>
        <button
          onClick={() => navigate('/tienda')}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 ml-3"
        >
          Seguir Comprando
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  currentStep >= step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  <step.icon />
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-full ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} style={{ width: '100px' }} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <span key={step.id} className={`text-sm ${
                currentStep >= step.id ? 'text-blue-600 font-medium' : 'text-gray-400'
              }`}>
                {step.name}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {currentStep === 1 && <CartStep />}
              {currentStep === 2 && <BillingStep />}
              {currentStep === 3 && <PaymentStep />}
              {currentStep === 4 && <ConfirmationStep />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {!orderComplete && (
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg flex items-center ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FaArrowLeft className="mr-2" />
                Anterior
              </button>
              
              <button
                onClick={handleNextStep}
                disabled={isProcessing || (currentStep === 3 && paymentMethod === 'paypal')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg flex items-center"
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Procesando...
                  </>
                ) : currentStep === 3 ? (
                  <>
                    <FaLock className="mr-2" />
                    {paymentMethod === 'paypal' ? 'Complete con PayPal ↓' : `Pagar $${calculateTotal().toFixed(2)}`}
                  </>
                ) : (
                  <>
                    Siguiente
                    <FaArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutSystem;
