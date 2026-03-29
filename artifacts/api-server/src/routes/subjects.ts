import { Router, type IRouter } from "express";
import { db, subjectsTable, subjectVersionsTable, knowledgeNodesTable, flashcardsTable, uploadsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { DEMO_USER_ID } from "./users";

const router: IRouter = Router();

router.get("/subjects", async (req, res) => {
  try {
    const subjects = await db.select().from(subjectsTable)
      .where(eq(subjectsTable.userId, DEMO_USER_ID))
      .orderBy(desc(subjectsTable.updatedAt));
    res.json(subjects.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list subjects");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/subjects", async (req, res) => {
  try {
    const { title, description, syllabusText, teamId } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });

    const keyConcepts = generateKeyConcepts(syllabusText || description || title);
    const aiDescription = generateAiDescription(title, syllabusText || description || "");

    const id = randomUUID();
    const now = new Date();
    await db.insert(subjectsTable).values({
      id,
      userId: DEMO_USER_ID,
      teamId: teamId ?? null,
      title,
      description: description ?? null,
      aiDescription,
      keyConcepts,
      status: "active",
      uploadsCount: 0,
      flashcardsCount: 0,
      nodeCount: 0,
    });

    await saveVersion(id, 1, "Initial creation", 0, 0, 0);

    const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, id));
    res.status(201).json({
      ...subject,
      createdAt: subject.createdAt.toISOString(),
      updatedAt: subject.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create subject");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/subjects/:subjectId", async (req, res) => {
  try {
    const [subject] = await db.select().from(subjectsTable)
      .where(and(eq(subjectsTable.id, req.params.subjectId), eq(subjectsTable.userId, DEMO_USER_ID)));
    if (!subject) return res.status(404).json({ error: "Not found" });
    res.json({ ...subject, createdAt: subject.createdAt.toISOString(), updatedAt: subject.updatedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to get subject");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/subjects/:subjectId", async (req, res) => {
  try {
    const { title, description } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;

    await db.update(subjectsTable).set(updates).where(
      and(eq(subjectsTable.id, req.params.subjectId), eq(subjectsTable.userId, DEMO_USER_ID))
    );
    const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, req.params.subjectId));
    if (!subject) return res.status(404).json({ error: "Not found" });
    res.json({ ...subject, createdAt: subject.createdAt.toISOString(), updatedAt: subject.updatedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update subject");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/subjects/:subjectId", async (req, res) => {
  try {
    await db.delete(subjectsTable).where(
      and(eq(subjectsTable.id, req.params.subjectId), eq(subjectsTable.userId, DEMO_USER_ID))
    );
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete subject");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/subjects/:subjectId/versions", async (req, res) => {
  try {
    const versions = await db.select().from(subjectVersionsTable)
      .where(eq(subjectVersionsTable.subjectId, req.params.subjectId))
      .orderBy(desc(subjectVersionsTable.versionNumber));
    res.json(versions.map(v => ({ ...v, createdAt: v.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list versions");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/subjects/:subjectId/versions/:versionId/restore", async (req, res) => {
  try {
    const [version] = await db.select().from(subjectVersionsTable)
      .where(eq(subjectVersionsTable.id, req.params.versionId));
    if (!version) return res.status(404).json({ error: "Version not found" });

    await db.update(subjectsTable).set({
      nodeCount: version.nodeCount,
      flashcardsCount: version.flashcardCount,
      uploadsCount: version.uploadsCount,
      updatedAt: new Date(),
    }).where(eq(subjectsTable.id, req.params.subjectId));

    const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, req.params.subjectId));
    res.json({ ...subject, createdAt: subject.createdAt.toISOString(), updatedAt: subject.updatedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to restore version");
    res.status(500).json({ error: "Internal server error" });
  }
});

async function saveVersion(subjectId: string, versionNumber: number, label: string, nodeCount: number, flashcardCount: number, uploadsCount: number) {
  await db.insert(subjectVersionsTable).values({
    id: randomUUID(),
    subjectId,
    versionNumber,
    label,
    nodeCount,
    flashcardCount,
    uploadsCount,
  });
}

function generateKeyConcepts(text: string): string[] {
  const words = text.split(/\s+/).filter(w => w.length > 4);
  const seen = new Set<string>();
  const concepts: string[] = [];
  for (const w of words) {
    const cleaned = w.replace(/[^a-zA-Z]/g, "");
    if (cleaned.length > 4 && !seen.has(cleaned.toLowerCase())) {
      seen.add(cleaned.toLowerCase());
      concepts.push(cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
      if (concepts.length >= 6) break;
    }
  }
  return concepts.length > 0 ? concepts : ["Core Concepts", "Key Theories", "Fundamentals"];
}

function generateAiDescription(title: string, context: string): string {
  const trimmed = context.slice(0, 200).trim();
  return `${title} is a comprehensive study subject covering foundational and advanced concepts. ${trimmed ? `Based on the provided material: ${trimmed}` : "This subject will be enriched as you upload course materials."} The knowledge base will grow as you add lectures, textbooks, and notes.`;
}

export { saveVersion };
export default router;
