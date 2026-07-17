import React from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const wished = wishlist.some((item) => item._id === product._id);

  return (
    <article className="product-card">
      <button className={`icon-btn heart ${wished ? "selected" : ""}`} onClick={() => toggleWishlist(product)}>
        <Heart size={18} fill={wished ? "currentColor" : "none"} />
      </button>
      <Link to={`/products/${product._id}`} className="product-image-wrap">
        <img src={product.image} alt={product.name} className="product-image" />
      </Link>
      <span className="match-pill">{product.aiMatch || 88}% Match</span>
      <Link to={`/products/${product._id}`}><h3>{product.name}</h3></Link>
      <p className="muted">{product.brand} · {product.category}</p>
      <div className="rating">★ {product.rating || 4.5} <span>({product.reviewCount || 0})</span></div>
      <div className="price-row">
        <strong>₹{product.price.toLocaleString("en-IN")}</strong>
        {product.originalPrice > product.price && <del>₹{product.originalPrice.toLocaleString("en-IN")}</del>}
      </div>
      <button className="primary-btn full" onClick={() => addToCart(product)}>
        <ShoppingCart size={16} /> Add to cart
      </button>
    </article>
  );
}
