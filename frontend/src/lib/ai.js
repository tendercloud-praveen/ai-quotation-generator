import { getProducts } from './data';

// "AI" keyword matching engine — scores products against inquiry text.
export function aiMatch(text) {
  const t = (text || '').toLowerCase();
  const products = getProducts();
  if (!t.trim() || products.length === 0) return { confidence: 0, matches: [] };

  const tokens = t.split(/[^a-z0-9.]+/).filter(Boolean);
  const scored = products.map((p) => {
    const haystack = `${p.sku} ${p.name} ${p.category} ${p.description}`.toLowerCase();
    let score = 0;
    tokens.forEach((tok) => {
      if (tok.length < 2) return;
      if (haystack.includes(tok)) score += tok.length >= 4 ? 3 : 1;
      if (p.sku.toLowerCase().includes(tok)) score += 2;
      if (p.category.toLowerCase().includes(tok)) score += 2;
    });
    // boost for exact qty hints like "2 units"
    const qtyMatch = t.match(/(\d+)\s*(?:units?|nos?|pcs?|pieces?|sets?|pairs?|boxes?|litres?|kgs?|meters?)/);
    return { product: p, score, qty: qtyMatch ? parseInt(qtyMatch[1], 10) : 1 };
  }).filter((m) => m.score > 0).sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 5);
  const maxScore = top[0]?.score || 0;
  const confidence = maxScore > 0 ? Math.min(0.98, 0.5 + maxScore * 0.08) : 0;
  return { confidence, matches: top };
}

export function buildQuotationLines(matches) {
  return matches.map(({ product, qty }) => ({
    productId: product.id,
    sku: product.sku,
    name: product.name,
    unit: product.unit,
    qty,
    sellingPrice: product.sellingPrice,
    costPrice: product.costPrice,
    margin: (product.sellingPrice - product.costPrice) * qty,
    total: product.sellingPrice * qty,
  }));
}
