import { Router } from "express";
import { db, userProfileTable, userBadgesTable } from "@workspace/db";

const router = Router();

const ALL_BADGES = [
  { id: "first_transaction", name: "Primeiro Passo", description: "Adicione sua primeira transação", icon: "Star", xpReward: 50 },
  { id: "week_streak", name: "Guerreiro Semanal", description: "Mantenha uma sequência de 7 dias", icon: "Flame", xpReward: 100 },
  { id: "month_streak", name: "Mestre Mensal", description: "Mantenha uma sequência de 30 dias", icon: "Trophy", xpReward: 500 },
  { id: "saver_100", name: "Poupador Inteligente", description: "Poupe R$ 100 em um único mês", icon: "PiggyBank", xpReward: 200 },
  { id: "goal_created", name: "Sonhador Realizador", description: "Defina sua primeira meta financeira", icon: "Target", xpReward: 75 },
  { id: "goal_completed", name: "Conquistador de Metas", description: "Conclua uma meta financeira", icon: "Award", xpReward: 300 },
  { id: "budget_master", name: "Mestre do Orçamento", description: "Fique abaixo do orçamento por 3 meses", icon: "ShieldCheck", xpReward: 250 },
  { id: "investor", name: "Investidor", description: "Registre uma receita de investimento", icon: "TrendingUp", xpReward: 150 },
  { id: "expense_tracker_10", name: "Atento aos Detalhes", description: "Registre 10 transações", icon: "ClipboardList", xpReward: 100 },
  { id: "expense_tracker_50", name: "Entusiasta Financeiro", description: "Registre 50 transações", icon: "BarChart2", xpReward: 300 },
];

const LEVEL_NAMES = [
  "Iniciante",
  "Poupador",
  "Orçamentista",
  "Investidor",
  "Construtor de Riqueza",
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
