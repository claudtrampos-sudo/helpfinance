import { Router } from "express";
import { db, userProfileTable, userBadgesTable } from "@workspace/db";

const router = Router();

const ALL_BADGES = [
  { id: "first_transaction", name: "First Step", description: "Add your first transaction", icon: "Star", xpReward: 50 },
  { id: "week_streak", name: "Week Warrior", description: "Maintain a 7-day activity streak", icon: "Flame", xpReward: 100 },
  { id: "month_streak", name: "Monthly Master", description: "Maintain a 30-day activity streak", icon: "Trophy", xpReward: 500 },
  { id: "saver_100", name: "Smart Saver", description: "Save $100 in a single month", icon: "PiggyBank", xpReward: 200 },
  { id: "goal_created", name: "Dream Builder", description: "Set your first financial goal", icon: "Target", xpReward: 75 },
  { id: "goal_completed", name: "Goal Crusher", description: "Complete a financial goal", icon: "Award", xpReward: 300 },
  { id: "budget_master", name: "Budget Master", description: "Stay under budget for 3 months", icon: "ShieldCheck", xpReward: 250 },
  { id: "investor", name: "Investor", description: "Log an investment income", icon: "TrendingUp", xpReward: 150 },
  { id: "expense_tracker_10", name: "Detail Oriented", description: "Log 10 transactions", icon: "ClipboardList", xpReward: 100 },
  { id: "expense_tracker_50", name: "Finance Enthusiast", description: "Log 50 transactions", icon: "BarChart2", xpReward: 300 },
];

const LEVEL_NAMES = [
  "Beginner",
  "Saver",
  "Budgeter",
  "Investor",
  "Wealth Builder",
  "Financial Expert",
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
