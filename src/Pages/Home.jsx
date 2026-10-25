
import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Truck, ShieldCheck, RotateCcw, Award,
} from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import ProductCard from "../Components/ProductCard";

const HERO_IMG =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80&auto=format&fit=crop";

const categories = [
  { title: "New Arrivals", sub: "Discover the latest", to: "/search?tag=New+Arrivals", img: "photo-1516257984-b1b4d707412e" },
  { title: "Everyday Essentials", sub: "Comfort meets style", to: "/search?department=Summer", img: "photo-1483985988355-763728e1935b" },
  { title: "Shirts & T-Shirts", sub: "Classic. Versatile. You.", to: "/search?q=shirt", img: "photo-1521572163474-6864f9cf17c9" },
  { title: "Knitwear", sub: "Soft layers, stronger days", to: "/search?department=Winter", img: "photo-1544923246-77307dd654cb" },
  { title: "Outerwear", sub: "For every season", to: "/search?q=jacket", img: "photo-1551028719-00167b16eac5" },
];

const trust = [
  { icon: Truck, title: "Free Shipping", text: "On orders above ₹2,000" },
  { icon: ShieldCheck, title: "Secure Payments", text: "100% Safe & Encrypted" },
  { icon: RotateCcw, title: "Easy Returns", text: "Hassle Free Process" },
  { icon: Award, title: "Premium Quality", text: "Designed for Lasting Comfort" },
];

const tile = (id) =>
  `url(https://images.unsplash.com/${id}?w=600&q=70&auto=format&fit=crop)`;

export default function Home() {
  const { products, loading } = useProducts();
  const scroller = useRef(null);

  const arrivals = useMemo(
    () => products.filter((p) => p.tags?.includes("New Arrivals")).slice(0, 12),
    [products]
  );

  const scrollBy = (dir) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };

  return (
    <div className="pm-home">
      {/* Hero */}
      <section className="pm-hero" style={{ backgroundImage: `url(${HERO_IMG})` }}>
        <div className="pm-hero-overlay" />
        <div className="pm-hero-content">
          <p className="pm-eyebrow">L M A F&nbsp;&nbsp;T A R A</p>
          <h1 className="pm-hero-title">
            Timeless
            <br />
            By Nature
          </h1>
          <p className="pm-hero-sub">
            Crafted for every chapter, in every season.
            <br />
            Premium clothing for the modern you.
          </p>
          <div className="pm-hero-cta">
            <Link to="/search?tag=New+Arrivals" className="pm-btn pm-btn-gold">
              Shop New Arrivals <ArrowRight size={16} />
            </Link>
            <Link to="/collections" className="pm-btn pm-btn-ghost">
              Explore Collections
            </Link>
          </div>
          <div className="pm-hero-meta">
            <span>All Season</span>
            <i>/</i>
            <span>All Occasions</span>
            <i>/</i>
            <span>Always You</span>
          </div>
        </div>
        <p className="pm-hero-quote">
          Effortless
          <br />
          Style.
          <br />
          Lasting
          <br />
          Impressions.
        </p>
      </section>

      {/* Category tiles */}
      <section className="pm-cats">
        {categories.map((c) => (
          <Link
            key={c.title}
            to={c.to}
            className="pm-cat-card"
            style={{ backgroundImage: tile(c.img) }}
          >
            <div className="pm-cat-grad" />
            <div className="pm-cat-text">
              <h3>{c.title}</h3>
              <p>{c.sub}</p>
            </div>
            <ArrowRight size={18} className="pm-cat-arrow" />
          </Link>
        ))}
      </section>

      {/* New arrivals */}
      <section className="pm-arrivals">
        <div className="pm-arrivals-head">
          <p className="pm-kicker">Fresh Styles</p>
          <h2 className="pm-serif">New Arrivals</h2>
          <p className="pm-arrivals-copy">
            Thoughtfully designed. Beautifully made. Explore the latest additions
            to the LMAF TARA collection.
          </p>
          <Link to="/search?tag=New+Arrivals" className="pm-btn pm-btn-dark">
            Shop All New Arrivals <ArrowRight size={16} />
          </Link>
        </div>

        <div className="pm-arrivals-rail">
          {loading ? (
            <div className="fk-loading">Loading…</div>
          ) : (
            <>
              <div className="pm-scroll" ref={scroller}>
                {arrivals.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              <div className="pm-rail-tools">
                <button type="button" onClick={() => scrollBy(-1)} aria-label="Previous">
                  <ArrowRight size={18} style={{ transform: "rotate(180deg)" }} />
                </button>
                <button type="button" onClick={() => scrollBy(1)} aria-label="Next">
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Trust bar */}
      <section className="pm-trust">
        {trust.map((t) => (
          <div key={t.title} className="pm-trust-item">
            <t.icon size={26} />
            <div>
              <p className="pm-trust-title">{t.title}</p>
              <p className="pm-trust-text">{t.text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
