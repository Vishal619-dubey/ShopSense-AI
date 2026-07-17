import React, { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const blank = {
  name:"", brand:"", category:"Electronics", price:"",
  originalPrice:"", stock:"", image:"", description:""
};
const statuses = ["Placed","Processing","Shipped","Delivered","Cancelled"];

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(blank);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const [{data:s}, {data:p}, {data:o}] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/products?limit=100"),
      api.get("/orders")
    ]);
    setStats(s); setProducts(p.products); setOrders(o);
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post("/products", {
      ...form,
      price:Number(form.price),
      originalPrice:Number(form.originalPrice || form.price),
      stock:Number(form.stock)
    });
    setForm(blank);
    toast.success("Product created");
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    toast.success("Product deleted");
    load();
  };

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const {data} = await api.post("/uploads/image", body, {
        headers: {"Content-Type":"multipart/form-data"}
      });
      setForm({...form,image:data.url});
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed. Paste an image URL instead.");
    } finally {
      setUploading(false);
    }
  };

  const changeStatus = async (id,status) => {
    await api.put(`/orders/${id}/status`,{status});
    toast.success("Order status updated");
    load();
  };

  return (
    <section className="page">
      <div className="section-head">
        <div><h2>Admin Dashboard</h2><p>Manage products, inventory and order fulfillment.</p></div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div><span>Products</span><b>{stats.products}</b></div>
          <div><span>Orders</span><b>{stats.orders}</b></div>
          <div><span>Users</span><b>{stats.users}</b></div>
          <div><span>Revenue</span><b>₹{stats.revenue.toLocaleString("en-IN")}</b></div>
        </div>
      )}

      <div className="admin-grid">
        <form className="panel" onSubmit={create}>
          <h3>Add Product</h3>
          <input placeholder="Product name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/>
          <input placeholder="Brand" value={form.brand} onChange={(e)=>setForm({...form,brand:e.target.value})}/>
          <input placeholder="Category" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}/>
          <input placeholder="Price" value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})}/>
          <input placeholder="Original price" value={form.originalPrice} onChange={(e)=>setForm({...form,originalPrice:e.target.value})}/>
          <input placeholder="Stock" value={form.stock} onChange={(e)=>setForm({...form,stock:e.target.value})}/>
          <input placeholder="Image URL" value={form.image} onChange={(e)=>setForm({...form,image:e.target.value})}/>
          <label className="upload-box">
            {uploading ? "Uploading..." : "Upload product image"}
            <input type="file" accept="image/*" hidden onChange={(e)=>uploadImage(e.target.files?.[0])}/>
          </label>
          {form.image && <img className="image-preview" src={form.image} alt="Preview"/>}
          <textarea placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
          <button className="primary-btn full">Create Product</button>
        </form>

        <div className="panel">
          <h3>Catalog</h3>
          <div className="admin-products">
            {products.map((p)=>(
              <div key={p._id}>
                <img src={p.image} alt=""/>
                <span className="grow">
                  <b>{p.name}</b>
                  <small>₹{p.price} · Stock {p.stock}</small>
                </span>
                <button onClick={()=>remove(p._id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel order-admin-panel">
        <h3>Order Management</h3>
        <div className="admin-orders">
          {orders.map((o)=>(
            <div className="admin-order" key={o._id}>
              <div><b>{o.orderNumber}</b><small>{o.user?.name} · {o.user?.email}</small></div>
              <div><span>₹{o.total.toLocaleString("en-IN")}</span><small>{o.paymentMethod}</small></div>
              <select value={o.status} onChange={(e)=>changeStatus(o._id,e.target.value)}>
                {statuses.map((s)=><option key={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}