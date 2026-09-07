import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";
import api from "../api/client";

interface Product {
  id: number;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  price: number;
  image_url?: string;
  category?: { name: string; name_ar?: string };
  seller?: { shop_name: string; area?: string };
}

interface Recommendation {
  product_id: number;
  reason: string;
}

export default function AIPersonalShopper() {
  const { isArabic } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [asked, setAsked] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setRecommendations([]);
    setAsked(true);

    try {
      // Fetch all products
      const productsRes = await api.get("/api/products");
      const products: Product[] = productsRes.data;

      if (products.length === 0) {
        setError(isArabic ? "لا توجد منتجات متاحة حالياً" : "No products available right now");
        setLoading(false);
        return;
      }

      // Build product list for AI
      const productList = products.map((p: Product) => ({
        id: p.id,
        name: p.name,
        name_ar: p.name_ar,
        price: p.price,
        category: p.category?.name,
        seller: p.seller?.shop_name,
        area: p.seller?.area,
        description: p.description?.slice(0, 100),
      }));

      // Call backend AI endpoint
      const aiRes = await api.post("/api/ai/shopper", {
        query,
        products: productList,
      });
      const recs: Recommendation[] = aiRes.data.recommendations;

      // Match with product data
      const matched = recs.map((rec: Recommendation) => {
        const product = products.find((p: Product) => p.id === rec.product_id);
        return product ? { ...product, reason: rec.reason } : null;
      }).filter(Boolean);

      setRecommendations(matched);
    } catch (e) {
      setError(isArabic ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  };

  const imgUrl = (img?: string) => {
    if (!img) return null;
    return img.startsWith("http") ? img : `https://web-production-63685.up.railway.app${img}`;
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#FF5A1F] text-white px-4 py-3 rounded-2xl shadow-xl font-medium text-sm hover:bg-[#E04B14] transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <path d="M8 10h8M8 14h5" opacity="0.6"/>
        </svg>
        {isArabic ? "مساعد التسوق" : "AI Shopper"}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{background: "rgba(0,0,0,0.5)"}}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#FF5A1F] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{isArabic ? "مساعد التسوق الذكي" : "AI Personal Shopper"}</div>
                  <div className="text-orange-100 text-xs">{isArabic ? "أخبرني ماذا تحتاج" : "Tell me what you're looking for"}</div>
                </div>
              </div>
              <button onClick={() => { setOpen(false); setRecommendations([]); setQuery(""); setAsked(false); }}
                className="text-white opacity-70 hover:opacity-100 transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="p-5">
              {/* Example prompts */}
              {!asked && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">{isArabic ? "جرّب مثلاً:" : "Try asking:"}</p>
                  <div className="flex flex-wrap gap-2">
                    {(isArabic ? [
                      "هدية لأمي بميزانية 150 درهم",
                      "شمع عربي بعطر العود",
                      "إكسسوارات فضية للعروس",
                    ] : [
                      "Gift for my mom, budget AED 150",
                      "Arabic scented candles",
                      "Handmade jewelry for a wedding",
                    ]).map((ex, i) => (
                      <button key={i} onClick={() => setQuery(ex)}
                        className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition">
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2 mb-4">
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder={isArabic ? "أخبرني ماذا تحتاج..." : "What are you looking for?"}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  dir={isArabic ? "rtl" : "ltr"}
                />
                <button onClick={handleSearch} disabled={loading || !query.trim()}
                  className="bg-[#FF5A1F] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#E04B14] transition disabled:opacity-50">
                  {loading ? (
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3"/><path d="M21 12a9 9 0 00-9-9"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                  )}
                </button>
              </div>

              {/* Loading */}
              {loading && (
                <div className="text-center py-6">
                  <div className="text-2xl mb-2">🔍</div>
                  <p className="text-sm text-gray-500">{isArabic ? "جارٍ البحث عن أفضل المنتجات لك..." : "Finding the best products for you..."}</p>
                </div>
              )}

              {/* Error */}
              {error && <p className="text-sm text-red-500 text-center py-2">{error}</p>}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-3">{isArabic ? "🎯 اقتراحاتي لك:" : "🎯 My picks for you:"}</p>
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {recommendations.map((product: any, i: number) => (
                      <Link key={i} to={`/product/${product.id}`} onClick={() => setOpen(false)}
                        className="flex gap-3 p-3 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition group">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                          {imgUrl(product.image_url)
                            ? <img src={imgUrl(product.image_url)!} alt={product.name} className="w-full h-full object-cover"/>
                            : <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">
                            {isArabic && product.name_ar ? product.name_ar : product.name}
                          </div>
                          <div className="text-[#FF5A1F] font-semibold text-sm">AED {product.price}</div>
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{product.reason}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
