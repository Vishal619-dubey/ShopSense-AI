import {Router} from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import {protect,adminOnly} from "../middleware/auth.js";
const router=Router();
router.get("/stats",protect,adminOnly,async(req,res)=>{
  const [products,orders,users,revenueAgg]=await Promise.all([
    Product.countDocuments(),Order.countDocuments(),User.countDocuments(),
    Order.aggregate([{$group:{_id:null,total:{$sum:"$total"}}}])
  ]);
  res.json({products,orders,users,revenue:revenueAgg[0]?.total||0});
});
export default router;
