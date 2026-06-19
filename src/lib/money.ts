// Pure money + opportunity-cost engine. Framework-free so the same module
// can power the dashboard, the browser extension widget, and unit tests.

export type Currency = "INR" | "USD" | "EUR" | "GBP";

export const CURRENCY_META: Record<Currency, { symbol: string; locale: string }> = {
  INR: { symbol: "₹", locale: "en-IN" },
  USD: { symbol: "$", locale: "en-US" },
  EUR: { symbol: "€", locale: "en-DE" },
  GBP: { symbol: "£", locale: "en-GB" },
};

export function formatMoney(amount: number, currency: Currency): string {
  const meta = CURRENCY_META[currency];
  try {
    return new Intl.NumberFormat(meta.locale, {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${meta.symbol}${amount.toFixed(0)}`;
  }
}

export interface FinanceProfile {
  monthlyIncome: number;
  hourlyRate: number; // derived or user-set
  currency: Currency;
  weeklyDiscretionary: number;
  coffeeBudget: number; // per-cup avg cost
  foodDeliveryAvg: number; // per-order avg cost
  savingsGoal: number; // total target
  monthlySavingsRate: number; // amount saved per month toward goal
}

export interface ComparisonRule {
  id: string;
  label: (qty: string) => string;
  emoji: string;
  /** Returns the human-readable quantity equivalent, or null if not applicable. */
  compute: (amount: number, p: FinanceProfile) => string | null;
}

const fmtQty = (n: number, unit: string, plural = `${unit}s`) => {
  if (!isFinite(n) || n <= 0) return null;
  if (n < 1) {
    const pct = Math.round(n * 100);
    return `${pct}% of a ${unit}`;
  }
  const rounded = n < 10 ? Math.round(n * 10) / 10 : Math.round(n);
  return `${rounded} ${rounded === 1 ? unit : plural}`;
};

export const DEFAULT_RULES: ComparisonRule[] = [
  {
    id: "work_hours",
    emoji: "⏱️",
    label: (q) => `${q} of grinding at work`,
    compute: (a, p) => (p.hourlyRate > 0 ? fmtQty(a / p.hourlyRate, "hour") : null),
  },
  {
    id: "work_days",
    emoji: "🗓️",
    label: (q) => `${q} of your daily bag`,
    compute: (a, p) => {
      const daily = (p.monthlyIncome ?? 0) / 30;
      return daily > 0 ? fmtQty(a / daily, "day") : null;
    },
  },
  {
    id: "weekly_fun",
    emoji: "🎉",
    label: (q) => `${q} of your weekly fun budget`,
    compute: (a, p) =>
      p.weeklyDiscretionary > 0 ? fmtQty(a / p.weeklyDiscretionary, "week") : null,
  },
  {
    id: "coffee",
    emoji: "☕",
    label: (q) => `${q} of café runs`,
    compute: (a, p) => (p.coffeeBudget > 0 ? fmtQty(a / p.coffeeBudget, "coffee") : null),
  },
  {
    id: "food_delivery",
    emoji: "🥡",
    label: (q) => `${q} of food deliveries`,
    compute: (a, p) =>
      p.foodDeliveryAvg > 0 ? fmtQty(a / p.foodDeliveryAvg, "delivery", "deliveries") : null,
  },
  {
    id: "savings_delay",
    emoji: "🎯",
    label: (q) => `${q} added to hitting your savings goal`,
    compute: (a, p) => {
      if (p.monthlySavingsRate <= 0) return null;
      const months = a / p.monthlySavingsRate;
      if (months < 1 / 30) return null;
      if (months < 1) return fmtQty(months * 30, "day");
      return fmtQty(months, "month");
    },
  },
];

export interface Comparison {
  id: string;
  emoji: string;
  text: string;
}

export function compare(amount: number, profile: FinanceProfile): Comparison[] {
  return DEFAULT_RULES.flatMap((rule) => {
    const q = rule.compute(amount, profile);
    return q ? [{ id: rule.id, emoji: rule.emoji, text: rule.label(q) }] : [];
  });
}

export function regretCaption(amount: number, item: string, profile: FinanceProfile): string {
  const top = compare(amount, profile)[0];
  if (!top) return `I almost dropped ${formatMoney(amount, profile.currency)} on ${item}. Vibe check failed.`;
  return `Almost bought ${item} for ${formatMoney(amount, profile.currency)}. That's ${top.text}. Not today, capitalism.`;
}
