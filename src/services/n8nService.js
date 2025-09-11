/**
 * n8n Service - Automatización de flujos y procesos
 * Abogados Ecuador
 */

const N8N_WEBHOOK_URL = 'https://n8n-latest-hurl.onrender.com';
const N8N_API_KEY = 'n8n-api-key'; // Configure this in production

class N8NService {
  constructor() {
    this.webhookUrl = N8N_WEBHOOK_URL;
    this.apiKey = N8N_API_KEY;
  }

  /**
   * Send data to n8n webhook
   */
  async sendToWebhook(workflowName, data) {
    try {
      const response = await fetch(`${this.webhookUrl}/webhook/${workflowName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: 'abogados-ecuador',
          ...data
        })
      });

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('n8n webhook error:', error);
      throw error;
    }
  }

  /**
   * Trigger new contact notification
   */
  async notifyNewContact(contactData) {
    return this.sendToWebhook('new-contact', {
      type: 'contact_form',
      contact: {
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        message: contactData.message,
        service: contactData.service,
        createdAt: contactData.createdAt
      }
    });
  }

  /**
   * Trigger new order notification
   */
  async notifyNewOrder(orderData) {
    return this.sendToWebhook('new-order', {
      type: 'order',
      order: {
        orderNumber: orderData.orderNumber,
        userId: orderData.userId,
        userEmail: orderData.userEmail,
        total: orderData.total,
        items: orderData.items,
        paymentMethod: orderData.paymentMethod,
        status: orderData.status,
        createdAt: orderData.createdAt
      }
    });
  }

  /**
   * Trigger appointment reminder
   */
  async sendAppointmentReminder(appointmentData) {
    return this.sendToWebhook('appointment-reminder', {
      type: 'appointment_reminder',
      appointment: {
        id: appointmentData.id,
        clientName: appointmentData.clientName,
        clientEmail: appointmentData.clientEmail,
        clientPhone: appointmentData.clientPhone,
        date: appointmentData.date,
        time: appointmentData.time,
        service: appointmentData.service,
        lawyer: appointmentData.lawyer,
        meetingUrl: appointmentData.meetingUrl
      }
    });
  }

  /**
   * Trigger newsletter subscription
   */
  async notifyNewsletterSubscription(subscriberData) {
    return this.sendToWebhook('newsletter-subscription', {
      type: 'newsletter',
      subscriber: {
        email: subscriberData.email,
        name: subscriberData.name,
        tags: subscriberData.tags,
        subscribedAt: subscriberData.subscribedAt
      }
    });
  }

  /**
   * Trigger user registration
   */
  async notifyUserRegistration(userData) {
    return this.sendToWebhook('user-registration', {
      type: 'registration',
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        referralCode: userData.referralCode,
        registeredAt: userData.registeredAt
      }
    });
  }

  /**
   * Trigger affiliate commission
   */
  async notifyAffiliateCommission(commissionData) {
    return this.sendToWebhook('affiliate-commission', {
      type: 'affiliate_commission',
      commission: {
        affiliateId: commissionData.affiliateId,
        affiliateName: commissionData.affiliateName,
        affiliateEmail: commissionData.affiliateEmail,
        orderId: commissionData.orderId,
        amount: commissionData.amount,
        status: commissionData.status,
        createdAt: commissionData.createdAt
      }
    });
  }

  /**
   * Send WhatsApp message via n8n
   */
  async sendWhatsAppMessage(phoneNumber, message, mediaUrl = null) {
    return this.sendToWebhook('whatsapp-message', {
      type: 'whatsapp',
      message: {
        to: phoneNumber,
        body: message,
        mediaUrl: mediaUrl
      }
    });
  }

  /**
   * Send email via n8n
   */
  async sendEmail(emailData) {
    return this.sendToWebhook('send-email', {
      type: 'email',
      email: {
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        attachments: emailData.attachments
      }
    });
  }

  /**
   * Sync data to external CRM
   */
  async syncToCRM(entityType, entityData) {
    return this.sendToWebhook('crm-sync', {
      type: 'crm_sync',
      entity: {
        type: entityType,
        data: entityData,
        action: 'upsert'
      }
    });
  }

  /**
   * Generate document via n8n
   */
  async generateDocument(documentType, data) {
    return this.sendToWebhook('generate-document', {
      type: 'document_generation',
      document: {
        type: documentType,
        data: data,
        format: 'pdf'
      }
    });
  }

  /**
   * Schedule task via n8n
   */
  async scheduleTask(taskData) {
    return this.sendToWebhook('schedule-task', {
      type: 'scheduled_task',
      task: {
        name: taskData.name,
        description: taskData.description,
        scheduledFor: taskData.scheduledFor,
        assignedTo: taskData.assignedTo,
        priority: taskData.priority,
        metadata: taskData.metadata
      }
    });
  }

  /**
   * Log analytics event
   */
  async logAnalyticsEvent(eventData) {
    return this.sendToWebhook('analytics-event', {
      type: 'analytics',
      event: {
        name: eventData.name,
        category: eventData.category,
        properties: eventData.properties,
        userId: eventData.userId,
        sessionId: eventData.sessionId,
        timestamp: eventData.timestamp
      }
    });
  }

  /**
   * Trigger backup workflow
   */
  async triggerBackup(backupType = 'full') {
    return this.sendToWebhook('backup', {
      type: 'backup',
      backup: {
        type: backupType,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Check n8n health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.webhookUrl}/health`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey
        }
      });

      return response.ok;
    } catch (error) {
      console.error('n8n health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
const n8nService = new N8NService();
export default n8nService;

// Export class for testing
export { N8NService };
