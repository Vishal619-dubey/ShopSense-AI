import Order from "../models/Order.js";
import Product from "../models/Product.js";
import jwt from "jsonwebtoken";

function estimatedDate() {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d;
}

export async function createOrder(req, res) {
  const { items, shippingAddress, paymentMethod, paymentDetails, paymentProof } = req.body;

  if (!items?.length) return res.status(400).json({ message: "Cart is empty" });

  const required = ["name", "phone", "address", "city", "state", "pincode"];
  for (const field of required) {
    if (!shippingAddress?.[field]) {
      return res.status(400).json({ message: `${field} is required` });
    }
  }

  if (!/^[6-9]\d{9}$/.test(shippingAddress.phone)) {
    return res.status(400).json({ message: "Enter a valid 10-digit Indian phone number" });
  }

  if (!/^\d{6}$/.test(shippingAddress.pincode)) {
    return res.status(400).json({ message: "Enter a valid 6-digit PIN code" });
  }

  let subtotal = 0;
  const finalItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ message: "A product in your cart no longer exists" });
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Invalid product quantity" });
    }
    subtotal += product.price * quantity;
    finalItems.push({ product: product._id, quantity, price: product.price });
  }

  const deliveryCharge = subtotal >= 999 ? 0 : 79;
  const total = subtotal + deliveryCharge;

  const isOnline = paymentMethod === "Online Payment";

  if (isOnline) {
    try {
      const proof = jwt.verify(paymentProof, process.env.JWT_SECRET);
      if (
        proof.userId !== String(req.user._id) ||
        proof.razorpay_order_id !== paymentDetails?.razorpay_order_id ||
        proof.razorpay_payment_id !== paymentDetails?.razorpay_payment_id ||
        proof.amount !== Math.round(total * 100)
      ) {
        throw new Error("Payment reference mismatch");
      }
    } catch {
      return res.status(400).json({ message: "Verified payment proof is required" });
    }
  }

  const updatedProducts = [];
  for (const item of finalItems) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );
    if (!updated) {
      await Promise.all(updatedProducts.map((entry) =>
        Product.findByIdAndUpdate(entry.product, { $inc: { stock: entry.quantity } })
      ));
      return res.status(409).json({ message: "Stock changed during checkout. Please review your cart." });
    }
    updatedProducts.push(item);
  }

  let order;
  try {
    order = await Order.create({
      orderNumber: `SSA-${Date.now().toString().slice(-8)}`,
      user: req.user._id,
      items: finalItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: isOnline ? "paid" : "cod",
      razorpayOrderId: paymentDetails?.razorpay_order_id,
      razorpayPaymentId: paymentDetails?.razorpay_payment_id,
      total,
      estimatedDelivery: estimatedDate(),
      statusHistory: [{ status: "Placed" }]
    });
  } catch (error) {
    await Promise.all(updatedProducts.map((entry) =>
      Product.findByIdAndUpdate(entry.product, { $inc: { stock: entry.quantity } })
    ));

    if (error?.code === 11000 && error?.keyPattern?.razorpayPaymentId) {
      return res.status(409).json({ message: "This payment has already been used for an order" });
    }
    throw error;
  }

  res.status(201).json(await order.populate("items.product"));
}

export async function myOrders(req, res) {
  res.json(await Order.find({ user: req.user._id })
    .populate("items.product")
    .sort({ createdAt: -1 }));
}

export async function getOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    .populate("items.product");
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
}

export async function allOrders(req, res) {
  res.json(await Order.find()
    .populate("user", "name email")
    .populate("items.product")
    .sort({ createdAt: -1 }));
}

export async function updateStatus(req, res) {
  const allowed = ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"];
  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = req.body.status;
  order.statusHistory.push({ status: req.body.status, changedAt: new Date() });
  await order.save();

  res.json(await order.populate("user", "name email"));
}
