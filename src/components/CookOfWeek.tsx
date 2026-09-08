import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";

export default function SellerSpotlight() {
  const { isArabic } = useLanguage();
  const [cook, setCook] = useState<any>(null);

  useEffect(() => {
    api.get("/api/admin/cook-of-week").then(r => setCook(r.data)).catch(() => {});
  }, []);

  if (!cook) return null;

  const img = cook.sample_image_1 || cook.sample_image_2;
  const productImg = cook.best_product?.image_url;

  return (
    <section className="py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
          {/* Badge + seller info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-orange-100">
              {img
                ? <img src={img} alt={cook.shop_name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                  ⭐ {isArabic ? "بائع الأسبوع" : "Seller of the Week"}
                </span>
              </div>
              <p className="font-bold text-gray-900 text-sm truncate">{cook.shop_name}</p>
              <p className="text-xs text-gray-500">📍 {cook.area}, {cook.city} · {cook.rating}⭐ · {cook.total_orders} {isArabic ? "طلب" : "orders"}</p>
            </div>
          </div>

          {/* Best product */}
          {cook.best_product && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex-shrink-0">
                {productImg
                  ? <img src={productImg} alt={cook.best_product.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xl">🛍️</div>}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">{isArabic ? "أبرز منتج" : "Featured"}</p>
                <p className="text-sm font-semibold text-gray-900 truncate max-w-32">
                  {isArabic && cook.best_product.name_ar ? cook.best_product.name_ar : cook.best_product.name}
                </p>
                <p className="text-sm font-bold text-orange-500">AED {cook.best_product.price}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            {cook.best_product && (
              <Link to={`/product/${cook.best_product.id}`}
                className="bg-orange-500 hover:bg-orange-600 text-gray-900 text-xs font-semibold px-3 py-2 rounded-xl transition">
                {isArabic ? "اطلب" : "Order"}
              </Link>
            )}
            <Link to={`/shop/${cook.id}`}
              className="bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 text-xs font-semibold px-3 py-2 rounded-xl transition">
              {isArabic ? "المتجر" : "Visit Shop"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
