import { pgTable, text, timestamp, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quizzesTable = pgTable("quizzes", {
  id: text("id").primaryKey(),
  subjectId: text("subject_id").notNull(),
  title: text("title").notNull(),
  questions: jsonb("questions").notNull().$type<Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }>>(),
  totalQuestions: integer("total_questions").notNull().default(0),
  score: real("score"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertQuizSchema = createInsertSchema(quizzesTable).omit({ createdAt: true });
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzesTable.$inferSelect;
