
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="pm-footer">
      <div className="pm-footer-inner">
        <div className="pm-footer-brand">
          <Link to="/" className="pm-footer-logo">
            <span className="fk-logo-word">
              LMAF<span className="fk-logo-word-2">TARA</span>
            </span>
          </Link>
          <p>Timeless by nature. Premium clothing crafted for every chapter, in every season.</p>
        </div>

        <div className="pm-footer-col">
          <h4>Shop</h4>
          <Link to="/collections">Winter</Link>
          <Link to="/collections">Summer</Link>
          <Link to="/collections">Rainy</Link>
          <Link to="/collections">Spring</Link>
        </div>

        <div className="pm-footer-col">
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/contact">Journal</Link>
          <Link to="/about">Careers</Link>
        </div>

        <div className="pm-footer-col">
          <h4>Help</h4>
          <Link to="/orders">Track Order</Link>
          <Link to="/orders">Shipping</Link>
          <Link to="/orders">Returns &amp; Exchanges</Link>
          <Link to="/contact">Support</Link>
          <Link to="/admin">Manage Products</Link>
        </div>

        <div className="pm-footer-col">
          <h4>Reach Us</h4>
          <a href="mailto:lmafindustries@gmail.com">lmafindustries@gmail.com</a>
          <a href="tel:+917338686529">+91 73386 86529</a>
          <a href="https://wa.me/917338686529" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
          <span className="pm-footer-text">Bangalore North, Karnataka</span>
        </div>
      </div>

      <div className="pm-footer-bottom">
        <p>© {new Date().getFullYear()} LMAF TARA — Timeless By Nature.</p>
        <p className="pm-footer-note">All prices in ₹ (INR). A premium clothing experience.</p>
      </div>
    </footer>
  );
}
