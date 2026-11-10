const LABEL = { winRate: "WIN RATE", pickRate: "PICK RATE", banRate: "BAN RATE", tier: "TIER" };
const state = { sortBy: "winRate", order: "desc", q: "", data: [] };

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (v) => (typeof v === "number" ? v.toFixed(1) + "%" : "-");

const num = (v) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v.replace("%", "").trim()) || 0;
  return 0;
};

async function load() {
  const container = document.getElementById("list");
  if (container) container.innerHTML = '<li style="color:#8fa3b0; padding:20px; list-style:none; text-align:center;">กำลังดึงฐานข้อมูลเมต้าความนิยมจาก Live API...</li>';
  try {
    const res = await fetch(`/api/heroes?sortBy=${state.sortBy}&order=${state.order}`);
    const json = await res.json();
    state.data = json.data || [];
    render();
  } catch (e) {
    if (document.getElementById("status")) document.getElementById("status").innerHTML = '<div style="color:#ff4a4a; text-align:center; padding:20px;">เกิดข้อผิดพลาดในการโหลดข้อมูล API</div>';
  }
}

function render() {
  const container = document.getElementById("list");
  if (!container) return;

  const key = state.sortBy;
  const q = state.q.trim().toLowerCase();
  const rows = q ? state.data.filter((h) => (h.name || "").toLowerCase().includes(q)) : state.data;
  
  if (document.getElementById("summary")) {
    document.getElementById("summary").textContent = `${rows.length} Heroes จัดลำดับตาม ${LABEL[state.sortBy]}`;
  }

  if (!rows.length) {
    container.innerHTML = '<li style="color:#8fa3b0; text-align:center; padding:20px; list-style:none;">ไม่พบฮีโร่</li>';
    return;
  }

  const max = Math.max(...rows.map((h) => num(h[key])), 1);

  container.innerHTML = rows.map((h, i) => {
    const tier = String(h.tier ?? "B").toUpperCase();
    let tierColor = "#a3b8cc";
    if (tier === "SS") tierColor = "#a855f7";
    else if (tier === "S") tierColor = "#ef4444";
    else if (tier === "A") tierColor = "#f97316";
    else if (tier === "B") tierColor = "#eab308";
    else if (tier === "C") tierColor = "#22c55e";
    else if (tier === "D") tierColor = "#3b82f6";

    const isTier = key === "tier";
    const meterContent = isTier 
      ? `<span class="val" style="font-size:1.1rem; font-weight:800; color:${tierColor}; background:${tierColor}15; padding:4px 10px; border-radius:6px; border:1px solid ${tierColor}30;">${tier} TIER</span>`
      : `<div class="bar"><i style="width:${(num(h[key]) / max) * 100}%"></i></div><span class="val">${fmt(h[key])}</span>`;

    return `
      <li class="row" data-slug="${esc(h.slug)}">
        <div style="display:flex; align-items:center; gap:14px; flex:1; min-width:0;">
          <span style="font-size:1.05rem; font-weight:700; color:#1d7df0; width:32px; text-align:center;">#${i + 1}</span>
          <div style="width:44px; height:44px; border-radius:6px; overflow:hidden; border:1px solid #203547; display:flex; align-items:center; justify-content:center; background:#0b131c;">
            <img src="${esc(h.image)}" style="width:100%; height:100%; object-fit:cover;" referrerpolicy="no-referrer">
          </div>
          <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            <div style="font-weight:700; color:#fff; display:flex; align-items:center; gap:8px;">
              ${esc(h.name)}
              <span style="font-size:0.65rem; font-weight:800; color:${tierColor}; border:1px solid ${tierColor}40; padding:1px 5px; border-radius:4px; background:rgba(0,0,0,0.2);">${tier} TIER</span>
            </div>
            <div style="font-size:0.75rem; color:#8fa3b0; margin-top:2px;">${esc(h.role)} · ${esc(h.lane)}</div>
          </div>
        </div>
        <div style="font-size:1.1rem; font-weight:700; color:#00d2ff; display:flex; align-items:center; justify-content:flex-end; min-width:120px;">${meterContent}</div>
      </li>
    `;
  }).join("");

  container.querySelectorAll(".row").forEach((row) => {
    row.onclick = () => {
      const slug = row.getAttribute("data-slug");
      if (slug) openDetail(slug);
    };
  });
}

