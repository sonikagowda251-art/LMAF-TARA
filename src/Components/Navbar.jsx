
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Heart } from "lucide-react";
import { useCart } from "../Contexts/CartContext";
import { useAuth } from "../Contexts/AuthContext";
import { useWishlist } from "../Contexts/WishlistContext";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/search" },
  { label: "Collections", to: "/collections" },
  { label: "About", to: "/about" },
  { label: "Journal", to: "/contact" },
  { label: "Support", to: "/track" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { count } = useCart();
  const { items: wishItems } = useWishlist();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const submitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    setQuery("");
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="fk-header">
      <div className="fk-header-inner">
        {/* Brand */}
        <Link to="/" className="fk-logo" aria-label="LMAF TARA home">
          <span className="fk-logo-word">
            LMAF<span className="fk-logo-word-2">TARA</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="fk-nav">
          {navLinks.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                isActive ? "fk-nav-link on" : "fk-nav-link"
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="fk-actions">
          <form
            className={searchOpen ? "fk-searchbar open" : "fk-searchbar"}
            onSubmit={submitSearch}
            role="search"
          >
            <input
              type="text"
              placeholder="Search clothes…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
          </form>

          <button
            type="button"
            className="fk-icon-btn"
            aria-label="Search"
            onClick={() => setSearchOpen((o) => !o)}
          >
            <Search size={19} />
          </button>

          <Link to={user ? "/account" : "/login"} className="fk-icon-btn" aria-label="Account">
            <User size={19} />
          </Link>

          <Link to="/wishlist" className="fk-icon-btn" aria-label="Wishlist">
            <Heart size={19} />
            {wishItems.length > 0 && <span className="fk-icon-badge">{wishItems.length}</span>}
          </Link>

          <Link to="/cart" className="fk-icon-btn" aria-label="Shopping bag">
            <ShoppingBag size={19} />
            {count > 0 && <span className="fk-icon-badge">{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
