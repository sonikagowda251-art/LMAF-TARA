
// Product catalog service — CLOTHING ONLY (garments you wear), 4 seasons.
// NO shoes, bags, watches, sunglasses, caps, scarves or any non-apparel.
// Tries the LMAF TARA backend first (fields mirror Backend/Models/Product.js),
// then falls back to this demo catalog so the storefront always works.
//
// NOTE: the internal field is still called `department`, but it holds a SEASON
// value (Winter / Summer / Rainy / Spring). Gender stays in `category`.

import { fetchSheetProducts, isSheetsConfigured } from "./sheets";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const img = (id, w = 400) =>
  `https://images.unsplash.com/${id}?w=${w}&q=70&auto=format&fit=crop`;

export const SEASONS = [
  { name: "Winter", icon: "❄️" },
  { name: "Summer", icon: "☀️" },
  { name: "Rainy", icon: "🌧️" },
  { name: "Spring", icon: "🌸" },
];

// Backwards-compatible alias (some pages import DEPARTMENTS)
export const DEPARTMENTS = SEASONS;

// Clothing only -> gender categories (no Accessories)
export const GENDERS = ["Men", "Women", "Unisex"];

// Verified, clothing-only Unsplash image pool (reused across items)
const IMG = {
  jacket: "photo-1551028719-00167b16eac5",
  womenOutfit: "photo-1483985988355-763728e1935b",
  hoodie: "photo-1529139574466-a303027c1d8b",
  premium: "photo-1539533018447-63fcce2678e3",
  mensRack: "photo-1516257984-b1b4d707412e",
  spring: "photo-1490481651871-ab68de25d43d",
  summer: "photo-1503342217505-b0a15ec3261c",
  rainy: "photo-1515886657613-9f3515b0c78f",
  winterKnit: "photo-1544923246-77307dd654cb",
  tshirt: "photo-1521572163474-6864f9cf17c9",
  jeans: "photo-1542272604-787c3835535d",
  shirt: "photo-1602810318383-e386cc2a3e5f",
};

