
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, signup, loginAsGuest } = useAuth();

  const [mode, setMode] = useState("login"); // login | signup
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    setError("");

    if (mode === "login") {
      const res = login({ email: form.email, password: form.password });
      if (!res.ok) return setError(res.message);
    } else {
      if (!form.name.trim()) return setError("Please enter your name");
      if (!/^\d{10}$/.test(form.phone.replace(/\D/g, "")))
        return setError("Enter a valid 10-digit mobile number");
      if (form.password.length < 4)
        return setError("Password must be at least 4 characters");
      const res = signup(form);
      if (!res.ok) return setError(res.message);
    }
    navigate("/");
  };

  const guest = () => {
    loginAsGuest();
    navigate("/");
  };

  return (
    <div className="fk-auth fk-page">
      <div className="fk-auth-card">
        {/* Info panel */}
        <aside className="fk-auth-info">
          <h2>{mode === "login" ? "Login" : "Looks like you're new here!"}</h2>
          <p>
            {mode === "login"
              ? "Get access to your orders, wishlist and recommendations."
              : "Sign up to start your LMAF TARA journey."}
          </p>
          <div className="fk-auth-art">🛍️</div>
        </aside>

        {/* Form */}
        <div className="fk-auth-form">
          {error && <p className="fk-alert">{error}</p>}

          <form onSubmit={submit}>
            {mode === "signup" && (
              <div className="fk-field">
                <input
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
            )}

            <div className="fk-field">
              <input
                type="email"
                placeholder="Email or Mobile No."
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </div>

            {mode === "signup" && (
              <div className="fk-field">
                <input
                  placeholder="10-digit Mobile Number"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                />
              </div>
            )}

            <div className="fk-field">
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
              />
            </div>

            <p className="fk-muted fk-auth-terms">
              By continuing, you agree to LMAF TARA's Terms of Use and Privacy Policy.
            </p>

            <button type="submit" className="fk-btn fk-btn-buy fk-auth-btn">
              {mode === "login" ? "Login" : "Create Account"}
            </button>

            <button type="button" className="fk-btn fk-btn-ghost fk-auth-otp">
              Request OTP (demo)
            </button>
          </form>

          <button type="button" className="fk-link" onClick={guest}>
            Continue as Guest
          </button>

          <div className="fk-auth-switch">
            New customer?{" "}
            <button
              type="button"
              className="fk-link"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
            >
              {mode === "login" ? "Register" : "Login instead"}
            </button>
          </div>

          <p className="fk-auth-home">
            <Link to="/">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
