import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  whatsappMessageId: text("whatsapp_message_id").notNull().unique(),
  fromNumber: text("from_number").notNull(),
  toNumber: text("to_number").notNull(),
  messageText: text("message_text"),
  messageType: text("message_type").notNull().default("text"), // text, image, document, etc.
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  status: text("status").notNull().default("received"), // received, responded, pending, failed
  responseTime: integer("response_time"), // in milliseconds
  isCommand: boolean("is_command").default(false),
  commandName: text("command_name"),
  botResponse: text("bot_response"),
  metadata: jsonb("metadata"), // additional WhatsApp metadata
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull().unique(),
  displayName: text("display_name"),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  messageCount: integer("message_count").default(0),
  isActive: boolean("is_active").default(true),
  lastCommand: text("last_command"),
  conversationState: text("conversation_state").default("active"), // active, paused, blocked
});

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  category: text("category").notNull(), // marketing, utility, authentication
  language: text("language").notNull().default("en_US"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  components: jsonb("components").notNull(), // WhatsApp template components
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const botConfig = pgTable("bot_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const webhookLogs = pgTable("webhook_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  webhookUrl: text("webhook_url").notNull(),
  method: text("method").notNull(),
  headers: jsonb("headers"),
  body: jsonb("body"),
  responseStatus: integer("response_status"),
  responseTime: integer("response_time"), // in milliseconds
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isSuccessful: boolean("is_successful").default(false),
  errorMessage: text("error_message"),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(), // YYYY-MM-DD format
  messagesReceived: integer("messages_received").default(0),
  messagesResponded: integer("messages_responded").default(0),
  activeUsers: integer("active_users").default(0),
  avgResponseTime: integer("avg_response_time").default(0), // in milliseconds
  commandUsage: jsonb("command_usage"), // {"help": 50, "info": 30, etc.}
  popularCommands: jsonb("popular_commands"), // top used commands
});

// Insert schemas
export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  lastMessageAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
});

export const insertBotConfigSchema = createInsertSchema(botConfig).omit({
  id: true,
  updatedAt: true,
});

export const insertWebhookLogSchema = createInsertSchema(webhookLogs).omit({
  id: true,
  timestamp: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

// Types
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

export type InsertBotConfig = z.infer<typeof insertBotConfigSchema>;
export type BotConfig = typeof botConfig.$inferSelect;

export type InsertWebhookLog = z.infer<typeof insertWebhookLogSchema>;
export type WebhookLog = typeof webhookLogs.$inferSelect;

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;
