// WhatsApp Cloud API integration utilities

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  version: string;
}

export class WhatsAppAPI {
  private config: WhatsAppConfig;

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  async sendTextMessage(to: string, message: string): Promise<any> {
    const url = `https://graph.facebook.com/${this.config.version}/${this.config.phoneNumberId}/messages`;
    
    const payload = {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: {
        body: message
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.status}`);
    }

    return await response.json();
  }

  async sendTemplate(to: string, templateName: string, language: string = 'en_US'): Promise<any> {
    const url = `https://graph.facebook.com/${this.config.version}/${this.config.phoneNumberId}/messages`;
    
    const payload = {
      messaging_product: "whatsapp",
      to: to,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: language
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.status}`);
    }

    return await response.json();
  }

  async markMessageAsRead(messageId: string): Promise<any> {
    const url = `https://graph.facebook.com/${this.config.version}/${this.config.phoneNumberId}/messages`;
    
    const payload = {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.status}`);
    }

    return await response.json();
  }
}

// Initialize WhatsApp API client
export const createWhatsAppClient = () => {
  const config: WhatsAppConfig = {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    accessToken: process.env.WHATSAPP_TOKEN || "",
    version: "v18.0"
  };

  return new WhatsAppAPI(config);
};
