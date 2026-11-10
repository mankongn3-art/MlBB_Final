# Hero Meta (MLBBDex Live Tier List)

801201 การออกแบบอัลกอริทึมและการพัฒนาเว็บ — ใบงานต่อยอด API ด้วย React-Vite + Express

เว็บจัดอันดับฮีโร่ Mobile Legends ตาม Win / Pick / Ban rate และ Tier พร้อมดูชุดไอเทมของแต่ละฮีโร่
API ที่ใช้: MLBB-API (`hero-meta-final.json`, `item-meta-final.json`) ผ่าน Express

## วิธีรัน
npm install
npm run dev
node backend/server.js

เปิด http://localhost:5173

## โครงสร้างโปรเจกต์

```
backend
  server.js
  stats.json
frontend
  data
    items.json
  App.js
  index.htlm
  style.css
  

## 7.1 ตารางส่วนร่วม

| ณัฏฐกิตติ์ มั่นคง | 681310400 | รับผิดชอบทุกชิ้น

## 7.2 ตารางข้อแนะนำจากงานแรก → สิ่งที่แก้

แนะนำให้ลองทำระบบแนะนำitem | สิ่งที่ต้องแก้คือรูปโหลดช้า |


> เติมข้อแนะนำจริงจากงานแรก และแนบภาพ Before/After ทั้งสองเวอร์ชัน
แนะนำให้ปรับปรุงเรื่องรูปฮีโร่ที่โหลดช้า -> รูปฮีโร่โหลดได้ไว้และไม่มีการติดขัด แต่รูปไอเทมไม่สามารถโหลดได้

## Component Tree

```
App  (เก็บ state: sortBy, order, q, selected)
├─ SearchBar        ช่องค้นหา
├─ SortBar          ปุ่มเรียง Win/Pick/Ban/Tier และปุ่มสลับ มาก-น้อย
├─ HeroList         แสดงรายการ (หรือสถานะ loading / error / empty)
│   └─ HeroRow × n  ฮีโร่แต่ละแถว
└─ HeroModal        popup รายละเอียดฮีโร่และชุดไอเทม
```

เหตุผล: state ที่หลาย component ต้องใช้ร่วมกัน (sortBy, order, q, selected) อยู่ที่ `App`
ส่วนข้อมูลที่ใช้เฉพาะ popup (ชุดไอเทม) อยู่ใน `HeroModal`

##หน้าที่ของ Express

Cache ข้อมูลจาก API ต้นทาง 30 นาที ลดการเรียกซ้ำ
Validate sortBy ∈ {winRate, pickRate, banRate, tier}, order ∈ {asc, desc} ไม่ผ่านตอบ 400
ประมวลผล/รวมข้อมูล: ผสมข้อมูล API กับ stats.json และ items.json, จัด Tier, แก้ URL รูปภาพ, ใช้ชุดไอเทมเริ่มต้นตาม role เมื่อ API ไม่มี build
จัดการ error: API ต้นทางล่มตอบ 502 พร้อมข้อความ ระบบไม่ล่ม
จัดเรียง ด้วย Merge Sort (ดูหัวข้อถัดไป)

##DSA: Merge Sort

ไฟล์: backend/utils/mergeSort.js ใช้ใน GET /api/heroes (server.js)
ทำไมทำฝั่ง Express: จัดเรียงครั้งเดียวก่อนส่ง React ได้ลำดับที่ตรงกันทุกเครื่อง และ React ไม่ต้องคำนวณซ้ำ
ความซับซ้อน: เวลา O(n log n) ทุกกรณี, พื้นที่เพิ่ม O(n)
Stable: ฮีโร่ที่ค่าเท่ากันรักษาลำดับเดิม (ใช้ <= ตอน merge) ผลลัพธ์จึงไม่สลับตำแหน่งเวลา sort ซ้ำ
เหตุผลที่ไม่เลือกทางอื่น: Bubble/Insertion Sort เป็น O(n²) ช้าลงเมื่อฮีโร่เพิ่ม, Quick Sort แย่สุด O(n²) และไม่ stable
ก่อน–หลัง: (ใส่ผลวัดเวลาจริงของคุณเอง เช่น console.time เทียบกับ Bubble Sort)
