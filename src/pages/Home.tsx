import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";

interface Product {
  id: number; name: string; name_ar?: string; description: string; description_ar?: string;
  price: number; image_url: string | null; preparation_time: number;
  stock_quantity: number; track_stock: number;
  seller: { id: number; shop_name: string; area: string; rating: number };
  category: { name: string; name_ar?: string; icon: string } | null;
}
interface Category { id: number; name: string; name_ar?: string; icon: string; }

export default function Home() {
  const { isArabic } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/api/categories").then(r => setCategories(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (selectedCategory) params.category_id = selectedCategory;
    if (search) params.search = search;
    api.get("/api/products/", { params }).then(r => setProducts(r.data)).finally(() => setLoading(false));
  }, [selectedCategory, search]);

  const getStockBadge = (product: Product) => {
    if (!product.track_stock || product.track_stock === 0) return null;
    const qty = product.stock_quantity;
    if (qty <= 0) return null;
    if (qty <= 3) return (
      <span className="inline-block bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full mt-1">
        🔥 {isArabic ? `${qty} متبقي فقط!` : `Only ${qty} left!`}
      </span>
    );
    if (qty <= 10) return (
      <span className="inline-block bg-yellow-50 text-yellow-700 text-xs px-2 py-0.5 rounded-full mt-1">
        ⚡ {isArabic ? `${qty} حصة متاحة` : `${qty} portions left`}
      </span>
    );
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          {isArabic
            ? <><span>أكل بيتي،</span> <span className="text-orange-500">يوصلك على بابك</span></>
            : <>Homemade food, <span className="text-orange-500">delivered to your door</span></>
          }
        </h1>
        <p className="text-gray-500 text-lg">{isArabic ? "ادعم الطباخين المنزليين في الإمارات" : "Support local home cooks across the UAE"}</p>
      </div>

      <div className="mb-6">
        <input type="text" placeholder={isArabic ? "ابحث عن أكلات، حلويات، منتجات..." : "Search for dishes, sweets, crafts..."} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-5 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white shadow-sm" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        <button onClick={() => setSelectedCategory(null)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${!selectedCategory ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"}`}>
          {isArabic ? "الكل" : "All"}
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === cat.id ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"}`}>
            {cat.icon} {isArabic && cat.name_ar ? cat.name_ar : cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (<div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"><div className="h-48 bg-gray-100" /><div className="p-4 space-y-2"><div className="h-4 bg-gray-100 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div></div>))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400"><div className="text-5xl mb-4">🍽️</div><p className="text-lg">{isArabic ? "لا توجد منتجات" : "No products found"}</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const displayName = isArabic && product.name_ar ? product.name_ar : product.name;
            const displayDesc = isArabic && product.description_ar ? product.description_ar : product.description;
            const displayCat = isArabic && product.category?.name_ar ? product.category.name_ar : product.category?.name;
            return (
              <Link key={product.id} to={`/product/${product.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
                <div className="h-48 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden relative">
                  {product.image_url ? <img src={product.image_url.startsWith("http") ? product.image_url : `https://web-production-63685.up.railway.app${product.image_url}`} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" /> : <span className="text-6xl">{product.category?.icon || "🍽️"}</span>}
                  {product.track_stock === 1 && product.stock_quantity >= 0 && product.stock_quantity <= 3 && product.stock_quantity > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      🔥 {isArabic ? `${product.stock_quantity} فقط` : `${product.stock_quantity} left`}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 leading-tight">{displayName}</h3>
                    <span className="text-orange-500 font-bold text-sm whitespace-nowrap">AED {product.price}</span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-2">{displayDesc}</p>
                  {getStockBadge(product)}
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                    <Link to={`/shop/${product.seller?.id}`} onClick={e => e.stopPropagation()} className="hover:text-orange-500 transition">🏠 {product.seller?.shop_name}</Link>
                    {product.seller?.rating > 0 && (
                      <span className="text-yellow-400 text-xs">{"★".repeat(Math.round(product.seller.rating))}{"☆".repeat(5 - Math.round(product.seller.rating))} {product.seller.rating}</span>
                    )}
                    <span>⏱ {product.preparation_time}{isArabic ? "د" : "min"}</span>
                  </div>
                  {displayCat && (
                    <div className="mt-2"><span className="inline-block bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded-full">{product.category?.icon} {displayCat}</span></div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
