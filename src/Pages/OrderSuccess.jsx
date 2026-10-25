
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useOrders } from "../Contexts/OrdersContext";
import { formatINR } from "../utils/data";

export default function OrderSuccess() {
  const { state } = useLocation();
  const { orders } = useOrders();
  const orderId = state?.orderId;
  const order = orders.find((o) => o.id === orderId);

  return (
    <div className="fk-success fk-page">
      <div className="fk-success-card">
        <CheckCircle2 size={54} className="fk-success-icon" />
        <h2>Order Confirmed! 🎉</h2>
        <p className="fk-muted">
          Thanks for shopping with LMAF TARA. Your order has been placed.
        </p>

        {order ? (
          <div className="fk-success-detail">
            <p><b>Order ID:</b> {order.id}</p>
            <p><b>Items:</b> {order.items.length}</p>
            <p><b>Amount Paid:</b> ₹{formatINR(order.amount.total)}</p>
            <p><b>Payment:</b> {order.payment.toUpperCase()}</p>
            <p><b>Deliver to:</b> {order.address.name}, {order.address.city}</p>
          </div>
        ) : (
          <p className="fk-muted">Order reference: {orderId || "—"}</p>
        )}

        <div className="fk-success-btns">
          <Link to="/orders" className="fk-btn fk-btn-primary">
            Track Your Order
          </Link>
          <Link to="/search" className="fk-btn fk-btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
