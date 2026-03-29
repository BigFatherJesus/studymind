import { Router, type IRouter } from "express";
import { db, flashcardsTable, quizzesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.get("/subjects/:subjectId/flashcards", async (req, res) => {
  try {
    const flashcards = await db.select().from(flashcardsTable)
      .where(eq(flashcardsTable.subjectId, req.params.subjectId));
    res.json(flashcards.map(f => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
      lastReviewed: f.lastReviewed?.toISOString() ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list flashcards");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/subjects/:subjectId/quizzes", async (req, res) => {
  try {
    const quizzes = await db.select().from(quizzesTable)
      .where(eq(quizzesTable.subjectId, req.params.subjectId));
    res.json(quizzes.map(q => ({
      ...q,
      createdAt: q.createdAt.toISOString(),
      completedAt: q.completedAt?.toISOString() ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list quizzes");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/subjects/:subjectId/quizzes", async (req, res) => {
  try {
    const { title, questionCount, difficulty } = req.body;
    if (!title || !questionCount) return res.status(400).json({ error: "title and questionCount are required" });

    const questions = generateQuizQuestions(req.params.subjectId, questionCount, difficulty || "mixed");
    const id = randomUUID();

    await db.insert(quizzesTable).values({
      id,
      subjectId: req.params.subjectId,
      title,
      questions,
      totalQuestions: questions.length,
    });

    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, id));
    res.status(201).json({
      ...quiz,
      createdAt: quiz.createdAt.toISOString(),
      completedAt: null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate quiz");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/subjects/:subjectId/quizzes/:quizId/submit", async (req, res) => {
  try {
    const { answers } = req.body;
    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, req.params.quizId));
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const questions = quiz.questions as Array<{ id: string; question: string; options: string[]; correctIndex: number; explanation?: string }>;
    const feedback = answers.map((a: { questionId: string; selectedIndex: number }) => {
      const q = questions.find(q => q.id === a.questionId);
      if (!q) return null;
      return {
        questionId: a.questionId,
        correct: q.correctIndex === a.selectedIndex,
        selectedIndex: a.selectedIndex,
        correctIndex: q.correctIndex,
        explanation: q.explanation ?? null,
      };
    }).filter(Boolean);

    const correct = feedback.filter((f: { correct: boolean }) => f.correct).length;
    const score = Math.round((correct / questions.length) * 100);

    await db.update(quizzesTable).set({
      score,
      completedAt: new Date(),
    }).where(eq(quizzesTable.id, req.params.quizId));

    res.json({
      quizId: quiz.id,
      score,
      totalQuestions: questions.length,
      correctAnswers: correct,
      feedback,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to submit quiz");
    res.status(500).json({ error: "Internal server error" });
  }
});

function generateQuizQuestions(subjectId: string, count: number, difficulty: string) {
  const sampleQuestions = [
    { question: "Which of the following best describes operant conditioning?", options: ["Learning through association", "Learning through consequences", "Learning through observation", "Learning through repetition"], correctIndex: 1, explanation: "Operant conditioning involves learning from consequences of behavior." },
    { question: "What is the primary difference between short-term and long-term memory?", options: ["Capacity only", "Duration and capacity", "Speed of retrieval", "Location in the brain"], correctIndex: 1, explanation: "Short-term memory has limited capacity and duration, while long-term memory is essentially unlimited." },
    { question: "Which concept refers to the tendency to perceive incomplete figures as complete?", options: ["Proximity", "Similarity", "Closure", "Continuity"], correctIndex: 2, explanation: "The Gestalt principle of closure explains our tendency to complete incomplete figures." },
    { question: "What does cognitive load theory primarily address?", options: ["Emotional processing", "Working memory limitations", "Long-term memory consolidation", "Neural plasticity"], correctIndex: 1, explanation: "Cognitive load theory focuses on the limitations of working memory during learning." },
    { question: "Which research method involves manipulating one variable while controlling others?", options: ["Case study", "Survey", "Experiment", "Observation"], correctIndex: 2, explanation: "Experiments involve controlled manipulation of independent variables." },
  ];

  const questions = [];
  for (let i = 0; i < Math.min(count, sampleQuestions.length); i++) {
    questions.push({ id: randomUUID(), ...sampleQuestions[i % sampleQuestions.length] });
  }
  return questions;
}

export default router;