function openDetail(slug) {
  const h = state.data.find((x) => x.slug === slug);
  if (!h || !document.getElementById("detail")) return;

  document.getElementById("detail").innerHTML = `
    <div id="d-backdrop" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.75); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:16px;">
      <div id="d-window" style="border-radius:12px; padding:0; width:min(660px,96vw); max-height:94vh; overflow:auto; background:#0b131c; color:#ffffff; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8); position:relative;">
        <div id="d-body" style="background: radial-gradient(circle at top, #142230 0%, #0b131c 100%); padding: 24px;">
          <button id="d-close-btn" style="position:absolute; top:12px; right:12px; width:32px; height:32px; border:0; border-radius:50%; background:rgba(255,255,255,0.1); color:#ffffff; font-size:1.4rem; cursor:pointer; display:flex; align-items:center; justify-content:center;">×</button>
          
          <div style="display: flex; flex-wrap: wrap; gap: 20px; padding-bottom: 16px; border-bottom: 1px solid #1a2936; margin-bottom: 20px;">
            <div style="width: 110px; height: 110px; border-radius: 8px; overflow: hidden; border: 2px solid #203547; background:#142230;">
              <img src="${esc(h.image)}" style="width:100%; height:100%; object-fit:cover;" referrerpolicy="no-referrer">
            </div>
            <div style="flex: 1; min-width: 240px;">
              <h2 style="margin:0 0 8px; font-size:1.6rem; font-weight:700; color:#ffffff;">${esc(h.name)}</h2>
              <div style="background: rgba(11, 19, 28, 0.6); padding: 12px; border-radius: 6px; border: 1px solid #182835; font-size:0.85rem; display:grid; gap:4px;">
                <div style="display:flex; justify-content:space-between;"><span>WIN RATE:</span><strong style="color:#00d2ff">${fmt(h.winRate)}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>PICK RATE:</span><strong style="color:#00d2ff">${fmt(h.pickRate)}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>BAN RATE:</span><strong style="color:#00d2ff">${fmt(h.banRate)}</strong></div>
              </div>
            </div>
          </div>

          <div style="background: rgba(14, 26, 36, 0.8); border: 1px solid #182835; border-radius: 8px; padding: 18px;">
            <h3 style="margin: 0 0 14px 0; font-size: 1rem; font-weight: 700; color: #ffffff;">🏆 Recommended Pro Build Items</h3>
            <div id="full-build-items" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 16px;">
              <span style="grid-column:1/7; text-align:center; color:#8fa3b0;">กำลังดึงรูปและชุดไอเทม...</span>
            </div>
            <div id="full-build-setup" style="display: flex; gap: 16px; align-items: center; border-top: 1px solid #1c2e3d; padding-top: 12px; font-size: 0.85rem; color:#8fa3b0;">
              กำลังโหลดข้อมูล Setup...
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const closePopup = () => { document.getElementById("detail").innerHTML = ""; };
  document.getElementById("d-close-btn").onclick = closePopup;
  document.getElementById("d-backdrop").onclick = (e) => { if (e.target === document.getElementById("d-backdrop")) closePopup(); };

  fetch("/api/heroes/" + encodeURIComponent(h.slug))
    .then((r) => r.json())
    .then((json) => {
      const itemContainer = document.getElementById("full-build-items");
      const setupContainer = document.getElementById("full-build-setup");
      const resData = json?.data || {};

      if (itemContainer && resData.items) {
        itemContainer.innerHTML = resData.items.map(item => `
          <div style="background: #111c26; border: 1px solid #1f3547; border-radius: 6px; padding: 8px 4px; text-align: center;">
            <img src="${esc(item.image)}" style="width: 36px; height: 36px; object-fit: contain;" referrerpolicy="no-referrer">
            <div style="font-size: 8px; color: #a3b8cc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top:4px;">${esc(item.name)}</div>
          </div>
        `).join("");
      }

      if (setupContainer && resData.setup) {
        const talents = Array.isArray(resData.setup.talents) ? resData.setup.talents.join(", ") : resData.setup.talents;
        setupContainer.innerHTML = `
          <div><strong>EMBLEM:</strong> ${esc(resData.setup.emblem)}</div>
          <div>|</div>
          <div><strong>TALENTS:</strong> ${esc(talents)}</div>
          <div>|</div>
          <div><strong>SPELL:</strong> ${esc(resData.setup.spell)}</div>
        `;
      }
    })
    .catch(() => {
      if (document.getElementById("full-build-items")) {
        document.getElementById("full-build-items").innerHTML = '<span style="grid-column:1/7; text-align:center; color:#ff4a4a;">โหลดข้อมูลล้มเหลว</span>';
      }
    });
}

document.querySelectorAll(".sort button").forEach((btn) => {
  btn.onclick = () => {
    state.sortBy = btn.dataset.sort;
    document.querySelectorAll(".sort button").forEach((x) => x.setAttribute("aria-pressed", x === btn));
    load();
  };
});

if (document.getElementById("order")) {
  document.getElementById("order").onclick = () => {
    state.order = state.order === "desc" ? "asc" : "desc";
    document.getElementById("order").textContent = state.order === "desc" ? "มาก → น้อย" : "น้อย → มาก";
    load();
  };
}

if (document.getElementById("q")) {
  document.getElementById("q").oninput = (e) => {
    state.q = e.target.value;
    render();
  };
}

load();