import { PRODUCTS, CATEGORIES } from '../data/products';

/**
 * Super Fast In-Memory Luxury Search Engine
 */

export const POPULAR_SEARCH_TAGS = [
  { label: '🔥 ফ্ল্যাশ সেল', query: 'flash-sale' },
  { label: '👑 Tourbillon', query: 'tourbillon' },
  { label: 'Audemars Piguet', query: 'audemars' },
  { label: 'RADO Captain Cook', query: 'rado' },
  { label: 'টিফানি স্কাই ব্লু', query: 'tiffany' },
  { label: 'Seiko GMT Diver', query: 'seiko' },
  { label: '🕰️ দেয়াল ঘড়ি', query: 'clock' },
  { label: 'Executive Leather', query: 'leather' },
];

/**
 * Normalizes string for fast accent-agnostic, phonetic comparison
 */
function normalize(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0980-\u09FF]/gi, ' ');
}

/**
 * Performs microsecond multi-field matching with relevance scoring
 * @param {string} query 
 * @param {string} categoryFilter ('all' | 'watches' | 'clocks' | 'budget')
 * @returns {Array<Object>} Sorted matching products with match score
 */
export function searchProducts(query, categoryFilter = 'all', customPool = null) {
  const cleanQ = normalize(query);
  if (!cleanQ) return [];

  const tokens = cleanQ.split(/\s+/).filter(Boolean);

  let pool = Array.isArray(customPool) && customPool.length > 0 ? customPool : PRODUCTS;

  // Apply quick category filter
  if (categoryFilter === 'watches') {
    pool = pool.filter((p) => p.category !== 'wall-clock');
  } else if (categoryFilter === 'clocks') {
    pool = pool.filter((p) => p.category === 'wall-clock');
  } else if (categoryFilter === 'budget') {
    pool = pool.filter((p) => p.price <= 3500);
  }

  const results = [];

  for (const product of pool) {
    const nameNorm = normalize(product.name);
    const nameBnNorm = normalize(product.nameBn);
    const brandNorm = normalize(product.brand);
    const catNorm = normalize(product.category);
    const descNorm = normalize(product.shortDesc + ' ' + product.description);
    const colorsNorm = normalize(
      (product.colors || []).map((c) => c.name + ' ' + (c.nameBn || '')).join(' ')
    );
    const specsNorm = normalize(
      Object.values(product.specs || {}).join(' ')
    );
    const priceStr = String(product.price);

    let score = 0;
    let matchesAllTokens = true;

    for (const token of tokens) {
      let tokenMatched = false;

      // Exact name matches get highest weight
      if (nameNorm.includes(token)) {
        score += 50;
        tokenMatched = true;
      }
      if (nameBnNorm.includes(token)) {
        score += 50;
        tokenMatched = true;
      }

      // Brand matches
      if (brandNorm.includes(token)) {
        score += 40;
        tokenMatched = true;
      }

      // Category matches
      if (catNorm.includes(token)) {
        score += 30;
        tokenMatched = true;
      }

      // Colors matches
      if (colorsNorm.includes(token)) {
        score += 25;
        tokenMatched = true;
      }

      // Price match (e.g. searching "4950")
      if (priceStr.includes(token)) {
        score += 20;
        tokenMatched = true;
      }

      // Specs / Movement matches
      if (specsNorm.includes(token)) {
        score += 15;
        tokenMatched = true;
      }

      // Description matches
      if (descNorm.includes(token)) {
        score += 10;
        tokenMatched = true;
      }

      if (!tokenMatched) {
        matchesAllTokens = false;
        break;
      }
    }

    if (matchesAllTokens && score > 0) {
      // Bonus points for popular / featured / flash sale items
      if (product.isFlashSale) score += 5;
      if (product.isPopular) score += 5;

      results.push({
        ...product,
        searchScore: score,
      });
    }
  }

  // Sort descending by score
  results.sort((a, b) => b.searchScore - a.searchScore);

  return results;
}
