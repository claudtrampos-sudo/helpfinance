import { Router } from "express";
import { db, transactionsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import {
  ListTransactionsQueryParams,
  CreateTransactionBody,
  GetTransactionParams,
  DeleteTransactionParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const query = ListTransactionsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }

  const conditions = [];
  if (query.data.type) {
    conditions.push(eq(transactionsTable.type, query.data.type));
  }
  if (query.data.category) {
    conditions.push(eq(transactionsTable.category, query.data.category));
  }
  if (query.data.month) {
    // filter by month prefix YYYY-MM
    conditions.push(
      // use SQL LIKE for date prefix match
      // drizzle-orm like: we'll filter in JS since date is text
      eq(transactionsTable.type, transactionsTable.type) // placeholder, will filter below
    );
  }

  let rows = await db
    .select()
    .from(transactionsTable)
    .where(conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : and(...conditions)) : undefined)
    .orderBy(desc(transactionsTable.date));

  // Filter by month in JS
  if (query.data.month) {
    rows = rows.filter((r) => r.date.startsWith(query.data.month!));
  }

  // Filter by category in JS if provided (since we have a placeholder condition)
  const result = rows.map((r) => ({
    id: r.id,
    description: r.description,
    amount: parseFloat(r.amount),
    type: r.type,
    category: r.category,
    date: r.date,
    isRecurring: r.isRecurring,
    recurringInterval: r.recurringInterval ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(result);
});

router.post("/", async (req, res) => {
  const body = CreateTransactionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const [row] = await db
    .insert(transactionsTable)
    .values({
      description: body.data.description,
      amount: String(body.data.amount),
      type: body.data.type,
      category: body.data.category,
      date: body.data.date,
      isRecurring: body.data.isRecurring,
      recurringInterval: body.data.recurringInterval ?? null,
    })
    .returning();

  res.status(201).json({
    id: row.id,
    description: row.description,
    amount: parseFloat(row.amount),
    type: row.type,
    category: row.category,
    date: row.date,
    isRecurring: row.isRecurring,
    recurringInterval: row.recurringInterval ?? null,
    createdAt: row.createdAt.toISOString(),
  });
});

router.get("/:id", async (req, res) => {
  const params = GetTransactionParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json({
    id: row.id,
    description: row.description,
    amount: parseFloat(row.amount),
    type: row.type,
    category: row.category,
    date: row.date,
    isRecurring: row.isRecurring,
    recurringInterval: row.recurringInterval ?? null,
    createdAt: row.createdAt.toISOString(),
  });
});

router.delete("/:id", async (req, res) => {
  const params = DeleteTransactionParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(transactionsTable).where(eq(transactionsTable.id, params.data.id));
  res.status(204).send();
});

export default router;
