import os

files = {}

files['src/pages/AddProduct.tsx'] = '''import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function AddProduct() {
  const { user } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", category_id: "", preparation_time: "60", stock_quantity: "10", track_stock: false });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  useEffect(() => {
    if (!user || user.role !== "seller") { navigate("/login"); return; }
    api.get("/api/categories").then(r => setCategories(r.data));
  }, [user]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); setAiSuggestion(null); }
  };

  const generateWithAI = async () => {
    if (!image && !form.name) { setError(isArabic ? "أضف صورة أو اسم المنتج أولاً." : "Add a photo or product name first."); return; }
    setAiLoading(true); setError("");
    try {
      const data = new FormData();
      data.append("product_name", form.name || "Unknown dish");
      const selectedCat = categories.find(c => c.id === parseInt(form.category_id));
      data.append("category", selectedCat?.name || "Food");
      data.append("language", isArabic ? "ar" : "en");
      if (form.price) data.append("price", form.price);
      if (image) data.append("image", image);
      const response = await api.post("/api/ai/generate-description", data, { headers: { "Content-Type": "multipart/form-data" } });
      if (response.data.success) {
        const suggestion = response.data.data;
        setAiSuggestion(suggestion);
        setForm(f => ({ ...f, description: suggestion.description || f.description, name: suggestion.suggested_name || f.name }));
      } else { setError(isArabic ? "فشل الذكاء الاصطناعي." : "AI generation failed."); }
    } catch (err: any) { setError("AI generation failed."); }
    finally { setAiLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("description", form.description);
      data.append("price", form.price);
      data.append("preparation_time", form.preparation_time);
      if (form.category_id) data.append("category_id", form.category_id);
      data.append("track_stock", String(form.track_stock));
      if (form.track_stock) data.append("stock_quantity", form.stock_quantity);
      if (image) data.append("image", image);
      await api.post("/api/products/", data, { headers: { "Content-Type": "multipart/form-data" } });
      navigate("/seller/dashboard");
    } catch (err: any) { setError(err.response?.data?.detail || "Failed to create product"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{isArabic ? "إضافة منتج جديد" : "Add a new product"}</h1>
      <p className="text-gray-500 text-sm mb-8">{isArabic ? "ارفع صورة ودع الذكاء الاصطناعي يكتب قائمتك ✨" : "Upload a photo and let AI write your listing ✨"}</p>
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{isArabic ? "الصورة" : "Photo"}</label>
          <label className="block cursor-pointer">
            <div className={`h-56 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition ${preview ? "border-orange-300" : "border-gray-200 hover:border-orange-300"}`}>
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : (
                <div className="text-center text-gray-400">
                  <div className="text-5xl mb-2">📷</div>
                  <p className="text-sm font-medium">{isArabic ? "اضغط لرفع صورة" : "Click to upload a photo"}</p>
                  <p className="text-xs mt-1">{isArabic ? "سيحللها الذكاء الاصطناعي" : "AI will analyze it"}</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
        </div>

        <button type="button" onClick={generateWithAI} disabled={aiLoading}
          className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${aiLoading ? "bg-purple-100 text-purple-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-sm"}`}>
          {aiLoading ? <><span className="animate-spin">⟳</span> {isArabic ? "يحلل الذكاء الاصطناعي..." : "AI is analyzing..."}</> : <>✨ {isArabic ? "توليد بالذكاء الاصطناعي" : "Generate with AI"}</>}
        </button>

        {aiSuggestion && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-purple-600 uppercase">✨ {isArabic ? "اقتراحات الذكاء الاصطناعي" : "AI Suggestions"}</p>
            {aiSuggestion.preparation_note && <p className="text-sm text-gray-600">📝 {aiSuggestion.preparation_note}</p>}
            {aiSuggestion.suggested_price_range && <p className="text-sm text-gray-600">💰 {isArabic ? "السعر المقترح:" : "Suggested:"} <span className="font-semibold">{aiSuggestion.suggested_price_range}</span></p>}
            {aiSuggestion.tags?.length > 0 && <div className="flex flex-wrap gap-1">{aiSuggestion.tags.map((t: string) => <span key={t} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{t}</span>)}</div>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "اسم المنتج *" : "Product name *"}</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
            placeholder={isArabic ? "مثال: مجبوس دجاج" : "e.g. Chicken Machboos"}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الوصف" : "Description"}{aiSuggestion && <span className="ml-2 text-xs text-purple-500">✨ AI</span>}</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4}
            placeholder={isArabic ? "صف منتجك..." : "Describe your product..."}
            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none ${aiSuggestion ? "border-purple-300 bg-purple-50" : "border-gray-200"}`} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "السعر (درهم) *" : "Price (AED) *"}</label>
            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="1" step="0.5"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "وقت التحضير (د)" : "Prep time (mins)"}</label>
            <input type="number" value={form.preparation_time} onChange={e => setForm(f => ({ ...f, preparation_time: e.target.value }))} min="5"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
        </div>

        {/* Stock Management */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-blue-900">{isArabic ? "تتبع المخزون" : "Track Stock"}</p>
              <p className="text-xs text-blue-600 mt-0.5">{isArabic ? "حدد كمية محدودة من المنتج" : "Set a limited quantity for this product"}</p>
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, track_stock: !f.track_stock }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.track_stock ? "bg-blue-500" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.track_stock ? "translate-x-6" : ""}`} />
            </button>
          </div>
          {form.track_stock && (
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">{isArabic ? "الكمية المتاحة *" : "Available quantity *"}</label>
              <input type="number" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))}
                min="1" required={form.track_stock}
                placeholder={isArabic ? "مثال: 10 حصص" : "e.g. 10 portions"}
                className="w-full border border-blue-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" />
              <p className="text-xs text-blue-600 mt-1">{isArabic ? "سيُوقف المنتج تلقائياً عند نفاد الكمية" : "Product auto-disables when stock runs out"}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الفئة" : "Category"}</label>
          <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
            <option value="">{isArabic ? "اختر فئة" : "Select a category"}</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {isArabic && cat.name_ar ? cat.name_ar : cat.name}</option>)}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate("/seller/dashboard")}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition">
            {isArabic ? "إلغاء" : "Cancel"}
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition disabled:opacity-60">
            {loading ? (isArabic ? "جاري الإضافة..." : "Adding...") : (isArabic ? "إضافة المنتج" : "Add Product")}
          </button>
        </div>
      </form>
    </div>
  );
}
'''

files['src/pages/SellerDashboard.tsx'] = '''import React, { useState, useEffect } from "react";
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
'''

files['src/pages/Home.tsx'] = '''import React, { useState, useEffect } from "react";
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
    if (!product.track_stock) return null;
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
                  {product.image_url ? <img src={`http://localhost:8000${product.image_url}`} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" /> : <span className="text-6xl">{product.category?.icon || "🍽️"}</span>}
                  {product.track_stock && product.stock_quantity <= 3 && product.stock_quantity > 0 && (
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
                    <span>🏠 {product.seller?.shop_name}</span>
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
'''

for path, content in files.items():
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ {path}")

print("\nInventory frontend written!")