// Clothing-only demo catalog. `department` = season, `category` = gender.
export const demoProducts = [
  // ---------------- WINTER ❄️ ----------------
  { _id: "wi1", name: "Men's Wool-Blend Winter Jacket", brand: "LMAF Studio", department: "Winter", category: "Men", price: 3499, mrp: 5999, rating: 4.6, ratingCount: 8120, reviews: 1120, stock: 30, sizes: ["S", "M", "L", "XL"], image: img(IMG.jacket), tags: ["Bestseller"], description: "Insulated wool-blend jacket with fleece lining to keep you warm on the coldest days." },
  { _id: "wi2", name: "Women's Oversized Knit Sweater", brand: "Muses", department: "Winter", category: "Women", price: 1599, mrp: 2799, rating: 4.7, ratingCount: 6300, reviews: 910, stock: 42, sizes: ["XS", "S", "M", "L"], image: img(IMG.winterKnit), tags: ["New Arrivals"], description: "Cozy chunky-knit sweater in a relaxed oversized fit." },
  { _id: "wi3", name: "Quilted Puffer Jacket (Unisex)", brand: "Kaze", department: "Winter", category: "Unisex", price: 2899, mrp: 4999, rating: 4.5, ratingCount: 4700, reviews: 640, stock: 25, sizes: ["S", "M", "L", "XL"], image: img(IMG.premium), tags: ["Deal of the Day"], description: "Lightweight quilted puffer with a water-repellent shell." },
  { _id: "wi4", name: "Fleece-Lined Thermal Hoodie", brand: "Kaze", department: "Winter", category: "Unisex", price: 1299, mrp: 2499, rating: 4.5, ratingCount: 11200, reviews: 1900, stock: 60, sizes: ["S", "M", "L", "XL"], image: img(IMG.hoodie), tags: ["New Arrivals"], description: "Heavyweight fleece hoodie with a brushed inner for extra warmth." },
  { _id: "wi5", name: "Women's Wool Long Coat", brand: "LMAF Studio", department: "Winter", category: "Women", price: 4299, mrp: 6999, rating: 4.8, ratingCount: 3120, reviews: 610, stock: 18, sizes: ["S", "M", "L"], image: img(IMG.womenOutfit), tags: ["Bestseller"], description: "Tailored double-breasted long coat in a premium wool blend." },
  { _id: "wi6", name: "Men's Cable-Knit Pullover", brand: "UrbanEdge", department: "Winter", category: "Men", price: 1499, mrp: 2699, rating: 4.4, ratingCount: 3900, reviews: 520, stock: 55, sizes: ["S", "M", "L", "XL"], image: img(IMG.mensRack), tags: [], description: "Classic crew-neck cable-knit sweater in soft acrylic wool." },

  // ---------------- SUMMER ☀️ ----------------
  { _id: "su1", name: "Men's Cotton Crew T-Shirt (Pack of 3)", brand: "UrbanEdge", department: "Summer", category: "Men", price: 799, mrp: 1499, rating: 4.3, ratingCount: 19800, reviews: 3400, stock: 200, sizes: ["S", "M", "L", "XL", "XXL"], image: img(IMG.tshirt), tags: ["Deal of the Day"], description: "Breathable pure combed-cotton crew-necks in black, white and grey." },
  { _id: "su2", name: "Women's Floral Summer Dress", brand: "Muses", department: "Summer", category: "Women", price: 1199, mrp: 2399, rating: 4.5, ratingCount: 5600, reviews: 890, stock: 52, sizes: ["XS", "S", "M", "L", "XL"], image: img(IMG.summer), tags: ["Bestseller"], description: "Airy rayon A-line dress with an all-over floral print." },
  { _id: "su3", name: "Men's Linen Full-Sleeve Shirt", brand: "LMAF Studio", department: "Summer", category: "Men", price: 1099, mrp: 1899, rating: 4.4, ratingCount: 4100, reviews: 620, stock: 65, sizes: ["S", "M", "L", "XL"], image: img(IMG.shirt), tags: ["New Arrivals"], description: "Lightweight, breathable linen shirt built for hot days." },
  { _id: "su4", name: "Women's Cropped Tank Top", brand: "Muses", department: "Summer", category: "Women", price: 499, mrp: 999, rating: 4.2, ratingCount: 7300, reviews: 1100, stock: 120, sizes: ["XS", "S", "M", "L"], image: img(IMG.womenOutfit), tags: [], description: "Soft ribbed crop tank in multiple summer shades." },
  { _id: "su5", name: "Men's Casual Cotton Shorts", brand: "UrbanEdge", department: "Summer", category: "Men", price: 699, mrp: 1299, rating: 4.3, ratingCount: 5200, reviews: 780, stock: 95, sizes: ["S", "M", "L", "XL"], image: img(IMG.mensRack), tags: [], description: "Relaxed-fit stretchable shorts with a drawstring waist." },
  { _id: "su6", name: "Women's Cotton Sundress", brand: "Muses", department: "Summer", category: "Women", price: 1299, mrp: 2299, rating: 4.6, ratingCount: 4300, reviews: 700, stock: 48, sizes: ["XS", "S", "M", "L"], image: img(IMG.spring), tags: ["New Arrivals"], description: "Flowy knee-length sundress in breathable cotton." },

  // ---- Summer '26 drop — women's outfit edit (inspired by trend research) ----
  { _id: "su7", name: "Women's Printed Crop Top & Maxi Skirt Co-ord Set", brand: "Muses", department: "Summer", category: "Women", price: 1799, mrp: 3199, rating: 4.4, ratingCount: 120, reviews: 18, stock: 35, sizes: ["XS", "S", "M", "L"], image: img(IMG.womenOutfit), tags: ["New Arrivals"], description: "Breathable cotton co-ord: a soft printed crop top paired with a flowing ankle-length maxi skirt." },
  { _id: "su8", name: "Women's Modal Jumpsuit Dress", brand: "LMAF Studio", department: "Summer", category: "Women", price: 1599, mrp: 2799, rating: 4.5, ratingCount: 96, reviews: 14, stock: 28, sizes: ["XS", "S", "M", "L", "XL"], image: img(IMG.summer), tags: ["New Arrivals"], description: "Effortless one-and-done jumpsuit in buttery modal with a tie waist and summer-friendly prints." },
  { _id: "su9", name: "Women's Cotton Short Kurta with Pants", brand: "Muses", department: "Summer", category: "Women", price: 1449, mrp: 2499, rating: 4.3, ratingCount: 74, reviews: 11, stock: 40, sizes: ["S", "M", "L", "XL"], image: img(IMG.premium), tags: ["New Arrivals"], description: "Airy block-printed short kurta set with matching straight pants — casual ethnic for warm days." },
  { _id: "su10", name: "Women's Floral Maxi Dress", brand: "LMAF Studio", department: "Summer", category: "Women", price: 1899, mrp: 3299, rating: 4.6, ratingCount: 132, reviews: 21, stock: 30, sizes: ["XS", "S", "M", "L"], image: img(IMG.rainy), tags: ["New Arrivals", "Bestseller"], description: "Floor-grazing floral maxi in featherweight rayon with a side slit and adjustable straps." },
  { _id: "su11", name: "Women's Cotton Shirt & Shorts Set", brand: "UrbanEdge", department: "Summer", category: "Women", price: 1299, mrp: 2199, rating: 4.2, ratingCount: 65, reviews: 9, stock: 50, sizes: ["S", "M", "L", "XL"], image: img(IMG.spring), tags: ["New Arrivals"], description: "Crisp checks shirt with relaxed elasticated shorts — the ultimate weekend summer combo." },

  // ---------------- RAINY 🌧️ ----------------
  { _id: "ra1", name: "Men's Waterproof Rain Jacket", brand: "Kaze", department: "Rainy", category: "Men", price: 1799, mrp: 2999, rating: 4.5, ratingCount: 3900, reviews: 610, stock: 40, sizes: ["S", "M", "L", "XL"], image: img(IMG.jacket), tags: ["New Arrivals"], description: "Sealed-seam waterproof shell with a packable hood." },
  { _id: "ra2", name: "Women's Classic Trench Coat", brand: "LMAF Studio", department: "Rainy", category: "Women", price: 2699, mrp: 4599, rating: 4.7, ratingCount: 2700, reviews: 430, stock: 22, sizes: ["XS", "S", "M", "L"], image: img(IMG.premium), tags: ["Bestseller"], description: "Elegant double-breasted trench in a water-resistant fabric." },
  { _id: "ra3", name: "Unisex Lightweight Rain Poncho", brand: "Kaze", department: "Rainy", category: "Unisex", price: 799, mrp: 1499, rating: 4.2, ratingCount: 2100, reviews: 300, stock: 75, sizes: ["Free Size"], image: img(IMG.hoodie), tags: [], description: "Packable ripstop poncho for sudden monsoon showers." },
  { _id: "ra4", name: "Women's Monsoon Hoodie", brand: "Muses", department: "Rainy", category: "Women", price: 1399, mrp: 2399, rating: 4.5, ratingCount: 3400, reviews: 520, stock: 48, sizes: ["XS", "S", "M", "L"], image: img(IMG.rainy), tags: [], description: "Quick-dry hooded sweatshirt for damp, breezy days." },
  { _id: "ra5", name: "Men's Quick-Dry Track Jacket", brand: "UrbanEdge", department: "Rainy", category: "Men", price: 1199, mrp: 2199, rating: 4.3, ratingCount: 2600, reviews: 380, stock: 55, sizes: ["S", "M", "L", "XL"], image: img(IMG.mensRack), tags: ["New Arrivals"], description: "Moisture-wicking shell that shrugs off light rain." },
  { _id: "ra6", name: "Women's Rain Duster Trench", brand: "LMAF Studio", department: "Rainy", category: "Women", price: 2299, mrp: 3999, rating: 4.4, ratingCount: 1900, reviews: 300, stock: 30, sizes: ["S", "M", "L"], image: img(IMG.rainy), tags: [], description: "Long-line water-resistant duster coat for the monsoon." },

  // ---------------- SPRING 🌸 ----------------
  { _id: "sp1", name: "Men's Denim Jacket", brand: "LMAF Studio", department: "Spring", category: "Men", price: 1899, mrp: 3199, rating: 4.6, ratingCount: 5100, reviews: 820, stock: 35, sizes: ["S", "M", "L", "XL"], image: img(IMG.jacket), tags: ["Bestseller"], description: "Classic mid-wash denim jacket with button closure." },
  { _id: "sp2", name: "Women's Floral Cardigan", brand: "Muses", department: "Spring", category: "Women", price: 1299, mrp: 2299, rating: 4.5, ratingCount: 3800, reviews: 540, stock: 44, sizes: ["XS", "S", "M", "L"], image: img(IMG.womenOutfit), tags: ["New Arrivals"], description: "Light knit cardigan in a soft spring floral hue." },
  { _id: "sp3", name: "Pastel Cotton Overshirt (Unisex)", brand: "Kaze", department: "Spring", category: "Unisex", price: 1399, mrp: 2399, rating: 4.4, ratingCount: 2900, reviews: 410, stock: 50, sizes: ["S", "M", "L", "XL"], image: img(IMG.shirt), tags: [], description: "Versatile layering shirt in fresh pastel shades." },
  { _id: "sp4", name: "Women's Midi Wrap Dress", brand: "Muses", department: "Spring", category: "Women", price: 1599, mrp: 2799, rating: 4.7, ratingCount: 4200, reviews: 660, stock: 38, sizes: ["XS", "S", "M", "L"], image: img(IMG.spring), tags: ["Deal of the Day"], description: "Flowing wrap dress perfect for blooming spring days." },
  { _id: "sp5", name: "Men's Slim Chino Trousers", brand: "UrbanEdge", department: "Spring", category: "Men", price: 1199, mrp: 1999, rating: 4.4, ratingCount: 6100, reviews: 900, stock: 70, sizes: ["S", "M", "L", "XL"], image: img(IMG.jeans), tags: [], description: "Slim-fit stretch chinos in a warm spring palette." },
  { _id: "sp6", name: "Lightweight Windbreaker (Unisex)", brand: "Kaze", department: "Spring", category: "Unisex", price: 1499, mrp: 2699, rating: 4.3, ratingCount: 3300, reviews: 480, stock: 46, sizes: ["S", "M", "L", "XL"], image: img(IMG.hoodie), tags: ["New Arrivals"], description: "Packable shell that blocks the cool spring breeze." },
];

