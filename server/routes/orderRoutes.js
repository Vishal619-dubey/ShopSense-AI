import { Router } from "express";
import {
  createOrder,
  myOrders,
  getOrder,
  allOrders,
  updateStatus
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();
router.post("/", protect, createOrder);
router.get("/mine", protect, myOrders);
router.get("/mine/:id", protect, getOrder);
router.get("/", protect, adminOnly, allOrders);
router.put("/:id/status", protect, adminOnly, updateStatus);

export default router;