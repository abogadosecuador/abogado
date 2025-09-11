/**
 * Documents Handler - AI-powered document generation with Gemini
 */

import { corsHeaders } from '../headers.js';

export class DocumentHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
  }

  async handle(request, method, id) {
    const authHeader = request.headers.get('Authorization');
    const user = await this.authenticate(authHeader);
    
    if (!user) {
      return this.unauthorized();
    }

    switch (method) {
      case 'GET':
        if (id === 'templates') {
          return this.getTemplates();
        }
        if (id) {
          return this.getDocument(id, user);
        }
        return this.listDocuments(user);
      
      case 'POST':
        if (id === 'generate') {
          return this.generateDocument(request, user);
        }
        if (id === 'from-template') {
          return this.generateFromTemplate(request, user);
        }
        return this.createDocument(request, user);
      
      case 'PATCH':
        return this.updateDocument(id, request, user);
      
      case 'DELETE':
        return this.deleteDocument(id, user);
      
      default:
        return this.methodNotAllowed();
    }
  }

  async authenticate(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    
    const { data: { user }, error } = await this.supabase.auth.getUser(token);
    return error ? null : user;
  }

  async listDocuments(user) {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return this.error(error.message);
    }

    return this.success(data);
  }

  async getDocument(id, user) {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return this.error(error.message, error.code === 'PGRST116' ? 404 : 500);
    }

    return this.success(data);
  }

  async generateDocument(request, user) {
    if (!this.env.GEMINI_API_KEY) {
      return this.error('Servicio de IA no disponible', 503);
    }

    const { 
      type, 
      title, 
      prompt, 
      variables = {},
      language = 'es'
    } = await request.json();

    if (!type || !title || !prompt) {
      return this.error('Tipo, título y prompt son requeridos', 400);
    }

    // Prepare the AI prompt
    const systemPrompt = this.getSystemPrompt(type, language);
    const fullPrompt = `${systemPrompt}\n\nDetalles específicos:\n${prompt}\n\nVariables:\n${JSON.stringify(variables, null, 2)}`;

    try {
      // Call Gemini API
      const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 3072,
            topP: 0.8,
            topK: 40
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE"
            }
          ]
        })
      });

      if (!geminiResponse.ok) {
        const error = await geminiResponse.text();
        console.error('Gemini API error:', error);
        return this.error('Error generando documento', 500);
      }

      const geminiData = await geminiResponse.json();
      const generatedContent = geminiData.candidates[0].content.parts[0].text;

      // Save document
      const { data: document, error } = await this.supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title,
          type,
          content: generatedContent,
          ai_prompt: prompt,
          status: 'draft',
          metadata: {
            variables,
            language,
            ai_model: 'gemini-pro',
            generated_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) {
        return this.error(error.message);
      }

      // Generate PDF if requested (placeholder for now)
      const pdfUrl = await this.generatePDF(document);

      // Log generation
      await this.logActivity('document', 'ai_generated', {
        document_id: document.id,
        type,
        user_id: user.id
      });

      // Send notification
      await this.supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'push',
          title: 'Documento Generado',
          message: `Su documento "${title}" ha sido generado exitosamente`,
          data: { document_id: document.id }
        });

      return this.success({
        ...document,
        pdf_url: pdfUrl
      }, 201);

    } catch (error) {
      console.error('Document generation error:', error);
      return this.error('Error generando documento', 500);
    }
  }

  async generateFromTemplate(request, user) {
    const { template_id, variables } = await request.json();

    const template = this.getTemplate(template_id);
    if (!template) {
      return this.error('Plantilla no encontrada', 404);
    }

    // Fill template with variables
    let content = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    // Save document
    const { data: document, error } = await this.supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title: template.title,
        type: template.type,
        content,
        template_used: template_id,
        status: 'draft',
        metadata: { variables }
      })
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    return this.success(document, 201);
  }

  async createDocument(request, user) {
    const { title, type, content, metadata = {} } = await request.json();

    if (!title || !type || !content) {
      return this.error('Título, tipo y contenido son requeridos', 400);
    }

    const { data, error } = await this.supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title,
        type,
        content,
        status: 'draft',
        metadata
      })
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    return this.success(data, 201);
  }

  async updateDocument(id, request, user) {
    const updates = await request.json();

    // Remove protected fields
    delete updates.id;
    delete updates.user_id;
    delete updates.created_at;

    // Check ownership
    const { data: existing } = await this.supabase
      .from('documents')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return this.error('Documento no encontrado', 404);
    }

    const { data, error } = await this.supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    return this.success(data);
  }

  async deleteDocument(id, user) {
    const { error } = await this.supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return this.error(error.message);
    }

    return this.success({ message: 'Documento eliminado' });
  }

  getSystemPrompt(type, language = 'es') {
    const prompts = {
      contract: `Genera un contrato legal profesional en ${language === 'es' ? 'español' : 'inglés'} que cumpla con las leyes de Ecuador. 
                 El contrato debe incluir:
                 - Encabezado con título del contrato
                 - Identificación de las partes
                 - Antecedentes
                 - Cláusulas numeradas y detalladas
                 - Obligaciones de las partes
                 - Condiciones de pago (si aplica)
                 - Duración y terminación
                 - Resolución de conflictos
                 - Firmas
                 Formato profesional y lenguaje jurídico apropiado.`,
      
      letter: `Genera una carta legal formal en ${language === 'es' ? 'español' : 'inglés'}.
               La carta debe incluir:
               - Membrete (lugar y fecha)
               - Destinatario
               - Asunto
               - Saludo formal
               - Contenido estructurado en párrafos
               - Solicitud o conclusión clara
               - Despedida formal
               - Firma y datos del remitente`,
      
      agreement: `Genera un acuerdo legal en ${language === 'es' ? 'español' : 'inglés'} válido en Ecuador.
                  Incluye:
                  - Título del acuerdo
                  - Partes involucradas
                  - Objeto del acuerdo
                  - Términos y condiciones
                  - Responsabilidades
                  - Confidencialidad (si aplica)
                  - Vigencia
                  - Cláusulas de incumplimiento
                  - Jurisdicción y ley aplicable
                  - Firmas`,
      
      power_of_attorney: `Genera un poder notarial en ${language === 'es' ? 'español' : 'inglés'} válido en Ecuador.
                          Incluye:
                          - Comparecencia del poderdante
                          - Identificación completa
                          - Facultades otorgadas (detalladas)
                          - Limitaciones (si las hay)
                          - Duración del poder
                          - Revocación
                          - Aceptación
                          - Firmas y notarización`,
      
      legal_notice: `Genera una notificación legal en ${language === 'es' ? 'español' : 'inglés'}.
                     Incluye:
                     - Identificación del notificante
                     - Identificación del notificado
                     - Hechos relevantes
                     - Fundamentos legales
                     - Requerimiento específico
                     - Plazo para cumplimiento
                     - Consecuencias del incumplimiento
                     - Fecha y firma`
    };

    return prompts[type] || prompts.contract;
  }

  getTemplates() {
    const templates = [
      {
        id: 'contract-sale',
        title: 'Contrato de Compraventa',
        type: 'contract',
        description: 'Contrato estándar de compraventa de bienes',
        variables: ['vendedor', 'comprador', 'bien', 'precio', 'fecha_entrega']
      },
      {
        id: 'contract-services',
        title: 'Contrato de Prestación de Servicios',
        type: 'contract',
        description: 'Contrato para prestación de servicios profesionales',
        variables: ['prestador', 'cliente', 'servicios', 'honorarios', 'plazo']
      },
      {
        id: 'contract-lease',
        title: 'Contrato de Arrendamiento',
        type: 'contract',
        description: 'Contrato de arrendamiento de inmueble',
        variables: ['arrendador', 'arrendatario', 'inmueble', 'canon', 'plazo']
      },
      {
        id: 'power-general',
        title: 'Poder General',
        type: 'power_of_attorney',
        description: 'Poder general amplio',
        variables: ['poderdante', 'apoderado', 'facultades']
      },
      {
        id: 'legal-demand-payment',
        title: 'Requerimiento de Pago',
        type: 'legal_notice',
        description: 'Notificación de requerimiento de pago',
        variables: ['acreedor', 'deudor', 'monto', 'concepto', 'plazo']
      }
    ];

    return this.success(templates);
  }

  getTemplate(templateId) {
    // This would normally fetch from database
    const templates = {
      'contract-sale': {
        title: 'Contrato de Compraventa',
        type: 'contract',
        content: `CONTRATO DE COMPRAVENTA

En la ciudad de {{ciudad}}, a {{fecha}}, comparecen:

Por una parte, {{vendedor}}, con cédula de identidad No. {{cedula_vendedor}}, 
en calidad de VENDEDOR.

Por otra parte, {{comprador}}, con cédula de identidad No. {{cedula_comprador}}, 
en calidad de COMPRADOR.

PRIMERA.- ANTECEDENTES
El VENDEDOR es propietario de {{bien}}.

SEGUNDA.- OBJETO
Por el presente contrato, el VENDEDOR vende y el COMPRADOR compra el bien 
descrito en la cláusula anterior.

TERCERA.- PRECIO
El precio acordado es de {{precio}} dólares estadounidenses.

CUARTA.- FORMA DE PAGO
{{forma_pago}}

QUINTA.- ENTREGA
La entrega se realizará el {{fecha_entrega}}.

Para constancia firman las partes en dos ejemplares.

VENDEDOR                    COMPRADOR`
      }
    };

    return templates[templateId];
  }

  async generatePDF(document) {
    // Placeholder for PDF generation
    // In production, you would use a service like Puppeteer or a PDF API
    return `https://storage.abogadosecuador.com/documents/${document.id}.pdf`;
  }

  async logActivity(category, action, data) {
    await this.supabase.from('logs_app').insert({
      level: 'info',
      category,
      message: action,
      metadata: data
    });
  }

  // Response helpers
  success(data, status = 200) {
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  error(message, status = 500) {
    return new Response(JSON.stringify({
      success: false,
      error: message
    }), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  unauthorized() {
    return this.error('No autorizado', 401);
  }

  methodNotAllowed() {
    return this.error('Método no permitido', 405);
  }
}
