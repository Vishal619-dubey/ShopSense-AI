import React from "react";
import ProductCard from "../components/ProductCard";
import { useShop } from "../context/ShopContext";

export default function Wishlist() {
  const { wishlist } = useShop();
  return (
    <section className="page">
      <div className="section-head"><div><h2>Wishlist</h2><p>Your saved products.</p></div></div>
      {!wishlist.length ? <div className="empty">No saved products yet.</div> :
      <div className="product-grid">{wishlist.map((p) => <ProductCard key={p._id} product={p}/>)}</div>}
    </section>
  );
}
