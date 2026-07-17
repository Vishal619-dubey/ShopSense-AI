import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const stages = ["Placed","Processing","Shipped","Delivered"];

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) api.get("/orders/mine").then(({ data }) => setOrders(data));
  }, [user]);

  if (!user) {
    return <section className="page"><div className="empty">Please <Link to="/login">sign in</Link> to view orders.</div></section>;
  }

  return (
    <section className="page">
      <div className="section-head">
        <div><h2>My Orders</h2><p>Track deliveries and payment status.</p></div>
      </div>

      {!orders.length ? (
        <div className="empty">No orders placed yet.</div>
      ) : (
        <div className="order-list">
          {orders.map((order) => {
            const current = stages.indexOf(order.status);
            return (
              <div className="order-card detailed" key={order._id}>
                <div className="order-head">
                  <div>
                    <b>{order.orderNumber}</b>
                    <small>{new Date(order.createdAt).toLocaleString()}</small>
                  </div>
                  <span className="status">{order.status}</span>
                  <strong>₹{order.total.toLocaleString("en-IN")}</strong>
                </div>

                <div className="mini-items">
                  {order.items.slice(0,3).map((item)=>(
                    <div key={item._id}>
                      <img src={item.product?.image} alt=""/>
                      <span>{item.product?.name}<small>Qty {item.quantity}</small></span>
                    </div>
                  ))}
                </div>

                <div className="status-timeline compact">
                  {stages.map((stage,index)=>(
                    <div key={stage} className={index<=current?"done":""}>
                      <span>{index+1}</span><b>{stage}</b>
                    </div>
                  ))}
                </div>

                <p className="delivery-date">
                  Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString("en-IN")}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}