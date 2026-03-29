import { Router, type IRouter } from "express";
import { db, uploadsTable, subjectsTable, flashcardsTable, knowledgeNodesTable, conflictsTable, notificationsTable, subjectVersionsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { DEMO_USER_ID } from "./users";
import { saveVersion } from "./subjects";

const router: IRouter = Router();

router.get("/subjects/:subjectId/uploads", async (req, res) => {
  try {
    const uploads = await db.select().from(uploadsTable)
      .where(eq(uploadsTable.subjectId, req.params.subjectId))
      .orderBy(desc(uploadsTable.createdAt));
    res.json(uploads.map(u => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      processedAt: u.processedAt?.toISOString() ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list uploads");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/subjects/:subjectId/uploads", async (req, res) => {
  try {
    const { title, type, content, url } = req.body;
    if (!title || !type) return res.status(400).json({ error: "title and type are required" });

    const id = randomUUID();
    await db.insert(uploadsTable).values({
      id,
      subjectId: req.params.subjectId,
      uploadedBy: DEMO_USER_ID,
      title,
      type,
      status: "pending",
      content: content ?? null,
      url: url ?? null,
      flashcardsGenerated: 0,
      nodesGenerated: 0,
    });

    const [upload] = await db.select().from(uploadsTable).where(eq(uploadsTable.id, id));
    res.status(201).json({
      ...upload,
      createdAt: upload.createdAt.toISOString(),
      processedAt: null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create upload");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/subjects/:subjectId/uploads/:uploadId", async (req, res) => {
  try {
    const [upload] = await db.select().from(uploadsTable)
      .where(and(eq(uploadsTable.id, req.params.uploadId), eq(uploadsTable.subjectId, req.params.subjectId)));
    if (!upload) return res.status(404).json({ error: "Not found" });
    res.json({ ...upload, createdAt: upload.createdAt.toISOString(), processedAt: upload.processedAt?.toISOString() ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to get upload");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/subjects/:subjectId/uploads/:uploadId", async (req, res) => {
  try {
    await db.delete(uploadsTable).where(
      and(eq(uploadsTable.id, req.params.uploadId), eq(uploadsTable.subjectId, req.params.subjectId))
    );
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete upload");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/subjects/:subjectId/uploads/:uploadId/process", async (req, res) => {
  try {
    const { subjectId, uploadId } = req.params;

    const [upload] = await db.select().from(uploadsTable)
      .where(and(eq(uploadsTable.id, uploadId), eq(uploadsTable.subjectId, subjectId)));
    if (!upload) return res.status(404).json({ error: "Upload not found" });

    await db.update(uploadsTable).set({ status: "processing" }).where(eq(uploadsTable.id, uploadId));

    const content = upload.content || upload.url || upload.title;
    const flashcardsToCreate = generateFlashcards(upload.title, content || "");
    const nodesToCreate = generateNodes(upload.title, content || "");
    const conflictsDetected = Math.random() > 0.7 ? 1 : 0;

    for (const fc of flashcardsToCreate) {
      await db.insert(flashcardsTable).values({ ...fc, subjectId, uploadId });
    }

    for (const node of nodesToCreate) {
      await db.insert(knowledgeNodesTable).values({ ...node, subjectId });
    }

    if (conflictsDetected > 0) {
      await db.insert(conflictsTable).values({
        id: randomUUID(),
        subjectId,
        description: `Potential contradiction detected in "${upload.title}" with existing material.`,
        sourceUploadId: uploadId,
        status: "pending",
      });
    }

    const summary = generateSummary(upload.title, content || "");
    const processingLog = `[${new Date().toISOString()}] Extracted text\n[${new Date().toISOString()}] Generated ${flashcardsToCreate.length} flashcards\n[${new Date().toISOString()}] Created ${nodesToCreate.length} knowledge nodes\n[${new Date().toISOString()}] Detected ${conflictsDetected} conflicts`;

    await db.update(uploadsTable).set({
      status: "completed",
      summary,
      processingLog,
      flashcardsGenerated: flashcardsToCreate.length,
      nodesGenerated: nodesToCreate.length,
      processedAt: new Date(),
    }).where(eq(uploadsTable.id, uploadId));

    const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, subjectId));
    if (subject) {
      const newFlashcardCount = subject.flashcardsCount + flashcardsToCreate.length;
      const newNodeCount = subject.nodeCount + nodesToCreate.length;
      const newUploadCount = subject.uploadsCount + 1;
      await db.update(subjectsTable).set({
        flashcardsCount: newFlashcardCount,
        nodeCount: newNodeCount,
        uploadsCount: newUploadCount,
        updatedAt: new Date(),
      }).where(eq(subjectsTable.id, subjectId));

      const allVersions = await db.select().from(subjectVersionsTable).where(eq(subjectVersionsTable.subjectId, subjectId));
      await saveVersion(subjectId, allVersions.length + 1, `After processing: ${upload.title}`, newNodeCount, newFlashcardCount, newUploadCount);
    }

    await db.insert(notificationsTable).values({
      id: randomUUID(),
      userId: DEMO_USER_ID,
      type: "upload_complete",
      title: "Upload Processed",
      message: `"${upload.title}" has been processed. ${flashcardsToCreate.length} flashcards and ${nodesToCreate.length} knowledge nodes created.`,
      read: false,
      subjectId,
    });

    res.json({
      uploadId,
      summary,
      flashcardsCreated: flashcardsToCreate.length,
      nodesCreated: nodesToCreate.length,
      conflictsDetected,
      processingLog,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to process upload");
    res.status(500).json({ error: "Internal server error" });
  }
});

function generateFlashcards(title: string, content: string) {
  const cards = [
    { id: randomUUID(), front: `What is the main concept in ${title}?`, back: `The main concept focuses on ${content.slice(0, 100) || "core principles"} as described in this material.`, difficulty: "medium" as const },
    { id: randomUUID(), front: `Define the key term from ${title}`, back: `Key term: relates to ${title} and encompasses the fundamental ideas presented.`, difficulty: "easy" as const },
    { id: randomUUID(), front: `What are the implications of ${title}?`, back: `The implications include practical applications in the field and theoretical consequences.`, difficulty: "hard" as const },
  ];
  return cards;
}

function generateNodes(title: string, content: string) {
  return [
    { id: randomUUID(), label: title, definition: content.slice(0, 150) || `Core concept from ${title}`, nodeType: "concept" as const, difficultyRating: 3, examRelevance: 4, x: Math.random() * 400, y: Math.random() * 400 },
    { id: randomUUID(), label: `${title} - Key Term`, definition: `Primary term introduced in ${title}`, nodeType: "term" as const, difficultyRating: 2, examRelevance: 5, x: Math.random() * 400, y: Math.random() * 400 },
  ];
}

function generateSummary(title: string, content: string): string {
  return `Summary of "${title}": This material covers the essential concepts and definitions. ${content ? `Content overview: ${content.slice(0, 200)}...` : "Key topics have been extracted and added to the knowledge base."} Flashcards and knowledge nodes have been automatically generated for study purposes.`;
}

export default router;
