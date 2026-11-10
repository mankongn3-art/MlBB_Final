const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { mergeSort } = require("./utils/mergeSort");

app.use(cors());
const PORT = process.env.PORT || 3000;

const VALID_SORT = ["winRate", "pickRate", "banRate", "tier"];
const VALID_ORDER = ["asc", "desc"];

const HERO_API_URL = "https://raw.githubusercontent.com/p3hndrx/MLBB-API/main/v1/hero-meta-final.json";
const ITEM_API_URL = "https://raw.githubusercontent.com/p3hndrx/MLBB-API/main/v1/item-meta-final.json";

let cache = { heroes: null, itemsMapByName: null, itemsMapById: null, fetchedAt: 0 };
const CACHE_TTL = 30 * 60 * 1000;


function getLocalStatsMap() {
  try {
    const filePath = path.join(__dirname, "stats.json");
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(rawData);
    }
  } catch (err) {
    console.log("⚠️ ไม่พบไฟล์ local stats.json");
  }
  return {};
}

const MOONTON_ITEM_IDS = {
  "warrior boots": "11010", "tough boots": "11020", "magic shoes": "11030", "arcane boots": "11040", 
  "swift boots": "11050", "demon boots": "11060", "rapid boots": "11070", "sea halberd": "12010", 
  "rose gold meteor": "12020", "bloodlust axe": "12030", "blade of despair": "12040", "malefic roar": "12050", 
  "demon hunter sword": "12060", "endless battle": "12070", "haas' claws": "12080", "hunter strike": "12090", 
  "golden staff": "12100", "corrosion scythe": "12110", "windtalker": "12120", "great dragon spear": "12130", 
  "war axe": "12140", "wind of nature": "12150", "sky piercer": "12160", "lightning truncheon": "32010", 
  "holy crystal": "32020", "divine glaive": "32030", "clock of destiny": "32040", "blood wings": "32050", 
  "genius wand": "32060", "wishing lantern": "32070", "concentrated energy": "32080", "ice queen wand": "32090", 
  "glowing wand": "32100", "enchanted talisman": "32110", "feather of heaven": "32120", "fleeting time": "32130", 
  "starlium scythe": "32140", "winter crown": "32150", "radiant armor": "22010", "immortality": "22020", 
  "dominance ice": "22030", "athena's shield": "22040", "oracle": "22050", "blade armor": "22060", 
  "antique cuirass": "22070", "guardian helmet": "22080", "cursed helmet": "22090", "thunder belt": "22100", 
  "queen's wings": "22110", "brute force breastplate": "22120", "twilight armor": "22130", "flask of the oasis": "22140"
};

const DEFAULT_BUILDS = {
  "Mage": ["Demon Boots", "Clock of Destiny", "Lightning Truncheon", "Holy Crystal", "Divine Glaive", "Blood Wings"],
  "Marksman": ["Swift Boots", "Corrosion Scythe", "Demon Hunter Sword", "Golden Staff", "Malefic Roar", "Immortality"],
  "Tank": ["Tough Boots", "Dominance Ice", "Athena's Shield", "Antique Cuirass", "Radiant Armor", "Immortality"],
  "Support": ["Demon Boots", "Flask of the Oasis", "Dominance Ice", "Oracle", "Fleeting Time", "Immortality"],
  "Assassin": ["Magic Shoes", "Hunter Strike", "Blade of Despair", "Malefic Roar", "Rose Gold Meteor", "Immortality"],
  "Fighter": ["Warrior Boots", "War Axe", "Dominance Ice", "Hunter Strike", "Blade of Despair", "Immortality"]
};

function getLocalItemsMap() {
  const localMapByName = new Map();
  const localMapById = new Map();
  try {
    const filePath = path.join(__dirname, "items.json");
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, "utf-8");
      const itemsList = JSON.parse(rawData);
      itemsList.forEach(item => {
        if (item.id) localMapById.set(String(item.id).trim(), item);
        if (item.name) localMapByName.set(item.name.toString().trim().toLowerCase(), item);
      });
    }
  } catch (err) {
    console.log("⚠️ ไม่พบไฟล์ local items.json");
  }
  return { localMapByName, localMapById };
}

