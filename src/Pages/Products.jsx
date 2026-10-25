
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { discountPct, SEASONS, GENDERS } from "../utils/data";
import ProductCard from "../Components/ProductCard";

const SORTS = [
  { id: "popularity", label: "Popularity" },
  { id: "price-low", label: "Price — Low to High" },
  { id: "price-high", label: "Price — High to Low" },
  { id: "discount", label: "Discount" },
  { id: "rating", label: "Customer Rating" },
];

const PRICE_BANDS = [
  { id: "0-999", label: "Under ₹1,000", test: (p) => p.price < 1000 },
  { id: "1000-2999", label: "₹1,000 – ₹2,999", test: (p) => p.price >= 1000 && p.price < 3000 },
  { id: "3000-9999", label: "₹3,000 – ₹9,999", test: (p) => p.price >= 3000 && p.price < 10000 },
  { id: "10000-", label: "₹10,000 & above", test: (p) => p.price >= 10000 },
];

export default function Products() {
  const { products, loading } = useProducts();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = params.get("q") || "";
  const department = params.get("department") || "";
  const category = params.get("category") || "";
  const tag = params.get("tag") || "";
  const sort = params.get("sort") || "popularity";
  const minRating = Number(params.get("rating") || 0);
  const priceParam = params.get("price") || "";
  const priceIds = useMemo(
    () => priceParam.split(",").filter(Boolean),
    [priceParam]
  );
  const assumed = params.get("assumed") === "1";

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === null || value === "" || value === undefined) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const togglePrice = (id) => {
    const set = new Set(priceIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    setParam("price", [...set].join(","));
  };

  const filtered = useMemo(() => {
    let list = [...products];

    if (q) {
      const t = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(t) ||
          (p.brand || "").toLowerCase().includes(t) ||
          (p.category || "").toLowerCase().includes(t) ||
          (p.department || "").toLowerCase().includes(t)
      );
    }
    if (department) list = list.filter((p) => p.department === department);
    if (category) list = list.filter((p) => p.category === category);
    if (tag) list = list.filter((p) => p.tags?.includes(tag));
    if (minRating) list = list.filter((p) => Number(p.rating) >= minRating);
    if (priceIds.length) {
      const bands = PRICE_BANDS.filter((b) => priceIds.includes(b.id));
      list = list.filter((p) => bands.some((b) => b.test(p)));
    }

    switch (sort) {
      case "price-low":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        list.sort((a, b) => discountPct(b) - discountPct(a));
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort((a, b) => b.ratingCount - a.ratingCount);
    }

    return list;
  }, [products, q, department, category, tag, sort, minRating, priceIds]);

  const activeCount =
    (department ? 1 : 0) + (category ? 1 : 0) + (tag ? 1 : 0) + priceIds.length + (minRating ? 1 : 0);

  const clearAll = () => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    setParams(next, { replace: true });
  };

  const title = department || category || tag || (q ? `Results for "${q}"` : "All Products");

  const filterPanel = (
    <div className="fk-filters">
      <div className="fk-filters-head">
        <h3>Filters</h3>
        <button type="button" className="fk-filter-close" onClick={() => setFiltersOpen(false)}>
          <X size={18} />
        </button>
      </div>

      <div className="fk-filter-group">
        <h4>Season</h4>
        {SEASONS.map((d) => (
          <label key={d.name} className="fk-check">
            <input
              type="radio"
              name="department"
              checked={department === d.name}
              onChange={() => setParam("department", d.name)}
            />
            {d.icon} {d.name}
          </label>
        ))}
        {department && (
          <button type="button" className="fk-clear-link" onClick={() => setParam("department", null)}>
            Clear
          </button>
        )}
      </div>

      <div className="fk-filter-group">
        <h4>Price</h4>
        {PRICE_BANDS.map((b) => (
          <label key={b.id} className="fk-check">
            <input
              type="checkbox"
              checked={priceIds.includes(b.id)}
              onChange={() => togglePrice(b.id)}
            />
            {b.label}
          </label>
        ))}
      </div>

      <div className="fk-filter-group">
        <h4>Customer Ratings</h4>
        {[4, 3].map((r) => (
          <label key={r} className="fk-check">
            <input
              type="radio"
              name="rating"
              checked={minRating === r}
              onChange={() => setParam("rating", r)}
            />
            {r}★ &amp; above
          </label>
        ))}
      </div>

      <div className="fk-filter-group">
        <h4>Gender</h4>
        {GENDERS.map((c) => (
          <label key={c} className="fk-check">
            <input
              type="radio"
              name="category"
              checked={category === c}
              onChange={() => setParam("category", c)}
            />
            {c}
          </label>
        ))}
      </div>

      <button type="button" className="fk-btn fk-btn-outline" onClick={clearAll}>
        Clear All
      </button>
    </div>
  );

  return (
    <div className="fk-list">
      <div className="fk-list-body">
        {/* Desktop sidebar */}
        <aside className="fk-sidebar">{filterPanel}</aside>

        <div className="fk-list-main">
          <div className="fk-list-top">
            <div>
              <h2>{title}</h2>
              <p className="fk-list-count">
                Showing {filtered.length} product{filtered.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="fk-sortbar">
              <button
                type="button"
                className="fk-filter-toggle"
                onClick={() => setFiltersOpen(true)}
              >
                <SlidersHorizontal size={16} /> Filters
                {activeCount > 0 && <span className="fk-badge">{activeCount}</span>}
              </button>

              <div className="fk-sort">
                <span>Sort By</span>
                {SORTS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={sort === o.id ? "on" : ""}
                    onClick={() => setParam("sort", o.id)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="fk-loading">Loading products…</div>
          ) : filtered.length === 0 ? (
            <div className="fk-empty">
              <p>No products match your filters.</p>
              <button type="button" className="fk-btn fk-btn-primary" onClick={clearAll}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="fk-grid">
              {filtered.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {!assumed && filtered.length > 0 && (
            <p className="fk-list-foot">
              Prices are inclusive of all charges. Free delivery on orders above ₹499.{" "}
              <Link to="/cart">Go to cart →</Link>
            </p>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fk-drawer-backdrop" onClick={() => setFiltersOpen(false)}>
          <div className="fk-drawer" onClick={(e) => e.stopPropagation()}>
            {filterPanel}
            <button
              type="button"
              className="fk-btn fk-btn-primary fk-drawer-apply"
              onClick={() => setFiltersOpen(false)}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
