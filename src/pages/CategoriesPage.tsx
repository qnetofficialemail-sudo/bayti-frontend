import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";

export default function CategoriesPage() {
  const { isArabic } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/categories"),
      api.get("/api/products/"),
    ]).then(([c, p]) => {
      setCategories(c.data);
      const countMap: Record<number, number> = {};
      p.data.forEach((prod: any) => {
        if (prod.category?.id) countMap[prod.category.id] = (countMap[prod.category.id] || 0) + 1;
      });
      setCounts(countMap);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{isArabic ? "تصفح الفئات" : "Browse Categories"}</h1>
      <p className="text-gray-500 mb-8">{isArabic ? "اكتشف ما يناسب ذوقك" : "Discover what suits your taste"}</p>
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
    </div>
  );
}
