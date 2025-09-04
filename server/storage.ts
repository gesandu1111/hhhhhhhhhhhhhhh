import { 
  type Message, type InsertMessage,
  type Conversation, type InsertConversation,
  type Template, type InsertTemplate,
  type BotConfig, type InsertBotConfig,
  type WebhookLog, type InsertWebhookLog,
  type Analytics, type InsertAnalytics
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(limit?: number, offset?: number): Promise<Message[]>;
  getMessagesByConversation(phoneNumber: string): Promise<Message[]>;
  updateMessageStatus(id: string, status: string, responseTime?: number, botResponse?: string): Promise<Message | undefined>;
  
  // Conversation operations
  getConversation(phoneNumber: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(phoneNumber: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;
  getActiveConversations(): Promise<Conversation[]>;
  
  // Template operations
  getTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, updates: Partial<Template>): Promise<Template | undefined>;
  incrementTemplateUsage(id: string): Promise<void>;
  
  // Bot config operations
  getBotConfig(): Promise<BotConfig[]>;
  getBotConfigByKey(key: string): Promise<BotConfig | undefined>;
  setBotConfig(config: InsertBotConfig): Promise<BotConfig>;
  updateBotConfig(key: string, value: string): Promise<BotConfig | undefined>;
  
  // Webhook log operations
  createWebhookLog(log: InsertWebhookLog): Promise<WebhookLog>;
  getWebhookLogs(limit?: number): Promise<WebhookLog[]>;
  
  // Analytics operations
  getAnalytics(date: string): Promise<Analytics | undefined>;
  upsertAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getAnalyticsRange(startDate: string, endDate: string): Promise<Analytics[]>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    messagesToday: number;
    activeUsers: number;
    responseRate: number;
    avgResponseTime: number;
    recentMessages: Message[];
    commandStats: { name: string; usage: number; description: string }[];
  }>;
}

export class MemStorage implements IStorage {
  private messages: Map<string, Message>;
  private conversations: Map<string, Conversation>;
  private templates: Map<string, Template>;
  private botConfigs: Map<string, BotConfig>;
  private webhookLogs: Map<string, WebhookLog>;
  private analytics: Map<string, Analytics>;

  constructor() {
    this.messages = new Map();
    this.conversations = new Map();
    this.templates = new Map();
    this.botConfigs = new Map();
    this.webhookLogs = new Map();
    this.analytics = new Map();
    
    // Initialize default bot configuration
    this.initializeDefaultConfig();
  }

