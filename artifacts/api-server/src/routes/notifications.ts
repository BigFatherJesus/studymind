import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { DEMO_USER_ID } from "./users";

const router: IRouter = Router();

router.get("/notifications", async (req, res) => {
  try {
    const notifications = await db.select().from(notificationsTable)
      .where(eq(notificationsTable.userId, DEMO_USER_ID))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(20);
    res.json(notifications.map(n => ({ ...n, createdAt: n.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list notifications");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
