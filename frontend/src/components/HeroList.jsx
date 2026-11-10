import HeroRow from "./HeroRow.jsx";

const box = { color: "#8fa3b0", textAlign: "center", padding: 20 };

// แสดงครบ 4 สถานะ: loading / error / empty / success
export default function HeroList({ rows, sortBy, status, error, onRetry, onSelect }) {
  if (status === "loading") return <div style={box}>กำลังดึงข้อมูลเมต้าจาก API...</div>;

  if (status === "error") {
    return (
      <div style={{ ...box, color: "#ff4a4a" }}>
        {error}
        <div>
          <button className="order-btn" style={{ marginTop: 12 }} onClick={onRetry}>
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  if (!rows.length) return <div style={box}>ไม่พบฮีโร่</div>;

  const max = Math.max(...rows.map((h) => (typeof h[sortBy] === "number" ? h[sortBy] : 0)), 1);

  return (
    <ul className="hero-list">
      {rows.map((h, i) => (
        <HeroRow key={h.slug} hero={h} rank={i + 1} sortBy={sortBy} max={max} onClick={() => onSelect(h)} />
      ))}
    </ul>
  );
}
