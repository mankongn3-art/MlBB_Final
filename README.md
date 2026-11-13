# Hero Meta (MLBBDex Live Tier List)

801201 การออกแบบอัลกอริทึมและการพัฒนาเว็บ — ใบงานต่อยอด API ด้วย React-Vite + Express

เว็บจัดอันดับฮีโร่ Mobile Legends ตาม Win / Pick / Ban rate และ Tier พร้อมดูชุดไอเทมของแต่ละฮีโร่
API ที่ใช้: MLBB-API (`hero-meta-final.json`, `item-meta-final.json`) ผ่าน Express

## วิธีรัน

```bash
# Terminal 1: backend (port 3000)
cd backend
npm install
npm start

# Terminal 2: frontend (port 5173, proxy /api -> 3000)
cd frontend
npm install
npm run dev
```

เปิด http://localhost:5173

## โครงสร้างโปรเจกต์

```
backend/    Express: cache, validate, รวมข้อมูล, Merge Sort
  server.js
  utils/mergeSort.js
  stats.json, items.json
frontend/   React + Vite
  src/App.jsx
  src/hooks/useHeroes.js
  src/components/ (SearchBar, SortBar, HeroList, HeroRow, HeroModal, tier.js)
```

## 7.1 ตารางส่วนร่วม

| ชื่อ-สกุล | รหัสนักศึกษา | ชิ้นงานที่รับผิดชอบ (ไฟล์ / component / route / DSA) | ช่วงที่นำเสนอในคลิป |
|---|---|---|---|
| ณัฏฐกิตติ์ มั่นคง | 681310400 | ทั้งโปรเจกต์ ได้แก่ `backend/server.js` (route `/api/heroes`, `/api/heroes/:slug`), `backend/utils/mergeSort.js`, `frontend/src/App.jsx`, `hooks/useHeroes.js`, `components/*` | ทั้งคลิป (ช่วง 1–6) |


## 7.2 ตารางข้อแนะนำจากงานแรก → สิ่งที่แก้
| ข้อแนะนำจากงานแรก | สิ่งที่แก้ในงานนี้ | หลักฐาน |
|---|---|---|
| แนะนำให้ลองเพิ่มไอเท็มในเกม | แก้ให้รูปไอเท็มโหลดขึ้น | <img width="400" alt="image" src="https://github.com/user-attachments/assets/4eb40485-b190-4735-ae7f-473ac75c089d" /> |
| ปรับขนาดรูปให้เห็นหน้าตัวละคร | ปรับ UX ขยายรูปฮีโร่ให้เห็นหน้าตัวละครชัดขึ้น | <img width="400" alt="image" src="https://github.com/user-attachments/assets/2c1335f9-5f19-488f-a64d-f39f94289f1b" /> |
| ปรับให้รูปโหลดไวขึ้น | เพิ่มรูป Emblem / Spell ที่ยังไม่มีรูป | <img width="400" alt="สกรีนช็อต 2026-11-13 082738" src="https://github.com/user-attachments/assets/60c800e8-4db4-4afc-b914-8ee0e76754b8" /> |

## Component Tree

```
App  (state: sortBy, order, q, selected; ใช้ useHeroes)
├─ SearchBar        (props: value, onChange)
├─ SortBar          (props: sortBy, order, onSort, onToggleOrder)
├─ HeroList         (props: rows, sortBy, status, error, onRetry, onSelect)
│   └─ HeroRow × n  (props: hero, rank, sortBy, max, onClick)
└─ HeroModal        (props: hero, onClose; ดึง /api/heroes/:slug เอง)
```

เหตุผล: state ที่หลาย component ต้องใช้ร่วมกัน (sortBy, order, q, selected) อยู่ที่ `App`
ส่วนข้อมูลที่ใช้เฉพาะ popup (ชุดไอเทม) อยู่ใน `HeroModal`

## หน้าที่ของ Express (ไม่ใช่แค่ทางผ่าน)

- **Cache** ข้อมูลจาก API ต้นทาง 30 นาที ลดการเรียกซ้ำ
- **Validate** `sortBy` ∈ {winRate, pickRate, banRate, tier}, `order` ∈ {asc, desc} ไม่ผ่านตอบ 400
- **ประมวลผล/รวมข้อมูล**: ผสมข้อมูล API กับ `stats.json` และ `items.json`, จัด Tier, แก้ URL รูปภาพ, ใช้ชุดไอเทมเริ่มต้นตาม role เมื่อ API ไม่มี build
- **จัดการ error**: API ต้นทางล่มตอบ 502 พร้อมข้อความ ระบบไม่ล่ม
- **จัดเรียง** ด้วย Merge Sort (ดูหัวข้อถัดไป)

## DSA: Merge Sort (ฝั่ง Express)

- ก่อน–หลัง: วัดเวลาเรียง Merge Sort (`mergeSort.js`) เทียบกับ Bubble Sort ด้วย `backend/utils/benchmark.mjs` (ค่ากลางของหลายรอบ)

| จำนวนข้อมูล (n) | Merge Sort (ms) | Bubble Sort (ms) | Bubble ช้ากว่า (เท่า) |
|---|---|---|---|
| 130 | 0.112 | 0.058 | 0.5x |
| 1000 | 0.341 | 1.367 | 4.0x |
| 5000 | 2.034 | 34.088 | 16.8x |
| 10000 | 3.667 | 141.683 | 38.6x |

สรุป: ที่ n = 130 (ใกล้จำนวนฮีโร่จริง) สองแบบต่างกันเพียงเสี้ยวมิลลิวินาที แต่เมื่อข้อมูลโตขึ้น Bubble Sort ช้าลงเร็วมากตาม O(n²) ขณะที่ Merge Sort โตตาม O(n log n) จึงเลือก Merge Sort เพราะรองรับข้อมูลที่เพิ่มขึ้นและ stable
- ไฟล์: `backend/utils/mergeSort.js` ใช้ใน `GET /api/heroes` (`server.js`)
- ทำไมทำฝั่ง Express: จัดเรียงครั้งเดียวก่อนส่ง React ได้ลำดับที่ตรงกันทุกเครื่อง และ React ไม่ต้องคำนวณซ้ำ
- ความซับซ้อน: เวลา O(n log n) ทุกกรณี, พื้นที่เพิ่ม O(n)
- Stable: ฮีโร่ที่ค่าเท่ากันรักษาลำดับเดิม (ใช้ `<=` ตอน merge) ผลลัพธ์จึงไม่สลับตำแหน่งเวลา sort ซ้ำ
- เหตุผลที่ไม่เลือกทางอื่น: Bubble/Insertion Sort เป็น O(n²) ช้าลงเมื่อฮีโร่เพิ่ม, Quick Sort แย่สุด O(n²) และไม่ stable
- ก่อน–หลัง: (ใส่ผลวัดเวลาจริงของคุณเอง เช่น `console.time` เทียบกับ Bubble Sort)
