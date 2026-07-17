import React from "react";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  const load = async () => {
    const { data } = await api.get("/products", { params: { q, category, limit: 100 } });
    setProducts(data.products || []);
  };

  useEffect(() => { load(); }, [category]);

  return (
    <section className="page">
      <div className="section-head">
        <div><h2>Explore Products</h2><p>Search, filter and discover the right product.</p></div>
      </div>
      <div className="filters">
        <div className="search-box"><Search size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Search products or brands..." /></div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option>Electronics</option><option>Fashion</option><option>Accessories</option><option>Home</option>
        </select>
        <button className="primary-btn" onClick={load}>Search</button>
      </div>
      <div className="product-grid">
        {products.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
    </section>
  );
}