async function fetchMLBBData() {
  const isStale = Date.now() - cache.fetchedAt > CACHE_TTL;
  if (!cache.heroes || !cache.itemsMapByName || !cache.itemsMapById || isStale) {
    try {
      const [heroRes, itemRes] = await Promise.all([
        fetch(HERO_API_URL),
        fetch(ITEM_API_URL)
      ]);

      const heroesJson = await heroRes.json();
      const itemsJson = await itemRes.json();

      const heroesList = heroesJson.data || heroesJson || [];
      const itemsRaw = itemsJson.data || itemsJson || [];

      const { localMapByName, localMapById } = getLocalItemsMap();

      const itemsMapByName = new Map(localMapByName);
      const itemsMapById = new Map(localMapById);

      itemsRaw.forEach(item => {
        const itemId = item.id || item.item_id;
        if (itemId && !itemsMapById.has(String(itemId).trim())) {
          itemsMapById.set(String(itemId).trim(), item);
        }

        const nameKey = item.item_name || item.name;
        if (nameKey && !itemsMapByName.has(nameKey.toString().trim().toLowerCase())) {
          itemsMapByName.set(nameKey.toString().trim().toLowerCase(), item);
        }
      });

      cache = {
        heroes: heroesList,
        itemsMapByName: itemsMapByName,
        itemsMapById: itemsMapById,
        fetchedAt: Date.now()
      };
      console.log(`✅ ซิงค์คลังสำเร็จ: ดึงฮีโร่ได้ ${heroesList.length} ตัว / คลังไอเทม ${itemsMapByName.size} ชิ้น`);
    } catch (err) {
      console.error("❌ ดึงข้อมูลล้มเหลว:", err.message);
      if (!cache.heroes) cache.heroes = [];
      if (!cache.itemsMapByName) cache.itemsMapByName = new Map();
      if (!cache.itemsMapById) cache.itemsMapById = new Map();
    }
  }
  return cache;
}

const MLBB_IO_TIERS = {
  "sun": "SS", "obsidia": "SS", "masha": "S", "marcel": "S", "gloo": "S", "aulus": "S", "carmilla": "S",
  "valir": "A", "hanabi": "A", "minotaur": "A", "rafaela": "A", "lukas": "A", "saber": "A", "atlas": "A", "zetian": "A", "belerick": "A", "eudora": "A", "gord": "A", "ling": "A", "floryn": "A", "minsitthar": "A", "kadita": "A", "badang": "A", "kagura": "A", "guinevere": "A", "argus": "A", "cyclops": "A", "silvanna": "A", "nolan": "A", "paquito": "A", "miya": "A", "suyou": "A", "dyrroth": "A", "alice": "A", "popol-and-kupa": "A", "cecilion": "A", "novaria": "A", "zhask": "A", "bruno": "A", "khufra": "A", "hirara": "A", "benedetta": "A", "barats": "A",
  "leomord": "C", "aurora": "C", "alucard": "C", "hayabusa": "C", "uranus": "C", "freya": "C", "tigreal": "C", "kimmy": "C", "kaja": "C", "claude": "C", "harley": "C", "lesley": "C", "hylos": "C", "ruby": "C", "change": "C", "nana": "C", "zhuxin": "C", "lunox": "C", "karrie": "C", "faramis": "C",
  "grock": "D", "lapu-lapu": "D", "chou": "D", "martis": "D", "roger": "D", "joy": "D", "helcurt": "D", "balmond": "D", "melissa": "D", "arlott": "D", "granger": "D", "jawhead": "D", "franco": "D", "gatotkaca": "D", "luo-yi": "D", "phoveus": "D", "pharsa": "D", "zilong": "D", "fanny": "D", "baxia": "D", "lancelot": "D", "harith": "D", "wanwan": "D", "mathilda": "D", "chip": "D", "valentina": "D"
};

const TIER_RANK = { "SS": 6, "S": 5, "A": 4, "B": 3, "C": 2, "D": 1 };

