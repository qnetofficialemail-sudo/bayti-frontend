import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const STATUS_COLORS: Record<string, string> = { pending: "bg-yellow-50 text-yellow-700", confirmed: "bg-blue-50 text-blue-700", preparing: "bg-purple-50 text-purple-700", ready: "bg-green-50 text-green-700", delivering: "bg-orange-50 text-orange-700", delivered: "bg-gray-50 text-gray-600", cancelled: "bg-red-50 text-red-600" };
const NEXT_STATUS: Record<string, string> = { pending: "confirmed", confirmed: "preparing", preparing: "ready", ready: "delivering", delivering: "delivered" };
const STATUS_AR: Record<string, string> = { pending: "قيد الانتظار", confirmed: "مؤكد", preparing: "جاري التحضير", ready: "جاهز", delivering: "في الطريق", delivered: "تم التوصيل", cancelled: "ملغي" };
const NEXT_STATUS_AR: Record<string, string> = { pending: "تأكيد", confirmed: "بدء التحضير", preparing: "جاهز", ready: "في الطريق", delivering: "تم التوصيل" };

export default function SellerDashboard() {
  const { user } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"orders"|"products">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [restockId, setRestockId] = useState<number | null>(null);
  const [restockQty, setRestockQty] = useState("10");

  useEffect(() => {
    if (!user || user.role !== "seller") { navigate("/login"); return; }
    Promise.all([api.get("/api/orders/my"), api.get("/api/sellers/")]).then(([o, s]) => {
      setOrders(o.data);
      const myProfile = s.data.find((sel: any) => sel.user?.id === user.id);
      setProfile(myProfile);
      if (myProfile) { api.get("/api/products/").then(p => { setProducts(p.data.filter((prod: any) => prod.seller?.id === myProfile.id)); }); }
    }).finally(() => setLoading(false));
  }, [user]);

  const advanceOrder = async (orderId: number, nextStatus: string) => {
    await api.patch(`/api/orders/${orderId}/status`, null, { params: { status: nextStatus } });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
  };

  const toggleProduct = async (productId: number, currentlyAvailable: boolean) => {
    const form = new FormData();
    form.append("is_available", String(!currentlyAvailable));
    await api.put(`/api/products/${productId}`, form, { headers: { "Content-Type": "multipart/form-data" } });
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_available: !currentlyAvailable } : p));
  };

  const handleRestock = async (productId: number) => {
    const qty = parseInt(restockQty);
    if (!qty || qty < 1) return;
    await api.patch(`/api/products/${productId}/restock`, null, { params: { quantity: qty } });
    setProducts(prev => prev.map(p => p.id === productId ? {
      ...p,
      stock_quantity: (p.stock_quantity === -1 ? qty : p.stock_quantity + qty),
      is_available: true,
      track_stock: 1
    } : p));
    setRestockId(null);
    setRestockQty("10");
  };

  const getStockBadge = (product: any) => {
    if (!product.track_stock) return null;
    const qty = product.stock_quantity;
    if (qty === 0) return <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{isArabic ? "نفد" : "Out"}</span>;
    if (qty <= 3) return <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">{isArabic ? `${qty} متبقي` : `${qty} left`}</span>;
    return <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{isArabic ? `${qty} متاح` : `${qty} in stock`}</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">{isArabic ? "جاري التحميل..." : "Loading..."}</div>;
  const pendingCount = orders.filter(o => o.status === "pending").length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {profile?.shop_name || (isArabic ? "متجري" : "My Shop")}
            {!profile?.is_approved && <span className="ml-3 text-sm bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-normal">{isArabic ? "قيد المراجعة" : "Pending approval"}</span>}
          </h1>
          <p className="text-gray-500 text-sm mt-1">📍 {profile?.area}, {profile?.city}</p>
        </div>
        <Link to="/seller/products/new" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
          {isArabic ? "+ إضافة منتج" : "+ Add Product"}
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: isArabic ? "إجمالي الطلبات" : "Total Orders", value: profile?.total_orders || 0, icon: "📦" },
          { label: isArabic ? "طلبات جديدة" : "New Orders", value: pendingCount, icon: "🔔", highlight: pendingCount > 0 },
          { label: isArabic ? "التقييم" : "Rating", value: `${profile?.rating || 0} ⭐`, icon: "⭐" },
        ].map(stat => (
          <div key={stat.label} className={`bg-white rounded-2xl p-5 border ${(stat as any).highlight ? "border-orange-300" : "border-gray-100"} shadow-sm`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {(["orders", "products"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition ${tab === t ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"}`}>
            {t === "orders"
              ? (isArabic ? `الطلبات${pendingCount > 0 ? ` (${pendingCount})` : ""}` : `Orders${pendingCount > 0 ? ` (${pendingCount})` : ""}`)
              : (isArabic ? "منتجاتي" : "My Products")}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400"><div className="text-4xl mb-3">📭</div><p>{isArabic ? "لا توجد طلبات بعد." : "No orders yet."}</p></div>
          ) : orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-semibold text-gray-900">{isArabic ? "طلب" : "Order"} #{order.id}</span>
                  <span className={`ml-3 text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>{isArabic ? STATUS_AR[order.status] : order.status}</span>
                </div>
                <span className="font-bold text-gray-900">AED {(order.total_amount + order.delivery_fee).toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-500 mb-2">👤 {order.buyer?.full_name} · 📍 {order.delivery_area}</div>
              <div className="text-sm text-gray-600 mb-3">{order.items?.map((item: any) => `${item.quantity}x ${item.product?.name}`).join(", ")}</div>
              {NEXT_STATUS[order.status] && (
                <button onClick={() => advanceOrder(order.id, NEXT_STATUS[order.status])} className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition font-medium">
                  {isArabic ? `تحديد كـ ${NEXT_STATUS_AR[order.status]}` : `Mark as ${NEXT_STATUS[order.status]}`}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "products" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {products.length === 0 && (
            <div className="col-span-2 text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">🍳</div>
              <p>{isArabic ? "لا توجد منتجات بعد." : "No products yet."}</p>
              <Link to="/seller/products/new" className="text-orange-500 hover:underline text-sm mt-2 inline-block">{isArabic ? "أضف منتجك الأول" : "Add your first product"}</Link>
            </div>
          )}
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-3xl overflow-hidden">
                  {product.image_url ? <img src={`http://localhost:8000${product.image_url}`} alt={product.name} className="w-full h-full object-cover rounded-xl" /> : product.category?.icon || "🍽️"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{isArabic && product.name_ar ? product.name_ar : product.name}</p>
                  <p className="text-orange-500 font-bold text-sm">AED {product.price}</p>
                  <div className="flex items-center gap-1 mt-1">{getStockBadge(product)}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${product.is_available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    {product.is_available ? (isArabic ? "متاح" : "Available") : (isArabic ? "غير متاح" : "Unavailable")}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => toggleProduct(product.id, product.is_available)} className="text-xs text-gray-500 hover:text-orange-500 transition">
                      {product.is_available ? (isArabic ? "إخفاء" : "Hide") : (isArabic ? "إظهار" : "Show")}
                    </button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => setRestockId(restockId === product.id ? null : product.id)} className="text-xs text-blue-500 hover:text-blue-700 transition">
                      {isArabic ? "تعبئة" : "Restock"}
                    </button>
                  </div>
                </div>
              </div>

              {restockId === product.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <input type="number" value={restockQty} onChange={e => setRestockQty(e.target.value)} min="1"
                    className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  <button onClick={() => handleRestock(product.id)} className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition">
                    {isArabic ? "تعبئة المخزون" : "Add Stock"}
                  </button>
                  <button onClick={() => setRestockId(null)} className="text-sm text-gray-400 hover:text-gray-600 px-2">✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