  private initializeDefaultConfig() {
    const defaultConfigs = [
      { key: "welcome_message", value: "Hello! Welcome to our WhatsApp bot. Type /help to see available commands.", description: "Welcome message for new users", isActive: true },
      { key: "help_message", value: "Available commands:\n/help - Show this help message\n/info - Company information\n/contact - Contact details\n/order - Check order status", description: "Help command response", isActive: true },
      { key: "info_message", value: "We are a leading company providing excellent services. Visit our website for more information.", description: "Company information", isActive: true },
      { key: "contact_message", value: "Contact us:\nPhone: +1 (555) 123-4567\nEmail: support@company.com\nWebsite: https://company.com", description: "Contact information", isActive: true },
      { key: "default_response", value: "I'm sorry, I didn't understand that. Type /help to see available commands.", description: "Default response for unknown messages", isActive: true },
    ];

    defaultConfigs.forEach(config => {
      const botConfig: BotConfig = {
        id: randomUUID(),
        ...config,
        updatedAt: new Date(),
      };
      this.botConfigs.set(config.key, botConfig);
    });
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      id,
      ...insertMessage,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessages(limit = 50, offset = 0): Promise<Message[]> {
    const messages = Array.from(this.messages.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(offset, offset + limit);
    return messages;
  }

  async getMessagesByConversation(phoneNumber: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.fromNumber === phoneNumber)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async updateMessageStatus(id: string, status: string, responseTime?: number, botResponse?: string): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;

    const updatedMessage: Message = {
      ...message,
      status,
      responseTime,
      botResponse,
    };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Conversation operations
  async getConversation(phoneNumber: string): Promise<Conversation | undefined> {
    return this.conversations.get(phoneNumber);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      id,
      ...insertConversation,
      lastMessageAt: new Date(),
    };
    this.conversations.set(insertConversation.phoneNumber, conversation);
    return conversation;
  }

  async updateConversation(phoneNumber: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(phoneNumber);
    if (!conversation) return undefined;

    const updatedConversation: Conversation = {
      ...conversation,
      ...updates,
      lastMessageAt: new Date(),
    };
    this.conversations.set(phoneNumber, updatedConversation);
    return updatedConversation;
  }

  async getActiveConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.isActive)
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }

  // Template operations
  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const now = new Date();
    const template: Template = {
      id,
      ...insertTemplate,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.templates.set(id, template);
    return template;
  }

  async updateTemplate(id: string, updates: Partial<Template>): Promise<Template | undefined> {
    const template = this.templates.get(id);
    if (!template) return undefined;

    const updatedTemplate: Template = {
      ...template,
      ...updates,
      updatedAt: new Date(),
    };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    const template = this.templates.get(id);
    if (template) {
      template.usageCount = (template.usageCount || 0) + 1;
      this.templates.set(id, template);
    }
  }

  // Bot config operations
  async getBotConfig(): Promise<BotConfig[]> {
    return Array.from(this.botConfigs.values());
  }

  async getBotConfigByKey(key: string): Promise<BotConfig | undefined> {
    return this.botConfigs.get(key);
  }

  async setBotConfig(insertBotConfig: InsertBotConfig): Promise<BotConfig> {
    const id = randomUUID();
    const botConfig: BotConfig = {
      id,
      ...insertBotConfig,
      updatedAt: new Date(),
    };
    this.botConfigs.set(insertBotConfig.key, botConfig);
    return botConfig;
  }

  async updateBotConfig(key: string, value: string): Promise<BotConfig | undefined> {
    const config = this.botConfigs.get(key);
    if (!config) return undefined;

    const updatedConfig: BotConfig = {
      ...config,
      value,
      updatedAt: new Date(),
    };
    this.botConfigs.set(key, updatedConfig);
    return updatedConfig;
  }

  // Webhook log operations
  async createWebhookLog(insertWebhookLog: InsertWebhookLog): Promise<WebhookLog> {
    const id = randomUUID();
    const webhookLog: WebhookLog = {
      id,
      ...insertWebhookLog,
      timestamp: new Date(),
    };
    this.webhookLogs.set(id, webhookLog);
    return webhookLog;
  }

  async getWebhookLogs(limit = 100): Promise<WebhookLog[]> {
    return Array.from(this.webhookLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Analytics operations
  async getAnalytics(date: string): Promise<Analytics | undefined> {
    return this.analytics.get(date);
  }

  async upsertAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const existing = this.analytics.get(insertAnalytics.date);
    if (existing) {
      const updated: Analytics = { ...existing, ...insertAnalytics };
      this.analytics.set(insertAnalytics.date, updated);
      return updated;
    } else {
      const id = randomUUID();
      const analytics: Analytics = { id, ...insertAnalytics };
      this.analytics.set(insertAnalytics.date, analytics);
      return analytics;
    }
  }

  async getAnalyticsRange(startDate: string, endDate: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values())
      .filter(analytics => analytics.date >= startDate && analytics.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    messagesToday: number;
    activeUsers: number;
    responseRate: number;
    avgResponseTime: number;
    recentMessages: Message[];
    commandStats: { name: string; usage: number; description: string }[];
  }> {
    const today = new Date().toISOString().split('T')[0];
    const todayMessages = Array.from(this.messages.values())
      .filter(msg => msg.timestamp.toISOString().split('T')[0] === today);

    const respondedMessages = todayMessages.filter(msg => msg.status === 'responded');
    const responseRate = todayMessages.length > 0 ? (respondedMessages.length / todayMessages.length) * 100 : 0;

    const responseTimes = respondedMessages
      .filter(msg => msg.responseTime)
      .map(msg => msg.responseTime!);
    const avgResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
      : 0;

    const activeUsers = new Set(
      Array.from(this.conversations.values())
        .filter(conv => conv.isActive && 
          conv.lastMessageAt.getTime() > Date.now() - 24 * 60 * 60 * 1000)
        .map(conv => conv.phoneNumber)
    ).size;

    const recentMessages = Array.from(this.messages.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    // Command usage stats
    const commandMessages = todayMessages.filter(msg => msg.isCommand);
    const commandCounts = commandMessages.reduce((acc, msg) => {
      if (msg.commandName) {
        acc[msg.commandName] = (acc[msg.commandName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const commandStats = Object.entries(commandCounts).map(([name, usage]) => ({
      name: `/${name}`,
      usage,
      description: this.getCommandDescription(name),
    }));

    return {
      messagesToday: todayMessages.length,
      activeUsers,
      responseRate: Math.round(responseRate * 10) / 10,
      avgResponseTime,
      recentMessages,
      commandStats: commandStats.slice(0, 5),
    };
  }

  private getCommandDescription(command: string): string {
    const descriptions: Record<string, string> = {
      help: "Show available commands",
      info: "Company information",
      contact: "Contact information",
      order: "Order status check",
    };
    return descriptions[command] || "Custom command";
  }
}

export const storage = new MemStorage();
