import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, MapPin, ShieldCheck, Truck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

const initialAddress = {
  name: "",
  phone: "",
  address: "",
  landmark: "",
  city: "",
  state: "Uttar Pradesh",
  pincode: ""
};

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { user } = useAuth();
  const { cart, total, clearCart } = useShop();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ ...initialAddress, name: user?.name || "" });
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [placing, setPlacing] = useState(false);

  const delivery = total >= 999 ? 0 : 79;
  const grandTotal = useMemo(() => total + delivery, [total, delivery]);

  const validate = () => {
    if (!address.name || !address.phone || !address.address || !address.city || !address.state || !address.pincode) {
      toast.error("Please complete all required address fields");
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(address.phone)) {
      toast.error("Enter a valid 10-digit phone number");
      return false;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      toast.error("Enter a valid 6-digit PIN code");
      return false;
    }
    return true;
  };

  const createFinalOrder = async (paymentDetails = {}) => {
    const { data } = await api.post("/orders", {
      items: cart.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      shippingAddress: address,
      paymentMethod,
      paymentDetails
    });

    clearCart();
    navigate(`/order-success/${data._id}`, { state: { order: data } });
  };

  const placeOrder = async () => {
    if (!validate() || !cart.length) return;

    setPlacing(true);
    try {
      if (paymentMethod === "Cash on Delivery") {
        await createFinalOrder();
        return;
      }

      const { data } = await api.post("/payments/create-order", { amount: grandTotal });

      if (data.demo) {
        await createFinalOrder({
          razorpay_order_id: data.order.id,
          razorpay_payment_id: `demo_payment_${Date.now()}`
        });
        toast.success("Demo online payment completed");
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Unable to load Razorpay checkout");

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "ShopSense AI",
        description: "Order Payment",
        order_id: data.order.id,
        prefill: {
          name: address.name,
          contact: address.phone,
          email: user?.email
        },
        theme: { color: "#6547e7" },
        handler: async (response) => {
          await api.post("/payments/verify", response);
          await createFinalOrder(response);
        }
      };

      new window.Razorpay(options).open();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Checkout failed");
    } finally {
      setPlacing(false);
    }
  };

  if (!cart.length) {
    return <section className="page"><div className="empty">Your cart is empty.</div></section>;
  }

  return (
    <section className="page">
      <div className="section-head">
        <div>
          <h2>Secure Checkout</h2>
          <p>Complete your delivery and payment details.</p>
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          <div className="panel">
            <h3 className="panel-title"><MapPin size={19}/> Delivery Address</h3>
            <div className="form-grid">
              <label>Full Name*<input value={address.name} onChange={(e)=>setAddress({...address,name:e.target.value})}/></label>
              <label>Phone Number*<input value={address.phone} onChange={(e)=>setAddress({...address,phone:e.target.value.replace(/\D/g,"").slice(0,10)})}/></label>
              <label className="span-2">Address*<textarea value={address.address} onChange={(e)=>setAddress({...address,address:e.target.value})}/></label>
              <label className="span-2">Landmark<input value={address.landmark} onChange={(e)=>setAddress({...address,landmark:e.target.value})}/></label>
              <label>City*<input value={address.city} onChange={(e)=>setAddress({...address,city:e.target.value})}/></label>
              <label>State*<input value={address.state} onChange={(e)=>setAddress({...address,state:e.target.value})}/></label>
              <label>PIN Code*<input value={address.pincode} onChange={(e)=>setAddress({...address,pincode:e.target.value.replace(/\D/g,"").slice(0,6)})}/></label>
            </div>
          </div>

          <div className="panel">
            <h3 className="panel-title"><CreditCard size={19}/> Payment Method</h3>
            <label className={`payment-option ${paymentMethod==="Cash on Delivery"?"selected":""}`}>
              <input type="radio" checked={paymentMethod==="Cash on Delivery"} onChange={()=>setPaymentMethod("Cash on Delivery")}/>
              <span><b>Cash on Delivery</b><small>Pay when your order arrives</small></span>
            </label>
            <label className={`payment-option ${paymentMethod==="Online Payment"?"selected":""}`}>
              <input type="radio" checked={paymentMethod==="Online Payment"} onChange={()=>setPaymentMethod("Online Payment")}/>
              <span><b>Online Payment</b><small>Razorpay test mode or safe demo fallback</small></span>
            </label>
          </div>
        </div>

        <aside className="summary-card checkout-summary">
          <h3>Order Summary</h3>
          {cart.map(({product,quantity})=>(
            <div className="checkout-item" key={product._id}>
              <img src={product.image} alt={product.name}/>
              <span className="grow"><b>{product.name}</b><small>Qty: {quantity}</small></span>
              <strong>₹{(product.price*quantity).toLocaleString("en-IN")}</strong>
            </div>
          ))}
          <hr/>
          <div><span>Subtotal</span><b>₹{total.toLocaleString("en-IN")}</b></div>
          <div><span>Delivery</span><b>{delivery ? `₹${delivery}` : "Free"}</b></div>
          <hr/>
          <div><span>Total</span><strong>₹{grandTotal.toLocaleString("en-IN")}</strong></div>
          <button className="primary-btn full" disabled={placing} onClick={placeOrder}>
            {placing ? "Processing..." : `Place Order · ₹${grandTotal.toLocaleString("en-IN")}`}
          </button>
          <p className="secure-note"><ShieldCheck size={15}/> Secure checkout</p>
          <p className="secure-note"><Truck size={15}/> Estimated delivery in 4–6 days</p>
        </aside>
      </div>
    </section>
  );
}