app.get("/api/heroes", async (req, res) => {
  try {
    const { sortBy = "winRate", order = "desc" } = req.query;
    if (!VALID_SORT.includes(sortBy) || !VALID_ORDER.includes(order)) {
      return res.status(400).json({ success: false, error: "พารามิเตอร์ sortBy หรือ order ไม่ถูกต้อง" });
    }
    const { heroes } = await fetchMLBBData();
    if (!heroes.length) {
      return res.status(502).json({ success: false, error: "ดึงข้อมูลจาก API ต้นทางไม่ได้" });
    }
    const statsMap = getLocalStatsMap(); // 🟢 ดึงข้อมูลสถิติจาก stats.json

    const formatted = heroes
      .filter(h => h.hero_name && h.hero_name !== "None")
      .map(h => {
        const heroName = h.hero_name || h.name || "Hero";
        const slug = h.uid || h.slug || heroName.toLowerCase().trim().replace(/\s+/g, "-").replace(/['.]/g, "");
        
        const customStat = statsMap[slug] || {};

        const parseStat = (val, fallback = 0) => {
          if (typeof val === "number") return val;
          if (typeof val === "string") return parseFloat(val.replace("%", "").trim()) || fallback;
          return fallback;
        };

        const finalTier = customStat.tier || MLBB_IO_TIERS[slug] || h.tier || "B";

        let imgUrl = h.portrait || h.hero_avatar || h.head_img;
        if (!imgUrl || (imgUrl.includes("mobilelegends.com") && !imgUrl.endsWith(".png"))) {
          imgUrl = `https://akm-img-a-cloud.mobilelegends.com/images/hero/head/${h.id || slug}.png`;
        }

        return {
          slug: slug,
          name: heroName,
          role: h.class || h.role || "Fighter",
          lane: (Array.isArray(h.laning) ? h.laning[0] : h.lane) || "EXP Lane",
          tier: finalTier,
          winRate: customStat.winRate ?? parseStat(h.win_rate || h.winRate, 50.0),
          pickRate: customStat.pickRate ?? parseStat(h.pick_rate || h.pickRate, 1.0),
          banRate: customStat.banRate ?? parseStat(h.ban_rate || h.banRate, 0.5),
          image: imgUrl
        };
      });

    const compareFn = (a, b) => {
      let valA = a[sortBy] ?? 0;
      let valB = b[sortBy] ?? 0;

      if (sortBy === "tier") {
        valA = TIER_RANK[a.tier] || 0;
        valB = TIER_RANK[b.tier] || 0;
      }

      return order === "asc" ? valA - valB : valB - valA;
    };

    // DSA: Merge Sort เขียนเอง O(n log n) ทำงานฝั่ง Express ก่อนส่งให้ React
    const sorted = mergeSort(formatted, compareFn);
    res.json({ success: true, total: sorted.length, data: sorted });
  } catch (err) {
    res.status(502).json({ success: false, error: "จัดเรียงข้อมูลหลังบ้านล้มเหลว" });
  }
});

app.get("/api/heroes/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { heroes, itemsMapByName, itemsMapById } = await fetchMLBBData();

    const targetSlug = slug.toLowerCase().trim().replace(/\s+/g, "-").replace(/['.]/g, "");

    const hero = heroes.find(h => {
      const heroName = h.hero_name || h.name || "";
      const hSlug = (h.uid || h.slug || heroName).toLowerCase().trim().replace(/\s+/g, "-").replace(/['.]/g, "");
      return hSlug === targetSlug || (h.id && String(h.id) === slug);
    });

    if (!hero) {
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูลฮีโร่ตัวนี้ในระบบ" });
    }

    let rawBuild = [];
    if (Array.isArray(hero.build) && hero.build.length > 0) rawBuild = hero.build;
    else if (Array.isArray(hero.recommended_build) && hero.recommended_build.length > 0) rawBuild = hero.recommended_build;
    else if (Array.isArray(hero.items) && hero.items.length > 0) rawBuild = hero.items;
    else if (Array.isArray(hero.equipment) && hero.equipment.length > 0) rawBuild = hero.equipment;
    else if (Array.isArray(hero.gear) && hero.gear.length > 0) rawBuild = hero.gear;

    if (!rawBuild || rawBuild.length === 0) {
      const heroRole = hero.class || hero.role || "Fighter";
      rawBuild = DEFAULT_BUILDS[heroRole] || DEFAULT_BUILDS["Fighter"];
    }

    const formattedItems = rawBuild.slice(0, 6).map(it => {
      let matched = null;
      let itemName = "";

      if (typeof it === "object" && it !== null) {
        itemName = it.item_name || it.name || it.item_slug || "";
        const itemId = it.id || it.item_id;
        matched = (itemId && itemsMapById.get(String(itemId).trim())) || itemsMapByName.get(itemName.trim().toLowerCase());
      } else {
        const valStr = String(it).trim();
        matched = itemsMapById.get(valStr) || itemsMapByName.get(valStr.toLowerCase());
        itemName = matched?.item_name || matched?.name || valStr;
      }

      const lowerName = itemName.trim().toLowerCase();
      const moontonId = MOONTON_ITEM_IDS[lowerName];
      let itemIcon = "";

      if (moontonId) {
        itemIcon = `https://akm-img-a-cloud.mobilelegends.com/images/equipment/head/${moontonId}.png`;
      } else if (matched?.image) {
        itemIcon = matched.image;
      } else if (matched?.icon) {
        itemIcon = matched.icon.startsWith("http")
          ? matched.icon
          : `https://raw.githubusercontent.com/p3hndrx/MLBB-API/main/${matched.icon.replace(/^\//, "")}`;
      } else {
        itemIcon = `https://akm-img-a-cloud.mobilelegends.com/images/equipment/head/12040.png`;
      }

      return {
        name: matched?.item_name || matched?.name || itemName || "Item",
        image: itemIcon
      };
    });

    res.json({
      success: true,
      data: {
        items: formattedItems,
        setup: {
          emblem: hero.emblem || (hero.class ? `Custom ${hero.class} Emblem` : "Custom Emblem"),
          spell: hero.spell || hero.spell_name || "Flicker",
          talents: hero.talents || ["Thrill", "Master Assassin", "Lethal Ignition"]
        }
      }
    });
  } catch (err) {
    console.error("❌ Hero detail error:", err);
    res.status(500).json({ success: false, error: "ดึงข้อมูลเซ็ตไอเทมรายบุคคลล้มเหลว" });
  }
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀 Live API Server running at http://localhost:${PORT}`));
}

module.exports = app;