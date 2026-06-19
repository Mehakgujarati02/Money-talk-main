import { useMoneyTalk } from "@/lib/store";
import { formatMoney } from "@/lib/money";
import { compare } from "@/lib/money";
import { Trash2 } from "lucide-react";

const HOURS_PER_DAY = 8;

export function RecentReceipts() {
  const purchases = useMoneyTalk((s) => s.purchases);
  const finance = useMoneyTalk((s) => s.profile.finance);
  const remove = useMoneyTalk((s) => s.removePurchase);

  return (
    <div className="card-soft p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl font-black">Recent receipts</h3>
        <span className="text-sm font-semibold text-[var(--color-primary)]">View all moves</span>
      </div>

      {purchases.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          No receipts yet, bestie. Log a purchase to start tracking your vibe.
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {purchases.slice(0, 6).map((p) => {
            const skipped = p.decision === "skipped";
            const top = compare(p.amount, finance)[0];
            const hours = finance.hourlyRate
              ? (p.amount / finance.hourlyRate).toFixed(1)
              : null;
            return (
              <li key={p.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-black"
                    style={{
                      background: skipped
                        ? "var(--color-primary)"
                        : "var(--color-secondary)",
                      color: "white",
                    }}
                  >
                    {skipped ? "−" : "+"}
                  </div>
                  <div>
                    <div className="font-semibold">{p.item}</div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {skipped ? "SAVED" : "BOUGHT"}
                      {hours && Number(hours) > 0
                        ? ` · ${hours} HOURS OF WORK`
                        : ""}
                      {top ? ` · ${top.text}` : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="font-display text-lg font-black tabular-nums"
                    style={{
                      color: skipped ? "var(--color-primary)" : "var(--color-secondary)",
                    }}
                  >
                    {skipped ? "−" : "+"}
                    {formatMoney(p.amount, finance.currency)}
                  </span>
                  <button
                    onClick={() => remove(p.id)}
                    className="text-muted-foreground/60 hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="sr-only">{HOURS_PER_DAY}</p>
    </div>
  );
}
