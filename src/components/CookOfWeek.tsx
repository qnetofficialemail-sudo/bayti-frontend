import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";

export default function CookOfWeek() {
  const { isArabic } = useLanguage();
  const [cook, setCook] = useState<any>(null);

  useEffect(() => {
    api.get("/api/admin/cook-of-week").then(r => setCook(r.data)).catch(() => {});
  }, []);

  if (!cook) return null;

  const img = cook.sample_image_1 || cook.sample_image_2;
  const productImg = cook.best_product?.image_url;

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <span>⭐</span>
            <span>{isArabic ? "طاهية الأسبوع" : "Cook of the Week"}</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isArabic ? `نُسلّط الضوء على ${cook.shop_name}` : `Spotlight on ${cook.shop_name}`}
          </h2>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left - Cook info */}
            <div className="p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-orange-50 flex-shrink-0">
                    {img
                      ? <img src={img} alt={cook.shop_name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{cook.shop_name}</h3>
                    <p className="text-sm text-gray-500">📍 {cook.area}, {cook.city}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-yellow-400">{"★".repeat(Math.round(cook.rating))}{"☆".repeat(5 - Math.round(cook.rating))}</span>
                      <span className="text-sm font-medium text-gray-700">{cook.rating}</span>
                      <span className="text-xs text-gray-400">· {cook.total_orders} {isArabic ? "طلب" : "orders"}</span>
                    </div>
                  </div>
                </div>

                {cook.description && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">
                    "{cook.description}"
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-orange-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-orange-500">{cook.total_orders}+</p>
                    <p className="text-xs text-gray-500">{isArabic ? "طلب مكتمل" : "Orders completed"}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-500">{cook.rating} ⭐</p>
                    <p className="text-xs text-gray-500">{isArabic ? "تقييم العملاء" : "Customer rating"}</p>
                  </div>
                </div>
              </div>

              <Link to={`/shop/${cook.id}`}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-2xl text-center transition">
                {isArabic ? "🏠 زيارة المتجر" : "🏠 Visit Shop"}
              </Link>
            </div>

            {/* Right - Best product */}
            {cook.best_product && (
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-8 flex flex-col justify-between text-white">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-3">
                    {isArabic ? "🍽️ أشهر طبق" : "🍽️ Signature Dish"}
                  </p>
                  <div className="h-48 rounded-2xl overflow-hidden mb-4 bg-white bg-opacity-20">
                    {productImg
                      ? <img src={productImg} alt={cook.best_product.name}
                          className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>}
                  </div>
                  <h4 className="text-xl font-bold mb-2">
                    {isArabic && cook.best_product.name_ar ? cook.best_product.name_ar : cook.best_product.name}
                  </h4>
                  {cook.best_product.description && (
                    <p className="text-orange-100 text-sm line-clamp-3">{cook.best_product.description}</p>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-bold">AED {cook.best_product.price}</span>
                  <Link to={`/product/${cook.best_product.id}`}
                    className="bg-white text-orange-500 hover:bg-orange-50 font-semibold px-6 py-2 rounded-xl transition">
                    {isArabic ? "اطلب الآن" : "Order Now"}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
