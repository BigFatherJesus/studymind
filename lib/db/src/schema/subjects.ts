import { pgTable, text, timestamp, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const subjectStatusEnum = pgEnum("subject_status", [
  "initializing", "active", "verifying", "archived"
]);

export const subjectsTable = pgTable("subjects", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  teamId: text("team_id"),
  title: text("title").notNull(),
  description: text("description"),
  aiDescription: text("ai_description"),
  keyConcepts: text("key_concepts").array().notNull().default([]),
  status: subjectStatusEnum("status").notNull().default("active"),
  verificationScore: real("verification_score"),
  uploadsCount: integer("uploads_count").notNull().default(0),
  flashcardsCount: integer("flashcards_count").notNull().default(0),
  nodeCount: integer("node_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSubjectSchema = createInsertSchema(subjectsTable).omit({ createdAt: true, updatedAt: true });
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjectsTable.$inferSelect;
