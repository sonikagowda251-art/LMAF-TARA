
import { Link } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import { discountPct, formatINR } from "../utils/data";
import { useWishlist } from "../Contexts/WishlistContext";

export default function ProductCard({ product }) {
  const { toggle, has } = useWishlist();
  const off = discountPct(product);
  const wished = has(product._id);

  return (
    <article className="fk-pcard">
      <Link to={`/product/${product._id}`} className="fk-pcard-media">
        <img
          src={product.image || "https://placehold.co/400x400?text=LMAF+TARA"}
          alt={product.name}
          loading="lazy"
        />
        <button
          type="button"
          className={wished ? "fk-wish on" : "fk-wish"}
          aria-label="Add to wishlist"
          onClick={(e) => {
            e.preventDefault();
            toggle(product);
          }}
        >
          <Heart size={16} fill={wished ? "#ff4b5c" : "none"} />
        </button>
      </Link>

      <div className="fk-pcard-body">
        <p className="fk-pcard-brand">{product.brand}</p>
        <Link to={`/product/${product._id}`} className="fk-pcard-name">
          {product.name}
        </Link>

        <div className="fk-pcard-rating">
          <span className="fk-rate-badge">
            {Number(product.rating).toFixed(1)} <Star size={11} fill="currentColor" />
          </span>
          <span className="fk-rate-count">
            ({formatINR(product.ratingCount)})
          </span>
        </div>

        <p className="fk-pcard-price">
          <span className="fk-price-now">₹{formatINR(product.price)}</span>
          {off > 0 && (
            <>
              <span className="fk-price-mrp">₹{formatINR(product.mrp)}</span>
              <span className="fk-price-off">{off}% off</span>
            </>
          )}
        </p>

        {product.stock > 0 && product.stock <= 20 && (
          <p className="fk-stock-warn">Only {product.stock} left!</p>
        )}
      </div>
    </article>
  );
}
