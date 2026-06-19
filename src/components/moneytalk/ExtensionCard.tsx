import { useState } from "react";
import { Download, Chrome, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExtensionCard() {
  const [status, setStatus] = useState<"idle" | "downloading" | "done" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  const download = () => {
    setStatus("downloading");
    setErr(null);
    fetch("/moneytalk-extension.zip")
      .then((r) => {
        if (!r.ok) throw new Error(`Download failed: ${r.status}`);
        return r.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "moneytalk-extension.zip";
        a.click();
        URL.revokeObjectURL(a.href);
        setStatus("done");
      })
      .catch((e) => {
        setStatus("error");
        setErr(e.message);
      });
  };

  return (
    <section className="card-soft mt-5 overflow-hidden p-0">
      <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Chrome className="size-4 text-[var(--color-primary)]" />
            <span className="chip bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
              Browser extension
            </span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-black leading-tight sm:text-4xl">
            Get the vibe check <span className="italic">at checkout</span>.
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            MoneyTalk pops up the second you hit <b>Buy Now</b> on Amazon, Flipkart, Myntra,
            food-delivery apps and most online stores — reframing the price as work hours, coffees,
            and food deliveries. No cap, just numbers.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button onClick={download} className="rounded-full px-5 py-5 text-sm font-bold">
              <Download className="mr-1 size-4" />
              {status === "downloading" ? "Downloading…" : "Download extension"}
            </Button>
            {status === "done" && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                <Check className="size-3.5" /> Saved to downloads
              </span>
            )}
            {status === "error" && (
              <span className="text-xs font-semibold text-[var(--color-secondary)]">{err}</span>
            )}
          </div>
        </div>

        <div className="border-t border-black/5 bg-black/[0.025] p-6 sm:p-8 md:border-l md:border-t-0 dark:bg-white/[0.03]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            How to install
          </p>
          <ol className="mt-3 space-y-2 text-sm">
            {[
              "Unzip the downloaded file.",
              <>
                Open <code className="rounded bg-black/5 px-1.5 py-0.5 text-[12px] dark:bg-white/10">chrome://extensions</code> in Chrome, Edge, Brave or Arc.
              </>,
              "Toggle Developer mode (top-right).",
              "Click Load unpacked and pick the unzipped folder.",
              "Set your hourly rate in the extension popup. That's it.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-foreground/80">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
