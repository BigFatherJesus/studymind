import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

const DEMO_USER_ID = "demo-user-1";

async function ensureDemoUser() {
  await db.insert(usersTable).values({
    id: DEMO_USER_ID,
    displayName: "Alex Johnson",
    email: "alex@example.com",
    subscriptionTier: "intermediate",
    subjectLimit: 10,
    creditBalance: 850,
    monthlyIncluded: 500,
    autoTopUp: false,
  }).onConflictDoNothing();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, DEMO_USER_ID)).limit(1);
  return user;
}

router.get("/users/me", async (req, res) => {
  try {
    const user = await ensureDemoUser();
    res.json({
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      subscriptionTier: user.subscriptionTier,
      subjectLimit: user.subjectLimit,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/me/credits", async (req, res) => {
  try {
    const user = await ensureDemoUser();
    res.json({
      balance: user.creditBalance,
      monthlyIncluded: user.monthlyIncluded,
      autoTopUp: user.autoTopUp,
      tier: user.subscriptionTier,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get credits");
    res.status(500).json({ error: "Internal server error" });
  }
});

export { ensureDemoUser, DEMO_USER_ID };
export default router;
