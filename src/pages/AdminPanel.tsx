import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const BADGE_CONFIG: Record<string, { label: string; labelAr: string; color: string; icon: string }> = {
  verified:  { label: "Verified",  labelAr: "موثق",  color: "bg-blue-50 text-blue-700 border-blue-200",     icon: "✓"  },
  inspected: { label: "Inspected", labelAr: "مفتش",  color: "bg-purple-50 text-purple-700 border-purple-200", icon: "🔍" },
  certified: { label: "Certified", labelAr: "معتمد", color: "bg-green-50 text-green-700 border-green-200",   icon: "🏅" },
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700", confirmed: "bg-blue-50 text-blue-700",
  preparing: "bg-purple-50 text-purple-700", ready: "bg-green-50 text-green-700",
  delivering: "bg-orange-50 text-orange-700", delivered: "bg-gray-50 text-gray-600",
  cancelled: "bg-red-50 text-red-600",
};

export default function AdminPanel() {
  const { user } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview"|"sellers"|"orders"|"users"|"commission"|"products"|"revenue">("overview");
  const [stats, setStats] = useState<any>(null);
  const [sellers, setSellers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [commissionSummary, setCommissionSummary] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);
  const [sellerFilter, setSellerFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [badgeModal, setBadgeModal] = useState<any>(null);
  const [commissionModal, setCommissionModal] = useState<any>(null);
  const [newRate, setNewRate] = useState("");
  const [expandedSeller, setExpandedSeller] = useState<number | null>(null);

  useEffect(() => {
    if (!user || user.role !== "admin") { navigate("/"); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, sel, o, u, cs, prods, rev] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/sellers"),
        api.get("/api/admin/orders"),
        api.get("/api/admin/users"),
        api.get("/api/admin/commission/summary"),
        api.get("/api/admin/products"),
        api.get("/api/admin/revenue/daily"),
      ]);
      setStats(s.data);
      setSellers(sel.data);
      setOrders(o.data);
      setUsers(u.data);
      setCommissionSummary(cs.data);
      setAllProducts(prods.data);
      setDailyRevenue(rev.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const approveSeller = async (id: number) => {
    setActionLoading(id);
    await api.patch(`/api/admin/sellers/${id}/approve`);
    setSellers(prev => prev.map(s => s.id === id ? { ...s, is_approved: true } : s));
    setStats((prev: any) => ({ ...prev, pending_sellers: prev.pending_sellers - 1, approved_sellers: prev.approved_sellers + 1 }));
    setActionLoading(null);
  };

  const disableSeller = async (id: number) => {
    setActionLoading(id);
    await api.patch(`/api/admin/sellers/${id}/disable`);
    setSellers(prev => prev.map(s => s.id === id ? { ...s, is_approved: false } : s));
    setActionLoading(null);
  };

  const updateBadge = async (sellerId: number, badge: string) => {
    await api.patch(`/api/admin/sellers/${sellerId}/badge`, null, { params: { badge } });
    setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, badge: badge === "none" ? null : badge } : s));
    setBadgeModal(null);
  };

  const updateCommission = async (sellerId: number) => {
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate < 0 || rate > 50) {
      alert("Enter a valid rate between 0 and 50");
      return;
    }
    await api.patch(`/api/admin/sellers/${sellerId}/commission`, null, { params: { rate } });
    setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, commission_rate: rate } : s));
    setCommissionModal(null);
    setNewRate("");
    loadData();
  };

  const toggleUser = async (user: any) => {
    if (user.role === "seller") {
      const seller = sellers.find(s => s.user?.id === user.id);
      if (seller) {
        // Use user.is_active to decide: if currently active, disable; if inactive, approve
        if (user.is_active) {
          await api.patch(`/api/admin/sellers/${seller.id}/disable`);
          setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, is_approved: false } : s));
        } else {
          await api.patch(`/api/admin/sellers/${seller.id}/approve`);
          setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, is_approved: true } : s));
        }
      }
    }
    await api.patch(`/api/admin/users/${user.id}/toggle`);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
  };

  const deleteSeller = async (seller: any) => {
    if (!window.confirm(`⚠️ Permanently delete "${seller.shop_name}" and ALL their products and orders? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/sellers/${seller.id}`);
      setSellers(prev => prev.filter(s => s.id !== seller.id));
      setStats((prev: any) => prev ? ({ ...prev, total_sellers: prev.total_sellers - 1 }) : prev);
    } catch (e: any) {
      alert(e.response?.data?.detail || "Delete failed");
    }
  };

  const toggleProduct = async (product: any) => {
    await api.patch(`/api/admin/products/${product.id}/toggle`);
    setAllProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_available: !p.is_available } : p));
  };

  const deleteProductAdmin = async (product: any) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    await api.delete(`/api/admin/products/${product.id}`);
    setAllProducts(prev => prev.filter(p => p.id !== product.id));
  };

  const exportCSV = (type: string) => {
    window.open(`https://web-production-63685.up.railway.app/api/admin/${type}?token=${localStorage.getItem("token")}`, "_blank");
  };

  const deleteUser = async (user: any) => {
    if (!window.confirm(`⚠️ Permanently delete "${user.full_name}" (${user.email}) and ALL their data? This cannot be undone.`)) return;
    try {
      if (user.role === "seller") {
        // Find seller profile id from sellers list
        const seller = sellers.find(s => s.user?.id === user.id);
        if (seller) {
          await api.delete(`/api/admin/sellers/${seller.id}`);
          setSellers(prev => prev.filter(s => s.id !== seller.id));
        } else {
          await api.delete(`/api/admin/users/${user.id}`);
        }
      } else {
        await api.delete(`/api/admin/users/${user.id}`);
      }
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (e: any) {
      alert(e.response?.data?.detail || "Delete failed");
    }
  };

  const filteredSellers = sellers.filter(s => {
    if (sellerFilter === "pending") return !s.is_approved;
    if (sellerFilter === "approved") return s.is_approved;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading admin panel...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">⚙️ {isArabic ? "لوحة الإدارة" : "Admin Panel"}</h1>
          <p className="text-gray-500 text-sm mt-1">{isArabic ? "إدارة البائعين والطلبات والعمولات" : "Manage sellers, orders and commissions"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="text-sm text-gray-500 hover:text-orange-500 flex items-center gap-1 transition">↻ {isArabic ? "تحديث" : "Refresh"}</button>
          <a href="https://web-production-63685.up.railway.app/api/admin/export/sellers" target="_blank"
            className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg transition font-medium">
            📥 {isArabic ? "تصدير البائعين" : "Export Sellers"}
          </a>
          <a href="https://web-production-63685.up.railway.app/api/admin/export/orders" target="_blank"
            className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition font-medium">
            📥 {isArabic ? "تصدير الطلبات" : "Export Orders"}
          </a>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: isArabic ? "بائعون معلقون" : "Pending Sellers", value: stats.pending_sellers, icon: "⏳", color: "border-yellow-200 bg-yellow-50", alert: stats.pending_sellers > 0 },
            { label: isArabic ? "بائعون نشطون" : "Active Sellers", value: stats.approved_sellers, icon: "🏪", color: "border-green-200 bg-green-50" },
            { label: isArabic ? "إجمالي الطلبات" : "Total Orders", value: stats.total_orders, icon: "📦", color: "border-blue-200 bg-blue-50" },
            { label: isArabic ? "عمولة المنصة" : "Platform Commission", value: `AED ${stats.platform_commission}`, icon: "💰", color: "border-orange-200 bg-orange-50" },
            { label: isArabic ? "إجمالي المشترين" : "Total Buyers", value: stats.total_buyers, icon: "🛍️", color: "border-purple-200 bg-purple-50" },
            { label: isArabic ? "إجمالي المنتجات" : "Total Products", value: stats.total_products, icon: "🍽️", color: "border-pink-200 bg-pink-50" },
            { label: isArabic ? "إجمالي الإيرادات" : "Total Revenue", value: `AED ${stats.total_revenue}`, icon: "📈", color: "border-teal-200 bg-teal-50" },
            { label: isArabic ? "إجمالي البائعين" : "Total Sellers", value: stats.total_sellers, icon: "👨‍🍳", color: "border-gray-200 bg-gray-50" },
          ].map(stat => (
            <div key={stat.label} className={`rounded-2xl p-4 border ${stat.color} ${(stat as any).alert ? "ring-2 ring-yellow-400" : ""}`}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { key: "overview",   label: isArabic ? "نظرة عامة" : "Overview",   icon: "📊" },
          { key: "sellers",    label: isArabic ? `البائعون (${stats?.pending_sellers || 0} معلق)` : `Sellers (${stats?.pending_sellers || 0} pending)`, icon: "🏪" },
          { key: "commission", label: isArabic ? "العمولات" : "Commissions",  icon: "💰" },
          { key: "orders",     label: isArabic ? "الطلبات" : "Orders",        icon: "📦" },
          { key: "users",      label: isArabic ? "المستخدمون" : "Users",      icon: "👥" },
          { key: "products",   label: isArabic ? "المنتجات" : "Products",    icon: "🍽️" },
          { key: "revenue",    label: isArabic ? "الإيرادات" : "Revenue",    icon: "📈" },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t.key ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">⏳ {isArabic ? "بائعون بانتظار الموافقة" : "Sellers Awaiting Approval"}</h3>
            {sellers.filter(s => !s.is_approved).length === 0 ? (
              <p className="text-gray-400 text-sm">✅ {isArabic ? "لا يوجد بائعون معلقون" : "No pending sellers"}</p>
            ) : sellers.filter(s => !s.is_approved).slice(0, 5).map(seller => (
              <div key={seller.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{seller.shop_name}</p>
                  <p className="text-xs text-gray-500">{seller.user.full_name} · {seller.area}</p>
                </div>
                <button onClick={() => approveSeller(seller.id)} disabled={actionLoading === seller.id}
                  className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-60">
                  {actionLoading === seller.id ? "..." : (isArabic ? "موافقة" : "Approve")}
                </button>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">📦 {isArabic ? "أحدث الطلبات" : "Latest Orders"}</h3>
            {orders.slice(0, 6).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">#{order.id} — {order.seller}</p>
                  <p className="text-xs text-gray-500">{order.buyer} · {order.area}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                  <p className="text-xs text-gray-500 mt-0.5">AED {order.total}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commission Tab */}
      {tab === "commission" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
            <p className="text-sm text-blue-800 font-medium">💡 {isArabic ? "كيف تعمل العمولات" : "How commissions work"}</p>
            <p className="text-xs text-blue-600 mt-1">
              {isArabic
                ? "يتم احتساب العمولة تلقائياً على كل طلب بناءً على نسبة البائع. يمكنك تخصيص نسبة مختلفة لكل بائع."
                : "Commission is automatically calculated on each order based on the seller's rate. You can set a custom rate per seller. Default is 12%."}
            </p>
          </div>

          {/* Commission Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="font-semibold text-gray-900">💰 {isArabic ? "ملخص العمولات" : "Commission Breakdown"}</h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "المتجر" : "Shop"}</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "النسبة" : "Rate"}</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "الطلبات" : "Orders"}</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "الإيرادات" : "Revenue"}</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "العمولة" : "Commission"}</th>
                </tr>
              </thead>
              <tbody>
                {commissionSummary.map((row, i) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.shop_name}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">{row.commission_rate}%</span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">{row.total_orders}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">AED {row.total_revenue}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-green-600">AED {row.total_commission}</td>
                  </tr>
                ))}
                {commissionSummary.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">{isArabic ? "لا توجد بيانات بعد" : "No data yet"}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Per-seller commission rates */}
          <h3 className="font-semibold text-gray-900 mt-6 mb-3">⚙️ {isArabic ? "إعدادات العمولة" : "Commission Settings"}</h3>
          {sellers.filter(s => s.is_approved).map(seller => (
            <div key={seller.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">{seller.shop_name}</p>
                <p className="text-sm text-gray-500">{seller.user.full_name} · {seller.area}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {isArabic ? "الإيرادات:" : "Revenue:"} AED {seller.total_revenue} ·
                  {isArabic ? " العمولة:" : " Commission:"} AED {seller.total_commission}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{seller.commission_rate}%</div>
                  <div className="text-xs text-gray-400">{isArabic ? "النسبة الحالية" : "Current rate"}</div>
                </div>
                <button onClick={() => { setCommissionModal(seller); setNewRate(String(seller.commission_rate)); }}
                  className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition font-medium">
                  {isArabic ? "تغيير" : "Change"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sellers Tab */}
      {tab === "sellers" && (
        <div>
          <div className="flex gap-2 mb-4">
            {[
              { key: "all", label: isArabic ? "الكل" : "All" },
              { key: "pending", label: isArabic ? "معلق" : "Pending" },
              { key: "approved", label: isArabic ? "موافق" : "Approved" },
            ].map(f => (
              <button key={f.key} onClick={() => setSellerFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${sellerFilter === f.key ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200"}`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {filteredSellers.map(seller => (
              <div key={seller.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{seller.shop_name}</h3>
                      {seller.badge && BADGE_CONFIG[seller.badge] && (
                        <span className={`text-xs border px-2 py-0.5 rounded-full font-medium ${BADGE_CONFIG[seller.badge].color}`}>
                          {BADGE_CONFIG[seller.badge].icon} {isArabic ? BADGE_CONFIG[seller.badge].labelAr : BADGE_CONFIG[seller.badge].label}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${seller.is_approved ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                        {seller.is_approved ? (isArabic ? "نشط" : "Active") : (isArabic ? "معلق" : "Pending")}
                      </span>
                      <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                        {seller.commission_rate}% {isArabic ? "عمولة" : "commission"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{seller.user.full_name} · {seller.user.email}</p>
                    <p className="text-sm text-gray-500">📍 {seller.area}, {seller.city} · ⭐ {seller.rating} · 📦 {seller.total_orders} {isArabic ? "طلب" : "orders"}</p>
                    {seller.badge_notes && <p className="text-xs text-orange-500 mt-1">📝 {seller.badge_notes}</p>}
                    <button onClick={() => setExpandedSeller(expandedSeller === seller.id ? null : seller.id)}
                      className="text-xs text-orange-500 hover:underline mt-2 inline-block">
                      {expandedSeller === seller.id ? "▲ Hide details" : "▼ View details"}
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {!seller.is_approved ? (
                      <button onClick={() => approveSeller(seller.id)} disabled={actionLoading === seller.id}
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition disabled:opacity-60 font-medium">
                        ✓ {isArabic ? "موافقة" : "Approve"}
                      </button>
                    ) : (
                      <button onClick={() => disableSeller(seller.id)} disabled={actionLoading === seller.id}
                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition font-medium">
                        ✕ {isArabic ? "تعطيل" : "Disable"}
                      </button>
                    )}
                    <button onClick={() => setBadgeModal(seller)}
                      className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg transition font-medium">
                      🏅 {isArabic ? "شارة" : "Badge"}
                    </button>
                    <button onClick={() => { setCommissionModal(seller); setNewRate(String(seller.commission_rate)); }}
                      className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg transition font-medium">
                      💰 {isArabic ? "عمولة" : "Commission"}
                    </button>
                  </div>
                </div>
              {expandedSeller === seller.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  {(seller.sample_image_1 || seller.sample_image_2 || seller.sample_image_3) && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">{isArabic ? "صور العينات" : "Sample Photos"}</p>
                      <div className="flex gap-2">
                        {[seller.sample_image_1, seller.sample_image_2, seller.sample_image_3].filter(Boolean).map((img: string, i: number) => (
                          <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                            <img src={img} alt={`Sample ${i+1}`} className="w-24 h-24 object-cover rounded-xl border border-gray-200 hover:opacity-80 transition" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {seller.whatsapp_number && (
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{isArabic ? "واتساب" : "WhatsApp"}</p>
                        <p className="font-medium text-gray-900">📱 {seller.whatsapp_number}</p>
                      </div>
                    )}
                    {seller.instagram_handle && (
                      <div className="bg-pink-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{isArabic ? "إنستغرام" : "Instagram"}</p>
                        <p className="font-medium text-gray-900">📸 {seller.instagram_handle}</p>
                      </div>
                    )}
                    {seller.min_order_amount && (
                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{isArabic ? "الحد الأدنى للطلب" : "Min Order"}</p>
                        <p className="font-medium text-gray-900">AED {seller.min_order_amount}</p>
                      </div>
                    )}
                    {seller.delivery_type && (
                      <div className="bg-orange-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{isArabic ? "التوصيل" : "Delivery"}</p>
                        <p className="font-medium text-gray-900">
                          {seller.delivery_type === "self" ? (isArabic ? "🏠 يوصل بنفسه" : "🏠 Self delivery") : (isArabic ? "🚗 يحتاج بيتي" : "🚗 Needs Bayti")}
                        </p>
                      </div>
                    )}
                  </div>
                  {seller.description && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">{isArabic ? "الوصف" : "Description"}</p>
                      <p className="text-sm text-gray-700">{seller.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Products Tab */}
      {tab === "products" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{allProducts.length} {isArabic ? "منتج" : "products total"}</p>
          {allProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-orange-50 flex items-center justify-center flex-shrink-0">
                {product.image_url
                  ? <img src={product.image_url.startsWith("http") ? product.image_url : `https://web-production-63685.up.railway.app${product.image_url}`} className="w-full h-full object-cover" alt={product.name} />
                  : <span className="text-2xl">🍽️</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500">🏠 {product.shop_name} · {product.category} · AED {product.price}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.is_available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {product.is_available ? (isArabic ? "متاح" : "Live") : (isArabic ? "مخفي" : "Hidden")}
                </span>
                <button onClick={() => toggleProduct(product)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">
                  {product.is_available ? (isArabic ? "إخفاء" : "Hide") : (isArabic ? "إظهار" : "Show")}
                </button>
                <button onClick={() => deleteProductAdmin(product)}
                  className="text-xs bg-red-700 hover:bg-red-800 text-white px-3 py-1.5 rounded-lg transition">
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Tab */}
      {tab === "revenue" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
              <p className="text-3xl font-bold text-orange-500">AED {dailyRevenue.reduce((a, r) => a + r.revenue, 0).toFixed(0)}</p>
              <p className="text-sm text-gray-500 mt-1">{isArabic ? "إجمالي الإيرادات (30 يوم)" : "Total Revenue (30 days)"}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
              <p className="text-3xl font-bold text-green-500">AED {dailyRevenue.reduce((a, r) => a + r.commission, 0).toFixed(0)}</p>
              <p className="text-sm text-gray-500 mt-1">{isArabic ? "عمولة بيتي (30 يوم)" : "Bayti Commission (30 days)"}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
              <p className="text-3xl font-bold text-blue-500">{dailyRevenue.reduce((a, r) => a + r.orders, 0)}</p>
              <p className="text-sm text-gray-500 mt-1">{isArabic ? "إجمالي الطلبات (30 يوم)" : "Total Orders (30 days)"}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="font-semibold text-gray-900">📅 {isArabic ? "الإيرادات اليومية" : "Daily Revenue"}</h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "اليوم" : "Date"}</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "الطلبات" : "Orders"}</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "الإيرادات" : "Revenue"}</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "العمولة" : "Commission"}</th>
                </tr>
              </thead>
              <tbody>
                {dailyRevenue.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">{isArabic ? "لا توجد بيانات بعد" : "No data yet"}</td></tr>
                ) : dailyRevenue.map((row, i) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{row.day}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">{row.orders}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900 font-medium">AED {row.revenue}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-green-600">AED {row.commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">#{order.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{order.commission_rate}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">🏪 {order.seller} · 👤 {order.buyer} · 📍 {order.area}</p>
                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">AED {order.total}</p>
                <p className="text-xs text-green-600 font-medium">+AED {order.commission_amount} {isArabic ? "عمولة" : "commission"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <div className="space-y-3">
          {users.map(u => (
            <div key={u.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{u.full_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "admin" ? "bg-red-50 text-red-600" : u.role === "seller" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"}`}>{u.role}</span>
                  {!u.is_active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{isArabic ? "معطل" : "Disabled"}</span>}
                </div>
                <p className="text-xs text-gray-500">{u.email} · {u.phone || "No phone"}</p>
              </div>
              {u.role !== "admin" && (
                <div className="flex gap-2">
                  <button onClick={() => toggleUser(u)}
                    className={`text-xs px-3 py-2 rounded-lg transition font-medium ${u.is_active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                    {u.is_active ? (isArabic ? "تعطيل" : "Disable") : (isArabic ? "تفعيل" : "Enable")}
                  </button>
                  {(u.role === "buyer" || u.role === "seller") && (
                    <button onClick={() => deleteUser(u)}
                      className="text-xs px-3 py-2 rounded-lg transition font-medium bg-red-700 text-white hover:bg-red-800">
                      🗑 {isArabic ? "حذف" : "Delete"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Badge Modal */}
      {badgeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-900 mb-1">{isArabic ? "تعيين شارة التحقق" : "Set Verification Badge"}</h3>
            <p className="text-sm text-gray-500 mb-4">{badgeModal.shop_name}</p>
            <div className="space-y-3 mb-4">
              {[
                { key: "verified",  icon: "✓",  label: "Verified",      labelAr: "موثق",        desc: "ID confirmed, phone verified",          descAr: "هوية مؤكدة، هاتف موثق" },
                { key: "inspected", icon: "🔍", label: "Inspected",     labelAr: "مفتش",         desc: "Food safety certificate uploaded",       descAr: "شهادة سلامة غذائية مرفوعة" },
                { key: "certified", icon: "🏅", label: "Certified",     labelAr: "معتمد",        desc: "Passed mystery order quality test",      descAr: "اجتازت اختبار الجودة السري" },
                { key: "none",      icon: "✕",  label: "Remove Badge",  labelAr: "إزالة الشارة", desc: "Remove current badge",                  descAr: "إزالة الشارة الحالية" },
              ].map(b => (
                <button key={b.key} onClick={() => updateBadge(badgeModal.id, b.key)}
                  className={`w-full text-left p-3 rounded-xl border transition ${badgeModal.badge === b.key ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-orange-300"}`}>
                  <p className="font-medium text-gray-900 text-sm">{b.icon} {isArabic ? b.labelAr : b.label}</p>
                  <p className="text-xs text-gray-500">{isArabic ? b.descAr : b.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setBadgeModal(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-sm font-medium transition">
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {/* Commission Modal */}
      {commissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-900 mb-1">💰 {isArabic ? "تعديل نسبة العمولة" : "Edit Commission Rate"}</h3>
            <p className="text-sm text-gray-500 mb-1">{commissionModal.shop_name}</p>
            <p className="text-xs text-gray-400 mb-4">{isArabic ? "النسبة الحالية:" : "Current rate:"} {commissionModal.commission_rate}%</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{isArabic ? "النسبة الجديدة (%)" : "New Rate (%)"}</label>
              <input type="number" value={newRate} onChange={e => setNewRate(e.target.value)}
                min="0" max="50" step="0.5"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 text-lg font-bold" />
              <div className="flex gap-2 mt-3 flex-wrap">
                {[5, 8, 10, 12, 15, 20].map(r => (
                  <button key={r} onClick={() => setNewRate(String(r))}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${newRate === String(r) ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {r}%
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">{isArabic ? "نصيحة: 8% للبائعين الجدد، 12% افتراضي، 15% للبائعين ذوي الأداء المنخفض" : "Tip: 8% for new sellers, 12% default, 15% for underperformers"}</p>
            </div>

            {newRate && (
              <div className="bg-orange-50 rounded-xl p-3 mb-4">
                <p className="text-sm text-orange-800">
                  {isArabic ? "على طلب بقيمة AED 100:" : "On a AED 100 order:"} <span className="font-bold">AED {(100 * parseFloat(newRate || "0") / 100).toFixed(2)}</span> {isArabic ? "عمولة" : "commission"}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setCommissionModal(null); setNewRate(""); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium transition">
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
              <button onClick={() => updateCommission(commissionModal.id)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-medium transition">
                {isArabic ? "حفظ" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
