export const TIER_COLOR = {
  SS: "#a855f7",
  S: "#ef4444",
  A: "#f97316",
  B: "#eab308",
  C: "#22c55e",
  D: "#3b82f6",
};

export const tierColor = (tier) => TIER_COLOR[String(tier ?? "B").toUpperCase()] || "#a3b8cc";
export const fmt = (v) => (typeof v === "number" ? v.toFixed(1) + "%" : "-");
