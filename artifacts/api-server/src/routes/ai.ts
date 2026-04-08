import { Router } from "express";
import { db, transactionsTable } from "@workspace/db";
import { AiChatBody } from "@workspace/api-zod";

const router = Router();

router.post("/chat", async (req, res) => {
  const body = AiChatBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Dados inválidos" });
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

  const formatBRL = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  let reply = "";
  let suggestions: string[] = [];

  const hasSpend = message.includes("gast") || message.includes("desp") || message.includes("spend") || message.includes("spent");
  const hasSave = message.includes("econom") || message.includes("poupar") || message.includes("save") || message.includes("cut") || message.includes("reduz");
  const hasIncome = message.includes("receita") || message.includes("salário") || message.includes("ganho") || message.includes("income") || message.includes("earn");
  const hasBalance = message.includes("saldo") || message.includes("total") || message.includes("balanço") || message.includes("balance");
  const hasTrack = message.includes("caminho") || message.includes("meta") || message.includes("goal") || message.includes("track") || message.includes("on track");

  if (hasSpend) {
    reply = `Este mês você gastou **${formatBRL(monthlyExpenses)}** em ${Object.keys(expenseByCategory).length} categorias. ${topCategory ? `Seu maior gasto é em **${topCategory[0]}**, com ${formatBRL(topCategory[1])}.` : ""} ${savingsRate < 0 ? "Você está gastando mais do que ganha — vamos analisar como reduzir as despesas!" : `Sua taxa de economia é de ${savingsRate.toFixed(1)}%, o que é ${savingsRate > 20 ? "excelente" : savingsRate > 10 ? "bom" : "um começo"}.`}`;
    suggestions = ["Onde posso economizar?", "Mostre minha receita do mês", "Como está minha taxa de poupança?"];
  } else if (hasSave) {
    const cutTips: string[] = [];
    for (const [cat, amount] of Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]).slice(0, 3)) {
      cutTips.push(`• **${cat}**: ${formatBRL(amount)} — tente reduzir de 10 a 15%`);
    }
    reply = `Aqui estão suas principais categorias de gastos onde você pode economizar:\n\n${cutTips.join("\n")}\n\nReduzir apenas 10% nessas categorias pode te economizar **${formatBRL(monthlyExpenses * 0.1)}** por mês — ou seja, **${formatBRL(monthlyExpenses * 0.1 * 12)}** por ano!`;
    suggestions = ["Quanto gastei este mês?", "Definir uma meta de economia", "Qual é meu saldo?"];
  } else if (hasIncome) {
    reply = `Sua receita total este mês é de **${formatBRL(monthlyIncome)}**. ${savings >= 0 ? `Após as despesas de ${formatBRL(monthlyExpenses)}, você tem **${formatBRL(savings)}** disponíveis para poupar ou investir.` : `Infelizmente suas despesas (${formatBRL(monthlyExpenses)}) ultrapassaram sua receita este mês.`}`;
    suggestions = ["Quanto gastei este mês?", "Quais são meus maiores gastos?", "Estou no caminho certo?"];
  } else if (hasBalance) {
    const totalIncome = allTx.filter((t) => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);
    const totalExpenses = allTx.filter((t) => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);
    const totalBalance = totalIncome - totalExpenses;
    reply = `Seu saldo total atual é de **${formatBRL(totalBalance)}**. Este mês você recebeu ${formatBRL(monthlyIncome)} e gastou ${formatBRL(monthlyExpenses)}.`;
    suggestions = ["Como aumentar minha poupança?", "Quais são meus maiores gastos?", "Criar uma meta financeira"];
  } else if (hasTrack) {
    reply = `${savingsRate > 0 ? `Você está poupando ${savingsRate.toFixed(1)}% da sua receita este mês — ${savingsRate > 20 ? "você está muito bem! Considere aumentar seus investimentos." : savingsRate > 10 ? "você está no caminho certo. Tente chegar a 20% de poupança." : "é um começo, mas há espaço para melhorar. Busque poupar entre 10% e 20% da renda."}` : "Suas despesas estão superando sua receita este mês. Vamos trabalhar para volcar aos trilhos!"}`;
    suggestions = ["Onde posso economizar?", "Resumo de gastos por categoria", "Criar uma nova meta"];
  } else {
    reply = `Olá! Sou seu Assistente Financeiro HelpFinance. Este mês você recebeu **${formatBRL(monthlyIncome)}** e gastou **${formatBRL(monthlyExpenses)}**, ${savings >= 0 ? `sobrando **${formatBRL(savings)}** de poupança` : "gastando mais do que recebeu"}. Como posso ajudá-lo a melhorar suas finanças?`;
    suggestions = [
      "Quanto gastei este mês?",
      "Onde posso economizar dinheiro?",
      "Estou no caminho certo com minhas metas?",
      "Qual é meu maior gasto?",
    ];
  }

  res.json({ reply, suggestions });
});

export default router;
