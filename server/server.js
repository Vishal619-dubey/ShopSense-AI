import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import {connectDB} from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app=express();
if(!process.env.JWT_SECRET){
  throw new Error("JWT_SECRET is required");
}
const allowed=(process.env.CLIENT_URL||"http://localhost:5173").split(",").map(x=>x.trim());
app.set("trust proxy",1);
app.use(helmet());
app.use(cors({origin:(origin,cb)=>!origin||allowed.includes(origin)?cb(null,true):cb(new Error("CORS blocked")),credentials:true}));
app.use(express.json({limit:"2mb"}));
app.use("/api",rateLimit({windowMs:15*60*1000,limit:300,standardHeaders:"draft-7",legacyHeaders:false}));
app.use("/api/auth",rateLimit({windowMs:15*60*1000,limit:30,standardHeaders:"draft-7",legacyHeaders:false}));

app.get("/api/health",(req,res)=>res.json({success:true,message:"ShopSense AI API is running"}));
app.use("/api/auth",authRoutes);
app.use("/api/products",productRoutes);
app.use("/api/orders",orderRoutes);
app.use("/api/ai",aiRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/payments",paymentRoutes);
app.use("/api/uploads",uploadRoutes);

app.use((err,req,res,next)=>{
  console.error(err);
  const status=err.status||500;
  res.status(status).json({message:status===500?"Internal server error":err.message});
});

const port=process.env.PORT||5000;
connectDB().then(()=>app.listen(port,()=>console.log(`ShopSense AI server running on ${port}`))).catch(e=>{console.error(e);process.exit(1);});
