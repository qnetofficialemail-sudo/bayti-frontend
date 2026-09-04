import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";

const BADGE_CONFIG: Record<string, { label: string; labelAr: string; color: string; icon: string }> = {
  verified:  { label: "Verified",  labelAr: "موثق",  color: "bg-blue-50 text-blue-700 border-blue-200",     icon: "✔" },
  inspected: { label: "Inspected", labelAr: "مفتش",  color: "bg-purple-50 text-purple-700 border-purple-200", icon: "🔍" },
  certified: { label: "Certified", labelAr: "معتمد", color: "bg-green-50 text-green-700 border-green-200",   icon: "🏅" },
};

export default function SellerProfilePage() {
  const { id } = useParams();
  const { isArabic } = useLanguage();
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/api/sellers/${id}/public`),
      api.get("/api/products/", { params: { seller_id: id } }),
      api.get("/api/categories"),
      api.get(`/api/reviews/seller/${id}`),
    ]).then(([s, p, c, r]) => {
      setSeller(s.data);
      setProducts(p.data);
      setCategories(c.data);
      setReviews(r.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      {isArabic ? "جاري التحميل..." : "Loading..."}
    </div>
  );

  if (!seller) return (
    <div className="text-center py-20 text-gray-400">
      {isArabic ? "المتجر غير موجود" : "Shop not found"}
    </div>
  );

  const offeredCategoryIds = seller.categories_offered
    ? seller.categories_offered.split(",").map(Number)
    : [];
  const offeredCategories = categories.filter(c => offeredCategoryIds.includes(c.id));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-gray-500 hover:text-orange-500 mb-6 inline-block">
        {isArabic ? "→ رجوع" : "← Back"}
      </Link>

      {/* Shop header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl flex-shrink-0">
            🏠
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{seller.shop_name}</h1>
              {seller.badge && BADGE_CONFIG[seller.badge] && (
                <span className={`text-xs border px-2 py-0.5 rounded-full font-medium ${BADGE_CONFIG[seller.badge].color}`}>
                  {BADGE_CONFIG[seller.badge].icon} {isArabic ? BADGE_CONFIG[seller.badge].labelAr : BADGE_CONFIG[seller.badge].label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
              <span>📍 {seller.area}, {seller.city}</span>
              <span>⭐ {seller.rating}</span>
              <span>📦 {seller.total_orders} {isArabic ? "طلب" : "orders"}</span>
            </div>
            {seller.description && (
              <p className="text-gray-600 text-sm">{seller.description}</p>
            )}
          </div>
        </div>

        {/* Categories offered */}
        {offeredCategories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">{isArabic ? "يبيع" : "Sells"}</p>
            <div className="flex flex-wrap gap-2">
              {offeredCategories.map(cat => (
                <span key={cat.id} className="text-xs bg-orange-50 text-orange-700 px-3 py-1 rounded-full">
                  {cat.icon} {isArabic && cat.name_ar ? cat.name_ar : cat.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sample photos */}
        {(seller.sample_image_1 || seller.sample_image_2 || seller.sample_image_3) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">{isArabic ? "صور من المطبخ" : "From the kitchen"}</p>
            <div className="flex gap-3">
              {[seller.sample_image_1, seller.sample_image_2, seller.sample_image_3].filter(Boolean).map((img: string, i: number) => (
                <img key={i} src={img} alt={`Sample ${i + 1}`}
                  className="w-28 h-28 object-cover rounded-xl border border-gray-100" />
              ))}
            </div>
          </div>
        )}

        {/* Min order / delivery info */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-500">
          {seller.min_order_amount && (
            <span>🛒 {isArabic ? `الحد الأدنى للطلب: AED ${seller.min_order_amount}` : `Min order: AED ${seller.min_order_amount}`}</span>
          )}
          {seller.delivery_type && (
            <span>{seller.delivery_type === "self" ? "🏠" : "🚗"} {seller.delivery_type === "self" ? (isArabic ? "توصيل ذاتي" : "Self delivery") : (isArabic ? "توصيل بيتي" : "Bayti delivery")}</span>
          )}
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            ⭐ {isArabic ? "تقييمات العملاء" : "Customer Reviews"}
          </h2>
          <div className="space-y-3">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-lg ${s <= review.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{review.buyer_name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        {isArabic ? "منتجات المتجر" : "Shop Products"}
      </h2>

      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🍽️</div>
          <p>{isArabic ? "لا توجد منتجات بعد" : "No products yet"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => {
            const displayName = isArabic && product.name_ar ? product.name_ar : product.name;
            const displayDesc = isArabic && product.description_ar ? product.description_ar : product.description;
            return (
              <Link key={product.id} to={`/product/${product.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group border border-gray-100">
                <div className="h-40 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden">
                  {product.image_url
                    ? <img src={product.image_url.startsWith("http") ? product.image_url : `https://web-production-63685.up.railway.app${product.image_url}`}
                        alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    : <span className="text-5xl">{product.category?.icon || "🍽️"}</span>
                  }
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{displayName}</h3>
                    <span className="text-orange-500 font-bold text-sm whitespace-nowrap">AED {product.price}</span>
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-2">{displayDesc}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                    <span>{product.category?.icon} {isArabic && product.category?.name_ar ? product.category.name_ar : product.category?.name}</span>
                    <span>⏱ {product.preparation_time}{isArabic ? "د" : "min"}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
