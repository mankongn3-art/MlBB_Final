export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-box">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ค้นหาชื่อฮีโร่ที่ต้องการ..."
        autoComplete="off"
      />
    </div>
  );
}
