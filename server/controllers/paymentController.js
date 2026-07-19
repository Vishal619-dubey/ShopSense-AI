import crypto from "crypto";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import Product from "../models/Product.js";

function getClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

export async function createPaymentOrder(req, res) {
  const { items = [] } = req.body;
  if (!items.length) {
    return res.status(400).json({ message: "Cart items are required" });
  }

  let subtotal = 0;
  for (const item of items) {
    const product = await Product.findById(item.product).select("price stock");
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Invalid cart item" });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: "A product does not have enough stock" });
    }
    subtotal += product.price * quantity;
  }

  const amount = subtotal + (subtotal >= 999 ? 0 : 79);
  const amountInPaise = Math.round(amount * 100);

  const razorpay = getClient();
  if (!razorpay) {
    if (process.env.ALLOW_DEMO_PAYMENTS !== "true") {
      return res.status(503).json({ message: "Online payment is not configured" });
    }
    const orderId = `demo_${Date.now()}`;
    const paymentIntent = jwt.sign(
      { type: "payment-intent", userId: String(req.user._id), razorpay_order_id: orderId, amount: amountInPaise },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );
    return res.json({
      demo: true,
      key: "demo",
      order: {
        id: orderId,
        amount: amountInPaise,
        currency: "INR"
      },
      paymentIntent
    });
  }

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `shopsense_${Date.now()}`
  });

  const paymentIntent = jwt.sign(
    { type: "payment-intent", userId: String(req.user._id), razorpay_order_id: order.id, amount: amountInPaise },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );

  res.json({ demo: false, key: process.env.RAZORPAY_KEY_ID, order, paymentIntent });
}

export async function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentIntent } = req.body;
  let intent;
  try {
    intent = jwt.verify(paymentIntent, process.env.JWT_SECRET);
    if (
      intent.type !== "payment-intent" ||
      intent.userId !== String(req.user._id) ||
      intent.razorpay_order_id !== razorpay_order_id
    ) throw new Error("Payment intent mismatch");
  } catch {
    return res.status(400).json({ verified: false, message: "Valid payment intent is required" });
  }

  if (String(razorpay_order_id || "").startsWith("demo_")) {
    if (process.env.ALLOW_DEMO_PAYMENTS !== "true") {
      return res.status(400).json({ verified: false, message: "Demo payments are disabled" });
    }
    const paymentProof = jwt.sign(
      { userId: String(req.user._id), razorpay_order_id, razorpay_payment_id, amount: intent.amount, demo: true },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );
    return res.json({ verified: true, demo: true, paymentProof });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ verified: false, message: "Payment service is not configured" });
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({ verified: false, message: "Payment verification failed" });
  }

  const paymentProof = jwt.sign(
    { userId: String(req.user._id), razorpay_order_id, razorpay_payment_id, amount: intent.amount },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );

  res.json({ verified: true, paymentProof });
}
