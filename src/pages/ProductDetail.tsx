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
      .then(r => setProduct(r.data))
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
              ? <img src={`https://web-production-63685.up.railway.app${product.image_url}`} alt={displayName} className="w-full h-full object-cover" />
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
            <p className="text-sm text-gray-600 font-medium mb-1">🏠 {product.seller.shop_name}</p>
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

            <button type="submit" disabled={!user || ordering}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-60">
              {ordering
                ? (isArabic ? "جاري تقديم الطلب..." : "Placing order...")
                : (isArabic ? `اطلب بـ AED ${total}` : `Order for AED ${total}`)
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
