import { useEffect, useState } from "react";

// ดึงรายชื่อฮีโร่จาก Express รีเฟรชทุกครั้งที่ sortBy/order เปลี่ยน
// status: loading | success | error
export default function useHeroes(sortBy, order) {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    fetch(`/api/heroes?sortBy=${sortBy}&order=${order}`, { signal: controller.signal })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error(json.error || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
        setData(json.data);
        setStatus("success");
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(e.message);
        setStatus("error");
      });
    return () => controller.abort();
  }, [sortBy, order, reloadKey]);

  return { data, status, error, retry: () => setReloadKey((k) => k + 1) };
}
