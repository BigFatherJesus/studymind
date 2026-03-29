import { Router, type IRouter } from "express";
import { db, teamsTable, teamMembersTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { DEMO_USER_ID } from "./users";

const router: IRouter = Router();

router.get("/teams", async (req, res) => {
  try {
    const memberships = await db.select().from(teamMembersTable)
      .where(eq(teamMembersTable.userId, DEMO_USER_ID));
    const teamIds = memberships.map(m => m.teamId);

    const teams = [];
    for (const teamId of teamIds) {
      const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, teamId));
      if (team) teams.push({ ...team, createdAt: team.createdAt.toISOString() });
    }
    res.json(teams);
  } catch (err) {
    req.log.error({ err }, "Failed to list teams");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/teams", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, DEMO_USER_ID));
    const teamId = randomUUID();
    const inviteCode = randomUUID().slice(0, 8).toUpperCase();

    await db.insert(teamsTable).values({
      id: teamId,
      name,
      description: description ?? null,
      ownerId: DEMO_USER_ID,
      memberCount: 1,
      subjectCount: 0,
      inviteCode,
    });

    await db.insert(teamMembersTable).values({
      id: randomUUID(),
      teamId,
      userId: DEMO_USER_ID,
      displayName: user?.displayName ?? "Demo User",
      email: user?.email ?? null,
      role: "owner",
    });

    const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, teamId));
    res.status(201).json({ ...team, createdAt: team.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create team");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/teams/:teamId", async (req, res) => {
  try {
    const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, req.params.teamId));
    if (!team) return res.status(404).json({ error: "Not found" });
    res.json({ ...team, createdAt: team.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to get team");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/teams/:teamId/members", async (req, res) => {
  try {
    const members = await db.select().from(teamMembersTable)
      .where(eq(teamMembersTable.teamId, req.params.teamId));
    res.json(members.map(m => ({ ...m, joinedAt: m.joinedAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list team members");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/teams/:teamId/members", async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ error: "email and role are required" });

    const memberId = randomUUID();
    await db.insert(teamMembersTable).values({
      id: memberId,
      teamId: req.params.teamId,
      userId: randomUUID(),
      displayName: email.split("@")[0],
      email,
      role,
    });

    await db.update(teamsTable).set({
      memberCount: (await db.select().from(teamMembersTable).where(eq(teamMembersTable.teamId, req.params.teamId))).length,
    }).where(eq(teamsTable.id, req.params.teamId));

    const [member] = await db.select().from(teamMembersTable).where(eq(teamMembersTable.id, memberId));
    res.status(201).json({ ...member, joinedAt: member.joinedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to add team member");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