// Derive a backend-safe `collection` from each item's tags.
demoProducts.forEach((p) => {
  p.collection = p.tags?.includes("New Arrivals")
    ? "New Arrivals"
    : p.department === "Winter"
    ? "Winter Collection"
    : "Regular Collection";
});

let cache = null;

// Normalise backend products into the storefront shape
function fromBackend(p) {
  const discountPctValue = p.discount ?? 0;
  const mrp =
    p.mrp ??
    (discountPctValue
      ? Math.round(p.price / (1 - discountPctValue / 100))
      : Math.round(p.price * 1.4));
  return {
    ...p,
    mrp,
    // Season lives in `department`; fall back to collection or Spring
    department:
      p.department ||
      (p.collection === "Winter Collection" ? "Winter" : "Spring"),
    brand: p.brand || "LMAF TARA",
    rating: p.rating ?? 4.2,
    ratingCount: p.ratingCount ?? 500,
    reviews: p.reviews ?? 60,
    tags: p.tags || (p.collection === "New Arrivals" ? ["New Arrivals"] : []),
  };
}

// Where the most recent fetchProducts() result came from: sheets | api | demo
let catalogSource = "demo";
export const getCatalogSource = () => catalogSource;

export async function fetchProducts(force = false) {
  if (cache && !force) return cache;

  // 1. Google Sheets catalog (owner-managed, no code / no deploy)
  if (isSheetsConfigured()) {
    const sheetItems = await fetchSheetProducts(force);
    if (sheetItems) {
      cache = sheetItems;
      catalogSource = "sheets";
      return cache;
    }
  }

  // 2. Backend API, 3. demo catalog fallback
  try {
    const res = await fetch(`${API}/products`);
    if (!res.ok) throw new Error("API unavailable");
    const data = await res.json();
    const items = Array.isArray(data) ? data : data.products;

    if (Array.isArray(items) && items.length > 0) {
      cache = items.map(fromBackend);
      catalogSource = "api";
      return cache;
    }
    throw new Error("Empty catalog");
  } catch (error) {
    console.log("Using demo catalog:", error.message);
    cache = demoProducts;
    catalogSource = "demo";
    return cache;
  }
}

export async function fetchProduct(id) {
  const list = await fetchProducts();
  const found = list.find((p) => p._id === id || p.id === id);
  if (found) return found;

  // Try backend for a single product not in the loaded list
  try {
    const res = await fetch(`${API}/products/${id}`);
    if (!res.ok) throw new Error();
    return fromBackend(await res.json());
  } catch {
    return null;
  }
}

export const discountPct = (p) =>
  p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;

export const formatINR = (n) => Number(n || 0).toLocaleString("en-IN");

export const deliveryFreeAt = 499;
