import { tierColor, fmt } from "./tier.js";

export default function HeroRow({ hero: h, rank, sortBy, max, onClick }) {
  const tier = String(h.tier ?? "B").toUpperCase();
  const color = tierColor(tier);
  const isTier = sortBy === "tier";
  const value = typeof h[sortBy] === "number" ? h[sortBy] : 0;

  return (
    <li className="row" onClick={onClick}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1d7df0", width: 32, textAlign: "center" }}>
          #{rank}
        </span>
        <div style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", border: "1px solid #203547", background: "#0b131c" }}>
          <img src={h.image} alt={h.name} referrerPolicy="no-referrer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
          <div style={{ fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            {h.name}
            <span style={{ fontSize: "0.65rem", fontWeight: 800, color, border: `1px solid ${color}40`, padding: "1px 5px", borderRadius: 4 }}>
              {tier} TIER
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "#8fa3b0", marginTop: 2 }}>
            {h.role} · {h.lane}
          </div>
        </div>
      </div>
      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#00d2ff", minWidth: 120, textAlign: "right" }}>
        {isTier ? (
          <span style={{ color, fontWeight: 800 }}>{tier} TIER</span>
        ) : (
          <>
            <div style={{ height: 6, background: "#1c2e3d", borderRadius: 3, marginBottom: 4 }}>
              <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: "#00d2ff", borderRadius: 3 }} />
            </div>
            {fmt(h[sortBy])}
          </>
        )}
      </div>
    </li>
  );
}
