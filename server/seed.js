import "dotenv/config";
import bcrypt from "bcryptjs";
import {connectDB} from "./config/db.js";
import User from "./models/User.js";
import Product from "./models/Product.js";

const products=[
{name:"Sony WH-CH520 Wireless Headphones",brand:"Sony",category:"Electronics",description:"Lightweight wireless headphones with long battery life and clear everyday sound.",price:2999,originalPrice:5990,stock:28,image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",rating:4.6,reviewCount:2100,tags:["wireless","headphones","bluetooth","music"],aiMatch:92,featured:true,specs:{Battery:"50 hours",Connectivity:"Bluetooth",Weight:"147 g"}},
{name:"Noise ColorFit Pulse 3 Smart Watch",brand:"Noise",category:"Electronics",description:"Fitness smartwatch with heart-rate monitoring, notifications and bright display.",price:1699,originalPrice:3999,stock:35,image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",rating:4.4,reviewCount:3200,tags:["smartwatch","fitness","watch","health"],aiMatch:89,featured:true,specs:{Display:"1.96 inch",Battery:"7 days",Waterproof:"IP68"}},
{name:"ASUS VivoBook 15 Student Laptop",brand:"ASUS",category:"Electronics",description:"Reliable student laptop with fast SSD storage, full-size keyboard and efficient performance.",price:44990,originalPrice:59990,stock:12,image:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",rating:4.5,reviewCount:1100,tags:["laptop","student","college","work"],aiMatch:89,featured:true,specs:{Processor:"Intel Core i5",RAM:"8 GB",Storage:"512 GB SSD"}},
{name:"Logitech K380 Multi-Device Keyboard",brand:"Logitech",category:"Accessories",description:"Compact Bluetooth keyboard for laptops, tablets and phones.",price:2299,originalPrice:3495,stock:42,image:"https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",rating:4.3,reviewCount:7000,tags:["keyboard","bluetooth","work","portable"],aiMatch:88,specs:{Connectivity:"Bluetooth",Devices:"3",Layout:"Compact"}},
{name:"Puma Men's Running Shoes",brand:"Puma",category:"Fashion",description:"Comfortable daily running shoes with cushioned sole and breathable upper.",price:1999,originalPrice:3499,stock:22,image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",rating:4.2,reviewCount:2800,tags:["shoes","running","fitness","men"],aiMatch:86,specs:{Material:"Mesh",Sole:"Rubber",Use:"Running"}},
{name:"Skybags Brat 24L Laptop Backpack",brand:"Skybags",category:"Accessories",description:"Durable laptop backpack for college and office with organized compartments.",price:1199,originalPrice:1999,stock:40,image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",rating:4.4,reviewCount:12000,tags:["backpack","college","laptop","travel"],aiMatch:91,specs:{Capacity:"24 L",Laptop:"15.6 inch",Material:"Polyester"}},
{name:"JBL Go 3 Portable Speaker",brand:"JBL",category:"Electronics",description:"Compact waterproof Bluetooth speaker with punchy sound.",price:2499,originalPrice:3999,stock:31,image:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80",rating:4.5,reviewCount:5400,tags:["speaker","bluetooth","portable","music"],aiMatch:90,specs:{Battery:"5 hours",Waterproof:"IP67",Connectivity:"Bluetooth"}},
{name:"Portronics Toad Wireless Mouse",brand:"Portronics",category:"Accessories",description:"Ergonomic wireless mouse for study, office and daily use.",price:499,originalPrice:899,stock:60,image:"https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80",rating:4.2,reviewCount:6400,tags:["mouse","wireless","office","student"],aiMatch:85,specs:{DPI:"1600",Connectivity:"2.4 GHz",Battery:"AA"}}
];

await connectDB();
await Promise.all([Product.deleteMany({}),User.deleteMany({})]);
await Product.insertMany(products);
await User.create({name:"ShopSense Admin",email:"admin@shopsense.ai",password:await bcrypt.hash("Admin@123",10),role:"admin"});
console.log("Seed complete. Admin: admin@shopsense.ai / Admin@123");
process.exit(0);
