import React, { useEffect, useState } from "react";
import { Scale, Sparkles } from "lucide-react";
import api from "../services/api";

export default function Compare() {
  const [catalog, setCatalog] = useState([]);
  const [ids, setIds] = useState(["",""]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get("/products?limit=100").then(({data})=>setCatalog(data.products));
  }, []);

  const compare = async () => {
    const selected = ids.filter(Boolean);
    if (selected.length < 2) return;
    const {data} = await api.post("/ai/compare",{ids:selected});
    setResult(data);
  };

  return (
    <section className="page">
      <div className="section-head">
        <div>
          <h2>AI Product Comparison</h2>
          <p>Compare specifications, ratings and value side by side.</p>
        </div>
      </div>

      <div className="compare-selectors">
        {[0,1].map((index)=>(
          <select
            key={index}
            value={ids[index]}
            onChange={(e)=>{
              const next=[...ids];
              next[index]=e.target.value;
              setIds(next);
            }}
          >
            <option value="">Select product {index+1}</option>
            {catalog.map((product)=>(
              <option key={product._id} value={product._id}>{product.name}</option>
            ))}
          </select>
        ))}
        <button className="primary-btn" onClick={compare}>
          <Scale size={17}/> Compare Now
        </button>
      </div>

      {result && (
        <div className="compare-grid">
          {result.products.map((product)=>(
            <article className="compare-card" key={product._id}>
              <img src={product.image} alt={product.name}/>
              <h3>{product.name}</h3>
              <p>{product.brand} · {product.category}</p>
              <strong>₹{product.price.toLocaleString("en-IN")}</strong>
              <div className="rating large">★ {product.rating}</div>
              <div className="spec-list single">
                {Object.entries(product.specs || {}).map(([key,value])=>(
                  <div key={key}><span>{key}</span><b>{value}</b></div>
                ))}
              </div>
            </article>
          ))}

          <div className="comparison-result">
            <Sparkles/>
            <b>AI Recommendation</b>
            <p>{result.recommendation} is the strongest overall choice based on rating and available catalog data.</p>
          </div>
        </div>
      )}
    </section>
  );
}