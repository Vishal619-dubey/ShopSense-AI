import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const tokenFor=(id)=>jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"7d"});
const publicUser=(u)=>({id:u._id,name:u.name,email:u.email,role:u.role});

export async function register(req,res){
  const name=String(req.body.name||"").trim();
  const email=String(req.body.email||"").trim().toLowerCase();
  const password=String(req.body.password||"");
  if(!name||!email||!password) return res.status(400).json({message:"All fields are required"});
  if(name.length<2||name.length>60) return res.status(400).json({message:"Enter a valid name"});
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({message:"Enter a valid email address"});
  if(password.length<8) return res.status(400).json({message:"Password must be at least 8 characters"});
  if(await User.findOne({email})) return res.status(409).json({message:"Email already registered"});
  const user=await User.create({name,email,password:await bcrypt.hash(password,10)});
  res.status(201).json({token:tokenFor(user._id),user:publicUser(user)});
}
export async function login(req,res){
  const email=String(req.body.email||"").trim().toLowerCase();
  const password=String(req.body.password||"");
  const user=await User.findOne({email});
  if(!user||!(await bcrypt.compare(password,user.password))) return res.status(401).json({message:"Invalid email or password"});
  res.json({token:tokenFor(user._id),user:publicUser(user)});
}
export async function profile(req,res){res.json(publicUser(req.user));}
