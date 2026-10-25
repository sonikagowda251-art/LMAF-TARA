
import { Link } from "react-router-dom";
import { useWishlist } from "../Contexts/WishlistContext";
import { useCart } from "../Contexts/CartContext";
import { discountPct, formatINR } from "../utils/data";
import { ShoppingCart, Trash2, Star } from "lucide-react";

export default function Wishlist() {
  const { items, remove, toggle } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="fk-empty fk-page">
        <div className="fk-empty-cart">❤️</div>
        <h2>Your wishlist is empty</h2>
        <p>Save items you love and find them here anytime.</p>
        <Link to="/search" className="fk-btn fk-btn-primary">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="fk-wishlist fk-page">
      <h2>My Wishlist ({items.length})</h2>
      <div className="fk-grid">
        {items.map((p) => {
          const off = discountPct(p);
          return (
            <article key={p._id} className="fk-pcard">
              <Link to={`/product/${p._id}`} className="fk-pcard-media">
                <img src={p.image} alt={p.name} loading="lazy" />
              </Link>
              <div className="fk-pcard-body">
                <p className="fk-pcard-brand">{p.brand}</p>
                <Link to={`/product/${p._id}`} className="fk-pcard-name">
                  {p.name}
                </Link>
                <div className="fk-pcard-rating">
                  <span className="fk-rate-badge">
                    {Number(p.rating).toFixed(1)} <Star size={11} fill="currentColor" />
                  </span>
                </div>
                <p className="fk-pcard-price">
                  <span className="fk-price-now">₹{formatINR(p.price)}</span>
                  {off > 0 && <span className="fk-price-off">{off}% off</span>}
                </p>
                <div className="fk-wish-actions">
                  <button
                    type="button"
                    className="fk-btn fk-btn-cart sm"
                    onClick={() => {
                      addItem(p, 1, p.sizes?.[0] || "Free Size");
                      remove(p._id);
                    }}
                  >
                    <ShoppingCart size={14} /> Move to Cart
                  </button>
                  <button
                    type="button"
                    className="fk-icon-btn"
                    aria-label="Remove from wishlist"
                    onClick={() => toggle(p)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
