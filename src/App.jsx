
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";

import { CartProvider } from "./Contexts/CartContext";
import { WishlistProvider } from "./Contexts/WishlistContext";
import { AuthProvider } from "./Contexts/AuthContext";
import { OrdersProvider } from "./Contexts/OrdersContext";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";

import Home from "./Pages/Home";
import Products from "./Pages/Products";
import Collections from "./Pages/Collections";
import ProductDetail from "./Pages/ProductDetail";
import Cart from "./Pages/Cart";
import Checkout from "./Pages/Checkout";
import OrderSuccess from "./Pages/OrderSuccess";
import Orders from "./Pages/Orders";
import Wishlist from "./Pages/Wishlist";
import Login from "./Pages/Login";
import Account from "./Pages/Account";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import TrackReport from "./Pages/TrackReport";
import Admin from "./Pages/Admin";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <OrdersProvider>
            <div className="fk-app">
              <ScrollToTop />
              <Navbar />
              <div className="fk-shell">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Products />} />
                  <Route path="/shop" element={<Products />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/track" element={<TrackReport />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </div>
              <Footer />
            </div>
          </OrdersProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
