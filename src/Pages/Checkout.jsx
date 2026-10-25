
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../Contexts/CartContext";
import { useAuth } from "../Contexts/AuthContext";
import { useOrders } from "../Contexts/OrdersContext";
import { formatINR } from "../utils/data";

const PAYMENTS = [
  { id: "cod", label: "Cash on Delivery", note: "Pay when your order arrives" },
  { id: "card", label: "Credit / Debit Card", note: "Visa, Mastercard, RuPay" },
  { id: "upi", label: "UPI", note: "GPay, PhonePe, Paytm" },
  { id: "emi", label: "EMI", note: "No cost EMI available" },
];

const emptyAddress = {
  name: "",
  phone: "",
  pincode: "",
  line1: "",
  city: "",
  state: "",
  type: "Home",
};

export default function Checkout() {
  const { items, totalPrice, totalMrp, discount, delivery, total, count, clearCart } = useCart();
  const { user } = useAuth();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 address, 2 payment, 3 review
  const [address, setAddress] = useState({
    ...emptyAddress,
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [payment, setPayment] = useState("cod");
  const [errors, setErrors] = useState({});

  if (items.length === 0) {
    return (
      <div className="fk-empty fk-page">
        <h2>Nothing to check out</h2>
        <p>Your cart is empty.</p>
        <Link to="/search" className="fk-btn fk-btn-primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  const set = (k, v) => setAddress((a) => ({ ...a, [k]: v }));

  const validateAddress = () => {
    const e = {};
    if (!address.name.trim()) e.name = "Full name is required";
    if (!/^\d{10}$/.test(address.phone.replace(/\D/g, ""))) e.phone = "Enter a valid 10-digit mobile";
    if (!/^\d{6}$/.test(address.pincode)) e.pincode = "Enter a valid 6-digit pincode";
    if (!address.line1.trim()) e.line1 = "Address is required";
    if (!address.city.trim()) e.city = "City is required";
    if (!address.state.trim()) e.state = "State is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const field = (key, label, props = {}) => (
    <div className={errors[key] ? "fk-field err" : "fk-field"}>
      <label>{label}</label>
      <input
        value={address[key]}
        onChange={(e) => set(key, e.target.value)}
        {...props}
      />
      {errors[key] && <span className="fk-err">{errors[key]}</span>}
    </div>
  );

  const placeMyOrder = () => {
    const order = placeOrder({
      items,
      amount: { totalPrice, totalMrp, discount, delivery, total },
      address,
      payment,
      user,
    });
    clearCart();
    navigate("/order-success", { state: { orderId: order.id } });
  };

  return (
    <div className="fk-checkout">
      <div className="fk-co-main">
        {/* Steps */}
        <ol className="fk-steps">
          <li className={step >= 1 ? "on" : ""} onClick={() => step > 1 && setStep(1)}>
            1. Login
          </li>
          <li className={step >= 2 ? "on" : ""} onClick={() => step > 2 && setStep(2)}>
            2. Delivery Address
          </li>
          <li className={step >= 3 ? "on" : ""} onClick={() => step > 3 && setStep(3)}>
            3. Payment
          </li>
        </ol>

        {/* Step 1: login shown as confirmed banner */}
        {step === 1 && (
          <section className="fk-co-card">
            <h3>
              {user ? `Logged in as ${user.name}` : "Not logged in"}
            </h3>
            {user ? (
              <p className="fk-muted">
                {user.email || user.phone || "Guest session"}
              </p>
            ) : (
              <p className="fk-muted">
                <Link to="/login">Log in</Link> to track orders (or continue as guest).
              </p>
            )}
            <button
              type="button"
              className="fk-btn fk-btn-primary"
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </section>
        )}

        {/* Step 2: address */}
        {step === 2 && (
          <section className="fk-co-card">
            <h3>Delivery Address</h3>
            <div className="fk-form-grid">
              {field("name", "Full Name", { placeholder: "e.g. Aarav Sharma" })}
              {field("phone", "Mobile Number", { placeholder: "10-digit number" })}
              {field("pincode", "Pincode", { placeholder: "6-digit pincode" })}
              <div className="fk-field full">
                <label>Address (House no, Street, Area)</label>
                <input
                  value={address.line1}
                  onChange={(e) => set("line1", e.target.value)}
                  placeholder="Flat / House, Street, Landmark"
                />
                {errors.line1 && <span className="fk-err">{errors.line1}</span>}
              </div>
              {field("city", "City")}
              {field("state", "State")}
            </div>

            <div className="fk-type">
              <span>Address Type</span>
              {["Home", "Work", "Other"].map((t) => (
                <label key={t}>
                  <input
                    type="radio"
                    checked={address.type === t}
                    onChange={() => set("type", t)}
                  />
                  {t}
                </label>
              ))}
            </div>

            <div className="fk-co-btns">
              <button type="button" className="fk-btn fk-btn-outline" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                className="fk-btn fk-btn-primary"
                onClick={() => validateAddress() && setStep(3)}
              >
                Save and Deliver to this address
              </button>
            </div>
          </section>
        )}

        {/* Step 3: payment */}
        {step === 3 && (
          <section className="fk-co-card">
            <h3>Payment Method</h3>
            <div className="fk-pay">
              {PAYMENTS.map((p) => (
                <label key={p.id} className={payment === p.id ? "fk-payopt on" : "fk-payopt"}>
                  <input
                    type="radio"
                    name="pay"
                    checked={payment === p.id}
                    onChange={() => setPayment(p.id)}
                  />
                  <div>
                    <p>{p.label}</p>
                    <small>{p.note}</small>
                  </div>
                </label>
              ))}
            </div>

            <div className="fk-review">
              <h4>Order Review · {count} item{count === 1 ? "" : "s"}</h4>
              <ul>
                {items.map((i) => (
                  <li key={`${i.product._id}-${i.size}`}>
                    <img src={i.product.image} alt="" />
                    <span className="fk-rev-name">{i.product.name}</span>
                    <span>Qty {i.qty}</span>
                    <b>₹{formatINR(i.product.price * i.qty)}</b>
                  </li>
                ))}
              </ul>
            </div>

            <div className="fk-co-btns">
              <button type="button" className="fk-btn fk-btn-outline" onClick={() => setStep(2)}>
                Back
              </button>
              <button type="button" className="fk-btn fk-btn-buy" onClick={placeMyOrder}>
                Place Order · ₹{formatINR(total)}
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Price summary */}
      <aside className="fk-pricebox">
        <h3>PRICE DETAILS</h3>
        <div className="fk-price-row">
          <span>Price ({count})</span>
          <span>₹{formatINR(totalMrp)}</span>
        </div>
        <div className="fk-price-row discount">
          <span>Discount</span>
          <span>− ₹{formatINR(discount)}</span>
        </div>
        <div className="fk-price-row">
          <span>Delivery</span>
          <span>{delivery === 0 ? <span className="fk-off">FREE</span> : `₹${formatINR(delivery)}`}</span>
        </div>
        <div className="fk-price-row total">
          <span>Total</span>
          <span>₹{formatINR(total)}</span>
        </div>
        <p className="fk-savings">You save ₹{formatINR(discount + (delivery === 0 ? 40 : 0))} on this order</p>
      </aside>
    </div>
  );
}
