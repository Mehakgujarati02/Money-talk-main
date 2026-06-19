import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Moon, Plus, Sun, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMoneyTalk, computeStats } from "@/lib/store";
import { formatMoney } from "@/lib/money";
import { StatCard } from "@/components/moneytalk/StatCard";
import { WeeklyChart } from "@/components/moneytalk/WeeklyChart";
import { NeedsWantsDonut } from "@/components/moneytalk/NeedsWantsDonut";
import { RecentReceipts } from "@/components/moneytalk/RecentReceipts";
import { Onboarding } from "@/components/moneytalk/Onboarding";
import { LogPurchaseDialog } from "@/components/moneytalk/LogPurchaseDialog";
import { ExtensionCard } from "@/components/moneytalk/ExtensionCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MoneyTalk · Vibe check your spending" },
      {
        name: "description",
        content:
          "MoneyTalk reframes every purchase as opportunity cost. Track impulse buys, save the bag, get your weekly spending awareness score.",
      },
      { property: "og:title", content: "MoneyTalk · Vibe check your spending" },
      {
        property: "og:description",
        content: "Reframe purchases into work hours, coffees and savings goals — Gen-Z finance, no judgement.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const profile = useMoneyTalk((s) => s.profile);
  const purchases = useMoneyTalk((s) => s.purchases);
  const theme = useMoneyTalk((s) => s.theme);
  const toggleTheme = useMoneyTalk((s) => s.toggleTheme);

  const [onboardOpen, setOnboardOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  useEffect(() => {
    if (!profile.onboarded) setOnboardOpen(true);
  }, [profile.onboarded]);

  const stats = useMemo(() => computeStats(purchases), [purchases]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[var(--color-primary)]" />
              <span className="chip bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
                MoneyTalk
              </span>
            </div>
            <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] sm:text-6xl">
              Vibe check, {profile.name}
            </h1>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">
              Main character energy detected
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button
              onClick={() => setOnboardOpen(true)}
              variant="outline"
              className="hidden rounded-full sm:inline-flex"
            >
              Settings
            </Button>
            <div className="relative">
              <Button
                onClick={() => setLogOpen(true)}
                className="rounded-full px-5 py-5 text-sm font-bold"
              >
                <Plus className="mr-1 size-4" />
                Log a purchase
              </Button>
              <span className="absolute -right-2 -top-2 rounded-full bg-[var(--color-secondary)] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                New
              </span>
            </div>
          </div>
        </header>

        {/* Stat row */}
        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            eyebrow="Ate that"
            value={formatMoney(stats.moneySaved, profile.finance.currency)}
            hint="Total money saved"
          />
          <StatCard
            variant="filled"
            eyebrow="No cap score"
            value={`${stats.awarenessScore}%`}
            hint="Spending awareness"
          />
          <StatCard
            eyebrow="Decision wins"
            value={stats.itemsReconsidered}
            hint="Items reconsidered"
          />
          <StatCard
            eyebrow="Delulu spending"
            value={
              <span style={{ color: "var(--color-primary)" }}>
                {stats.topImpulseCategory ?? "—"}
              </span>
            }
            hint="Top impulse category"
          />
        </section>

        {/* Chart row */}
        <section className="mt-5 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <WeeklyChart data={stats.weeklySpend} />
          <NeedsWantsDonut needs={stats.needsVsWants.needs} wants={stats.needsVsWants.wants} />
        </section>

        {/* Extension */}
        <ExtensionCard />

        {/* Receipts */}
        <section className="mt-5">
          <RecentReceipts />
        </section>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          MoneyTalk · save the bag, not the regret · v0.1
        </footer>
      </div>

      <Onboarding open={onboardOpen} onClose={() => setOnboardOpen(false)} />
      <LogPurchaseDialog open={logOpen} onClose={() => setLogOpen(false)} />
    </div>
  );
}
