import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Currency, FinanceProfile } from "./money";

export type PurchaseCategory =
  | "Fashion"
  | "Tech"
  | "Late Night Takeout"
  | "Coffee"
  | "Subscriptions"
  | "Beauty"
  | "Going Out"
  | "Other";

export const CATEGORIES: PurchaseCategory[] = [
  "Fashion",
  "Tech",
  "Late Night Takeout",
  "Coffee",
  "Subscriptions",
  "Beauty",
  "Going Out",
  "Other",
];

export type Decision = "skipped" | "bought";

export interface PurchaseEntry {
  id: string;
  item: string;
  amount: number;
  category: PurchaseCategory;
  decision: Decision;
  source?: string; // amazon, myntra, ...
  createdAt: number;
}

export interface UserProfile {
  name: string;
  onboarded: boolean;
  finance: FinanceProfile;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "friend",
  onboarded: false,
  finance: {
    monthlyIncome: 60000,
    hourlyRate: 400,
    currency: "INR" as Currency,
    weeklyDiscretionary: 3000,
    coffeeBudget: 300,
    foodDeliveryAvg: 400,
    savingsGoal: 100000,
    monthlySavingsRate: 8000,
  },
};

interface MoneyTalkState {
  profile: UserProfile;
  purchases: PurchaseEntry[];
  theme: "light" | "dark";
  setProfile: (p: Partial<UserProfile>) => void;
  setFinance: (f: Partial<FinanceProfile>) => void;
  completeOnboarding: (p: Partial<UserProfile> & { finance?: Partial<FinanceProfile> }) => void;
  addPurchase: (p: Omit<PurchaseEntry, "id" | "createdAt">) => void;
  removePurchase: (id: string) => void;
  toggleTheme: () => void;
  reset: () => void;
}

export const useMoneyTalk = create<MoneyTalkState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      purchases: [],
      theme: "light",
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      setFinance: (f) =>
        set((s) => ({ profile: { ...s.profile, finance: { ...s.profile.finance, ...f } } })),
      completeOnboarding: (p) =>
        set((s) => ({
          profile: {
            ...s.profile,
            ...p,
            onboarded: true,
            finance: { ...s.profile.finance, ...(p.finance ?? {}) },
          },
        })),
      addPurchase: (p) =>
        set((s) => ({
          purchases: [
            { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
            ...s.purchases,
          ].slice(0, 200),
        })),
      removePurchase: (id) =>
        set((s) => ({ purchases: s.purchases.filter((x) => x.id !== id) })),
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === "light" ? "dark" : "light";
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", next === "dark");
          }
          return { theme: next };
        }),
      reset: () => set({ profile: DEFAULT_PROFILE, purchases: [] }),
    }),
    {
      name: "moneytalk-store-v1",
      onRehydrateStorage: () => (state) => {
        if (typeof document !== "undefined" && state?.theme === "dark") {
          document.documentElement.classList.add("dark");
        }
      },
    },
  ),
);

// Derived selectors -------------------------------------------------------

export interface DashboardStats {
  moneySaved: number;
  itemsReconsidered: number;
  awarenessScore: number; // 0-100
  topImpulseCategory: PurchaseCategory | null;
  needsVsWants: { needs: number; wants: number };
  weeklySpend: { day: string; amount: number }[];
}

const WANT_CATEGORIES: PurchaseCategory[] = [
  "Fashion",
  "Late Night Takeout",
  "Coffee",
  "Going Out",
  "Beauty",
];

export function computeStats(purchases: PurchaseEntry[]): DashboardStats {
  const moneySaved = purchases
    .filter((p) => p.decision === "skipped")
    .reduce((s, p) => s + p.amount, 0);

  const itemsReconsidered = purchases.filter((p) => p.decision === "skipped").length;
  const totalDecisions = purchases.length || 1;
  const awarenessScore = Math.round((itemsReconsidered / totalDecisions) * 100);

  const catCounts = new Map<PurchaseCategory, number>();
  purchases.forEach((p) => catCounts.set(p.category, (catCounts.get(p.category) ?? 0) + 1));
  const topImpulseCategory =
    [...catCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const bought = purchases.filter((p) => p.decision === "bought");
  const wants = bought
    .filter((p) => WANT_CATEGORIES.includes(p.category))
    .reduce((s, p) => s + p.amount, 0);
  const needs = bought.reduce((s, p) => s + p.amount, 0) - wants;
  const sum = needs + wants || 1;
  const needsVsWants = {
    needs: Math.round((needs / sum) * 100),
    wants: Math.round((wants / sum) * 100),
  };

  // weekly chart: last 7 days, summed bought amount per day
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const today = new Date();
  const weeklySpend = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dayKey = days[d.getDay()];
    const total = bought
      .filter((p) => {
        const pd = new Date(p.createdAt);
        return (
          pd.getFullYear() === d.getFullYear() &&
          pd.getMonth() === d.getMonth() &&
          pd.getDate() === d.getDate()
        );
      })
      .reduce((s, p) => s + p.amount, 0);
    return { day: dayKey, amount: total };
  });

  return {
    moneySaved,
    itemsReconsidered,
    awarenessScore,
    topImpulseCategory,
    needsVsWants,
    weeklySpend,
  };
}
