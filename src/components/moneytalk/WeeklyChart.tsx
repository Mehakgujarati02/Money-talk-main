import { useMemo } from "react";
import type { DashboardStats } from "@/lib/store";

export function WeeklyChart({ data }: { data: DashboardStats["weeklySpend"] }) {
  const max = useMemo(() => Math.max(1, ...data.map((d) => d.amount)), [data]);
  const peakIdx = data.findIndex((d) => d.amount === max && max > 0);

  return (
    <div className="card-soft p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="chip bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
            The receipts
          </div>
          <h3 className="mt-2 text-2xl font-black">Weekly clarity</h3>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          last 7 days <br />
          <span className="text-foreground/70">bought, not browsed</span>
        </div>
      </div>

      <div className="flex h-44 items-end justify-between gap-3">
        {data.map((d, i) => {
          const h = max === 0 ? 4 : Math.max(6, (d.amount / max) * 100);
          const isPeak = i === peakIdx && max > 0;
          return (
            <div key={d.day + i} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-xl transition-all"
                style={{
                  height: `${h}%`,
                  background: isPeak
                    ? "linear-gradient(180deg, var(--color-primary) 0%, oklch(0.6 0.22 357) 100%)"
                    : "var(--color-accent)",
                  opacity: d.amount === 0 ? 0.15 : 1,
                }}
                title={d.amount ? d.amount.toFixed(0) : "no spend"}
              />
              <span className="text-[10px] font-semibold tracking-widest text-muted-foreground">
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
