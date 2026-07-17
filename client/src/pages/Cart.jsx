import React from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Cart() {
  const { cart, total, updateQty, removeFromCart, clearCart } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();

  const checkout = () => {
    if (!user) return navigate("/login");
    if (!cart.length) return;
    navigate("/checkout");
  };

  return (
    <section className="page">
      <div className="section-head"><div><h2>Your Cart</h2><p>{cart.length} product(s)</p></div></div>
      {!cart.length ? <div className="empty">Your cart is empty.</div> :
      <div className="cart-layout">
        <div className="cart-list">
          {cart.map(({ product, quantity }) => (
            <div className="cart-item" key={product._id}>
              <img src={product.image} alt={product.name}/>
              <div className="grow"><h3>{product.name}</h3><p>₹{product.price.toLocaleString("en-IN")}</p></div>
              <div className="qty"><button onClick={() => updateQty(product._id, quantity - 1)}><Minus size={14}/></button><span>{quantity}</span><button onClick={() => updateQty(product._id, quantity + 1)}><Plus size={14}/></button></div>
              <button className="icon-btn" onClick={() => removeFromCart(product._id)}><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
        <div className="summary-card">
          <h3>Order Summary</h3>
          <div><span>Subtotal</span><b>₹{total.toLocaleString("en-IN")}</b></div>
          <div><span>Delivery</span><b>Free</b></div>
          <hr/>
          <div><span>Total</span><strong>₹{total.toLocaleString("en-IN")}</strong></div>
          <button className="primary-btn full" onClick={checkout}>Proceed to Checkout</button>
        </div>
      </div>}
    </section>
  );
}
