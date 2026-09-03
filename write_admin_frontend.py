import os

files = {}

files['src/pages/AdminPanel.tsx'] = '''import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const BADGE_CONFIG: Record<string, { label: string; labelAr: string; color: string; icon: string }> = {
  verified:  { label: "Verified",   labelAr: "موثق",          color: "bg-blue-50 text-blue-700 border-blue-200",   icon: "✓" },
  inspected: { label: "Inspected",  labelAr: "مفتش",          color: "bg-purple-50 text-purple-700 border-purple-200", icon: "🔍" },
  certified: { label: "Certified",  labelAr: "معتمد",         color: "bg-green-50 text-green-700 border-green-200",  icon: "🏅" },
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  preparing: "bg-purple-50 text-purple-700",
  ready: "bg-green-50 text-green-700",
  delivering: "bg-orange-50 text-orange-700",
  delivered: "bg-gray-50 text-gray-600",
  cancelled: "bg-red-50 text-red-600",
};

export default function AdminPanel() {
  const { user } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview"|"sellers"|"orders"|"users">("overview");
  const [stats, setStats] = useState<any>(null);
  const [sellers, setSellers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [sellerFilter, setSellerFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [badgeModal, setBadgeModal] = useState<any>(null);

  useEffect(() => {
    if (!user || user.role !== "admin") { navigate("/"); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, sel, o, u] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/sellers"),
        api.get("/api/admin/orders"),
        api.get("/api/admin/users"),
      ]);
      setStats(s.data);
      setSellers(sel.data);
      setOrders(o.data);
      setUsers(u.data);
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

  const toggleUser = async (id: number) => {
    await api.patch(`/api/admin/users/${id}/toggle`);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
  };

  const filteredSellers = sellers.filter(s => {
    if (sellerFilter === "pending") return !s.is_approved;
    if (sellerFilter === "approved") return s.is_approved;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading admin panel...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">⚙️ {isArabic ? "لوحة الإدارة" : "Admin Panel"}</h1>
          <p className="text-gray-500 text-sm mt-1">{isArabic ? "إدارة البائعين والطلبات والمستخدمين" : "Manage sellers, orders and users"}</p>
        </div>
        <button onClick={loadData} className="text-sm text-gray-500 hover:text-orange-500 flex items-center gap-1 transition">
          ↻ {isArabic ? "تحديث" : "Refresh"}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: isArabic ? "طلبات معلقة" : "Pending Sellers", value: stats.pending_sellers, icon: "⏳", color: "border-yellow-200 bg-yellow-50", alert: stats.pending_sellers > 0 },
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
          { key: "overview", label: isArabic ? "نظرة عامة" : "Overview", icon: "📊" },
          { key: "sellers", label: isArabic ? `البائعون (${stats?.pending_sellers || 0} معلق)` : `Sellers (${stats?.pending_sellers || 0} pending)`, icon: "🏪" },
          { key: "orders", label: isArabic ? "الطلبات" : "Orders", icon: "📦" },
          { key: "users", label: isArabic ? "المستخدمون" : "Users", icon: "👥" },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t.key ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
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

      {/* Sellers Tab */}
      {tab === "sellers" && (
        <div>
          <div className="flex gap-2 mb-4">
            {[
              { key: "all", label: isArabic ? "الكل" : "All" },
              { key: "pending", label: isArabic ? "معلق" : "Pending" },
              { key: "approved", label: isArabic ? "موافق عليه" : "Approved" },
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
                    </div>
                    <p className="text-sm text-gray-500">{seller.user.full_name} · {seller.user.email}</p>
                    <p className="text-sm text-gray-500">📍 {seller.area}, {seller.city} · ⭐ {seller.rating} · 📦 {seller.total_orders} {isArabic ? "طلب" : "orders"}</p>
                    {seller.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{seller.description}</p>}
                    {seller.badge_notes && <p className="text-xs text-orange-500 mt-1">📝 {seller.badge_notes}</p>}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {!seller.is_approved ? (
                      <button onClick={() => approveSeller(seller.id)} disabled={actionLoading === seller.id}
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition disabled:opacity-60 font-medium">
                        ✓ {isArabic ? "موافقة" : "Approve"}
                      </button>
                    ) : (
                      <button onClick={() => disableSeller(seller.id)} disabled={actionLoading === seller.id}
                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition disabled:opacity-60 font-medium">
                        ✕ {isArabic ? "تعطيل" : "Disable"}
                      </button>
                    )}
                    <button onClick={() => setBadgeModal(seller)}
                      className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg transition font-medium">
                      🏅 {isArabic ? "شارة" : "Badge"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredSellers.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">🏪</div>
                <p>{isArabic ? "لا يوجد بائعون" : "No sellers found"}</p>
              </div>
            )}
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
                </div>
                <p className="text-xs text-gray-500 mt-0.5">🏪 {order.seller} · 👤 {order.buyer} · 📍 {order.area}</p>
                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">AED {order.total}</p>
                <p className="text-xs text-orange-500">+AED {(order.total * 0.12).toFixed(2)} {isArabic ? "عمولة" : "commission"}</p>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-3">📦</div><p>{isArabic ? "لا توجد طلبات" : "No orders yet"}</p></div>
          )}
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
                <p className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</p>
              </div>
              {u.role !== "admin" && (
                <button onClick={() => toggleUser(u.id)}
                  className={`text-xs px-3 py-2 rounded-lg transition font-medium ${u.is_active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                  {u.is_active ? (isArabic ? "تعطيل" : "Disable") : (isArabic ? "تفعيل" : "Enable")}
                </button>
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
                { key: "verified", icon: "✓", label: "Verified", labelAr: "موثق", desc: "ID confirmed, phone verified", descAr: "هوية مؤكدة، هاتف موثق" },
                { key: "inspected", icon: "🔍", label: "Inspected", labelAr: "مفتش", desc: "Food safety certificate uploaded", descAr: "شهادة سلامة غذائية مرفوعة" },
                { key: "certified", icon: "🏅", label: "Certified", labelAr: "معتمد", desc: "Passed mystery order quality test", descAr: "اجتازت اختبار الجودة السري" },
                { key: "none", icon: "✕", label: "Remove Badge", labelAr: "إزالة الشارة", desc: "Remove current badge", descAr: "إزالة الشارة الحالية" },
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
    </div>
  );
}
'''

for path, content in files.items():
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ {path}")

print("\nAdmin frontend written!")
