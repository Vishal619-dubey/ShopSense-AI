import React from "react";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, BrainCircuit, Check, Headphones, Laptop, Star } from "lucide-react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products?limit=8").then(({ data }) => setProducts(data.products || [])).catch(() => {});
  }, []);

  return (
    <section className="page">
      <div className="hero">
        <div>
          <span className="eyebrow"><Sparkles size={15} /> AI-powered recommendations</span>
          <h2>Smart shopping,<br /><span>personalized by AI.</span></h2>
          <p>Discover products that match your needs, budget and style—handpicked by intelligent recommendations.</p>
          <div className="hero-actions">
            <Link className="primary-btn" to="/assistant">Start Smart Shopping <ArrowRight size={16} /></Link>
            <Link className="outline-btn" to="/products">Browse Products</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="recommendation-console">
            <div className="console-head">
              <span><BrainCircuit size={18}/> AI Match Engine</span>
              <small><i/> Live</small>
            </div>
            <div className="console-query">Best tech under ₹50,000</div>
            <div className="match-row primary">
              <span className="product-glyph"><Laptop size={21}/></span>
              <span><b>ASUS VivoBook 15</b><small>Performance · Student choice</small></span>
              <strong>96%</strong>
            </div>
            <div className="match-row">
              <span className="product-glyph"><Headphones size={21}/></span>
              <span><b>Sony Wireless</b><small>Value · 50h battery</small></span>
              <strong>92%</strong>
            </div>
            <div className="console-foot"><Check size={14}/> Ranked using budget, rating and intent <Star size={14}/></div>
          </div>
        </div>
      </div>

      <div className="feature-strip">
        <div><Sparkles /><span><b>AI Product Assistant</b><small>Natural-language discovery</small></span></div>
        <div><TrendingUp /><span><b>Smart Recommendations</b><small>Personalized product matches</small></span></div>
        <div><ShieldCheck /><span><b>Secure Checkout</b><small>Safe demo order flow</small></span></div>
      </div>

      <div className="section-head">
        <div><h2>Top products for you</h2><p>AI-ranked picks from our catalog.</p></div>
        <Link to="/products">View all</Link>
      </div>
      <div className="product-grid">
        {products.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
    </section>
  );
}
