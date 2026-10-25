
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "../Contexts/CartContext";
import { formatINR, deliveryFreeAt } from "../utils/data";

export default function Cart() {
  const {
    items, removeItem, setQty,
    totalPrice, totalMrp, discount, delivery, total, count,
  } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="fk-empty fk-page">
        <div className="fk-empty-cart">🛒</div>
        <h2>Your cart is empty!</h2>
        <p>Add items to it now.</p>
        <Link to="/search" className="fk-btn fk-btn-primary">
          Shop Now
        </Link>
      </div>
    );
  }

  const savings = discount;
  const toFreeDel = delivery > 0 ? deliveryFreeAt - totalPrice : 0;

  return (
    <div className="fk-cart">
      <div className="fk-cart-list">
        <h2>My Cart ({count})</h2>

        <div className="fk-cart-items">
          {items.map((i) => {
            const key = `${i.product._id}-${i.size}`;
            return (
              <div key={key} className="fk-cart-item">
                <Link to={`/product/${i.product._id}`} className="fk-cart-img">
                  <img src={i.product.image} alt={i.product.name} />
                </Link>

                <div className="fk-cart-info">
                  <Link to={`/product/${i.product._id}`} className="fk-cart-name">
                    {i.product.name}
                  </Link>
                  <p className="fk-cart-brand">{i.product.brand}</p>
                  {i.size && i.size !== "Free Size" && (
                    <p className="fk-cart-size">Size: <b>{i.size}</b></p>
                  )}

                  <div className="fk-cart-price">
                    <span className="fk-now">₹{formatINR(i.product.price)}</span>
                    {i.product.mrp > i.product.price && (
                      <>
                        <span className="fk-mrp">₹{formatINR(i.product.mrp)}</span>
                        <span className="fk-off">
                          {Math.round(((i.product.mrp - i.product.price) / i.product.mrp) * 100)}% off
                        </span>
                      </>
                    )}
                  </div>

                  <div className="fk-cart-ctrl">
                    <div className="fk-ctrl sm">
                      <button
                        type="button"
                        onClick={() => setQty(i.product._id, i.size, i.qty - 1)}
                        aria-label="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <b>{i.qty}</b>
                      <button
                        type="button"
                        onClick={() => setQty(i.product._id, i.size, i.qty + 1)}
                        aria-label="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="fk-remove"
                      onClick={() => removeItem(i.product._id, i.size)}
                    >
                      <Trash2 size={15} /> REMOVE
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {toFreeDel > 0 && (
          <p className="fk-freedel-hint">
            Add ₹{formatINR(toFreeDel)} more to get FREE delivery 🎉
          </p>
        )}
      </div>

      {/* Price details */}
      <aside className="fk-pricebox">
        <h3>PRICE DETAILS</h3>
        <div className="fk-price-row">
          <span>Price ({count} item{count === 1 ? "" : "s"})</span>
          <span>₹{formatINR(totalMrp)}</span>
        </div>
        <div className="fk-price-row discount">
          <span>Discount</span>
          <span>− ₹{formatINR(discount)}</span>
        </div>
        <div className="fk-price-row">
          <span>Delivery Charges</span>
          <span>
            {delivery === 0 ? (
              <>
                <s className="fk-mrp">₹40</s> <span className="fk-off">FREE</span>
              </>
            ) : (
              <>₹{formatINR(delivery)}</>
            )}
          </span>
        </div>
        <div className="fk-price-row total">
          <span>Total Amount</span>
          <span>₹{formatINR(total)}</span>
        </div>

        <p className="fk-savings">You will save ₹{formatINR(savings)} on this order</p>

        <button
          type="button"
          className="fk-btn fk-btn-buy fk-checkout"
          onClick={() => navigate("/checkout")}
        >
          PROCEED TO CHECKOUT
        </button>
      </aside>
    </div>
  );
}
