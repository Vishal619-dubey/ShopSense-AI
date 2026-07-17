import React from "react";
import { createContext, useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("shopsense_cart") || "[]"));
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem("shopsense_wishlist") || "[]"));

  const saveCart = (next) => {
    setCart(next);
    localStorage.setItem("shopsense_cart", JSON.stringify(next));
  };

  const saveWishlist = (next) => {
    setWishlist(next);
    localStorage.setItem("shopsense_wishlist", JSON.stringify(next));
  };

  const addToCart = (product) => {
    const found = cart.find((item) => item.product._id === product._id);
    const next = found
      ? cart.map((item) => item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { product, quantity: 1 }];
    saveCart(next);
    toast.success("Added to cart");
  };

  const updateQty = (id, quantity) => {
    if (quantity <= 0) return removeFromCart(id);
    saveCart(cart.map((item) => item.product._id === id ? { ...item, quantity } : item));
  };

  const removeFromCart = (id) => saveCart(cart.filter((item) => item.product._id !== id));

  const toggleWishlist = (product) => {
    const exists = wishlist.some((item) => item._id === product._id);
    saveWishlist(exists ? wishlist.filter((item) => item._id !== product._id) : [...wishlist, product]);
    toast.success(exists ? "Removed from wishlist" : "Added to wishlist");
  };

  const clearCart = () => saveCart([]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  return (
    <ShopContext.Provider value={{
      cart, wishlist, total, addToCart, updateQty, removeFromCart,
      toggleWishlist, clearCart
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);
