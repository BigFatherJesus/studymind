import { pgTable, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const uploadTypeEnum = pgEnum("upload_type", [
  "pdf", "text", "url", "audio", "video", "image", "word", "ppt"
]);

export const uploadStatusEnum = pgEnum("upload_status", [
  "pending", "processing", "completed", "failed"
]);

export const uploadsTable = pgTable("uploads", {
  id: text("id").primaryKey(),
  subjectId: text("subject_id").notNull(),
  uploadedBy: text("uploaded_by").notNull(),
  title: text("title").notNull(),
  type: uploadTypeEnum("type").notNull(),
  status: uploadStatusEnum("status").notNull().default("pending"),
  content: text("content"),
  summary: text("summary"),
  url: text("url"),
  fileSize: integer("file_size"),
  processingLog: text("processing_log"),
  flashcardsGenerated: integer("flashcards_generated").notNull().default(0),
  nodesGenerated: integer("nodes_generated").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const insertUploadSchema = createInsertSchema(uploadsTable).omit({ createdAt: true, processedAt: true });
export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type Upload = typeof uploadsTable.$inferSelect;
