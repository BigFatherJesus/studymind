import { pgTable, text, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const chatRoleEnum = pgEnum("chat_role", ["user", "assistant"]);

export const chatMessagesTable = pgTable("chat_messages", {
  id: text("id").primaryKey(),
  subjectId: text("subject_id").notNull(),
  role: chatRoleEnum("role").notNull(),
  content: text("content").notNull(),
  citations: jsonb("citations").notNull().$type<Array<{
    uploadId: string;
    title: string;
    excerpt: string;
  }>>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessagesTable).omit({ createdAt: true });
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessagesTable.$inferSelect;
