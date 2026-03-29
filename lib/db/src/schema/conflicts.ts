import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const conflictStatusEnum = pgEnum("conflict_status", ["pending", "resolved", "researching"]);

export const conflictsTable = pgTable("conflicts", {
  id: text("id").primaryKey(),
  subjectId: text("subject_id").notNull(),
  description: text("description").notNull(),
  sourceUploadId: text("source_upload_id"),
  conflictingUploadId: text("conflicting_upload_id"),
  status: conflictStatusEnum("status").notNull().default("pending"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertConflictSchema = createInsertSchema(conflictsTable).omit({ createdAt: true });
export type InsertConflict = z.infer<typeof insertConflictSchema>;
export type Conflict = typeof conflictsTable.$inferSelect;
