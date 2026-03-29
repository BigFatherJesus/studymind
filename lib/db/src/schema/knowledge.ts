import { pgTable, text, timestamp, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const nodeTypeEnum = pgEnum("node_type", [
  "concept", "definition", "formula", "event", "term"
]);

export const knowledgeNodesTable = pgTable("knowledge_nodes", {
  id: text("id").primaryKey(),
  subjectId: text("subject_id").notNull(),
  label: text("label").notNull(),
  definition: text("definition"),
  sourceReference: text("source_reference"),
  difficultyRating: integer("difficulty_rating"),
  examRelevance: integer("exam_relevance"),
  nodeType: nodeTypeEnum("node_type").notNull().default("concept"),
  x: real("x"),
  y: real("y"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const knowledgeEdgesTable = pgTable("knowledge_edges", {
  id: text("id").primaryKey(),
  subjectId: text("subject_id").notNull(),
  sourceNodeId: text("source_node_id").notNull(),
  targetNodeId: text("target_node_id").notNull(),
  label: text("label"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertKnowledgeNodeSchema = createInsertSchema(knowledgeNodesTable).omit({ createdAt: true });
export type InsertKnowledgeNode = z.infer<typeof insertKnowledgeNodeSchema>;
export type KnowledgeNode = typeof knowledgeNodesTable.$inferSelect;

export const insertKnowledgeEdgeSchema = createInsertSchema(knowledgeEdgesTable).omit({ createdAt: true });
export type InsertKnowledgeEdge = z.infer<typeof insertKnowledgeEdgeSchema>;
export type KnowledgeEdge = typeof knowledgeEdgesTable.$inferSelect;
