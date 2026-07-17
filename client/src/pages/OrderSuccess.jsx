import React, { useEffect, useState } from "react";
import { CheckCircle2, PackageCheck } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "../services/api";

export default function OrderSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);

  useEffect(() => {
    if (!order) api.get(`/orders/mine/${id}`).then(({data})=>setOrder(data));
  }, [id, order]);

  if (!order) return <section className="page"><div className="empty">Loading order...</div></section>;

  return (
    <section className="page success-page">
      <div className="success-card">
        <CheckCircle2 size={62}/>
        <h2>Order placed successfully!</h2>
        <p>Thank you for shopping with ShopSense AI.</p>

        <div className="success-details">
          <div><span>Order ID</span><b>{order.orderNumber}</b></div>
          <div><span>Payment</span><b>{order.paymentMethod}</b></div>
          <div><span>Total</span><b>₹{order.total.toLocaleString("en-IN")}</b></div>
          <div><span>Estimated Delivery</span><b>{new Date(order.estimatedDelivery).toLocaleDateString("en-IN")}</b></div>
        </div>

        <div className="status-timeline">
          {["Placed","Processing","Shipped","Delivered"].map((status,index)=>(
            <div key={status} className={status==="Placed"?"done":""}>
              <span>{index+1}</span><b>{status}</b>
            </div>
          ))}
        </div>

        <div className="hero-actions">
          <Link className="primary-btn" to="/orders"><PackageCheck size={17}/> Track Order</Link>
          <Link className="outline-btn" to="/products">Continue Shopping</Link>
        </div>
      </div>
    </section>
  );
}