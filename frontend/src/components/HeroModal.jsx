import { useEffect, useState } from "react";
import { fmt } from "./tier.js";

// popup รายละเอียดฮีโร่: ดึงชุดไอเทม/setup จาก /api/heroes/:slug (มี loading + error ของตัวเอง)
export default function HeroModal({ hero: h, onClose }) {
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    fetch("/api/heroes/" + encodeURIComponent(h.slug), { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error();
        setDetail(json.data);
        setStatus("success");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, [h.slug]);

  const talents = detail && (Array.isArray(detail.setup.talents) ? detail.setup.talents.join(", ") : detail.setup.talents);

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}
    >
      <div style={{ borderRadius: 12, width: "min(660px,96vw)", maxHeight: "94vh", overflow: "auto", background: "radial-gradient(circle at top, #142230 0%, #0b131c 100%)", padding: 24, position: "relative" }}>
        <button onClick={onClose} aria-label="ปิด" style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, border: 0, borderRadius: "50%", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: "1.4rem", cursor: "pointer" }}>
          ×
        </button>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, paddingBottom: 16, borderBottom: "1px solid #1a2936", marginBottom: 20 }}>
          <img src={h.image} alt={h.name} referrerPolicy="no-referrer" style={{ width: 110, height: 110, borderRadius: 8, objectFit: "cover", border: "2px solid #203547" }} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <h2 style={{ marginBottom: 8, fontSize: "1.6rem" }}>{h.name}</h2>
            <div style={{ padding: 12, borderRadius: 6, border: "1px solid #182835", fontSize: "0.85rem", display: "grid", gap: 4 }}>
              {[["WIN RATE", h.winRate], ["PICK RATE", h.pickRate], ["BAN RATE", h.banRate]].map(([label, v]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{label}:</span>
                  <strong style={{ color: "#00d2ff" }}>{fmt(v)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ border: "1px solid #182835", borderRadius: 8, padding: 18 }}>
          <h3 style={{ marginBottom: 14, fontSize: "1rem" }}>🏆 Recommended Pro Build Items</h3>
          {status === "loading" && <div style={{ color: "#8fa3b0", textAlign: "center" }}>กำลังดึงรูปและชุดไอเทม...</div>}
          {status === "error" && <div style={{ color: "#ff4a4a", textAlign: "center" }}>โหลดข้อมูลล้มเหลว</div>}
          {status === "success" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 16 }}>
                {detail.items.map((it, i) => (
                  <div key={i} style={{ background: "#111c26", border: "1px solid #1f3547", borderRadius: 6, padding: "8px 4px", textAlign: "center" }}>
                    <img src={it.image} alt={it.name} referrerPolicy="no-referrer" style={{ width: 36, height: 36, objectFit: "contain" }} />
                    <div style={{ fontSize: 8, color: "#a3b8cc", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", borderTop: "1px solid #1c2e3d", paddingTop: 12, fontSize: "0.85rem", color: "#8fa3b0" }}>
                <div><strong>EMBLEM:</strong> {detail.setup.emblem}</div>
                <div><strong>TALENTS:</strong> {talents}</div>
                <div><strong>SPELL:</strong> {detail.setup.spell}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
