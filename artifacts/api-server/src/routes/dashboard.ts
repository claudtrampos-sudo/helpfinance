import { Router } from "express";
import { db, transactionsTable } from "@workspace/db";
import { GetDashboardSummaryQueryParams, GetCategoryBreakdownQueryParams } from "@workspace/api-zod";

const router = Router();

const CATEGORY_COLORS: Record<string, string> = {
  Housing: "#7c3aed",
  "Food & Dining": "#ea580c",
  Transportation: "#0891b2",
  Healthcare: "#dc2626",
  Entertainment: "#db2777",
  Shopping: "#d97706",
  Education: "#0284c7",
  Utilities: "#65a30d",
  Subscriptions: "#9333ea",
  Travel: "#0d9488",
  Savings: "#16a34a",
  Salary: "#22c55e",
  Freelance: "#16a34a",
  Investments: "#2563eb",
  "Other Income": "#3b82f6",
};

const CATEGORY_PT: Record<string, string> = {
  Housing: "Moradia",
  "Food & Dining": "Alimentação",
  Transportation: "Transporte",
  Healthcare: "Saúde",
  Entertainment: "Lazer",
  Shopping: "Compras",
  Education: "Educação",
  Utilities: "Utilidades",
  Subscriptions: "Assinaturas",
  Travel: "Viagem",
  Savings: "Poupança",
  Salary: "Salário",
  Freelance: "Freelance",
  Investments: "Investimentos",
  "Other Income": "Outras Receitas",
};

const MONTH_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

router.get("/summary", async (req, res) => {
  const query = GetDashboardSummaryQueryParams.safeParse(req.query);
  const month = query.success && query.data.month ? query.data.month : new Date().toISOString().substring(0, 7);

  const allTx = await db.select().from(transactionsTable);
  const monthTx = allTx.filter((t) => t.date.startsWith(month));

  const monthlyIncome = monthTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const monthlyExpenses = monthTx
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalBalance =
    allTx.filter((t) => t.type === "income").reduce((sum, t) => sum + parseFloat(t.amount), 0) -
    allTx.filter((t) => t.type === "expense").reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  const expenseByCategory: Record<string, number> = {};
  for (const t of monthTx.filter((t) => t.type === "expense")) {
    expenseByCategory[t.category] = (expenseByCategory[t.category] ?? 0) + parseFloat(t.amount);
  }
  const topExpenseCategoryEn = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const topExpenseCategory = topExpenseCategoryEn ? (CATEGORY_PT[topExpenseCategoryEn] ?? topExpenseCategoryEn) : "Nenhuma";

  const formatBRL = (val: number) => val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  let aiInsight = "Continue assim! Rastreie suas despesas para manter o controle das suas finanças.";
  if (savingsRate > 20) {
    aiInsight = `Excelente! Sua taxa de poupança é de ${savingsRate.toFixed(1)}%, acima da média. Considere investir o excedente.`;
  } else if (savingsRate < 0) {
    aiInsight = `Atenção! Suas despesas superam sua receita em ${formatBRL(Math.abs(monthlyExpenses - monthlyIncome))} este mês. Revise seus gastos com ${topExpenseCategory}.`;
  } else if (topExpenseCategoryEn) {
    aiInsight = `Sua maior categoria de gastos é **${topExpenseCategory}**. Pequenas reduções ali podem aumentar sua poupança significativamente.`;
  }

  res.json({
    totalBalance: Math.round(totalBalance * 100) / 100,
    monthlyIncome: Math.round(monthlyIncome * 100) / 100,
    monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
    savingsRate: Math.round(savingsRate * 10) / 10,
    topExpenseCategory,
    transactionCount: monthTx.length,
    aiInsight,
  });
});

router.get("/monthly-trend", async (_req, res) => {
  const allTx = await db.select().from(transactionsTable);

  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const trend = months.map((month) => {
    const monthTx = allTx.filter((t) => t.date.startsWith(month));
    const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);
    const expenses = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);
    const savings = income - expenses;
    const monthIndex = parseInt(month.split("-")[1]) - 1;
    const label = MONTH_PT[monthIndex];
    return {
      month: label,
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      savings: Math.round(savings * 100) / 100,
    };
  });

  res.json(trend);
});

router.get("/category-breakdown", async (req, res) => {
  const query = GetCategoryBreakdownQueryParams.safeParse(req.query);
  const month = query.success && query.data.month ? query.data.month : new Date().toISOString().substring(0, 7);

  const allTx = await db.select().from(transactionsTable);
  const expenses = allTx.filter((t) => t.type === "expense" && t.date.startsWith(month));

  const byCategory: Record<string, number> = {};
  for (const t of expenses) {
    byCategory[t.category] = (byCategory[t.category] ?? 0) + parseFloat(t.amount);
  }

  const total = Object.values(byCategory).reduce((s, v) => s + v, 0);

  const breakdown = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category: CATEGORY_PT[category] ?? category,
      amount: Math.round(amount * 100) / 100,
      percentage: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
      color: CATEGORY_COLORS[category] ?? "#6b7280",
    }));

  res.json(breakdown);
});

export default router;
