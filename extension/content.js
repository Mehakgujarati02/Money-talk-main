/* MoneyTalk content script
 * - Detects checkout/buy/place-order buttons across shopping & food sites
 * - Reads price from page (best-effort heuristic + DOM scan)
 * - Shows a centered opportunity-cost modal before purchase
 * - Profile lives in chrome.storage.local, edited from the popup
 */
(() => {
  if (window.__MONEYTALK_LOADED__) return;
  window.__MONEYTALK_LOADED__ = true;

  // ---------- defaults & storage ----------
  const DEFAULT_PROFILE = {
    currency: "USD",
    monthlyIncome: 3000,
    hourlyRate: 20,
    weeklyDiscretionary: 120,
    coffeeBudget: 5,
    foodDeliveryAvg: 18,
    monthlySavingsRate: 300,
  };
  const SYMBOLS = { USD: "$", INR: "₹", EUR: "€", GBP: "£" };

  let profile = { ...DEFAULT_PROFILE };
  let stats = { reconsidered: 0, saved: 0, proceeded: 0 };

  chrome.storage.local.get(["profile", "stats"], (res) => {
    if (res.profile) profile = { ...DEFAULT_PROFILE, ...res.profile };
    if (res.stats) stats = { ...stats, ...res.stats };
  });
  chrome.storage.onChanged.addListener((c) => {
    if (c.profile?.newValue) profile = { ...DEFAULT_PROFILE, ...c.profile.newValue };
    if (c.stats?.newValue) stats = c.stats.newValue;
  });

  // ---------- comparison engine ----------
  const fmtQty = (n, unit, plural = unit + "s") => {
    if (!isFinite(n) || n <= 0) return null;
    if (n < 1) return `${Math.round(n * 100)}% of a ${unit}`;
    const r = n < 10 ? Math.round(n * 10) / 10 : Math.round(n);
    return `${r} ${r === 1 ? unit : plural}`;
  };
  const compare = (a, p) => {
    const out = [];
    const push = (emoji, text) => text && out.push({ emoji, text });
    if (p.hourlyRate > 0) push("⏱️", `<b>${fmtQty(a / p.hourlyRate, "hour")}</b> of grinding at work`);
    if (p.coffeeBudget > 0) push("☕", `<b>${fmtQty(a / p.coffeeBudget, "coffee")}</b> café runs`);
    if (p.foodDeliveryAvg > 0) push("🥡", `<b>${fmtQty(a / p.foodDeliveryAvg, "delivery", "deliveries")}</b> food deliveries`);
    if (p.weeklyDiscretionary > 0) push("🎉", `<b>${fmtQty(a / p.weeklyDiscretionary, "week")}</b> of your weekly fun budget`);
    if (p.monthlySavingsRate > 0) {
      const months = a / p.monthlySavingsRate;
      const q = months < 1 ? fmtQty(months * 30, "day") : fmtQty(months, "month");
      push("🎯", `<b>${q}</b> added to your savings goal`);
    }
    return out.slice(0, 4);
  };
  const formatMoney = (a, c) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency", currency: c, maximumFractionDigits: a % 1 === 0 ? 0 : 2,
      }).format(a);
    } catch { return `${SYMBOLS[c] || ""}${a.toFixed(0)}`; }
  };

  // ---------- price detection ----------
  const PRICE_RE = /(?:[₹$€£]|USD|EUR|GBP|INR|Rs\.?)\s*([0-9]{1,3}(?:[,.\s][0-9]{3})*(?:[.,][0-9]{1,2})?)|([0-9]{2,7}(?:[.,][0-9]{2}))\s*(?:USD|EUR|GBP|INR)/i;
  const parsePrice = (txt) => {
    if (!txt) return null;
    const m = txt.match(PRICE_RE);
    if (!m) return null;
    const raw = (m[1] || m[2] || "").replace(/[,\s]/g, "");
    const n = parseFloat(raw);
    return isFinite(n) && n >= 1 ? n : null;
  };
  const detectPrice = (clickedEl) => {
    // 1. Look near the clicked button (parent containers, siblings)
    let node = clickedEl;
    for (let i = 0; i < 6 && node; i++) {
      const txt = node.innerText || "";
      if (txt.length < 4000) {
        const p = parsePrice(txt);
        if (p) return p;
      }
      node = node.parentElement;
    }
    // 2. Common price selectors
    const sels = [
      '[class*="grand-total" i]', '[class*="total-amount" i]', '[class*="total" i][class*="price" i]',
      '[data-test*="total" i]', '[data-testid*="total" i]', '[id*="total" i]',
      '[class*="price" i]', '[data-price]', 'meta[itemprop="price"]',
    ];
    let best = null;
    for (const s of sels) {
      document.querySelectorAll(s).forEach((el) => {
        const t = el.getAttribute?.("content") || el.textContent || "";
        const p = parsePrice(t);
        if (p && (!best || p > best)) best = p;
      });
      if (best) return best;
    }
    return null;
  };

  // ---------- button matching ----------
  const TRIGGER_RE = /\b(buy now|place order|proceed to (pay|checkout)|checkout|pay now|complete (order|purchase)|confirm order|continue to payment|order now)\b/i;
  const ATTR_HINTS = ["checkout", "place-order", "place_order", "placeorder", "buynow", "buy-now", "pay-now", "proceed"];
  const isTrigger = (el) => {
    if (!el || el.dataset?.mtIgnore === "1") return false;
    const role = (el.getAttribute("role") || "").toLowerCase();
    const tag = el.tagName;
    if (!(tag === "BUTTON" || tag === "A" || tag === "INPUT" || role === "button")) return false;
    const txt = (el.innerText || el.value || el.getAttribute("aria-label") || "").trim();
    if (txt && TRIGGER_RE.test(txt)) return true;
    const haystack = [el.id, el.name, el.className, el.getAttribute("data-testid"), el.getAttribute("data-test")]
      .filter(Boolean).join(" ").toLowerCase();
    return ATTR_HINTS.some((h) => haystack.includes(h));
  };

  // ---------- modal ----------
  let modalOpen = false;
  let pendingAction = null; // () => proceed
  const openModal = (price, sourceLabel) => {
    if (modalOpen) return;
    modalOpen = true;
    const items = compare(price, profile);
    const root = document.createElement("div");
    root.id = "moneytalk-root";
    root.innerHTML = `
      <div id="moneytalk-backdrop" role="dialog" aria-modal="true" aria-label="MoneyTalk vibe check">
        <div id="moneytalk-modal">
          <button class="mt-close" aria-label="Close">×</button>
          <span class="mt-chip">✨ MoneyTalk · vibe check</span>
          <h2>Hold up bestie — that's a lot.</h2>
          <div class="mt-price">${formatMoney(price, profile.currency)}</div>
          <div class="mt-sub">${sourceLabel ? `On <b>${sourceLabel}</b> · ` : ""}This bag is equal to:</div>
          <ul>
            ${items.map((i) => `<li><span class="mt-emoji">${i.emoji}</span><span>${i.text}</span></li>`).join("") ||
              `<li><span class="mt-emoji">🤔</span><span>Set up your profile in the MoneyTalk popup to see comparisons.</span></li>`}
          </ul>
          <div class="mt-actions">
            <button class="mt-cancel" data-mt-action="cancel">Nah, save the bag</button>
            <button class="mt-proceed" data-mt-action="proceed">It's giving necessity</button>
          </div>
          <div class="mt-footer">No judgement · just numbers</div>
        </div>
      </div>`;
    document.documentElement.appendChild(root);

    const close = (proceed) => {
      modalOpen = false;
      root.remove();
      const next = { ...stats };
      next.reconsidered += 1;
      if (proceed) { next.proceeded += 1; }
      else { next.saved += price; }
      stats = next;
      chrome.storage.local.set({ stats: next });
      if (typeof pendo !== "undefined" && pendo.track) {
        pendo.track("checkout_decision_made", {
          decision: proceed ? "proceeded" : "skipped",
          price: price,
          currency: profile.currency,
          source_site: sourceLabel,
          amount_saved: proceed ? 0 : price,
        });
      }
      if (proceed && pendingAction) pendingAction();
      pendingAction = null;
    };
    root.querySelector(".mt-close").addEventListener("click", () => close(false));
    root.querySelector("#moneytalk-backdrop").addEventListener("click", (e) => {
      if (e.target.id === "moneytalk-backdrop") close(false);
    });
    root.querySelector('[data-mt-action="cancel"]').addEventListener("click", () => close(false));
    root.querySelector('[data-mt-action="proceed"]').addEventListener("click", () => close(true));
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape") { document.removeEventListener("keydown", esc); close(false); }
    });
  };

  // ---------- click interception (capture phase) ----------
  document.addEventListener("click", (ev) => {
    if (modalOpen) return;
    const path = ev.composedPath ? ev.composedPath() : [];
    const el = path.find((n) => n instanceof Element && isTrigger(n)) || (ev.target.closest && ev.target.closest("button, a, input, [role=button]"));
    if (!el || !isTrigger(el)) return;
    const price = detectPrice(el);
    if (!price) return; // don't block if we can't justify it

    // Block this click, then queue the actual proceed
    ev.preventDefault();
    ev.stopImmediatePropagation();

    pendingAction = () => {
      el.dataset.mtIgnore = "1";
      el.click();
      setTimeout(() => { delete el.dataset.mtIgnore; }, 1500);
    };
    openModal(price, location.hostname.replace(/^www\./, ""));
    if (typeof pendo !== "undefined" && pendo.track) {
      pendo.track("checkout_intercepted", {
        price: price,
        currency: profile.currency,
        source_site: location.hostname.replace(/^www\./, ""),
        comparisons_count: compare(price, profile).slice(0, 4).length,
      });
    }
  }, true);
})();
