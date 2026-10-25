
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const OrdersContext = createContext(null);

const ORDERS_KEY = "fk_orders";

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  } catch {
    return [];
  }
};

const STATUS_FLOW = [
  "Order Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(load);

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const placeOrder = ({ items, amount, address, payment, user }) => {
    const order = {
      id: `OD${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      userId: user?.id ?? "guest",
      items: items.map((i) => ({
        productId: i.product._id,
        name: i.product.name,
        brand: i.product.brand,
        image: i.product.image,
        size: i.size,
        qty: i.qty,
        price: i.product.price,
        mrp: i.product.mrp || i.product.price,
      })),
      amount,
      address,
      payment,
      status: "Order Placed",
      statusHistory: [{ status: "Order Placed", at: new Date().toISOString() }],
    };

    setOrders((prev) => [order, ...prev]);
    return order;
  };

  const advanceStatus = (orderId) =>
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const idx = STATUS_FLOW.indexOf(o.status);
        if (idx >= STATUS_FLOW.length - 1) return o;
        const next = STATUS_FLOW[idx + 1];
        return {
          ...o,
          status: next,
          statusHistory: [
            ...o.statusHistory,
            { status: next, at: new Date().toISOString() },
          ],
        };
      })
    );

  const cancelOrder = (orderId) =>
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId && o.status !== "Delivered"
          ? { ...o, status: "Cancelled" }
          : o
      )
    );

  const myOrders = (userId) =>
    orders.filter((o) => (o.userId ?? "guest") === (userId ?? "guest"));

  return (
    <OrdersContext.Provider
      value={{ orders, placeOrder, advanceStatus, cancelOrder, myOrders, STATUS_FLOW }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used inside OrdersProvider");
  return ctx;
}
