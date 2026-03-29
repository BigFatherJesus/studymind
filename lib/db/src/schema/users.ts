import { pgTable, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free", "entry", "intermediate", "advanced", "professional", "enterprise"
]);

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  subscriptionTier: subscriptionTierEnum("subscription_tier").notNull().default("free"),
  subjectLimit: integer("subject_limit").notNull().default(1),
  creditBalance: integer("credit_balance").notNull().default(50),
  monthlyIncluded: integer("monthly_included").notNull().default(50),
  autoTopUp: boolean("auto_top_up").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
