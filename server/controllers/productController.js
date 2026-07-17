import Product from "../models/Product.js";

export async function listProducts(req,res){
  const {q="",category="",limit=20,page=1}=req.query;
  const filter={};
  if(q) filter.$or=[
    {name:{$regex:q,$options:"i"}},{brand:{$regex:q,$options:"i"}},
    {description:{$regex:q,$options:"i"}},{tags:{$regex:q,$options:"i"}}
  ];
  if(category) filter.category=category;
  const products=await Product.find(filter).sort({featured:-1,createdAt:-1}).limit(Number(limit)).skip((Number(page)-1)*Number(limit));
  const total=await Product.countDocuments(filter);
  res.json({products,total,page:Number(page)});
}
export async function getProduct(req,res){
  const product=await Product.findById(req.params.id);
  if(!product) return res.status(404).json({message:"Product not found"});
  res.json(product);
}
export async function createProduct(req,res){
  const product=await Product.create(req.body);
  res.status(201).json(product);
}
export async function updateProduct(req,res){
  const product=await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
  if(!product) return res.status(404).json({message:"Product not found"});
  res.json(product);
}
export async function deleteProduct(req,res){
  const product=await Product.findByIdAndDelete(req.params.id);
  if(!product) return res.status(404).json({message:"Product not found"});
  res.json({message:"Product deleted"});
}
