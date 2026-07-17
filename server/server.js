import "dotenv/config";
import express from "express";
import cors from "cors";
import {connectDB} from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app=express();
const allowed=(process.env.CLIENT_URL||"http://localhost:5173").split(",").map(x=>x.trim());
app.use(cors({origin:(origin,cb)=>!origin||allowed.includes(origin)?cb(null,true):cb(new Error("CORS blocked")),credentials:true}));
app.use(express.json({limit:"2mb"}));

app.get("/api/health",(req,res)=>res.json({success:true,message:"ShopSense AI API is running"}));
app.use("/api/auth",authRoutes);
app.use("/api/products",productRoutes);
app.use("/api/orders",orderRoutes);
app.use("/api/ai",aiRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/payments",paymentRoutes);
app.use("/api/uploads",uploadRoutes);

app.use((err,req,res,next)=>{console.error(err);res.status(500).json({message:err.message||"Server error"});});

const port=process.env.PORT||5000;
connectDB().then(()=>app.listen(port,()=>console.log(`ShopSense AI server running on ${port}`))).catch(e=>{console.error(e);process.exit(1);});
