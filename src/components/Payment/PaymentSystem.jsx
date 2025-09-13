import React, { useState, useEffect } from 'react';
import { FaPaypal, FaCreditCard, FaBitcoin, FaDollarSign, FaUpload, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

const PaymentSystem = ({ amount, onPaymentComplete, productName = 'Servicio Legal' }) => {
  const { user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const ENABLE_CRYPTO = import.meta.env?.VITE_ENABLE_CRYPTO === 'true';

  let paymentMethods = [
    {
      id: 'paypal',
      name: 'PayPal',
      icon: FaPaypal,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Pago seguro con PayPal'
    },
    {
      id: 'card',
      name: 'Tarjeta de Crédito/Débito',
      icon: FaCreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Visa, Mastercard, American Express'
    },
    {
      id: 'transfer',
      name: 'Transferencia Bancaria',
      icon: FaDollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Transferencia directa a cuenta bancaria'
    }
  ];

  // Agregar crypto sólo si la variable de entorno lo habilita explícitamente
  if (ENABLE_CRYPTO) {
    paymentMethods.splice(2, 0, {
      id: 'crypto',
      name: 'Criptomonedas',
      icon: FaBitcoin,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Bitcoin, Ethereum, USDT'
    });
  }

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí iría la lógica real de pago según el método seleccionado
      let result;
      switch (paymentMethod) {
        case 'paypal':
          result = await processPayPalPayment();
          break;
        case 'card':
          result = await processCardPayment();
          break;
        case 'crypto':
          if (!ENABLE_CRYPTO) {
            throw new Error('El pago con criptomonedas está desactivado.');
          }
          result = await processCryptoPayment();
          break;
        case 'transfer':
          result = await processBankTransfer();
          break;
        default:
          throw new Error('Método de pago no válido');
      }
      // Sólo marcar como completado si el método fue validado y finalizado
      if (result?.finalized) {
        toast.success('Pago procesado exitosamente');
        onPaymentComplete && onPaymentComplete({
          method: paymentMethod,
          amount,
          transactionId: result.transactionId || generateTransactionId(),
          timestamp: new Date().toISOString()
        });
      } else if (result?.status === 'pending') {
        toast('Comprobante enviado. Tu pago está en revisión.', { icon: '⏳' });
      }
      
    } catch (error) {
      console.error('Error en el pago:', error);
      toast.error('Error al procesar el pago. Inténtelo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processPayPalPayment = async () => {
    // Integración con PayPal
    console.log('Procesando pago con PayPal...');
    // Aquí iría la integración real con PayPal
    return { finalized: true };
  };

  const processCardPayment = async () => {
    // Validar datos de tarjeta
    if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name) {
      throw new Error('Por favor complete todos los datos de la tarjeta');
    }
    
    console.log('Procesando pago con tarjeta...');
    // Aquí iría la integración real con Stripe u otro procesador
    return { finalized: true };
  };

  const processCryptoPayment = async () => {
    console.log('Procesando pago con criptomonedas...');
    // Aquí iría la integración real con procesadores de crypto
    return { finalized: false };
  };

  const processBankTransfer = async () => {
    if (!uploadedFile) {
      throw new Error('Por favor suba el comprobante de transferencia');
    }
    
    console.log('Procesando transferencia bancaria...');
    // Aquí se debe enviar el comprobante a backend para revisión manual
    // No se otorga acceso inmediato; queda en estado pendiente
    try {
      const formData = new FormData();
      formData.append('receipt', uploadedFile);
      formData.append('amount', String(amount));
      formData.append('productName', productName);
      if (user) {
        formData.append('userId', user.id);
      }
      await fetch('/api/payments/bank-transfer', {
        method: 'POST',
        body: formData
      });
    } catch (e) {
      console.warn('No se pudo subir comprobante al backend (modo fallback):', e?.message);
    }
    return { status: 'pending', finalized: false };
  };

  const generateTransactionId = () => {
    return 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }
      setUploadedFile(file);
    }
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Tarjeta
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={cardData.number}
                onChange={(e) => setCardData({...cardData, number: e.target.value})}
                maxLength="19"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Vencimiento
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                  maxLength="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                  maxLength="4"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre en la Tarjeta
              </label>
              <input
                type="text"
                placeholder="Juan Pérez"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={cardData.name}
                onChange={(e) => setCardData({...cardData, name: e.target.value})}
              />
            </div>
          </div>
        );

      case 'transfer':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Datos Bancarios</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Banco:</strong> Banco del Pichincha</p>
                <p><strong>Cuenta:</strong> 2100123456789</p>
                <p><strong>Titular:</strong> Wilson Ipiales</p>
                <p><strong>Tipo:</strong> Cuenta Corriente</p>
                <p><strong>Monto:</strong> ${amount}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comprobante de Transferencia
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {uploadedFile ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FaCheck className="text-green-500" />
                    <span className="text-green-600">{uploadedFile.name}</span>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <div>
                    <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Haga clic para subir o arrastre el archivo aquí
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                    >
                      Seleccionar Archivo
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'crypto':
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">Direcciones de Pago</h4>
              <div className="space-y-2 text-sm text-orange-800">
                <div>
                  <p><strong>Bitcoin (BTC):</strong></p>
                  <p className="font-mono text-xs break-all">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</p>
                </div>
                <div>
                  <p><strong>Ethereum (ETH):</strong></p>
                  <p className="font-mono text-xs break-all">0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6</p>
                </div>
                <div>
                  <p><strong>USDT (TRC20):</strong></p>
                  <p className="font-mono text-xs break-all">TQn9Y2khDD95J42FQtQTdwVVRZqjqXqKqK</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Envíe exactamente ${amount} USD. 
                El pago será confirmado automáticamente una vez recibido.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <FaPaypal className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <p className="text-gray-600">
              Será redirigido a PayPal para completar su pago de forma segura.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Completar Pago</h2>
        <p className="text-gray-600">{productName}</p>
        <div className="text-3xl font-bold text-green-600 mt-2">${amount}</div>
      </div>

      {/* Métodos de pago */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Seleccione método de pago</h3>
        <div className="grid grid-cols-2 gap-4">
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
              <div className="flex items-center space-x-3">
                <method.icon className={`text-xl ${method.color}`} />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{method.name}</p>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Formulario de pago */}
      <div className="mb-6">
        {renderPaymentForm()}
      </div>

      {/* Botón de pago */}
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Procesando pago...
          </div>
        ) : (
          `Pagar $${amount}`
        )}
      </button>

      {/* Información de seguridad */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          🔒 Su información está protegida con encriptación SSL de 256 bits
        </p>
      </div>
    </div>
  );
};

export default PaymentSystem;
