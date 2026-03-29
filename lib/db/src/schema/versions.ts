import { pgTable, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const subjectVersionsTable = pgTable("subject_versions", {
  id: text("id").primaryKey(),
  subjectId: text("subject_id").notNull(),
  versionNumber: integer("version_number").notNull(),
  label: text("label").notNull(),
  nodeCount: integer("node_count").notNull().default(0),
  flashcardCount: integer("flashcard_count").notNull().default(0),
  uploadsCount: integer("uploads_count").notNull().default(0),
  snapshot: jsonb("snapshot"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubjectVersionSchema = createInsertSchema(subjectVersionsTable).omit({ createdAt: true });
export type InsertSubjectVersion = z.infer<typeof insertSubjectVersionSchema>;
export type SubjectVersion = typeof subjectVersionsTable.$inferSelect;
