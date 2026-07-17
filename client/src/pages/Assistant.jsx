import React from "react";
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

export default function Assistant() {
  const [query, setQuery] = useState("Best wireless headphones under ₹3000");
  const [answer, setAnswer] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/ai/assistant", { query });
      setAnswer(data.answer);
      setProducts(data.products || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <div className="assistant-hero">
        <Sparkles size={34} />
        <h2>AI Shopping Assistant</h2>
        <p>Describe what you need in normal language. ShopSense AI will search and rank matching products.</p>
        <div className="assistant-input">
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()} />
          <button onClick={ask}><Send size={19}/></button>
        </div>
        <div className="chips">
          {["Laptop for students under 50000", "Smartwatch for fitness", "Best value keyboard"].map((x) => <button key={x} onClick={() => setQuery(x)}>{x}</button>)}
        </div>
      </div>
      {loading && <div className="empty">ShopSense AI is analyzing the catalog...</div>}
      {answer && <div className="answer-card"><Sparkles/><p>{answer}</p></div>}
      <div className="product-grid">{products.map((p) => <ProductCard key={p._id} product={p}/>)}</div>
    </section>
  );
}
