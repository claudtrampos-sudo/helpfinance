import { Router } from "express";

const router = Router();

const CATEGORIES = [
  { id: 1, name: "Salary", icon: "Briefcase", color: "#22c55e", type: "income" },
  { id: 2, name: "Freelance", icon: "Laptop", color: "#16a34a", type: "income" },
  { id: 3, name: "Investments", icon: "TrendingUp", color: "#2563eb", type: "income" },
  { id: 4, name: "Other Income", icon: "PlusCircle", color: "#3b82f6", type: "income" },
  { id: 5, name: "Housing", icon: "Home", color: "#7c3aed", type: "expense" },
  { id: 6, name: "Food & Dining", icon: "UtensilsCrossed", color: "#ea580c", type: "expense" },
  { id: 7, name: "Transportation", icon: "Car", color: "#0891b2", type: "expense" },
  { id: 8, name: "Healthcare", icon: "Heart", color: "#dc2626", type: "expense" },
  { id: 9, name: "Entertainment", icon: "Music", color: "#db2777", type: "expense" },
  { id: 10, name: "Shopping", icon: "ShoppingBag", color: "#d97706", type: "expense" },
  { id: 11, name: "Education", icon: "BookOpen", color: "#0284c7", type: "expense" },
  { id: 12, name: "Utilities", icon: "Zap", color: "#65a30d", type: "expense" },
  { id: 13, name: "Subscriptions", icon: "CreditCard", color: "#9333ea", type: "expense" },
  { id: 14, name: "Travel", icon: "Plane", color: "#0d9488", type: "expense" },
  { id: 15, name: "Savings", icon: "PiggyBank", color: "#16a34a", type: "both" },
];

router.get("/", (_req, res) => {
  res.json(CATEGORIES);
});

export default router;
