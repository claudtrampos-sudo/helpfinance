import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return format(new Date(date), "d 'de' MMM 'de' yyyy", { locale: ptBR });
}

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  Salary: "Salário",
  Freelance: "Freelance",
  Investments: "Investimentos",
  "Other Income": "Outras Receitas",
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
};

export function translateCategory(name: string): string {
  return CATEGORY_TRANSLATIONS[name] ?? name;
}

const TYPE_TRANSLATIONS: Record<string, string> = {
  income: "Receita",
  expense: "Despesa",
  daily: "diário",
  weekly: "semanal",
  monthly: "mensal",
  yearly: "anual",
};

export function translateType(type: string): string {
  return TYPE_TRANSLATIONS[type] ?? type;
}
