import { useState } from "react";
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
import { useMoneyTalk } from "@/lib/store";
import type { Currency } from "@/lib/money";

const STEPS = ["You", "Income", "Habits", "Goals"] as const;

export function Onboarding({ open, onClose }: { open: boolean; onClose: () => void }) {
  const finance = useMoneyTalk((s) => s.profile.finance);
  const name = useMoneyTalk((s) => s.profile.name);
  const complete = useMoneyTalk((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name,
    currency: finance.currency,
    monthlyIncome: finance.monthlyIncome,
    hourlyRate: finance.hourlyRate,
    weeklyDiscretionary: finance.weeklyDiscretionary,
    coffeeBudget: finance.coffeeBudget,
    foodDeliveryAvg: finance.foodDeliveryAvg,
    savingsGoal: finance.savingsGoal,
    monthlySavingsRate: finance.monthlySavingsRate,
  });

  const update =
    <K extends keyof typeof form>(k: K) =>
    (v: (typeof form)[K]) =>
      setForm((f) => ({ ...f, [k]: v }));

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      complete({
        name: form.name || "friend",
        finance: {
          currency: form.currency as Currency,
          monthlyIncome: Number(form.monthlyIncome) || 0,
          hourlyRate: Number(form.hourlyRate) || 0,
          weeklyDiscretionary: Number(form.weeklyDiscretionary) || 0,
          coffeeBudget: Number(form.coffeeBudget) || 0,
          foodDeliveryAvg: Number(form.foodDeliveryAvg) || 0,
          savingsGoal: Number(form.savingsGoal) || 0,
          monthlySavingsRate: Number(form.monthlySavingsRate) || 0,
        },
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="chip mb-2 w-fit bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
            Vibe setup · {step + 1}/{STEPS.length}
          </div>
          <DialogTitle className="font-display text-3xl font-black">
            {step === 0 && "Let's get you set up, bestie"}
            {step === 1 && "How does the bag look?"}
            {step === 2 && "What's the spending vibe?"}
            {step === 3 && "Big main-character goals?"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {step === 0 && (
            <>
              <Field label="Your name">
                <Input value={form.name} onChange={(e) => update("name")(e.target.value)} />
              </Field>
              <Field label="Currency">
                <Select value={form.currency} onValueChange={(v) => update("currency")(v as Currency)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹ INR</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                    <SelectItem value="GBP">£ GBP</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <NumField label="Monthly income" value={form.monthlyIncome} onChange={update("monthlyIncome")} />
              <NumField
                label="Hourly rate (or income ÷ work hours)"
                value={form.hourlyRate}
                onChange={update("hourlyRate")}
              />
            </>
          )}

          {step === 2 && (
            <>
              <NumField
                label="Weekly fun-money budget"
                value={form.weeklyDiscretionary}
                onChange={update("weeklyDiscretionary")}
              />
              <NumField
                label="Avg coffee cost"
                value={form.coffeeBudget}
                onChange={update("coffeeBudget")}
              />
              <NumField
                label="Avg food-delivery order"
                value={form.foodDeliveryAvg}
                onChange={update("foodDeliveryAvg")}
              />
            </>
          )}

          {step === 3 && (
            <>
              <NumField
                label="Savings goal (total)"
                value={form.savingsGoal}
                onChange={update("savingsGoal")}
              />
              <NumField
                label="Amount you save per month"
                value={form.monthlySavingsRate}
                onChange={update("monthlySavingsRate")}
              />
            </>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            Back
          </Button>
          <Button onClick={next} className="rounded-full px-6">
            {step === STEPS.length - 1 ? "Lock it in" : "Next"}
          </Button>
        </div>
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

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <Field label={label}>
      <Input
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}
