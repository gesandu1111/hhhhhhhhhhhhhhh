import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertConversationSchema, insertTemplateSchema, insertBotConfigSchema } from "@shared/schema";
import { z } from "zod";

// WhatsApp webhook verification schema
const webhookVerificationSchema = z.object({
  "hub.mode": z.literal("subscribe"),
  "hub.verify_token": z.string(),
  "hub.challenge": z.string(),
});

// WhatsApp webhook message schema (simplified)
const whatsappMessageSchema = z.object({
  entry: z.array(z.object({
    changes: z.array(z.object({
      value: z.object({
        messages: z.array(z.object({
          id: z.string(),
          from: z.string(),
          timestamp: z.string(),
          text: z.object({
            body: z.string(),
          }).optional(),
          type: z.string(),
        })).optional(),
        metadata: z.object({
          display_phone_number: z.string(),
        }),
      }),
    })),
  })),
});

export async function registerRoutes(app: Express): Promise<Server> {
  const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "your_verify_token_here";
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "your_whatsapp_token_here";

  // WhatsApp webhook verification
  app.get("/api/webhook", async (req, res) => {
    try {
      const params = webhookVerificationSchema.parse(req.query);
      
      if (params["hub.verify_token"] === WEBHOOK_VERIFY_TOKEN) {
        res.send(params["hub.challenge"]);
        return;
      }
      
      res.status(403).json({ error: "Verification failed" });
    } catch (error) {
      res.status(400).json({ error: "Invalid verification request" });
    }
  });

  // WhatsApp webhook message handler
  app.post("/api/webhook", async (req, res) => {
    try {
      const webhookData = whatsappMessageSchema.parse(req.body);
      
      for (const entry of webhookData.entry) {
        for (const change of entry.changes) {
          if (change.value.messages) {
            for (const message of change.value.messages) {
              await processIncomingMessage(message, change.value.metadata.display_phone_number);
            }
          }
        }
      }
      
      res.status(200).json({ status: "ok" });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Messages endpoints
  app.get("/api/messages", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const messages = await storage.getMessages(limit, offset);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/conversation/:phoneNumber", async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      const messages = await storage.getMessagesByConversation(phoneNumber);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversation messages" });
    }
  });

  // Conversations endpoints
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getActiveConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Templates endpoints
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const templateData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create template" });
      }
    }
  });

  app.put("/api/templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const template = await storage.updateTemplate(id, updates);
      
      if (!template) {
        res.status(404).json({ error: "Template not found" });
        return;
      }
      
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to update template" });
    }
  });

  // Bot configuration endpoints
  app.get("/api/bot/config", async (req, res) => {
    try {
      const config = await storage.getBotConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot configuration" });
    }
  });

  app.put("/api/bot/config/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      
      if (!value) {
        res.status(400).json({ error: "Value is required" });
        return;
      }
      
      const config = await storage.updateBotConfig(key, value);
      
      if (!config) {
        res.status(404).json({ error: "Configuration key not found" });
        return;
      }
      
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bot configuration" });
    }
  });

  // Webhook logs
  app.get("/api/webhooks/logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getWebhookLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch webhook logs" });
    }
  });

  // Test bot endpoint
  app.post("/api/bot/test", async (req, res) => {
    try {
      const { message, phoneNumber } = req.body;
      
      if (!message || !phoneNumber) {
        res.status(400).json({ error: "Message and phone number are required" });
        return;
      }
      
      // Simulate incoming message processing
      const testMessage = {
        id: `test_${Date.now()}`,
        from: phoneNumber,
        timestamp: new Date().toISOString(),
        text: { body: message },
        type: "text",
      };
      
      await processIncomingMessage(testMessage, "test_bot");
      res.json({ status: "Test message processed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to process test message" });
    }
  });

  // Send broadcast message
  app.post("/api/messages/broadcast", async (req, res) => {
    try {
      const { message, templateId } = req.body;
      
      if (!message && !templateId) {
        res.status(400).json({ error: "Either message or templateId is required" });
        return;
      }
      
      const activeConversations = await storage.getActiveConversations();
      
      // In a real implementation, you would send messages via WhatsApp API
      // For now, we'll just log the broadcast
      console.log(`Broadcasting to ${activeConversations.length} active conversations:`, message);
      
      res.json({ 
        status: "Broadcast queued", 
        recipientCount: activeConversations.length 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to send broadcast message" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Process incoming WhatsApp messages
async function processIncomingMessage(message: any, toNumber: string) {
  const startTime = Date.now();
  
  try {
    // Create message record
    const messageData = {
      whatsappMessageId: message.id,
      fromNumber: message.from,
      toNumber: toNumber,
      messageText: message.text?.body || "",
      messageType: message.type,
      status: "received",
      responseTime: null,
      isCommand: message.text?.body?.startsWith('/') || false,
      commandName: message.text?.body?.startsWith('/') 
        ? message.text.body.substring(1).split(' ')[0].toLowerCase() 
        : null,
      botResponse: null,
      metadata: { timestamp: message.timestamp },
    };

    const createdMessage = await storage.createMessage(messageData);

    // Create or update conversation
    let conversation = await storage.getConversation(message.from);
    if (!conversation) {
      conversation = await storage.createConversation({
        phoneNumber: message.from,
        displayName: null,
        messageCount: 1,
        isActive: true,
        lastCommand: messageData.commandName,
        conversationState: "active",
      });
    } else {
      await storage.updateConversation(message.from, {
        messageCount: (conversation.messageCount || 0) + 1,
        lastCommand: messageData.commandName || conversation.lastCommand,
      });
    }

    // Process bot response
    let botResponse = "";
    const responseTime = Date.now() - startTime;

    if (messageData.isCommand && messageData.commandName) {
      botResponse = await getBotResponse(messageData.commandName);
    } else {
      // Default response for non-commands
      const defaultConfig = await storage.getBotConfigByKey("default_response");
      botResponse = defaultConfig?.value || "I'm sorry, I didn't understand that. Type /help to see available commands.";
    }

    // Update message with bot response
    await storage.updateMessageStatus(
      createdMessage.id,
      "responded",
      responseTime,
      botResponse
    );

    // In a real implementation, send the response via WhatsApp API
    console.log(`Bot response to ${message.from}: ${botResponse}`);

  } catch (error) {
    console.error("Error processing message:", error);
  }
}

// Get bot response for commands
async function getBotResponse(command: string): Promise<string> {
  const configKey = `${command}_message`;
  const config = await storage.getBotConfigByKey(configKey);
  
  if (config) {
    return config.value;
  }
  
  // Fallback responses
  const fallbackResponses: Record<string, string> = {
    help: "Available commands:\n/help - Show this help message\n/info - Company information\n/contact - Contact details",
    info: "We are a leading company providing excellent services.",
    contact: "Contact us at support@company.com or +1 (555) 123-4567",
    order: "To check your order status, please provide your order number.",
  };
  
  return fallbackResponses[command] || "Command not recognized. Type /help for available commands.";
}
