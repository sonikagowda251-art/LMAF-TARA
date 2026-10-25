
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

// Demo, client-side auth backed by localStorage.
// The backend exposes /api/auth (register/login/me) — wire this
// context to those endpoints when you want real JWT sessions.

const USERS_KEY = "fk_users";
const SESSION_KEY = "fk_session";

const loadUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const signup = ({ name, email, phone, password }) => {
    const users = loadUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email === normalizedEmail)) {
      return { ok: false, message: "Email already registered" };
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      // NOTE: demo only — never store plain passwords in production
      password,
    };

    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    const safe = { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone };
    setUser(safe);
    return { ok: true, user: safe };
  };

  const login = ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = loadUsers().find(
      (u) => u.email === normalizedEmail && u.password === password
    );

    if (!found) {
      return { ok: false, message: "Invalid email or password" };
    }

    const safe = { id: found.id, name: found.name, email: found.email, phone: found.phone };
    setUser(safe);
    return { ok: true, user: safe };
  };

  const loginAsGuest = () => {
    setUser({
      id: "guest",
      name: "Guest",
      email: "",
      phone: "",
      guest: true,
    });
    return { ok: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{ user, login, signup, loginAsGuest, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
