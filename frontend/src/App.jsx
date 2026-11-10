import { useState } from "react";
import useHeroes from "./hooks/useHeroes.js";
import SearchBar from "./components/SearchBar.jsx";
import SortBar from "./components/SortBar.jsx";
import HeroList from "./components/HeroList.jsx";
import HeroModal from "./components/HeroModal.jsx";

const LABEL = { winRate: "WIN RATE", pickRate: "PICK RATE", banRate: "BAN RATE", tier: "TIER" };

// state หลักอยู่ที่ App: sortBy, order, q (คำค้น), selected (ฮีโร่ที่เปิดดู)
export default function App() {
  const [sortBy, setSortBy] = useState("winRate");
  const [order, setOrder] = useState("desc");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const { data, status, error, retry } = useHeroes(sortBy, order);

  const keyword = q.trim().toLowerCase();
  const rows = keyword ? data.filter((h) => (h.name || "").toLowerCase().includes(keyword)) : data;

  return (
    <div className="container">
      <div className="header">
        <h1>Hero Meta</h1>
        <p>จัดอันดับฮีโร่ Mobile Legends ตามความยอดนิยม</p>
      </div>
      <SearchBar value={q} onChange={setQ} />
      <SortBar
        sortBy={sortBy}
        order={order}
        onSort={setSortBy}
        onToggleOrder={() => setOrder((o) => (o === "desc" ? "asc" : "desc"))}
      />
      {status === "success" && (
        <div className="summary-text">{rows.length} Heroes จัดลำดับตาม {LABEL[sortBy]}</div>
      )}
      <HeroList rows={rows} sortBy={sortBy} status={status} error={error} onRetry={retry} onSelect={setSelected} />
      {selected && <HeroModal hero={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
