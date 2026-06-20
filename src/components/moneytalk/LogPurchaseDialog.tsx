import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, useMoneyTalk, type Decision, type PurchaseCategory } from "@/lib/store";
import { compare, formatMoney } from "@/lib/money";
import { RegretReceipt } from "./RegretReceipt";

export function LogPurchaseDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addPurchase = useMoneyTalk((s) => s.addPurchase);
  const finance = useMoneyTalk((s) => s.profile.finance);

  const [item, setItem] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<PurchaseCategory>("Fashion");
  const [decision, setDecision] = useState<Decision>("skipped");
  const [showReceipt, setShowReceipt] = useState(false);

  const comparisons = useMemo(
    () => (amount > 0 ? compare(amount, finance) : []),
    [amount, finance],
  );

  const reset = () => {
    setItem("");
    setAmount(0);
    setCategory("Fashion");
    setDecision("skipped");
    setShowReceipt(false);
  };

  const submit = () => {
    if (!item.trim() || amount <= 0) return;
    addPurchase({ item: item.trim(), amount, category, decision });
    if ((window as any).pendo) {
      (window as any).pendo.track("purchase_logged", {
        decision,
        category,
        amount,
        currency: finance.currency,
        item: item.trim(),
        comparisons_shown_count: comparisons.length,
      });
    }
    if (decision === "skipped") setShowReceipt(true);
    else {
      onClose();
      reset();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          reset();
        }
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="chip mb-2 w-fit bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
            Log a move
          </div>
          <DialogTitle className="font-display text-3xl font-black">
            Vibe check this purchase
          </DialogTitle>
        </DialogHeader>

        {!showReceipt ? (
          <>
            <div className="grid gap-4 py-2">
              <Field label="What were you eyeing?">
                <Input
                  placeholder="e.g. Y2K hoodie, late-night food delivery"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label={`Amount (${finance.currency})`}>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={amount || ""}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </Field>
                <Field label="Category">
                  <Select value={category} onValueChange={(v) => setCategory(v as PurchaseCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DecisionPill
                  label="I skipped it 💪"
                  active={decision === "skipped"}
                  onClick={() => setDecision("skipped")}
                />
                <DecisionPill
                  label="I bought it 🛍️"
                  active={decision === "bought"}
                  onClick={() => setDecision("bought")}
                />
              </div>

              {comparisons.length > 0 && (
                <div className="card-soft mt-1 p-4">
                  <div className="chip mb-2 bg-[var(--color-accent)]/12 text-[var(--color-accent)]">
                    Opportunity cost
                  </div>
                  <div className="font-display text-xl font-bold leading-snug">
                    {formatMoney(amount, finance.currency)} =
                  </div>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {comparisons.slice(0, 4).map((c) => (
                      <li key={c.id} className="flex items-start gap-2">
                        <span>{c.emoji}</span>
                        <span>{c.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { onClose(); reset(); }}>
                Cancel
              </Button>
              <Button onClick={submit} className="rounded-full px-6">
                {decision === "skipped" ? "Save & flex receipt" : "Log purchase"}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <RegretReceipt item={item} amount={amount} />
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  onClose();
                  reset();
                }}
                className="rounded-full px-6"
                variant="ghost"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function DecisionPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border-2 px-4 py-2.5 text-sm font-semibold transition-all"
      style={{
        background: active ? "var(--color-primary)" : "transparent",
        color: active ? "var(--color-primary-foreground)" : "var(--color-foreground)",
        borderColor: active ? "var(--color-primary)" : "var(--color-border)",
      }}
    >
      {label}
    </button>
  );
}
