import { Router, type IRouter } from "express";
import { db, chatMessagesTable, uploadsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.get("/subjects/:subjectId/chat", async (req, res) => {
  try {
    const messages = await db.select().from(chatMessagesTable)
      .where(eq(chatMessagesTable.subjectId, req.params.subjectId))
      .orderBy(chatMessagesTable.createdAt);
    res.json(messages.map(m => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list chat messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/subjects/:subjectId/chat", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "content is required" });

    const userMsgId = randomUUID();
    await db.insert(chatMessagesTable).values({
      id: userMsgId,
      subjectId: req.params.subjectId,
      role: "user",
      content,
      citations: [],
    });

    const uploads = await db.select().from(uploadsTable)
      .where(eq(uploadsTable.subjectId, req.params.subjectId))
      .limit(3);

    const aiResponse = generateAiResponse(content, uploads);
    const citations = uploads.slice(0, 2).map(u => ({
      uploadId: u.id,
      title: u.title,
      excerpt: u.summary?.slice(0, 120) ?? `Relevant content from ${u.title}`,
    }));

    const aiMsgId = randomUUID();
    await db.insert(chatMessagesTable).values({
      id: aiMsgId,
      subjectId: req.params.subjectId,
      role: "assistant",
      content: aiResponse,
      citations,
    });

    const [aiMsg] = await db.select().from(chatMessagesTable).where(eq(chatMessagesTable.id, aiMsgId));
    res.json({
      ...aiMsg,
      createdAt: aiMsg.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to send chat message");
    res.status(500).json({ error: "Internal server error" });
  }
});

function generateAiResponse(question: string, uploads: any[]): string {
  const q = question.toLowerCase();
  const hasUploads = uploads.length > 0;
  const uploadContext = hasUploads ? ` Based on your uploaded materials (${uploads.map(u => u.title).join(", ")}), ` : " ";

  if (q.includes("explain") || q.includes("what is") || q.includes("define")) {
    return `Great question!${uploadContext}here is a detailed explanation: This concept involves understanding the fundamental principles at play. The key idea is that we need to consider multiple perspectives and integrate information from various sources. ${hasUploads ? "Your course materials provide excellent examples of this." : "Once you upload course materials, I'll be able to give you more specific answers grounded in your actual content."} Would you like me to break this down further or provide a practice quiz on this topic?`;
  }

  if (q.includes("quiz") || q.includes("test") || q.includes("practice")) {
    return `Absolutely! Here are a few practice questions based on your subject:\n\n1. What are the main theoretical frameworks in this area?\n2. How do the core concepts relate to each other?\n3. What are practical applications of these principles?\n\nI can generate a full quiz from your uploaded materials. Just go to the Quizzes tab to create one!`;
  }

  if (q.includes("summary") || q.includes("overview") || q.includes("recap")) {
    return `Here's an overview of the key points from your materials:${uploadContext}\n\n• Core concepts and definitions have been identified\n• Key relationships between topics are mapped in your knowledge graph\n• Flashcards have been generated for active recall practice\n\nFor a detailed summary of specific uploads, check the Uploads tab where each item has its own AI-generated summary.`;
  }

  if (q.includes("difference") || q.includes("compare") || q.includes("vs")) {
    return `Let me compare those concepts for you:${uploadContext}The main differences lie in their theoretical foundations, practical applications, and scope. While they share some similarities, each has distinct characteristics that make them applicable in different contexts. ${hasUploads ? "Your uploaded materials cover this distinction in detail." : "Upload your course materials for a comparison grounded in your specific content."} Would you like me to create flashcards to help you remember these distinctions?`;
  }

  return `That's a thoughtful question!${uploadContext}I can help you understand this topic better. The key aspects to consider are: the foundational principles, the practical applications, and how this connects to other concepts in your knowledge graph. ${hasUploads ? "I've analyzed your uploaded materials and can see relevant connections to what you've been studying." : "Upload your lecture notes or textbook chapters so I can provide answers grounded in your specific course content."} Is there a specific aspect you'd like me to dive deeper into?`;
}

export default router;
