import Order from "../models/Order.js";
import Product from "../models/Product.js";

function estimatedDate() {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d;
}

export async function createOrder(req, res) {
  const { items, shippingAddress, paymentMethod, paymentDetails } = req.body;

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

  let total = 0;
  const finalItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ message: "A product in your cart no longer exists" });
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }
    total += product.price * item.quantity;
    finalItems.push({ product: product._id, quantity: item.quantity, price: product.price });
  }

  for (const item of finalItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  const isOnline = paymentMethod === "Online Payment";

  const order = await Order.create({
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