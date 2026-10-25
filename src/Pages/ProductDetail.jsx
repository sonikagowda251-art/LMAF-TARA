
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Heart, ShoppingCart, Zap, Star, MapPin, RotateCcw, Truck, ShieldCheck, ChevronRight,
} from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { discountPct, formatINR, deliveryFreeAt } from "../utils/data";
import { useCart } from "../Contexts/CartContext";
import { useWishlist } from "../Contexts/WishlistContext";
import ProductCard from "../Components/ProductCard";

const bankOffers = [
  "Bank Offer 10% instant discount on SBI Credit Cards, up to ₹1,500",
  "Bank Offer 5% Cashback on LMAF TARA Card",
  "No Cost EMI on orders above ₹3,000",
  "Special Price Extra savings applied at checkout",
];

function ratingBreakdown(rating) {
  // Deterministic pseudo-distribution centered on the product rating
  const five = Math.round(45 + (rating - 4) * 20);
  const four = 30;
  const three = 14;
  const two = 7;
  const one = Math.max(2, 100 - five - four - three - two);
  return [
    { star: 5, pct: five },
    { star: 4, pct: four },
    { star: 3, pct: three },
    { star: 2, pct: two },
    { star: 1, pct: one },
  ];
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();

  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [pincode, setPincode] = useState("");
  const [pinMsg, setPinMsg] = useState("");

  const product = useMemo(
    () => products.find((p) => p._id === id || p.id === id),
    [products, id]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImg(0);
    setSize(product?.sizes?.[0] || null);
  }, [id, product]);

  if (loading) return <div className="fk-loading">Loading product…</div>;

  if (!product) {
    return (
      <div className="fk-empty fk-page">
        <p>Product not found.</p>
        <Link to="/search" className="fk-btn fk-btn-primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  const off = discountPct(product);
  const wished = has(product._id);
  const gallery = [
    product.image,
    `${product.image}${product.image.includes("?") ? "&" : "?"}sat=-30`,
    `${product.image}${product.image.includes("?") ? "&" : "?"}flip=h`,
  ];
  const dist = ratingBreakdown(product.rating);
  const similar = products
    .filter((p) => p._id !== product._id && p.department === product.department)
    .slice(0, 6);

  const checkPin = () => {
    if (!/^\d{6}$/.test(pincode)) {
      setPinMsg("Please enter a valid 6-digit pincode");
      return;
    }
    setPinMsg(`✅ Delivery by ${new Date(Date.now() + 3 * 864e5).toDateString().slice(4)} to ${pincode}`);
  };

  const requireSize = Array.isArray(product.sizes) && product.sizes.length > 0;

  const handleAdd = () => {
    if (requireSize && !size) {
      setPinMsg("Please select a size to continue");
      return;
    }
    addItem(product, qty, size || "Free Size");
    navigate("/cart");
  };

  const handleBuy = () => {
    if (requireSize && !size) {
      setPinMsg("Please select a size to continue");
      return;
    }
    addItem(product, qty, size || "Free Size");
    navigate("/checkout");
  };

  return (
    <div className="fk-pdp">
      <div className="fk-crumb">
        <Link to="/">Home</Link>
        <ChevronRight size={13} />
        <Link to={`/search?department=${encodeURIComponent(product.department)}`}>
          {product.department}
        </Link>
        <ChevronRight size={13} />
        <span>{product.name}</span>
      </div>

      <div className="fk-pdp-grid">
        {/* Left: gallery + actions */}
        <div className="fk-pdp-left">
          <div className="fk-gallery">
            <div className="fk-thumbs">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  className={i === activeImg ? "fk-thumb on" : "fk-thumb"}
                  onMouseEnter={() => setActiveImg(i)}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={src} alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>
            <div className="fk-mainimg">
              <img src={gallery[activeImg]} alt={product.name} />
            </div>
          </div>

          <div className="fk-pdp-actions">
            <button
              type="button"
              className="fk-btn fk-btn-cart"
              onClick={handleAdd}
            >
              <ShoppingCart size={18} /> ADD TO CART
            </button>
            <button
              type="button"
              className="fk-btn fk-btn-buy"
              onClick={handleBuy}
            >
              <Zap size={18} /> BUY NOW
            </button>
          </div>
        </div>

        {/* Right: info */}
        <div className="fk-pdp-right">
          <p className="fk-pdp-brand">{product.brand}</p>
          <h1 className="fk-pdp-title">{product.name}</h1>

          <div className="fk-pdp-rate">
            <span className="fk-rate-badge">
              {Number(product.rating).toFixed(1)} <Star size={12} fill="currentColor" />
            </span>
            <span>
              {formatINR(product.ratingCount)} ratings &amp; {formatINR(product.reviews)} reviews
            </span>
          </div>

          <p className="fk-pdp-special">Special Price</p>

          <div className="fk-pdp-price">
            <span className="fk-now">₹{formatINR(product.price)}</span>
            {off > 0 && (
              <>
                <span className="fk-mrp">₹{formatINR(product.mrp)}</span>
                <span className="fk-off">{off}% off</span>
              </>
            )}
          </div>

          {product.stock > 0 ? (
            <p className="fk-stock ok">In stock · ships in 24 hrs</p>
          ) : (
            <p className="fk-stock out">Currently unavailable</p>
          )}

          {/* Size selector */}
          {requireSize && (
            <div className="fk-sizes">
              <h4>Select Size</h4>
              <div className="fk-size-row">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={size === s ? "fk-size on" : "fk-size"}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="fk-size-note">Standard sizes · 7-day easy returns</p>
            </div>
          )}

          {/* Qty */}
          <div className="fk-qty">
            <span>Quantity</span>
            <div className="fk-ctrl">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <b>{qty}</b>
              <button type="button" onClick={() => setQty((q) => Math.min(product.stock || 10, q + 1))}>+</button>
            </div>
          </div>

          {/* Offers */}
          <div className="fk-offers">
            <h3>
              <BadgeHeading /> AVAILABLE OFFERS
            </h3>
            <ul>
              {bankOffers.map((o, i) => (
                <li key={i}>
                  <span className="fk-off-tag">OFF</span>
                  {o}
                </li>
              ))}
              {product.price >= deliveryFreeAt && (
                <li>
                  <span className="fk-off-tag">FREE</span>
                  Free delivery on this order
                </li>
              )}
            </ul>
          </div>

          {/* Delivery pincode */}
          <div className="fk-pin">
            <label className="fk-pin-label">
              <MapPin size={15} /> Enter your pincode for delivery date
            </label>
            <div className="fk-pin-row">
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
              />
              <button type="button" onClick={checkPin}>CHECK</button>
            </div>
            {pinMsg && <p className="fk-pin-msg">{pinMsg}</p>}
          </div>

          {/* Assurance */}
          <div className="fk-pdp-assure">
            <span><Truck size={15} /> Free Delivery</span>
            <span><RotateCcw size={15} /> 7-Day Returns</span>
            <span><ShieldCheck size={15} /> Secure Payment</span>
          </div>

          <button
            type="button"
            className={wished ? "fk-wishline on" : "fk-wishline"}
            onClick={() => toggle(product)}
          >
            <Heart size={16} fill={wished ? "#ff4b5c" : "none"} />
            {wished ? "Removed from" : "Add to"} Wishlist
          </button>
        </div>
      </div>

      {/* Highlights + description */}
      <section className="fk-block">
        <h2>Product Highlights</h2>
        <ul className="fk-highlights">
          <li><b>Brand</b> {product.brand}</li>
          <li><b>Category</b> {product.category}</li>
          <li><b>Department</b> {product.department}</li>
          <li><b>Highlights</b> {product.description}</li>
          {product.sizes?.length ? <li><b>Available Sizes</b> {product.sizes.join(", ")}</li> : null}
          <li><b>Warranty</b> 1 year manufacturer warranty</li>
        </ul>
      </section>

      <section className="fk-block">
        <h2>Ratings &amp; Reviews</h2>
        <div className="fk-reviews">
          <div className="fk-rev-summary">
            <div className="fk-rev-score">
              <span>{Number(product.rating).toFixed(1)}</span>
              <Star size={16} fill="currentColor" />
            </div>
            <p>{formatINR(product.ratingCount)} ratings</p>
            <div className="fk-dist">
              {dist.map((d) => (
                <div key={d.star} className="fk-dist-row">
                  <span>{d.star}★</span>
                  <div className="fk-dist-bar">
                    <div style={{ width: `${d.pct}%` }} />
                  </div>
                  <em>{d.pct}%</em>
                </div>
              ))}
            </div>
          </div>

          <div className="fk-rev-list">
            <ReviewCard
              name="Aditya R."
              stars={Math.round(product.rating)}
              date="2 weeks ago"
              text={`Really happy with the ${product.name.toLowerCase()}. Quality matches the price and delivery was quick.`}
            />
            <ReviewCard
              name="Priya S."
              stars={5}
              date="1 month ago"
              text="Exactly as shown. LMAF TARA never disappoints — packaging was neat too."
            />
            <ReviewCard
              name="Rahul M."
              stars={4}
              date="1 month ago"
              text="Good product overall. Would have liked a bit faster shipping but worth it."
            />
          </div>
        </div>
      </section>

      {/* Similar products */}
      {similar.length > 0 && (
        <section className="fk-block">
          <h2>Similar Products</h2>
          <div className="fk-grid">
            {similar.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BadgeHeading() {
  return <span className="fk-off-tag">BANK</span>;
}

function ReviewCard({ name, stars, date, text }) {
  return (
    <div className="fk-rev">
      <div className="fk-rate-badge sm">
        {stars} <Star size={10} fill="currentColor" />
      </div>
      <p className="fk-rev-text">{text}</p>
      <p className="fk-rev-meta">
        <span>{name}</span> · {date}
      </p>
    </div>
  );
}
