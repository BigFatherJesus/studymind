import { Router, type IRouter } from "express";
import { db, knowledgeNodesTable, knowledgeEdgesTable, conflictsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.get("/subjects/:subjectId/knowledge-nodes", async (req, res) => {
  try {
    const nodes = await db.select().from(knowledgeNodesTable)
      .where(eq(knowledgeNodesTable.subjectId, req.params.subjectId));
    const edges = await db.select().from(knowledgeEdgesTable)
      .where(eq(knowledgeEdgesTable.subjectId, req.params.subjectId));

    res.json({
      nodes: nodes.map(n => ({ ...n, createdAt: n.createdAt.toISOString() })),
      edges: edges.map(e => ({ ...e, createdAt: e.createdAt.toISOString() })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list knowledge nodes");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/subjects/:subjectId/knowledge-nodes", async (req, res) => {
  try {
    const { label, definition, nodeType, difficultyRating, examRelevance } = req.body;
    if (!label || !nodeType) return res.status(400).json({ error: "label and nodeType are required" });

    const id = randomUUID();
    await db.insert(knowledgeNodesTable).values({
      id,
      subjectId: req.params.subjectId,
      label,
      definition: definition ?? null,
      nodeType,
      difficultyRating: difficultyRating ?? null,
      examRelevance: examRelevance ?? null,
      x: Math.random() * 500,
      y: Math.random() * 500,
    });

    const [node] = await db.select().from(knowledgeNodesTable).where(eq(knowledgeNodesTable.id, id));
    res.status(201).json({ ...node, createdAt: node.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create knowledge node");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/subjects/:subjectId/knowledge-nodes/:nodeId", async (req, res) => {
  try {
    const { label, definition, difficultyRating, examRelevance, x, y } = req.body;
    const updates: Record<string, unknown> = {};
    if (label !== undefined) updates.label = label;
    if (definition !== undefined) updates.definition = definition;
    if (difficultyRating !== undefined) updates.difficultyRating = difficultyRating;
    if (examRelevance !== undefined) updates.examRelevance = examRelevance;
    if (x !== undefined) updates.x = x;
    if (y !== undefined) updates.y = y;

    await db.update(knowledgeNodesTable).set(updates).where(
      and(eq(knowledgeNodesTable.id, req.params.nodeId), eq(knowledgeNodesTable.subjectId, req.params.subjectId))
    );

    const [node] = await db.select().from(knowledgeNodesTable).where(eq(knowledgeNodesTable.id, req.params.nodeId));
    if (!node) return res.status(404).json({ error: "Not found" });
    res.json({ ...node, createdAt: node.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update knowledge node");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/subjects/:subjectId/knowledge-nodes/:nodeId", async (req, res) => {
  try {
    await db.delete(knowledgeNodesTable).where(
      and(eq(knowledgeNodesTable.id, req.params.nodeId), eq(knowledgeNodesTable.subjectId, req.params.subjectId))
    );
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete knowledge node");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/subjects/:subjectId/knowledge-edges", async (req, res) => {
  try {
    const { sourceNodeId, targetNodeId, label } = req.body;
    if (!sourceNodeId || !targetNodeId) return res.status(400).json({ error: "sourceNodeId and targetNodeId are required" });

    const id = randomUUID();
    await db.insert(knowledgeEdgesTable).values({
      id,
      subjectId: req.params.subjectId,
      sourceNodeId,
      targetNodeId,
      label: label ?? null,
    });

    const [edge] = await db.select().from(knowledgeEdgesTable).where(eq(knowledgeEdgesTable.id, id));
    res.status(201).json({ ...edge, createdAt: edge.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create knowledge edge");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/subjects/:subjectId/knowledge-edges/:edgeId", async (req, res) => {
  try {
    await db.delete(knowledgeEdgesTable).where(
      and(eq(knowledgeEdgesTable.id, req.params.edgeId), eq(knowledgeEdgesTable.subjectId, req.params.subjectId))
    );
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete edge");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/subjects/:subjectId/conflicts", async (req, res) => {
  try {
    const conflicts = await db.select().from(conflictsTable)
      .where(eq(conflictsTable.subjectId, req.params.subjectId));
    res.json(conflicts.map(c => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      resolvedAt: c.resolvedAt?.toISOString() ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list conflicts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/subjects/:subjectId/conflicts/:conflictId/resolve", async (req, res) => {
  try {
    const { resolution, manualText } = req.body;
    if (!resolution) return res.status(400).json({ error: "resolution is required" });

    const resolutionText = resolution === "manual" && manualText
      ? manualText
      : `Resolved via ${resolution}: ${resolution === "accept_new" ? "New information accepted" : resolution === "reject_new" ? "New information rejected" : resolution === "research" ? "External research conducted and verified" : "Manual correction applied"}`;

    await db.update(conflictsTable).set({
      status: resolution === "research" ? "researching" : "resolved",
      resolution: resolutionText,
      resolvedAt: resolution !== "research" ? new Date() : null,
    }).where(eq(conflictsTable.id, req.params.conflictId));

    const [conflict] = await db.select().from(conflictsTable).where(eq(conflictsTable.id, req.params.conflictId));
    res.json({
      ...conflict,
      createdAt: conflict.createdAt.toISOString(),
      resolvedAt: conflict.resolvedAt?.toISOString() ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to resolve conflict");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
