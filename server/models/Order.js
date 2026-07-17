import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: Number,
    price: Number
  }],
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String
  },
  paymentMethod: { type: String, default: "Cash on Delivery" },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "cod"],
    default: "pending"
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  status: {
    type: String,
    enum: ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Placed"
  },
  total: { type: Number, required: true },
  estimatedDelivery: Date,
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);