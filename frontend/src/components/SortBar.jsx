const OPTIONS = [
  ["winRate", "Win rate"],
  ["pickRate", "Pick rate"],
  ["banRate", "Ban rate"],
  ["tier", "Tier"],
];

export default function SortBar({ sortBy, order, onSort, onToggleOrder }) {
  return (
    <div className="filter-panel">
      <div className="sort">
        {OPTIONS.map(([key, label]) => (
          <button key={key} aria-pressed={sortBy === key} onClick={() => onSort(key)}>
            {label}
          </button>
        ))}
      </div>
      <button className="order-btn" onClick={onToggleOrder}>
        {order === "desc" ? "มาก → น้อย" : "น้อย → มาก"}
      </button>
    </div>
  );
}
