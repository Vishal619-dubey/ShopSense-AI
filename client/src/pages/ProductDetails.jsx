import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useShop } from "../context/ShopContext";
import { ShoppingCart, Heart, Sparkles } from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [summary, setSummary] = useState("");
  const { addToCart, toggleWishlist } = useShop();

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data));
  }, [id]);

  const getSummary = async () => {
    const { data } = await api.post(`/ai/review-summary/${id}`);
    setSummary(data.summary);
  };

  if (!product) return <section className="page"><div className="empty">Loading product...</div></section>;

  return (
    <section className="page">
      <div className="details-grid">
        <div className="detail-image"><img src={product.image} alt={product.name} /></div>
        <div className="detail-content">
          <span className="eyebrow">{product.category}</span>
          <h2>{product.name}</h2>
          <p className="muted">{product.brand}</p>
          <div className="rating large">★ {product.rating} ({product.reviewCount} reviews)</div>
          <div className="detail-price">₹{product.price.toLocaleString("en-IN")} <del>₹{product.originalPrice.toLocaleString("en-IN")}</del></div>
          <p>{product.description}</p>
          <div className="spec-list">
            {Object.entries(product.specs || {}).map(([k,v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}
          </div>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => addToCart(product)}><ShoppingCart size={17}/> Add to cart</button>
            <button className="outline-btn" onClick={() => toggleWishlist(product)}><Heart size={17}/> Wishlist</button>
          </div>
          <div className="ai-summary">
            <button className="ghost-btn" onClick={getSummary}><Sparkles size={16}/> Generate AI review summary</button>
            {summary && <p>{summary}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
