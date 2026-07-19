import React from "react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShoppingBag } from "lucide-react";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      mode === "login" ? await login(form.email, form.password) : await register(form.name, form.email, form.password);
      toast.success(mode === "login" ? "Welcome back" : "Account created");
      navigate("/");
    } catch (e) {
      toast.error(e.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand big"><span className="brand-mark"><ShoppingBag size={20}/></span><span>ShopSense <b>AI</b></span></div>
        <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        <p>Access personalized shopping and order tracking.</p>
        {mode === "register" && <input placeholder="Full name" value={form.name} onChange={(e) => setForm({...form, name:e.target.value})}/>}
        <input type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({...form, email:e.target.value})}/>
        <input type="password" minLength={mode === "register" ? 8 : undefined} placeholder={mode === "register" ? "Password (minimum 8 characters)" : "Password"} value={form.password} onChange={(e) => setForm({...form, password:e.target.value})}/>
        <button className="primary-btn full" disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button>
        <button type="button" className="link-btn" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </form>
    </section>
  );
}
