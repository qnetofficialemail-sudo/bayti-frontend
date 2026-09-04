import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [sellerOpen, setSellerOpen] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/products/${id}`)
      .then(r => {
        setProduct(r.data);
        if (r.data?.seller?.id) {
          api.get(`/api/sellers/${r.data.seller.id}/status`)
            .then(s => setSellerOpen(s.data)).catch(() => {});
          api.get('/api/products/', { params: { seller_id: r.data.seller.id } })
            .then(rel => setRelated(rel.data.filter((p: any) => p.id !== Number(id)).slice(0, 3))).catch(() => {});
        }
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    setOrdering(true); setError("");
    try {
      await api.post("/api/orders/", {
        seller_id: product.seller.id,
        delivery_address: address,
        delivery_area: area,
        notes,
        items: [{ product_id: product.id, quantity }],
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || (isArabic ? "فشل الطلب. حاول مرة أخرى." : "Order failed. Try again."));
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">{isArabic ? "جاري التحميل..." : "Loading..."}</div>;
  if (!product) return null;

  const displayName = isArabic && product.name_ar ? product.name_ar : product.name;
  const displayDesc = isArabic && product.description_ar ? product.description_ar : product.description;
  const displayCat = isArabic && product.category?.name_ar ? product.category.name_ar : product.category?.name;
  const total = (product.price * quantity + 10).toFixed(2);

  if (success) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{isArabic ? "تم الطلب بنجاح!" : "Order placed!"}</h2>
      <p className="text-gray-500 mb-6">{isArabic ? `استلم ${product.seller.shop_name} طلبك وسيؤكده قريباً.` : `${product.seller.shop_name} has received your order.`}</p>
      <div className="flex gap-3 justify-center">
        <Link to="/orders" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition">
          {isArabic ? "تتبع الطلب" : "Track Order"}
        </Link>
        <Link to="/" className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition">
          {isArabic ? "تصفح المزيد" : "Browse More"}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-gray-500 hover:text-orange-500 mb-6 inline-block">
        {isArabic ? "→ رجوع" : "← Back"}
      </Link>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Info */}
        <div>
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 h-72 flex items-center justify-center mb-6">
            {product.image_url
              ? <img src={product.image_url.startsWith("http") ? product.image_url : `https://web-production-63685.up.railway.app${product.image_url}`} alt={displayName} className="w-full h-full object-cover" />
              : <span className="text-8xl">{product.category?.icon || "🍽️"}</span>
            }
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{displayName}</h1>
          <p className="text-gray-500 mb-4">{displayDesc}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span>⏱ {product.preparation_time} {isArabic ? "دقيقة تحضير" : "min prep"}</span>
            {product.category && <span>{product.category.icon} {displayCat}</span>}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <Link to={`/shop/${product.seller.id}`} className="text-sm text-gray-600 font-medium mb-1 hover:text-orange-500 transition block">🏠 {product.seller.shop_name}</Link>
            <p className="text-sm text-gray-500">📍 {product.seller.area}</p>
            <p className="text-sm text-gray-500">⭐ {product.seller.rating} · {product.seller.total_orders} {isArabic ? "طلب" : "orders"}</p>
          </div>
        </div>

        {/* Order Form */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">{isArabic ? "تقديم الطلب" : "Place Order"}</h2>
            <span className="text-2xl font-bold text-orange-500">AED {product.price}</span>
          </div>

          {/* Seller schedule status banner */}
          {sellerOpen && !sellerOpen.is_open && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
              <span>🔴</span>
              <span>
                {isArabic ? "لا تقبل طلبات الآن" : "Not accepting orders right now"}
                {sellerOpen.message ? ` · ${sellerOpen.message}` : ""}
              </span>
            </div>
          )}
          {sellerOpen && sellerOpen.is_open && sellerOpen.reason !== "always_open" && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
              <span>🟢</span>
              <span>{isArabic ? "تقبل الطلبات الآن" : "Accepting orders now"}</span>
              {sellerOpen.message ? <span className="text-green-600">· {sellerOpen.message}</span> : null}
            </div>
          )}

          {!user && (
            <div className="bg-orange-50 text-orange-700 text-sm px-4 py-3 rounded-xl mb-4">
              <Link to="/login" className="font-medium underline">{isArabic ? "سجل الدخول" : "Sign in"}</Link>
              {isArabic ? " لتقديم طلب" : " to place an order"}
            </div>
          )}
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

          <form onSubmit={handleOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الكمية" : "Quantity"}</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-lg transition">−</button>
                <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
                <button type="button" onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-lg transition">+</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "عنوان التوصيل" : "Delivery Address"}</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} required rows={2}
                placeholder={isArabic ? "المبنى، الشارع، رقم الشقة..." : "Building, street, flat number..."}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "المنطقة" : "Area"}</label>
              <input type="text" value={area} onChange={e => setArea(e.target.value)} required
                placeholder={isArabic ? "مثال: جي بي آر، وسط المدينة..." : "e.g. JBR, Downtown, Mirdif..."}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "ملاحظات (اختياري)" : "Notes (optional)"}</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                placeholder={isArabic ? "بدون بصل، حار جداً..." : "No onions, extra spicy..."}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>{isArabic ? "المجموع الفرعي" : "Subtotal"}</span>
                <span>AED {(product.price * quantity).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{isArabic ? "التوصيل" : "Delivery"}</span>
                <span>AED 10.00</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>{isArabic ? "الإجمالي" : "Total"}</span>
                <span>AED {total}</span>
              </div>
            </div>

            <button type="submit" disabled={!user || ordering || (sellerOpen && !sellerOpen.is_open)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-60">
              {ordering
                ? (isArabic ? "جاري تقديم الطلب..." : "Placing order...")
                : (isArabic ? `اطلب بـ AED ${total}` : `Order for AED ${total}`)
              }
            </button>
          </form>
        </div>
      </div>

      {/* More from this seller */}
      {related.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 pb-8 mt-6">
          <h3 className="font-bold text-gray-900 mb-4">
            {isArabic ? `المزيد من ${product?.seller?.shop_name}` : `More from ${product?.seller?.shop_name}`}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((p: any) => {
              const name = isArabic && p.name_ar ? p.name_ar : p.name;
              const imgUrl = p.image_url ? (p.image_url.startsWith("http") ? p.image_url : `https://web-production-63685.up.railway.app${p.image_url}`) : null;
              return (
                <Link key={p.id} to={`/product/${p.id}`}
                  className="flex gap-3 bg-white rounded-xl border border-gray-100 p-3 hover:border-orange-300 transition shadow-sm">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0 flex items-center justify-center">
                    {imgUrl ? <img src={imgUrl} alt={name} className="w-full h-full object-cover" /> : <span className="text-2xl">{p.category?.icon || "🍽️"}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{name}</p>
                    <p className="text-orange-500 font-bold text-sm">AED {p.price}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}