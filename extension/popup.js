const FIELDS = [
  "currency", "hourlyRate", "monthlyIncome", "weeklyDiscretionary",
  "coffeeBudget", "foodDeliveryAvg", "monthlySavingsRate",
];
const DEFAULTS = {
  currency: "USD", hourlyRate: 20, monthlyIncome: 3000,
  weeklyDiscretionary: 120, coffeeBudget: 5, foodDeliveryAvg: 18, monthlySavingsRate: 300,
};
const SYM = { USD: "$", INR: "₹", EUR: "€", GBP: "£" };

const load = () => chrome.storage.local.get(["profile", "stats"], ({ profile, stats }) => {
  const p = { ...DEFAULTS, ...(profile || {}) };
  FIELDS.forEach((f) => { document.getElementById(f).value = p[f]; });
  const s = stats || { reconsidered: 0, saved: 0, proceeded: 0 };
  document.getElementById("s-rec").textContent = s.reconsidered;
  document.getElementById("s-sav").textContent = `${SYM[p.currency] || ""}${Math.round(s.saved)}`;
  document.getElementById("s-pro").textContent = s.proceeded;
});

document.getElementById("save").addEventListener("click", () => {
  const profile = {};
  FIELDS.forEach((f) => {
    const el = document.getElementById(f);
    profile[f] = el.type === "number" ? parseFloat(el.value) || 0 : el.value;
  });
  chrome.storage.local.set({ profile }, () => {
    const msg = document.getElementById("msg");
    msg.textContent = "Saved · let's get that bag 💸";
    setTimeout(() => (msg.textContent = ""), 1800);
    load();
  });
});

load();
