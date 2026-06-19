import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { useMoneyTalk } from "@/lib/store";
import { compare, formatMoney, regretCaption } from "@/lib/money";
import { Download, Share2 } from "lucide-react";

interface Props {
  item: string;
  amount: number;
}

export function RegretReceipt({ item, amount }: Props) {
  const finance = useMoneyTalk((s) => s.profile.finance);
  const name = useMoneyTalk((s) => s.profile.name);
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const comps = compare(amount, finance).slice(0, 3);
  const caption = regretCaption(amount, item || "that thing", finance);

  const download = async () => {
    if (!ref.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(ref.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#fbf6ee",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `moneytalk-receipt-${Date.now()}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "MoneyTalk Receipt", text: caption });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(caption);
    }
  };

  return (
    <div className="space-y-3">
      <div
        ref={ref}
        className="overflow-hidden rounded-3xl p-7 text-white"
        style={{
          background:
            "linear-gradient(150deg, oklch(0.42 0.16 285) 0%, oklch(0.3 0.15 290) 55%, oklch(0.55 0.22 25) 110%)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold tracking-[0.25em] opacity-80">
            MONEYTALK · REGRET RECEIPT
          </div>
          <div className="text-xs opacity-70">@{name}</div>
        </div>
        <div className="mt-5">
          <div className="text-sm opacity-80">I almost bought</div>
          <div
            className="font-black leading-[0.95]"
            style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem" }}
          >
            {item || "that thing"}
          </div>
          <div
            className="mt-2 font-black"
            style={{ fontFamily: "var(--font-display)", fontSize: "3rem", color: "oklch(0.78 0.18 60)" }}
          >
            {formatMoney(amount || 0, finance.currency)}
          </div>
        </div>

        <div className="mt-5 border-t border-white/20 pt-4">
          <div className="text-xs font-bold uppercase tracking-wider opacity-75">
            That's the same as
          </div>
          <ul className="mt-2 space-y-1.5 text-base">
            {comps.length === 0 ? (
              <li className="opacity-80">Finish onboarding to unlock comparisons.</li>
            ) : (
              comps.map((c) => (
                <li key={c.id} className="flex items-start gap-2">
                  <span>{c.emoji}</span>
                  <span>{c.text}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="mt-6 flex items-center justify-between text-xs opacity-75">
          <span>not today, capitalism ✋</span>
          <span>moneytalk.app</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={download} disabled={busy} className="rounded-full">
          <Download className="mr-1.5 size-4" />
          {busy ? "Cooking..." : "Save PNG"}
        </Button>
        <Button onClick={share} variant="outline" className="rounded-full">
          <Share2 className="mr-1.5 size-4" />
          Share
        </Button>
      </div>
    </div>
  );
}
