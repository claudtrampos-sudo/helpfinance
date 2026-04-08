import { Router } from "express";
import { db, userProfileTable, userBadgesTable } from "@workspace/db";

const router = Router();

const ALL_BADGES = [
  { id: "first_transaction", name: "Primeiros Passos", description: "Você registrou sua primeira transação. A jornada começa aqui!", icon: "Star", xpReward: 50 },
  { id: "week_streak", name: "Primeira Semana Controlando Gastos", description: "7 dias consecutivos de acompanhamento. Continue assim!", icon: "Flame", xpReward: 100 },
  { id: "month_streak", name: "Um Mês de Controle Total", description: "30 dias seguidos de disciplina financeira. Incrível!", icon: "Trophy", xpReward: 500 },
  { id: "saver_100", name: "Poupando com Inteligência", description: "Economizou R$ 100 em um único mês. Seu futuro agradece!", icon: "PiggyBank", xpReward: 200 },
  { id: "goal_created", name: "Sonhe Grande!", description: "Definiu sua primeira meta financeira. Todo sonho começa com um plano.", icon: "Target", xpReward: 75 },
  { id: "goal_completed", name: "Meta Atingida!", description: "Parabéns! Você cumpriu uma meta financeira do início ao fim.", icon: "Award", xpReward: 300 },
  { id: "budget_master", name: "Sem Gastos Desnecessários", description: "Ficou dentro do orçamento por 3 meses seguidos. Disciplina exemplar!", icon: "ShieldCheck", xpReward: 250 },
  { id: "investor", name: "Modo Investidor Ativado", description: "Registrou sua primeira receita de investimento. O dinheiro trabalhando por você!", icon: "TrendingUp", xpReward: 150 },
  { id: "expense_tracker_10", name: "Atento aos Detalhes", description: "Registrou 10 transações. Quem controla, prospera!", icon: "ClipboardList", xpReward: 100 },
  { id: "expense_tracker_50", name: "Mestre das Finanças", description: "50 transações registradas. Você domina o seu dinheiro!", icon: "BarChart2", xpReward: 300 },
];

const LEVEL_NAMES = [
  "Iniciante",
  "Poupador",
  "Orçamentista",
  "Investidor",
  "Especialista Financeiro",
];

function getLevelName(level: number): string {
  return LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
}

function getXpToNextLevel(level: number): number {
  return level * 500;
}

router.get("/profile", async (_req, res) => {
  let [profile] = await db.select().from(userProfileTable).limit(1);
  if (!profile) {
    [profile] = await db.insert(userProfileTable).values({ xp: 1250, level: 3, streak: 12 }).returning();
  }

  const earnedBadgeRows = await db.select().from(userBadgesTable);
  const earnedIds = new Set(earnedBadgeRows.map((b) => b.badgeId));

  const earnedBadges = ALL_BADGES.filter((b) => earnedIds.has(b.id)).map((b) => {
    const row = earnedBadgeRows.find((r) => r.badgeId === b.id);
    return { ...b, earned: true, earnedAt: row?.earnedAt.toISOString() ?? null };
  });

  res.json({
    xp: profile.xp,
    level: profile.level,
    levelName: getLevelName(profile.level),
    xpToNextLevel: getXpToNextLevel(profile.level),
    streak: profile.streak,
    badgeCount: earnedBadges.length,
    earnedBadges,
  });
});

router.get("/badges", async (_req, res) => {
  const earnedRows = await db.select().from(userBadgesTable);
  const earnedIds = new Set(earnedRows.map((b) => b.badgeId));

  const badges = ALL_BADGES.map((b) => {
    const row = earnedRows.find((r) => r.badgeId === b.id);
    return {
      ...b,
      earned: earnedIds.has(b.id),
      earnedAt: row?.earnedAt.toISOString() ?? null,
    };
  });

  res.json(badges);
});

export default router;
