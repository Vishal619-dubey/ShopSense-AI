import React from "react";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
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
          <div className="orb">🤖</div>
          <div className="floating-card">🎧 <b>92% Match</b></div>
          <div className="shopping-bag">🛍️</div>
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
