import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, Grid2X2, Sparkles, ShoppingCart, Heart, Package, ShieldCheck, LogOut, Scale } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const { cart, wishlist } = useShop();
  const navigate = useNavigate();

  const nav = [
    ["/", "Home", Home],
    ["/products", "Products", Grid2X2],
    ["/assistant", "AI Assistant", Sparkles],
    ["/cart", `Cart (${cart.length})`, ShoppingCart],
    ["/wishlist", `Wishlist (${wishlist.length})`, Heart],
    ["/compare", "Compare", Scale],
    ["/orders", "Orders", Package]
  ];

  if (user?.role === "admin") nav.push(["/admin", "Admin", ShieldCheck]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span>🛍️</span> ShopSense <b>AI</b></div>
        <p className="tagline">Smart shopping, personalized by AI.</p>
        <nav>
          {nav.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? "active" : ""}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          {user ? (
            <>
              <div className="user-mini">
                <div className="avatar">{user.name?.[0]}</div>
                <div><strong>{user.name}</strong><small>{user.role}</small></div>
              </div>
              <button className="ghost-btn" onClick={() => { logout(); navigate("/"); }}>
                <LogOut size={16} /> Sign out
              </button>
            </>
          ) : (
            <button className="primary-btn" onClick={() => navigate("/login")}>Sign in</button>
          )}
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>ShopSense AI</h1>
            <p>Intelligent E-commerce Platform</p>
          </div>
          <button className="outline-btn" onClick={() => navigate("/assistant")}>
            <Sparkles size={16} /> Ask AI
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
