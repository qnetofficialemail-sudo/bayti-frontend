import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import SEO from "../components/SEO";
import { useLanguage } from "../context/LanguageContext";

export default function CategoriesPage() {
  const { isArabic } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/categories")
      .then(c => setCategories(c.data.filter((cat: any) => cat.is_active !== false)))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
    api.get("/api/products?limit=200")
      .then(p => {
        const prods = Array.isArray(p.data) ? p.data : p.data.items || [];
        const countMap: Record<number, number> = {};
        prods.forEach((prod: any) => {
          const catId = prod.category_id || prod.category?.id;
          if (catId) countMap[catId] = (countMap[catId] || 0) + 1;
        });
        setCounts(countMap);
      })
      .catch(() => {});
  }, []);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SEO title={isArabic ? 'الفئات | بيتي' : 'Categories | Bayti'} description={isArabic ? 'اكتشف جميع فئات المنتجات المحلية' : 'Discover all local product categories in UAE'} />
      <div className="h-8 bg-gray-100 rounded-xl w-48 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-100 rounded-xl w-64 mb-8 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 text-center animate-pulse">
            <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3" />
            <div className="h-4 bg-gray-100 rounded w-20 mx-auto mb-1" />
            <div className="h-3 bg-gray-100 rounded w-12 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{isArabic ? "تصفح الفئات" : "Browse Categories"}</h1>
      <p className="text-gray-500 mb-8">{isArabic ? "اكتشف ما يناسب ذوقك" : "Discover what suits your taste"}</p>
      {categories.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📦</div>
          <p>{isArabic ? "لا توجد فئات متاحة حالياً" : "No categories available yet"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <Link key={cat.id} to={`/marketplace?category=${cat.id}`}
              className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:border-orange-300 hover:shadow-md transition group">
              <div className="text-5xl mb-3">{cat.icon}</div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {isArabic && cat.name_ar ? cat.name_ar : cat.name}
              </h3>
              <p className="text-xs text-orange-500 font-medium">
                {counts[cat.id] || 0} {isArabic ? "منتج" : "products"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
