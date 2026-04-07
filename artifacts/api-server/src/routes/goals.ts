import { Router } from "express";
import { db, goalsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateGoalBody, UpdateGoalParams, UpdateGoalBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (_req, res) => {
  const rows = await db.select().from(goalsTable).orderBy(goalsTable.createdAt);
  res.json(
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      targetAmount: parseFloat(r.targetAmount),
      currentAmount: parseFloat(r.currentAmount),
      deadline: r.deadline ?? null,
      category: r.category,
      icon: r.icon,
      color: r.color,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

router.post("/", async (req, res) => {
  const body = CreateGoalBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const [row] = await db
    .insert(goalsTable)
    .values({
      title: body.data.title,
      targetAmount: String(body.data.targetAmount),
      currentAmount: String(body.data.currentAmount),
      deadline: body.data.deadline ?? null,
      category: body.data.category,
      icon: body.data.icon,
      color: body.data.color,
    })
    .returning();

  res.status(201).json({
    id: row.id,
    title: row.title,
    targetAmount: parseFloat(row.targetAmount),
    currentAmount: parseFloat(row.currentAmount),
    deadline: row.deadline ?? null,
    category: row.category,
    icon: row.icon,
    color: row.color,
    createdAt: row.createdAt.toISOString(),
  });
});

router.patch("/:id", async (req, res) => {
  const params = UpdateGoalParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const body = UpdateGoalBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (body.data.currentAmount !== undefined) updates.currentAmount = String(body.data.currentAmount);
  if (body.data.title !== undefined) updates.title = body.data.title;
  if (body.data.targetAmount !== undefined) updates.targetAmount = String(body.data.targetAmount);

  const [row] = await db.update(goalsTable).set(updates).where(eq(goalsTable.id, params.data.id)).returning();

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json({
    id: row.id,
    title: row.title,
    targetAmount: parseFloat(row.targetAmount),
    currentAmount: parseFloat(row.currentAmount),
    deadline: row.deadline ?? null,
    category: row.category,
    icon: row.icon,
    color: row.color,
    createdAt: row.createdAt.toISOString(),
  });
});

export default router;
