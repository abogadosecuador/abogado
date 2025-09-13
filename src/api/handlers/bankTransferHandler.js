import { corsHeaders } from '../headers.js';

// Esta es una implementación básica. En un entorno de producción,
// considera usar un SDK de Cloudinary para más robustez.
async function uploadToCloudinary(file, env) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'receipts'); // Asume un upload preset 'receipts' en Cloudinary

  const response = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error.message || 'Error al subir a Cloudinary');
  }
  return data.secure_url;
}

export class BankTransferHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
  }

  async handle(request) {
    try {
      const formData = await request.formData();
      const receiptFile = formData.get('receipt');
      const amount = formData.get('amount');
      const productName = formData.get('productName');
      const userId = formData.get('userId'); // El cliente debería enviar el ID de usuario si está logueado

      if (!receiptFile || !amount) {
        return this.error('Faltan datos requeridos (comprobante, monto).', 400);
      }

      // 1. Subir comprobante a Cloudinary
      const receiptUrl = await uploadToCloudinary(receiptFile, this.env);

      // 2. Crear registro de pago en Supabase
      const { data: payment, error: paymentError } = await this.supabase
        .from('payments')
        .insert({
          user_id: userId || null,
          amount: parseFloat(amount),
          currency: 'USD',
          status: 'pending_review', // Estado especial para revisión manual
          payment_method: 'bank_transfer',
          metadata: { 
            productName,
            receiptUrl,
            fileName: receiptFile.name,
          }
        })
        .select()
        .single();

      if (paymentError) {
        throw new Error(`Error al guardar en DB: ${paymentError.message}`);
      }

      // 3. (Opcional) Enviar notificación a n8n para alertar al admin
      await this.triggerWebhook('bank-transfer-received', {
        payment_id: payment.id,
        amount: payment.amount,
        receiptUrl: receiptUrl,
        user_id: userId,
      });

      return this.success({ 
        paymentId: payment.id,
        status: 'pending_review',
        message: 'Comprobante recibido. Su pago será verificado pronto.'
      });

    } catch (err) {
      console.error('Error en BankTransferHandler:', err);
      return this.error(err.message);
    }
  }

  async triggerWebhook(event, data) {
    if (!this.env.N8N_WEBHOOK_URL) return;
    try {
      await fetch(`${this.env.N8N_WEBHOOK_URL}/webhook/${event}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Webhook error:', error);
    }
  }

  success(data, status = 200) {
    return new Response(JSON.stringify({ success: true, data }), {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  error(message, status = 500) {
    return new Response(JSON.stringify({ success: false, error: message }), {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}
