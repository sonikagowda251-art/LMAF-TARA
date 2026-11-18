// ---------------------------------------------------------------------------
// GOOGLE SHEETS CATALOG  (Option 1 — no-code product updates)
// ---------------------------------------------------------------------------
// The storefront can read its products straight from a published Google Sheet,
// so adding a item = typing a new row in the sheet. No code, no rebuild.
//
// ONE-TIME SETUP
//  1. Create a Google Sheet with this exact header row (row 1):
//     id,name,brand,season,gender,price,mrp,sizes,stock,image,tags,description,rating
//  2. Fill one product per row (see the README in the project root).
//  3. In the sheet: File → Share → Add people → "Anyone with the link" is NOT
//     enough. Use: File → Share → Publish to web → choose the sheet tab →
//     format "Comma separated values (.csv)" → Publish.
//  4. Copy the published CSV URL and paste it on the /admin page of this site
//     (or set VITE_SHEETS_URL in a .env file and redeploy once).
//
// NOTE: Google can take up to ~1 hour to publish changes the first time; after
// that, edits usually appear within a few minutes. Re-click "Publish" in Google
// if you change the header row, and use "New version" under "Automatically
// re-publish" to keep it in sync.
// ---------------------------------------------------------------------------

const STORAGE_KEY = "lmf:catalog-sheet-url";

// Canonical values the rest of the site expects
const SEASON_MAP = {
  winter: "Winter",
  summer: "Summer",
  rainy: "Rainy",
  monsoon: "Rainy",
  spring: "Spring",
};
const GENDER_MAP = {
  men: "Men",
  male: "Men",
  women: "Women",
  female: "Women",
  unisex: "Unisex",
};

// In-memory + module level cache so we only hit Google once per visit
let cache = null;

export function getSheetUrl() {
  try {
    return (
      localStorage.getItem(STORAGE_KEY) ||
      import.meta.env.VITE_SHEETS_URL ||
      ""
    );
  } catch {
    return import.meta.env.VITE_SHEETS_URL || "";
  }
}

export function setSheetUrl(url) {
  const clean = (url || "").trim();
  try {
    if (clean) localStorage.setItem(STORAGE_KEY, clean);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode — env var still works */
  }
  cache = null;
}

export function isSheetsConfigured() {
  return Boolean(getSheetUrl());
}

// Google Drive share links are not direct images — convert them so <img> works
export function toImageUrl(raw) {
  const value = (raw || "").trim();
  if (!value) return "";
  const drive = value.match(/drive\.google\.com\/(?:file\/d\/|.*[?&]id=)([\w-]{10,})/);
  if (drive) {
    return `https://drive.google.com/thumbnail?id=${drive[1]}&sz=w1000`;
  }
  return value;
}

// Minimal, quote-aware CSV parser (handles "a, b" fields and "" escapes)
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      pushField();
    } else if (char === "\n") {
      pushRow();
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) pushRow();

  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const num = (value, fallback = 0) => {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  if (text === "") return fallback;
  const parsed = Number(text.replace(/[₹,\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Turn one CSV record into the storefront product shape
function toProduct(record, index) {
  const name = (record.name || "").trim();
  if (!name) return null;

  const price = num(record.price, 0);
  if (price <= 0) return null;

  let mrp = num(record.mrp, 0);
  if (mrp <= price) mrp = Math.round(price * 1.4);

  const seasonKey = (record.season || record.department || "").trim().toLowerCase();
  const genderKey = (record.gender || record.category || "").trim().toLowerCase();

  const sizes = String(record.sizes || "")
    .split(/[/,|;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const tags = String(record.tags || "")
    .split(/[,|;]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const rating = num(record.rating, 4.2);

  return {
    _id: (record.id || "").trim() || `sheet-${index + 1}`,
    name,
    brand: (record.brand || "").trim() || "LMAF TARA",
    // Internal field is `department`, and it holds the SEASON
    department: SEASON_MAP[seasonKey] || "Spring",
    category: GENDER_MAP[genderKey] || "Unisex",
    price,
    mrp,
    rating,
    ratingCount: num(record.ratingCount ?? record.reviews, 25),
    reviews: num(record.reviews, 5),
    stock: num(record.stock, 20),
    sizes: sizes.length ? sizes : ["S", "M", "L", "XL"],
    image: toImageUrl(record.image),
    tags,
    description: (record.description || "").trim() || `${name} by LMAF TARA.`,
  };
}

export async function fetchSheetProducts(force = false) {
  const url = getSheetUrl();
  if (!url) return null; // not configured → caller falls back
  if (cache && !force) return cache;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sheet responded ${res.status}`);
    const rows = parseCsv(await res.text());
    if (rows.length < 2) throw new Error("Sheet has no product rows");

    const header = rows[0].map((h) => h.trim().replace(/^\uFEFF/, "").toLowerCase());
    if (!header.includes("name")) {
      throw new Error('Sheet header row must contain a "name" column');
    }

    const records = rows.slice(1).map((cells) => {
      const record = {};
      header.forEach((key, i) => {
        record[key] = (cells[i] ?? "").trim();
      });
      return record;
    });

    const items = records.map(toProduct).filter(Boolean);
    if (items.length === 0) throw new Error("No valid rows (each needs name + price)");

    cache = items;
    return items;
  } catch (error) {
    console.warn("Google Sheets catalog unavailable:", error.message);
    return null;
  }
}

// Used by /admin to test a pasted URL before saving it
export async function validateSheetUrl(url) {
  const previous = getSheetUrl();
  setSheetUrl(url);
  const items = await fetchSheetProducts(true);
  if (!items) {
    setSheetUrl(previous);
    return { ok: false, count: 0 };
  }
  return { ok: true, count: items.length };
}
