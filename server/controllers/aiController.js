import Product from "../models/Product.js";

function extractBudget(query){
  const match=query.replace(/,/g,"").match(/(?:under|below|within|₹)\s*(\d{3,7})/i);
  return match?Number(match[1]):null;
}
function score(product,words,budget){
  let s=0;
  const text=`${product.name} ${product.brand} ${product.category} ${product.description} ${(product.tags||[]).join(" ")}`.toLowerCase();
  words.forEach(w=>{if(w.length>2&&text.includes(w))s+=3;});
  if(budget&&product.price<=budget)s+=5;
  if(product.rating>=4.4)s+=2;
  return s;
}
async function groqAnswer(query,products){
  const key=process.env.GROQ_API_KEY;
  if(!key) return null;
  const response=await fetch("https://api.groq.com/openai/v1/chat/completions",{
    method:"POST",
    headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},
    body:JSON.stringify({
      model:"llama-3.1-8b-instant",
      temperature:0.35,
      messages:[
        {role:"system",content:"You are ShopSense AI. Recommend only from the provided product catalog. Be concise and practical."},
        {role:"user",content:`Query: ${query}\nProducts: ${JSON.stringify(products.map(p=>({name:p.name,price:p.price,rating:p.rating,category:p.category,brand:p.brand})))}`}
      ]
    })
  });
  if(!response.ok) return null;
  const data=await response.json();
  return data.choices?.[0]?.message?.content||null;
}
export async function assistant(req,res){
  const {query=""}=req.body;
  if(!query.trim()) return res.status(400).json({message:"Query is required"});
  const all=await Product.find().lean();
  const words=query.toLowerCase().replace(/[^\w\s]/g," ").split(/\s+/);
  const budget=extractBudget(query);
  const ranked=all.map(p=>({...p,_score:score(p,words,budget)})).filter(p=>p._score>0).sort((a,b)=>b._score-a._score||b.rating-a.rating).slice(0,6);
  const products=ranked.length?ranked:all.sort((a,b)=>b.rating-a.rating).slice(0,6);
  const ai=await groqAnswer(query,products);
  const answer=ai||`I found ${products.length} strong matches${budget?` within or close to your ₹${budget.toLocaleString("en-IN")} budget`:""}. I ranked them using product relevance, price and customer rating.`;
  res.json({answer,products});
}
export async function reviewSummary(req,res){
  const product=await Product.findById(req.params.id);
  if(!product) return res.status(404).json({message:"Product not found"});
  const comments=product.reviews?.map(r=>r.comment).filter(Boolean)||[];
  const summary=comments.length
    ? `Customers generally appreciate ${product.name} for value and everyday usability. Positive themes include ${comments.slice(0,2).join("; ")}. Check detailed specifications before purchase.`
    : `${product.name} has a ${product.rating}/5 rating. It appears to be a strong option in the ${product.category} category, especially for buyers prioritizing value and reliability.`;
  res.json({summary});
}
export async function compare(req,res){
  const {ids=[]}=req.body;
  const products=await Product.find({_id:{$in:ids.slice(0,3)}});
  res.json({products,recommendation:products.sort((a,b)=>b.rating-a.rating)[0]?.name||null});
}
