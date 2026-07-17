import crypto from "crypto";
import Razorpay from "razorpay";

function getClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

export async function createPaymentOrder(req, res) {
  const { amount } = req.body;
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ message: "Valid amount is required" });
  }

  const razorpay = getClient();
  if (!razorpay) {
    return res.json({
      demo: true,
      key: "demo",
      order: {
        id: `demo_${Date.now()}`,
        amount: Math.round(Number(amount) * 100),
        currency: "INR"
      }
    });
  }

  const order = await razorpay.orders.create({
    amount: Math.round(Number(amount) * 100),
    currency: "INR",
    receipt: `shopsense_${Date.now()}`
  });

  res.json({ demo: false, key: process.env.RAZORPAY_KEY_ID, order });
}

export async function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (String(razorpay_order_id || "").startsWith("demo_")) {
    return res.json({ verified: true, demo: true });
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({ verified: false, message: "Payment verification failed" });
  }

  res.json({ verified: true });
}