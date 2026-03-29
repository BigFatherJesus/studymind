import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

export const flashcardsTable = pgTable("flashcards", {
  id: text("id").primaryKey(),
  subjectId: text("subject_id").notNull(),
  nodeId: text("node_id"),
  uploadId: text("upload_id"),
  front: text("front").notNull(),
  back: text("back").notNull(),
  difficulty: difficultyEnum("difficulty").notNull().default("medium"),
  lastReviewed: timestamp("last_reviewed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFlashcardSchema = createInsertSchema(flashcardsTable).omit({ createdAt: true });
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type Flashcard = typeof flashcardsTable.$inferSelect;
