
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

export default function ProductRow({ title, subtitle, products, cta }) {
  const scroller = useRef(null);

  const scrollBy = (dir) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  if (!products?.length) return null;

  return (
    <section className="fk-row">
      <div className="fk-row-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="fk-row-tools">
          {cta && <a href={cta.href} className="fk-btn fk-btn-primary">{cta.label}</a>}
          <button type="button" onClick={() => scrollBy(-1)} aria-label="Scroll left">
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={() => scrollBy(1)} aria-label="Scroll right">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="fk-row-scroll" ref={scroller}>
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}
