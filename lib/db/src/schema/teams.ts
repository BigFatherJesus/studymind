import { pgTable, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const teamRoleEnum = pgEnum("team_role", ["owner", "editor", "viewer"]);

export const teamsTable = pgTable("teams", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: text("owner_id").notNull(),
  memberCount: integer("member_count").notNull().default(1),
  subjectCount: integer("subject_count").notNull().default(0),
  inviteCode: text("invite_code").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const teamMembersTable = pgTable("team_members", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull(),
  userId: text("user_id").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  role: teamRoleEnum("role").notNull().default("viewer"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const insertTeamSchema = createInsertSchema(teamsTable).omit({ createdAt: true });
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teamsTable.$inferSelect;

export const insertTeamMemberSchema = createInsertSchema(teamMembersTable).omit({ joinedAt: true });
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembersTable.$inferSelect;
