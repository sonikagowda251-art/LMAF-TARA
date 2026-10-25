
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Package, Heart, LogIn } from "lucide-react";
import { useAuth } from "../Contexts/AuthContext";
import { useOrders } from "../Contexts/OrdersContext";
import { useWishlist } from "../Contexts/WishlistContext";
import { useCart } from "../Contexts/CartContext";
import { formatINR } from "../utils/data";

export default function Account() {
  const { user, logout } = useAuth();
  const { myOrders } = useOrders();
  const { items: wished } = useWishlist();
  const { count } = useCart();
  const navigate = useNavigate();

  const [tab, setTab] = useState("profile");

  if (!user) {
    return (
      <div className="fk-empty fk-page">
        <h2>You're not logged in</h2>
        <p>Log in to view your profile, orders and wishlist.</p>
        <Link to="/login" className="fk-btn fk-btn-primary">
          Login / Register
        </Link>
      </div>
    );
  }

  const orders = myOrders(user.id);
  const spent = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.amount.total, 0);

  const tabs = [
    { id: "profile", label: "Personal Information", icon: User },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
  ];

  return (
    <div className="fk-account fk-page">
      <aside className="fk-acc-side">
        <div className="fk-acc-user">
          <div className="fk-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <p className="fk-acc-name">{user.name}</p>
            <p className="fk-muted">
              {user.guest ? "Guest account" : user.email}
            </p>
          </div>
        </div>

        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? "fk-acc-tab on" : "fk-acc-tab"}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={17} /> {t.label}
          </button>
        ))}

        <button
          type="button"
          className="fk-acc-tab logout"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <LogIn size={17} /> Logout
        </button>
      </aside>

      <div className="fk-acc-body">
        {tab === "profile" && (
          <section className="fk-acc-card">
            <h2>Personal Information</h2>
            <div className="fk-info-grid">
              <div><label>Name</label><p>{user.name}</p></div>
              <div><label>Email</label><p>{user.email || "—"}</p></div>
              <div><label>Phone</label><p>{user.phone || "—"}</p></div>
              <div><label>Account Type</label><p>{user.guest ? "Guest" : "Registered"}</p></div>
            </div>

            <div className="fk-acc-stats">
              <div className="fk-stat">
                <b>{orders.length}</b>
                <span>Orders</span>
              </div>
              <div className="fk-stat">
                <b>₹{formatINR(spent)}</b>
                <span>Total spent</span>
              </div>
              <div className="fk-stat">
                <b>{wished.length}</b>
                <span>Wishlist</span>
              </div>
              <div className="fk-stat">
                <b>{count}</b>
                <span>In cart</span>
              </div>
            </div>
          </section>
        )}

        {tab === "orders" && (
          <section className="fk-acc-card">
            <h2>My Orders</h2>
            {orders.length === 0 ? (
              <p className="fk-muted">
                No orders yet. <Link to="/search">Start shopping →</Link>
              </p>
            ) : (
              <ul className="fk-acc-orders">
                {orders.map((o) => (
                  <li key={o.id}>
                    <div>
                      <b>{o.id}</b>
                      <p className="fk-muted">
                        {o.items.length} item(s) · {new Date(o.date).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <span className={o.status === "Cancelled" ? "fk-status cancel" : o.status === "Delivered" ? "fk-status done" : "fk-status"}>
                      {o.status}
                    </span>
                    <b>₹{formatINR(o.amount.total)}</b>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === "wishlist" && (
          <section className="fk-acc-card">
            <h2>Wishlist</h2>
            {wished.length === 0 ? (
              <p className="fk-muted">
                Your wishlist is empty. <Link to="/search">Browse products →</Link>
              </p>
            ) : (
              <>
                <p className="fk-muted">{wished.length} saved item(s).</p>
                <Link to="/wishlist" className="fk-btn fk-btn-primary">
                  View full wishlist
                </Link>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
