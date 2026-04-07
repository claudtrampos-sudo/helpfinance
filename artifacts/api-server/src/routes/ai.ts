import { Router } from "express";
import { db, transactionsTable } from "@workspace/db";
import { AiChatBody } from "@workspace/api-zod";

const router = Router();

router.post("/chat", async (req, res) => {
  const body = AiChatBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const message = body.data.message.toLowerCase();
  const allTx = await db.select().from(transactionsTable);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthTx = allTx.filter((t) => t.date.startsWith(currentMonth));

  const monthlyExpenses = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);
  const monthlyIncome = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);
  const savings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

  const expenseByCategory: Record<string, number> = {};
  for (const t of monthTx.filter((t) => t.type === "expense")) {
    expenseByCategory[t.category] = (expenseByCategory[t.category] ?? 0) + parseFloat(t.amount);
  }
  const topCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0];

  let reply = "";
  let suggestions: string[] = [];

  if (message.includes("spend") || message.includes("expense") || message.includes("spent")) {
    reply = `This month you've spent **$${monthlyExpenses.toFixed(2)}** across ${Object.keys(expenseByCategory).length} categories. ${topCategory ? `Your biggest expense is **${topCategory[0]}** at $${topCategory[1].toFixed(2)}.` : ""} ${savingsRate < 0 ? "You're currently spending more than you earn — let's look at ways to reduce expenses!" : `You're saving ${savingsRate.toFixed(1)}% of your income, which is ${savingsRate > 20 ? "excellent" : savingsRate > 10 ? "good" : "a start"}.`}`;
    suggestions = ["Where can I cut expenses?", "Show my income this month", "How's my savings rate?"];
  } else if (message.includes("save") || message.includes("saving") || message.includes("cut")) {
    const cutTips: string[] = [];
    for (const [cat, amount] of Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]).slice(0, 3)) {
      cutTips.push(`• **${cat}**: $${amount.toFixed(2)} — try reducing by 10-15%`);
    }
    reply = `Here are your top spending areas where you could save money:\n\n${cutTips.join("\n")}\n\nReducing these by just 10% could save you **$${(monthlyExpenses * 0.1).toFixed(2)}** per month — that's **$${(monthlyExpenses * 0.1 * 12).toFixed(2)}** per year!`;
    suggestions = ["How much did I spend this month?", "Set a savings goal", "What's my balance?"];
  } else if (message.includes("income") || message.includes("earn")) {
    reply = `Your total income this month is **$${monthlyIncome.toFixed(2)}**. ${savings >= 0 ? `After expenses of $${monthlyExpenses.toFixed(2)}, you have **$${savings.toFixed(2)}** left to save or invest.` : `Unfortunately your expenses ($${monthlyExpenses.toFixed(2)}) exceed your income this month.`}`;
    suggestions = ["How much did I spend?", "What are my biggest expenses?", "Am I on track?"];
  } else if (message.includes("balance") || message.includes("net worth") || message.includes("total")) {
    const totalIncome = allTx.filter((t) => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);
    const totalExpenses = allTx.filter((t) => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);
    const totalBalance = totalIncome - totalExpenses;
    reply = `Your current total balance is **$${totalBalance.toFixed(2)}**. This month you earned $${monthlyIncome.toFixed(2)} and spent $${monthlyExpenses.toFixed(2)}.`;
    suggestions = ["How can I grow my savings?", "What are my biggest expenses?", "Set a financial goal"];
  } else if (message.includes("track") || message.includes("goal") || message.includes("on track")) {
    reply = `${savingsRate > 0 ? `You're saving ${savingsRate.toFixed(1)}% of your income this month — ${savingsRate > 20 ? "you're well on track! Consider increasing your investment contributions." : savingsRate > 10 ? "you're on the right path. Try to push towards a 20% savings rate." : "it's a start, but there's room to improve. Aim for 10-20% savings rate."}` : "Your expenses are exceeding your income this month. Let's work on getting back on track!"}`;
    suggestions = ["Where can I save money?", "Show spending breakdown", "Set a new goal"];
  } else {
    reply = `Hi! I'm your HelpFinance AI assistant. This month you've earned **$${monthlyIncome.toFixed(2)}** and spent **$${monthlyExpenses.toFixed(2)}**, ${savings >= 0 ? `leaving you with **$${savings.toFixed(2)}** in savings` : "spending more than you earned"}. How can I help you improve your finances?`;
    suggestions = [
      "How much did I spend this month?",
      "Where can I save money?",
      "Am I on track with my goals?",
      "What's my biggest expense?",
    ];
  }

  res.json({ reply, suggestions });
});

export default router;
