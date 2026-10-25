
import { Link } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { useOrders } from "../Contexts/OrdersContext";
import { formatINR } from "../utils/data";

export default function Orders() {
  const { user } = useAuth();
  const { myOrders, advanceStatus, cancelOrder, STATUS_FLOW } = useOrders();
  const orders = myOrders(user?.id);

  if (orders.length === 0) {
    return (
      <div className="fk-empty fk-page">
        <div className="fk-empty-cart">📦</div>
        <h2>No orders yet</h2>
        <p>
          {user
            ? "Looks like you haven't placed an order."
            : "Log in to keep your orders saved to your account."}
        </p>
        <div className="fk-empty-btns">
          {!user && (
            <Link to="/login" className="fk-btn fk-btn-outline">
              Login
            </Link>
          )}
          <Link to="/search" className="fk-btn fk-btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fk-orders fk-page">
      <h2>My Orders ({orders.length})</h2>

      {orders.map((o) => {
        const currentIdx = STATUS_FLOW.indexOf(o.status);
        const cancelled = o.status === "Cancelled";
        const delivered = o.status === "Delivered";

        return (
          <div key={o.id} className="fk-order">
            <div className="fk-order-head">
              <div>
                <Link to={`/product/${o.items[0]?.productId}`} className="fk-order-id">
                  Order {o.id}
                </Link>
                <p className="fk-muted">
                  Placed on {new Date(o.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="fk-order-right">
                <p className="fk-order-total">₹{formatINR(o.amount.total)}</p>
                <span className={cancelled ? "fk-status cancel" : delivered ? "fk-status done" : "fk-status"}>
                  {o.status}
                </span>
              </div>
            </div>

            {/* Timeline */}
            {!cancelled && (
              <div className="fk-track">
                {STATUS_FLOW.map((st, i) => (
                  <div key={st} className={i <= currentIdx ? "fk-track-node done" : "fk-track-node"}>
                    <span className="fk-track-dot" />
                    <small>{st}</small>
                  </div>
                ))}
              </div>
            )}

            <ul className="fk-order-items">
              {o.items.map((it, idx) => (
                <li key={`${it.productId}-${it.size}-${idx}`}>
                  <Link to={`/product/${it.productId}`}>
                    <img src={it.image} alt={it.name} />
                  </Link>
                  <div className="fk-oi-info">
                    <Link to={`/product/${it.productId}`} className="fk-oi-name">{it.name}</Link>
                    <p className="fk-muted">{it.brand}{it.size && it.size !== "Free Size" ? ` · Size ${it.size}` : ""} · Qty {it.qty}</p>
                    <p>₹{formatINR(it.price * it.qty)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="fk-order-foot">
              <div className="fk-order-addr">
                <b>Deliver to:</b> {o.address.name}, {o.address.line1}, {o.address.city}, {o.address.state} — {o.address.pincode}
              </div>
              <div className="fk-order-btns">
                {!delivered && !cancelled && (
                  <button type="button" className="fk-btn fk-btn-outline" onClick={() => advanceStatus(o.id)}>
                    Simulate Next Status
                  </button>
                )}
                {!delivered && !cancelled && (
                  <button type="button" className="fk-btn fk-btn-ghost" onClick={() => cancelOrder(o.id)}>
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
