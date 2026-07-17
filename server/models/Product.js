import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true},
  brand:{type:String,required:true},
  category:{type:String,required:true,index:true},
  description:{type:String,required:true},
  price:{type:Number,required:true,min:0},
  originalPrice:{type:Number,default:0},
  stock:{type:Number,default:0},
  image:{type:String,required:true},
  images:[String],
  rating:{type:Number,default:4.5},
  reviewCount:{type:Number,default:0},
  reviews:[{user:String,rating:Number,comment:String}],
  specs:{type:Map,of:String,default:{}},
  tags:[String],
  aiMatch:{type:Number,default:88},
  featured:{type:Boolean,default:false}
},{timestamps:true});
productSchema.index({name:"text",brand:"text",category:"text",description:"text",tags:"text"});
export default mongoose.model("Product", productSchema);
