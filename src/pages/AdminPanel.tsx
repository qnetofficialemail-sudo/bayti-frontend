import React, { useState, useEffect } from "react";
import GrowthOSPage from "./GrowthOSPage";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const BADGE_CONFIG: Record<string, { label: string; labelAr: string; color: string; icon: string }> = {
  verified:  { label: "Verified",  labelAr: "Ù…ÙˆØ«Ù‚",  color: "bg-blue-50 text-blue-700 border-blue-200",     icon: "âœ“"  },
  inspected: { label: "Inspected", labelAr: "Ù…ÙØªØ´",  color: "bg-purple-50 text-purple-700 border-purple-200", icon: "/icons/bayti/ui/search.png" },
  certified: { label: "Certified", labelAr: "Ù…Ø¹ØªÙ…Ø¯", color: "bg-green-50 text-green-700 border-green-200",   icon: "ðŸ…" },
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
  const [tab, setTab] = useState<"overview"|"sellers"|"orders"|"users"|"commission"|"products"|"revenue"|"reviews"|"categories"|"applications"|"forecast"|"content"|"growth">("overview");
  const [forecast, setForecast] = useState<any>(null);
  const [contentPost, setContentPost] = useState<{caption: string; hashtags: string; imageUrl: string | null; contentType?: string} | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentCopied, setContentCopied] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [sellers, setSellers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [commissionSummary, setCommissionSummary] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [managedCategories, setManagedCategories] = useState<any[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [sellerFilter, setSellerFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [badgeModal, setBadgeModal] = useState<any>(null);
  const [commissionModal, setCommissionModal] = useState<any>(null);
  const [newRate, setNewRate] = useState("");
  const [expandedSeller, setExpandedSeller] = useState<number | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [appFilter, setAppFilter] = useState("pending");
  const [appActionLoading, setAppActionLoading] = useState<number | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "admin") { navigate("/"); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, sel, o, u, cs, prods, rev, cats, prods2, apps] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/sellers"),
        api.get("/api/admin/orders"),
        api.get("/api/admin/users"),
        api.get("/api/admin/commission/summary"),
        api.get("/api/admin/products"),
        api.get("/api/admin/revenue/daily"),
        api.get("/api/admin/categories/manage"),
        api.get("/api/reviews/admin/pending"),
        api.get("/api/applications/admin/list"),
      ]);
      setStats(s.data);
      setSellers(sel.data);
      setOrders(o.data);
      setUsers(u.data);
      setCommissionSummary(cs.data);
      setAllProducts(prods.data);
      setDailyRevenue(rev.data);
      setPendingReviews(prods2.data);
      setManagedCategories(cats.data);
      setApplications(apps.data);
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
    if (!window.confirm(`âš ï¸ Permanently delete "${seller.shop_name}" and ALL their products and orders? This cannot be undone.`)) return;
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
    if (!window.confirm(`âš ï¸ Permanently delete "${user.full_name}" (${user.email}) and ALL their data? This cannot be undone.`)) return;
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
          <h1 className="text-2xl font-bold text-gray-900">âš™ï¸ {isArabic ? "Ù„ÙˆØ­Ø© Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©" : "Admin Panel"}</h1>
          <p className="text-gray-500 text-sm mt-1">{isArabic ? "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¨Ø§Ø¦Ø¹ÙŠÙ† ÙˆØ§Ù„Ø·Ù„Ø¨Ø§Øª ÙˆØ§Ù„Ø¹Ù…ÙˆÙ„Ø§Øª" : "Manage sellers, orders and commissions"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="text-sm text-gray-500 hover:text-orange-500 flex items-center gap-1 transition">â†» {isArabic ? "ØªØ­Ø¯ÙŠØ«" : "Refresh"}</button>
          <a href="https://web-production-63685.up.railway.app/api/admin/export/sellers" target="_blank"
            className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg transition font-medium">
            ðŸ“¥ {isArabic ? "ØªØµØ¯ÙŠØ± Ø§Ù„Ø¨Ø§Ø¦Ø¹ÙŠÙ†" : "Export Sellers"}
          </a>
          <a href="https://web-production-63685.up.railway.app/api/admin/export/orders" target="_blank"
            className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition font-medium">
            ðŸ“¥ {isArabic ? "ØªØµØ¯ÙŠØ± Ø§Ù„Ø·Ù„Ø¨Ø§Øª" : "Export Orders"}
          </a>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: isArabic ? "Ø¨Ø§Ø¦Ø¹ÙˆÙ† Ù…Ø¹Ù„Ù‚ÙˆÙ†" : "Pending Sellers", value: stats.pending_sellers, icon: "â³", color: "border-yellow-200 bg-yellow-50", alert: stats.pending_sellers > 0 },
            { label: isArabic ? "Ø¨Ø§Ø¦Ø¹ÙˆÙ† Ù†Ø´Ø·ÙˆÙ†" : "Active Sellers", value: stats.approved_sellers, icon: "/icons/bayti/ui/seller-store.png", color: "border-green-200 bg-green-50" },
            { label: isArabic ? "Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø·Ù„Ø¨Ø§Øª" : "Total Orders", value: stats.total_orders, icon: "/icons/bayti/ui/orders-box.png", color: "border-blue-200 bg-blue-50" },
            { label: isArabic ? "Ø¹Ù…ÙˆÙ„Ø© Ø§Ù„Ù…Ù†ØµØ©" : "Platform Commission", value: `AED ${stats.platform_commission}`, icon: "ðŸ’°", color: "border-orange-200 bg-orange-50" },
            { label: isArabic ? "Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù…Ø´ØªØ±ÙŠÙ†" : "Total Buyers", value: stats.total_buyers, icon: "/icons/bayti/ui/shopping-bag.png", color: "border-purple-200 bg-purple-50" },
            { label: isArabic ? "Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª" : "Total Products", value: stats.total_products, icon: "/icons/bayti/categories/home-cooked-meals.png", color: "border-pink-200 bg-pink-50" },
            { label: isArabic ? "Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø¥ÙŠØ±Ø§Ø¯Ø§Øª" : "Total Revenue", value: `AED ${stats.total_revenue}`, icon: "ðŸ“ˆ", color: "border-teal-200 bg-teal-50" },
            { label: isArabic ? "Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø¨Ø§Ø¦Ø¹ÙŠÙ†" : "Total Sellers", value: stats.total_sellers, icon: "ðŸ‘¨â€ðŸ³", color: "border-gray-200 bg-gray-50" },
          ].map(stat => (
            <div key={stat.label} className={`rounded-2xl p-4 border ${stat.color} ${(stat as any).alert ? "ring-2 ring-yellow-400" : ""}`}>
              <div className="w-7 h-7 mb-1 flex items-center justify-center">{String(stat.icon).startsWith("/") ? <img src={stat.icon} alt="" aria-hidden="true" className="w-7 h-7 object-contain" /> : <span className="text-2xl">{stat.icon}</span>}</div>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { key: "overview",   label: isArabic ? "Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø©" : "Overview",   icon: "ðŸ“Š" },
          { key: "sellers",    label: isArabic ? `Ø§Ù„Ø¨Ø§Ø¦Ø¹ÙˆÙ† (${stats?.pending_sellers || 0} Ù…Ø¹Ù„Ù‚)` : `Sellers (${stats?.pending_sellers || 0} pending)`, icon: "/icons/bayti/ui/seller-store.png" },
          { key: "commission", label: isArabic ? "Ø§Ù„Ø¹Ù…ÙˆÙ„Ø§Øª" : "Commissions",  icon: "ðŸ’°" },
          { key: "orders",     label: isArabic ? "Ø§Ù„Ø·Ù„Ø¨Ø§Øª" : "Orders",        icon: "/icons/bayti/ui/orders-box.png" },
          { key: "users",      label: isArabic ? "Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ†" : "Users",      icon: "ðŸ‘¥" },
          { key: "products",   label: isArabic ? "Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª" : "Products",    icon: "/icons/bayti/categories/home-cooked-meals.png" },
          { key: "revenue",    label: isArabic ? "Ø§Ù„Ø¥ÙŠØ±Ø§Ø¯Ø§Øª" : "Revenue",    icon: "ðŸ“ˆ" },
          { key: "reviews",    label: isArabic ? `Ø§Ù„ØªÙ‚ÙŠÙŠÙ…Ø§Øª${pendingReviews.length > 0 ? ` (${pendingReviews.length})` : ""}` : `Reviews${pendingReviews.length > 0 ? ` (${pendingReviews.length})` : ""}`, icon: "â­" },
          { key: "categories", label: isArabic ? "Ø§Ù„ÙØ¦Ø§Øª" : "Categories", icon: "ðŸ·ï¸" },
          { key: "applications", label: (isArabic ? "Ø§Ù„Ø·Ù„Ø¨Ø§Øª" : "Applications") + (applications.filter(a => a.status === "pending").length > 0 ? ` (${applications.filter(a => a.status === "pending").length})` : ""), icon: "ðŸ“‹" },
          { key: "forecast", label: isArabic ? "ØªÙˆÙ‚Ø¹Ø§Øª Ø§Ù„Ø·Ù„Ø¨" : "Demand Forecast", icon: "ðŸ”®" },
          { key: "content", label: isArabic ? "Ù…Ø­ØªÙˆÙ‰ Ø¥Ù†Ø³ØªÙ‚Ø±Ø§Ù…" : "Instagram Content", icon: "ðŸ“¸" },
          { key: "growth", label: "🚀 Growth OS", icon: "🚀" },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t.key ? "bg-orange-500 text-gray-900" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"}`}>
            {String(t.icon).startsWith("/") ? <img src={t.icon} alt="" aria-hidden="true" className="w-4 h-4 object-contain inline-block mr-1" /> : <span className="mr-1">{t.icon}</span>}{t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">â³ {isArabic ? "Ø¨Ø§Ø¦Ø¹ÙˆÙ† Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø©" : "Sellers Awaiting Approval"}</h3>
            {sellers.filter(s => !s.is_approved).length === 0 ? (
              <p className="text-gray-400 text-sm">âœ… {isArabic ? "Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø¨Ø§Ø¦Ø¹ÙˆÙ† Ù…Ø¹Ù„Ù‚ÙˆÙ†" : "No pending sellers"}</p>
            ) : sellers.filter(s => !s.is_approved).slice(0, 5).map(seller => (
              <div key={seller.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{seller.shop_name}</p>
                  <p className="text-xs text-gray-500">{seller.user.full_name} Â· {seller.area}</p>
                </div>
                <button onClick={() => approveSeller(seller.id)} disabled={actionLoading === seller.id}
                  className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-60">
                  {actionLoading === seller.id ? "..." : (isArabic ? "Ù…ÙˆØ§ÙÙ‚Ø©" : "Approve")}
                </button>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">ðŸ“¦ {isArabic ? "Ø£Ø­Ø¯Ø« Ø§Ù„Ø·Ù„Ø¨Ø§Øª" : "Latest Orders"}</h3>
            {orders.slice(0, 6).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">#{order.id} â€” {order.seller}</p>
                  <p className="text-xs text-gray-500">{order.buyer} Â· {order.area}</p>
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
            <p className="text-sm text-blue-800 font-medium">ðŸ’¡ {isArabic ? "ÙƒÙŠÙ ØªØ¹Ù…Ù„ Ø§Ù„Ø¹Ù…ÙˆÙ„Ø§Øª" : "How commissions work"}</p>
            <p className="text-xs text-blue-600 mt-1">
              {isArabic
                ? "ÙŠØªÙ… Ø§Ø­ØªØ³Ø§Ø¨ Ø§Ù„Ø¹Ù…ÙˆÙ„Ø© ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ø¹Ù„Ù‰ ÙƒÙ„ Ø·Ù„Ø¨ Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ù†Ø³Ø¨Ø© Ø§Ù„Ø¨Ø§Ø¦Ø¹. ÙŠÙ…ÙƒÙ†Ùƒ ØªØ®ØµÙŠØµ Ù†Ø³Ø¨Ø© Ù…Ø®ØªÙ„ÙØ© Ù„ÙƒÙ„ Ø¨Ø§Ø¦Ø¹."
                : "Commission is automatically calculated on each order based on the seller's rate. You can set a custom rate per seller. Default is 12%."}
            </p>
          </div>

          {/* Commission Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="font-semibold text-gray-900">ðŸ’° {isArabic ? "Ù…Ù„Ø®Øµ Ø§Ù„Ø¹Ù…ÙˆÙ„Ø§Øª" : "Commission Breakdown"}</h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "Ø§Ù„Ù…ØªØ¬Ø±" : "Shop"}</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "Ø§Ù„Ù†Ø³Ø¨Ø©" : "Rate"}</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "Ø§Ù„Ø·Ù„Ø¨Ø§Øª" : "Orders"}</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "Ø§Ù„Ø¥ÙŠØ±Ø§Ø¯Ø§Øª" : "Revenue"}</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "Ø§Ù„Ø¹Ù…ÙˆÙ„Ø©" : "Commission"}</th>
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
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">{isArabic ? "Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¨ÙŠØ§Ù†Ø§Øª Ø¨Ø¹Ø¯" : "No data yet"}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Per-seller commission rates */}
          <h3 className="font-semibold text-gray-900 mt-6 mb-3">âš™ï¸ {isArabic ? "Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø¹Ù…ÙˆÙ„Ø©" : "Commission Settings"}</h3>
          {sellers.filter(s => s.is_approved).map(seller => (
            <div key={seller.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">{seller.shop_name}</p>
                <p className="text-sm text-gray-500">{seller.user.full_name} Â· {seller.area}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {isArabic ? "Ø§Ù„Ø¥ÙŠØ±Ø§Ø¯Ø§Øª:" : "Revenue:"} AED {seller.total_revenue} Â·
                  {isArabic ? " Ø§Ù„Ø¹Ù…ÙˆÙ„Ø©:" : " Commission:"} AED {seller.total_commission}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{seller.commission_rate}%</div>
                  <div className="text-xs text-gray-400">{isArabic ? "Ø§Ù„Ù†Ø³Ø¨Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ©" : "Current rate"}</div>
                </div>
                <button onClick={() => { setCommissionModal(seller); setNewRate(String(seller.commission_rate)); }}
                  className="text-sm bg-orange-500 hover:bg-orange-600 text-gray-900 px-4 py-2 rounded-xl transition font-medium">
                  {isArabic ? "ØªØºÙŠÙŠØ±" : "Change"}
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
              { key: "all", label: isArabic ? "Ø§Ù„ÙƒÙ„" : "All" },
              { key: "pending", label: isArabic ? "Ù…Ø¹Ù„Ù‚" : "Pending" },
              { key: "approved", label: isArabic ? "Ù…ÙˆØ§ÙÙ‚" : "Approved" },
            ].map(f => (
              <button key={f.key} onClick={() => setSellerFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${sellerFilter === f.key ? "bg-orange-500 text-gray-900" : "bg-white text-gray-600 border border-gray-200"}`}>
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
                        {seller.is_approved ? (isArabic ? "Ù†Ø´Ø·" : "Active") : (isArabic ? "Ù…Ø¹Ù„Ù‚" : "Pending")}
                      </span>
                      <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                        {seller.commission_rate}% {isArabic ? "Ø¹Ù…ÙˆÙ„Ø©" : "commission"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{seller.user.full_name} Â· {seller.user.email}</p>
                    <p className="text-sm text-gray-500">ðŸ“ {seller.area}, {seller.city} Â· â­ {seller.rating} Â· ðŸ“¦ {seller.total_orders} {isArabic ? "Ø·Ù„Ø¨" : "orders"}</p>
                    {seller.badge_notes && <p className="text-xs text-orange-500 mt-1">ðŸ“ {seller.badge_notes}</p>}
                    <button onClick={() => setExpandedSeller(expandedSeller === seller.id ? null : seller.id)}
                      className="text-xs text-orange-500 hover:underline mt-2 inline-block">
                      {expandedSeller === seller.id ? "â–² Hide details" : "â–¼ View details"}
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {!seller.is_approved ? (
                      <button onClick={() => approveSeller(seller.id)} disabled={actionLoading === seller.id}
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition disabled:opacity-60 font-medium">
                        âœ“ {isArabic ? "Ù…ÙˆØ§ÙÙ‚Ø©" : "Approve"}
                      </button>
                    ) : (
                      <button onClick={() => disableSeller(seller.id)} disabled={actionLoading === seller.id}
                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition font-medium">
                        âœ• {isArabic ? "ØªØ¹Ø·ÙŠÙ„" : "Disable"}
                      </button>
                    )}
                    <button onClick={() => setBadgeModal(seller)}
                      className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg transition font-medium">
                      ðŸ… {isArabic ? "Ø´Ø§Ø±Ø©" : "Badge"}
                    </button>
                    <button onClick={() => { setCommissionModal(seller); setNewRate(String(seller.commission_rate)); }}
                      className="text-xs bg-orange-500 hover:bg-orange-600 text-gray-900 px-3 py-2 rounded-lg transition font-medium">
                      ðŸ’° {isArabic ? "Ø¹Ù…ÙˆÙ„Ø©" : "Commission"}
                    </button>
                    <button onClick={() => deleteSeller(seller)}
                      className="text-xs bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded-lg transition font-medium">
                      ðŸ—‘ï¸ {isArabic ? "Ø­Ø°Ù" : "Delete"}
                    </button>
                  </div>
                </div>
              {expandedSeller === seller.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  {(seller.sample_image_1 || seller.sample_image_2 || seller.sample_image_3) && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">{isArabic ? "ØµÙˆØ± Ø§Ù„Ø¹ÙŠÙ†Ø§Øª" : "Sample Photos"}</p>
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
                        <p className="text-xs text-gray-500 mb-0.5">{isArabic ? "ÙˆØ§ØªØ³Ø§Ø¨" : "WhatsApp"}</p>
                        <p className="font-medium text-gray-900">ðŸ“± {seller.whatsapp_number}</p>
                      </div>
                    )}
                    {seller.instagram_handle && (
                      <div className="bg-pink-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{isArabic ? "Ø¥Ù†Ø³ØªØºØ±Ø§Ù…" : "Instagram"}</p>
                        <p className="font-medium text-gray-900">ðŸ“¸ {seller.instagram_handle}</p>
                      </div>
                    )}
                    {seller.min_order_amount && (
                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{isArabic ? "Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ø¯Ù†Ù‰ Ù„Ù„Ø·Ù„Ø¨" : "Min Order"}</p>
                        <p className="font-medium text-gray-900">AED {seller.min_order_amount}</p>
                      </div>
                    )}
                    {seller.delivery_type && (
                      <div className="bg-orange-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{isArabic ? "Ø§Ù„ØªÙˆØµÙŠÙ„" : "Delivery"}</p>
                        <p className="font-medium text-gray-900">
                          {seller.delivery_type === "self" ? (isArabic ? "ðŸ  ÙŠÙˆØµÙ„ Ø¨Ù†ÙØ³Ù‡" : "ðŸ  Self delivery") : (isArabic ? "ðŸš— ÙŠØ­ØªØ§Ø¬ Ø¨ÙŠØªÙŠ" : "ðŸš— Needs Bayti")}
                        </p>
                      </div>
                    )}
                  </div>
                  {seller.description && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">{isArabic ? "Ø§Ù„ÙˆØµÙ" : "Description"}</p>
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
          <p className="text-sm text-gray-500">{allProducts.length} {isArabic ? "Ù…Ù†ØªØ¬" : "products total"}</p>
          {allProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-orange-50 flex items-center justify-center flex-shrink-0">
                {product.image_url
                  ? <img src={product.image_url.startsWith("http") ? product.image_url : `https://web-production-63685.up.railway.app${product.image_url}`} className="w-full h-full object-cover" alt={product.name} />
                  : <span className="text-2xl">ðŸ½ï¸</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500">ðŸ  {product.shop_name} Â· {product.category} Â· AED {product.price}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.is_available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {product.is_available ? (isArabic ? "Ù…ØªØ§Ø­" : "Live") : (isArabic ? "Ù…Ø®ÙÙŠ" : "Hidden")}
                </span>
                <button onClick={async () => {
                    await api.patch(`/api/admin/products/${product.id}/feature`);
                    setAllProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_featured: !p.is_featured } : p));
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg transition font-medium ${product.is_featured ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                  â­ {product.is_featured ? (isArabic ? "Ù…Ù…ÙŠØ²" : "Featured") : (isArabic ? "ØªÙ…ÙŠÙŠØ²" : "Feature")}
                </button>
                <button onClick={() => toggleProduct(product)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">
                  {product.is_available ? (isArabic ? "Ø¥Ø®ÙØ§Ø¡" : "Hide") : (isArabic ? "Ø¥Ø¸Ù‡Ø§Ø±" : "Show")}
                </button>
                <button onClick={() => deleteProductAdmin(product)}
                  className="text-xs bg-red-700 hover:bg-red-800 text-white px-3 py-1.5 rounded-lg transition">
                  ðŸ—‘
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
              <p className="text-sm text-gray-500 mt-1">{isArabic ? "Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø¥ÙŠØ±Ø§Ø¯Ø§Øª (30 ÙŠÙˆÙ…)" : "Total Revenue (30 days)"}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
              <p className="text-3xl font-bold text-green-500">AED {dailyRevenue.reduce((a, r) => a + r.commission, 0).toFixed(0)}</p>
              <p className="text-sm text-gray-500 mt-1">{isArabic ? "Ø¹Ù…ÙˆÙ„Ø© Ø¨ÙŠØªÙŠ (30 ÙŠÙˆÙ…)" : "Bayti Commission (30 days)"}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
              <p className="text-3xl font-bold text-blue-500">{dailyRevenue.reduce((a, r) => a + r.orders, 0)}</p>
              <p className="text-sm text-gray-500 mt-1">{isArabic ? "Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø·Ù„Ø¨Ø§Øª (30 ÙŠÙˆÙ…)" : "Total Orders (30 days)"}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="font-semibold text-gray-900">ðŸ“… {isArabic ? "Ø§Ù„Ø¥ÙŠØ±Ø§Ø¯Ø§Øª Ø§Ù„ÙŠÙˆÙ…ÙŠØ©" : "Daily Revenue"}</h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "Ø§Ù„ÙŠÙˆÙ…" : "Date"}</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "Ø§Ù„Ø·Ù„Ø¨Ø§Øª" : "Orders"}</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "Ø§Ù„Ø¥ÙŠØ±Ø§Ø¯Ø§Øª" : "Revenue"}</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">{isArabic ? "Ø§Ù„Ø¹Ù…ÙˆÙ„Ø©" : "Commission"}</th>
                </tr>
              </thead>
              <tbody>
                {dailyRevenue.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">{isArabic ? "Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¨ÙŠØ§Ù†Ø§Øª Ø¨Ø¹Ø¯" : "No data yet"}</td></tr>
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

      {/* Categories Tab */}
      {tab === "categories" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{isArabic ? "ØªØ­ÙƒÙ… ÙÙŠ Ø§Ù„ÙØ¦Ø§Øª Ø§Ù„Ù…Ø¹Ø±ÙˆØ¶Ø© Ù„Ù„Ø¹Ù…Ù„Ø§Ø¡" : "Control which categories are visible to customers"}</p>
          {managedCategories.map((cat: any) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
              {String(cat.icon).startsWith("/") ? <img src={cat.icon} alt={cat.name} className="w-10 h-10 object-contain" /> : <span className="text-3xl">{cat.icon}</span>}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{cat.name}</p>
                {cat.name_ar && <p className="text-sm text-gray-500">{cat.name_ar}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${cat.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {cat.is_active ? (isArabic ? "Ù†Ø´Ø·" : "Active") : (isArabic ? "Ù…Ø®ÙÙŠ" : "Hidden")}
                </span>
                <button onClick={async () => {
                  const res = await api.patch(`/api/admin/categories/${cat.id}/toggle`);
                  setManagedCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: res.data.is_active } : c));
                }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${cat.is_active ? "bg-green-500" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${cat.is_active ? "translate-x-6" : ""}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Tab */}
      {tab === "reviews" && (
        <div className="space-y-3">
          {pendingReviews.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">âœ…</div>
              <p>{isArabic ? "Ù„Ø§ ØªÙˆØ¬Ø¯ ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ù…Ø¹Ù„Ù‚Ø©" : "No pending reviews"}</p>
            </div>
          ) : pendingReviews.map((review: any) => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-400 text-lg">{"â˜…".repeat(review.rating)}{"â˜†".repeat(5 - review.rating)}</span>
                    <span className="font-medium text-gray-900">{review.buyer_name}</span>
                    <span className="text-gray-400 text-sm">â†’ {review.seller_name}</span>
                  </div>
                  {review.comment && <p className="text-sm text-gray-600 mt-1">"{review.comment}"</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={async () => {
                    await api.patch(`/api/reviews/admin/${review.id}/approve`);
                    setPendingReviews(prev => prev.filter(r => r.id !== review.id));
                  }} className="text-xs bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition">
                    âœ“ {isArabic ? "Ù…ÙˆØ§ÙÙ‚Ø©" : "Approve"}
                  </button>
                  <button onClick={async () => {
                    await api.delete(`/api/reviews/admin/${review.id}`);
                    setPendingReviews(prev => prev.filter(r => r.id !== review.id));
                  }} className="text-xs bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-xl font-medium transition">
                    ðŸ—‘ {isArabic ? "Ø­Ø°Ù" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                <p className="text-xs text-gray-500 mt-0.5">ðŸª {order.seller} Â· ðŸ‘¤ {order.buyer} Â· ðŸ“ {order.area}</p>
                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">AED {order.total}</p>
                <p className="text-xs text-green-600 font-medium">+AED {order.commission_amount} {isArabic ? "Ø¹Ù…ÙˆÙ„Ø©" : "commission"}</p>
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
                  {!u.is_active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{isArabic ? "Ù…Ø¹Ø·Ù„" : "Disabled"}</span>}
                </div>
                <p className="text-xs text-gray-500">{u.email} Â· {u.phone || "No phone"}</p>
              </div>
              {u.role !== "admin" && (
                <div className="flex gap-2">
                  <button onClick={() => toggleUser(u)}
                    className={`text-xs px-3 py-2 rounded-lg transition font-medium ${u.is_active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                    {u.is_active ? (isArabic ? "ØªØ¹Ø·ÙŠÙ„" : "Disable") : (isArabic ? "ØªÙØ¹ÙŠÙ„" : "Enable")}
                  </button>
                  {(u.role === "buyer" || u.role === "seller") && (
                    <button onClick={() => deleteUser(u)}
                      className="text-xs px-3 py-2 rounded-lg transition font-medium bg-red-700 text-white hover:bg-red-800">
                      ðŸ—‘ {isArabic ? "Ø­Ø°Ù" : "Delete"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Applications Tab */}
      {tab === "applications" && (
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            {[
              { key: "pending", label: isArabic ? "Ù…Ø¹Ù„Ù‚" : "Pending" },
              { key: "approved", label: isArabic ? "Ù…ÙˆØ§ÙÙ‚" : "Approved" },
              { key: "rejected", label: isArabic ? "Ù…Ø±ÙÙˆØ¶" : "Rejected" },
              { key: "all", label: isArabic ? "Ø§Ù„ÙƒÙ„" : "All" },
            ].map(f => (
              <button key={f.key} onClick={() => setAppFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${appFilter === f.key ? "bg-orange-500 text-gray-900" : "bg-white text-gray-600 border border-gray-200"}`}>
                {f.label}
              </button>
            ))}
          </div>

          {inviteLink && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
              <p className="text-sm font-medium text-green-800 mb-2">âœ… {isArabic ? "Ø±Ø§Ø¨Ø· Ø§Ù„ØªØ³Ø¬ÙŠÙ„ (Ø£Ø±Ø³Ù„Ù‡ Ù„Ù„Ø¨Ø§Ø¦Ø¹):" : "Registration link (send this to the seller):"}</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-white border border-green-200 rounded-lg px-3 py-2 break-all">
                  {`${window.location.origin}${inviteLink}`}
                </code>
                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}${inviteLink}`); alert("Copied!"); }}
                  className="text-xs bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition flex-shrink-0">
                  ðŸ“‹ {isArabic ? "Ù†Ø³Ø®" : "Copy"}
                </button>
              </div>
              <button onClick={() => setInviteLink(null)} className="text-xs text-green-600 hover:underline mt-2 block">
                {isArabic ? "Ø¥Ø®ÙØ§Ø¡" : "Dismiss"}
              </button>
            </div>
          )}

          {applications.filter(a => appFilter === "all" ? true : a.status === appFilter).length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">ðŸ“‹</div>
              <p>{isArabic ? "Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª" : "No applications"}</p>
            </div>
          ) : applications.filter(a => appFilter === "all" ? true : a.status === appFilter).map((app: any) => (
            <div key={app.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{app.full_name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      app.status === "pending" ? "bg-yellow-50 text-yellow-700" :
                      app.status === "approved" ? "bg-green-50 text-green-700" :
                      "bg-red-50 text-red-600"}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{app.email} Â· {app.phone}</p>
                  <p className="text-sm text-gray-500">ðŸ“ {app.area}, {app.city}</p>
                  <p className="text-sm text-gray-700 mt-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="font-medium text-gray-500 text-xs block mb-0.5">{isArabic ? "Ù…Ø§Ø°Ø§ Ø³ÙŠØ¨ÙŠØ¹:" : "What they sell:"}</span>
                    {app.what_they_sell}
                  </p>
                  {(app.doc_1_url || app.doc_2_url || app.doc_3_url) && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {[app.doc_1_url, app.doc_2_url, app.doc_3_url].filter(Boolean).map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                          className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition font-medium">
                          ðŸ“„ {isArabic ? `Ù…Ø³ØªÙ†Ø¯ ${i + 1}` : `Document ${i + 1}`}
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">{new Date(app.created_at).toLocaleDateString()}</p>
                </div>
                {app.status === "pending" && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      disabled={appActionLoading === app.id}
                      onClick={async () => {
                        setAppActionLoading(app.id);
                        try {
                          const res = await api.patch(`/api/applications/admin/${app.id}/approve`);
                          setInviteLink(res.data.registration_link);
                          setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "approved", invite_token: res.data.invite_token } : a));
                        } catch (e: any) { alert(e.response?.data?.detail || "Failed"); }
                        setAppActionLoading(null);
                      }}
                      className="text-xs bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition disabled:opacity-60">
                      âœ“ {isArabic ? "Ù…ÙˆØ§ÙÙ‚Ø©" : "Approve"}
                    </button>
                    <button
                      disabled={appActionLoading === app.id}
                      onClick={async () => {
                        setAppActionLoading(app.id);
                        try {
                          await api.patch(`/api/applications/admin/${app.id}/reject`);
                          setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "rejected" } : a));
                        } catch (e: any) { alert(e.response?.data?.detail || "Failed"); }
                        setAppActionLoading(null);
                      }}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition disabled:opacity-60">
                      âœ• {isArabic ? "Ø±ÙØ¶" : "Reject"}
                    </button>
                  </div>
                )}
                {app.status === "approved" && app.invite_token && (
                  <button onClick={() => setInviteLink(`/seller-register?token=${app.invite_token}`)}
                    className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-xl transition font-medium flex-shrink-0">
                    ðŸ”— {isArabic ? "Ø¹Ø±Ø¶ Ø§Ù„Ø±Ø§Ø¨Ø·" : "Show Link"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Badge Modal */}
      {badgeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-900 mb-1">{isArabic ? "ØªØ¹ÙŠÙŠÙ† Ø´Ø§Ø±Ø© Ø§Ù„ØªØ­Ù‚Ù‚" : "Set Verification Badge"}</h3>
            <p className="text-sm text-gray-500 mb-4">{badgeModal.shop_name}</p>
            <div className="space-y-3 mb-4">
              {[
                { key: "verified",  icon: "âœ“",  label: "Verified",      labelAr: "Ù…ÙˆØ«Ù‚",        desc: "ID confirmed, phone verified",          descAr: "Ù‡ÙˆÙŠØ© Ù…Ø¤ÙƒØ¯Ø©ØŒ Ù‡Ø§ØªÙ Ù…ÙˆØ«Ù‚" },
                { key: "inspected", icon: "/icons/bayti/ui/search.png", label: "Inspected",     labelAr: "Ù…ÙØªØ´",         desc: "Food safety certificate uploaded",       descAr: "Ø´Ù‡Ø§Ø¯Ø© Ø³Ù„Ø§Ù…Ø© ØºØ°Ø§Ø¦ÙŠØ© Ù…Ø±ÙÙˆØ¹Ø©" },
                { key: "certified", icon: "ðŸ…", label: "Certified",     labelAr: "Ù…Ø¹ØªÙ…Ø¯",        desc: "Passed mystery order quality test",      descAr: "Ø§Ø¬ØªØ§Ø²Øª Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ø¬ÙˆØ¯Ø© Ø§Ù„Ø³Ø±ÙŠ" },
                { key: "none",      icon: "âœ•",  label: "Remove Badge",  labelAr: "Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø´Ø§Ø±Ø©", desc: "Remove current badge",                  descAr: "Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø´Ø§Ø±Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ©" },
              ].map(b => (
                <button key={b.key} onClick={() => updateBadge(badgeModal.id, b.key)}
                  className={`w-full text-left p-3 rounded-xl border transition ${badgeModal.badge === b.key ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-orange-300"}`}>
                  <p className="font-medium text-gray-900 text-sm">{b.icon} {isArabic ? b.labelAr : b.label}</p>
                  <p className="text-xs text-gray-500">{isArabic ? b.descAr : b.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setBadgeModal(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-sm font-medium transition">
              {isArabic ? "Ø¥Ù„ØºØ§Ø¡" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {/* Commission Modal */}
      {commissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-900 mb-1">ðŸ’° {isArabic ? "ØªØ¹Ø¯ÙŠÙ„ Ù†Ø³Ø¨Ø© Ø§Ù„Ø¹Ù…ÙˆÙ„Ø©" : "Edit Commission Rate"}</h3>
            <p className="text-sm text-gray-500 mb-1">{commissionModal.shop_name}</p>
            <p className="text-xs text-gray-400 mb-4">{isArabic ? "Ø§Ù„Ù†Ø³Ø¨Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ©:" : "Current rate:"} {commissionModal.commission_rate}%</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{isArabic ? "Ø§Ù„Ù†Ø³Ø¨Ø© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© (%)" : "New Rate (%)"}</label>
              <input type="number" value={newRate} onChange={e => setNewRate(e.target.value)}
                min="0" max="50" step="0.5"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 text-lg font-bold" />
              <div className="flex gap-2 mt-3 flex-wrap">
                {[5, 8, 10, 12, 15, 20].map(r => (
                  <button key={r} onClick={() => setNewRate(String(r))}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${newRate === String(r) ? "bg-orange-500 text-gray-900" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {r}%
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">{isArabic ? "Ù†ØµÙŠØ­Ø©: 8% Ù„Ù„Ø¨Ø§Ø¦Ø¹ÙŠÙ† Ø§Ù„Ø¬Ø¯Ø¯ØŒ 12% Ø§ÙØªØ±Ø§Ø¶ÙŠØŒ 15% Ù„Ù„Ø¨Ø§Ø¦Ø¹ÙŠÙ† Ø°ÙˆÙŠ Ø§Ù„Ø£Ø¯Ø§Ø¡ Ø§Ù„Ù…Ù†Ø®ÙØ¶" : "Tip: 8% for new sellers, 12% default, 15% for underperformers"}</p>
            </div>

            {newRate && (
              <div className="bg-orange-50 rounded-xl p-3 mb-4">
                <p className="text-sm text-orange-800">
                  {isArabic ? "Ø¹Ù„Ù‰ Ø·Ù„Ø¨ Ø¨Ù‚ÙŠÙ…Ø© AED 100:" : "On a AED 100 order:"} <span className="font-bold">AED {(100 * parseFloat(newRate || "0") / 100).toFixed(2)}</span> {isArabic ? "Ø¹Ù…ÙˆÙ„Ø©" : "commission"}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setCommissionModal(null); setNewRate(""); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium transition">
                {isArabic ? "Ø¥Ù„ØºØ§Ø¡" : "Cancel"}
              </button>
              <button onClick={() => updateCommission(commissionModal.id)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-gray-900 py-3 rounded-xl text-sm font-medium transition">
                {isArabic ? "Ø­ÙØ¸" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demand Forecast */}
      {tab === "forecast" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isArabic ? "ðŸ”® ØªÙˆÙ‚Ø¹Ø§Øª Ø§Ù„Ø·Ù„Ø¨ Ø§Ù„Ù…ÙˆØ³Ù…ÙŠ" : "ðŸ”® Seasonal Demand Forecast"}
            </h2>
            <button
              onClick={async () => {
                setForecastLoading(true);
                try {
                  const res = await api.get("/api/ai/demand-forecast");
                  setForecast(res.data);
                } catch (e) {
                  console.error(e);
                } finally {
                  setForecastLoading(false);
                }
              }}
              className="bg-orange-500 hover:bg-orange-600 text-gray-900 px-4 py-2 rounded-xl text-sm font-medium transition">
              {forecastLoading ? (isArabic ? "Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù„ÙŠÙ„..." : "Analyzing...") : (isArabic ? "ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨" : "Run Forecast")}
            </button>
          </div>
          {!forecast && !forecastLoading && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="text-5xl mb-4">ðŸ”®</div>
              <p className="text-gray-500 text-lg mb-2">{isArabic ? "ØªÙˆÙ‚Ø¹Ø§Øª Ø§Ù„Ø·Ù„Ø¨ Ø§Ù„Ù…ÙˆØ³Ù…ÙŠ" : "UAE Seasonal Demand Forecasting"}</p>
              <p className="text-gray-400 text-sm">{isArabic ? "Ø§Ø¶ØºØ· Ø¹Ù„Ù‰ ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨ Ù„Ø±Ø¤ÙŠØ© ØªÙˆÙ‚Ø¹Ø§Øª ÙƒÙ„ ÙØ¦Ø©" : "Click Run Forecast to see demand predictions per category"}</p>
            </div>
          )}
          {forecastLoading && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="animate-spin text-4xl mb-4">â³</div>
              <p className="text-gray-500">{isArabic ? "Ø¬Ø§Ø±Ù ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙˆØ³Ù…ÙŠØ©..." : "Analyzing seasonal patterns..."}</p>
            </div>
          )}
          {forecast && !forecastLoading && (
            <div className="grid gap-4">
              {forecast.forecasts?.map((f: any) => (
                <div key={f.category_id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{isArabic ? f.category_name_ar || f.category_name : f.category_name}</h3>
                      <p className="text-orange-600 font-medium text-sm mt-1">
                        ðŸŽ¯ {isArabic ? f.top_season_ar : f.top_season}
                      </p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-right">
                      <p className="text-xs text-orange-600 font-medium">{isArabic ? "Ù†ØµÙŠØ­Ø©" : "Tip"}</p>
                      <p className="text-xs text-orange-700 mt-1 max-w-48">{isArabic ? f.tip_ar : f.tip}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {f.monthly_demand?.map((m: any) => (
                      <div key={`${m.month}-${m.year}`} className="flex-1 text-center">
                        <div className="relative h-16 bg-gray-100 rounded-lg overflow-hidden">
                          <div
                            className="absolute bottom-0 left-0 right-0 rounded-lg transition-all"
                            style={{
                              height: `${m.demand_index}%`,
                              backgroundColor: m.demand_index >= 80 ? '#FF5A1F' : m.demand_index >= 60 ? '#f97316' : m.demand_index >= 40 ? '#fb923c' : '#fed7aa'
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{new Date(m.year, m.month - 1).toLocaleString('default', { month: 'short' })}</p>
                        {m.season_label && <p className="text-xs text-orange-600 font-medium">{isArabic ? m.season_label_ar : m.season_label}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Instagram Content Tab */}
      {tab === "content" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {isArabic ? "ðŸŽ¨ Ù…ÙˆÙ„Ù‘Ø¯ Ù…Ø­ØªÙˆÙ‰ Ø¥Ù†Ø³ØªÙ‚Ø±Ø§Ù…" : "ðŸŽ¨ Instagram Content Generator"}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {isArabic ? "ÙŠÙˆÙ„Ù‘Ø¯ Ù†Øµ + ØµÙˆØ±Ø© Ø§Ø­ØªØ±Ø§ÙÙŠØ© Ø¬Ø§Ù‡Ø²Ø© Ù„Ù„Ù†Ø´Ø± Ø¹Ù„Ù‰ @baytimarketplace" : "Generate caption + AI image ready for @baytimarketplace"}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: "sellers", label: isArabic ? "ðŸ‘©â€ðŸ’¼ Ù„Ù„Ø¨Ø§Ø¦Ø¹Ø§Øª" : "ðŸ‘©â€ðŸ’¼ Sellers", desc: isArabic ? "Ø¯Ø¹ÙˆØ© ÙˆØªØ³Ø¬ÙŠÙ„" : "Recruitment", color: "bg-orange-500 hover:bg-orange-600" },
                { type: "events",  label: isArabic ? "ðŸŽ‰ ÙØ¹Ø§Ù„ÙŠØ§Øª ÙˆØªØ±Ù†Ø¯Ø§Øª" : "ðŸŽ‰ Events & Trends", desc: isArabic ? "Ø£Ø­Ø¯Ø§Ø« Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª" : "UAE Events", color: "bg-purple-500 hover:bg-purple-600" },
                { type: "value",   label: isArabic ? "ðŸ’¡ Ù…Ø­ØªÙˆÙ‰ Ù‚ÙŠÙ…Ø©" : "ðŸ’¡ Value Content", desc: isArabic ? "Ù†ØµØ§Ø¦Ø­ ÙˆØ£ÙÙƒØ§Ø±" : "Tips & Ideas", color: "bg-teal-500 hover:bg-teal-600" },
              ].map(btn => (
                <button key={btn.type}
                  onClick={async () => {
                    setContentLoading(true);
                    setContentPost(null);
                    setContentCopied(false);
                    try {
                      const res = await fetch("https://web-production-63685.up.railway.app/api/ai/instagram-content-v2", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: btn.type })
                      });
                      const data = await res.json();
                      setContentPost({ caption: data.caption, hashtags: data.hashtags, imageUrl: data.image_url || null, contentType: btn.type });
                    } catch {
                      alert(isArabic ? "Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ ØªÙˆÙ„ÙŠØ¯ Ø§Ù„Ù…Ø­ØªÙˆÙ‰" : "Error generating content");
                    } finally {
                      setContentLoading(false);
                    }
                  }}
                  disabled={contentLoading}
                  className={`${btn.color} text-white font-bold py-3 px-2 rounded-2xl transition disabled:opacity-50 text-sm flex flex-col items-center gap-1`}
                >
                  <span className="text-lg">{btn.label}</span>
                  <span className="text-xs opacity-80">{btn.desc}</span>
                </button>
              ))}
            </div>
            {contentLoading && (
              <div className="text-center py-4 text-gray-500">
                {isArabic ? "â³ Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªÙˆÙ„ÙŠØ¯... Ù‚Ø¯ ÙŠØ³ØªØºØ±Ù‚ Ù£Ù  Ø«Ø§Ù†ÙŠØ©" : "â³ Generating... may take 30 seconds"}
              </div>
            )}
          </div>

          {contentPost && (
            <>
              {contentPost.imageUrl && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-gray-900">{isArabic ? "Ø§Ù„ØµÙˆØ±Ø©" : "Image"}</p>
                    <a href={contentPost.imageUrl} download="bayti_post.png" className="text-sm text-orange-500 font-medium hover:text-orange-600">
                      {isArabic ? "â¬‡ï¸ ØªÙ†Ø²ÙŠÙ„" : "â¬‡ï¸ Download"}
                    </a>
                  </div>
                  <img src={contentPost.imageUrl} alt="Generated" className="w-full rounded-xl" />
                </div>
              )}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-gray-900">{isArabic ? "Ø§Ù„ÙƒØ§Ø¨Ø´Ù†" : "Caption"}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(contentPost.caption + "\n\n" + contentPost.hashtags);
                      setContentCopied(true);
                      setTimeout(() => setContentCopied(false), 2000);
                    }}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium transition"
                  >
                    {contentCopied ? "âœ… " + (isArabic ? "ØªÙ… Ø§Ù„Ù†Ø³Ø®!" : "Copied!") : (isArabic ? "ðŸ“‹ Ù†Ø³Ø® Ø§Ù„ÙƒÙ„" : "ðŸ“‹ Copy All")}
                  </button>
                </div>
                <div dir="rtl" className="bg-gray-50 rounded-xl p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {contentPost.caption}
                </div>
                <div className="mt-3 bg-gray-50 rounded-xl p-3 text-xs text-gray-500 leading-relaxed">
                  {contentPost.hashtags}
                </div>
              </div>
              <a href="https://publish.buffer.com" target="_blank" rel="noopener noreferrer"
                className="block w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition text-center text-lg">
                {isArabic ? "ðŸ“¤ Ø§ÙØªØ­ Buffer Ù„Ù„Ù†Ø´Ø±" : "ðŸ“¤ Open Buffer to Publish"}
              </a>
            </>
          )}
        </div>
      )}

      {/* Growth OS Tab */}
      {tab === "growth" && (
        <div className="-mx-4 -mb-4">
          <GrowthOSPage embedded={true} />
        </div>
      )}

    </div>
  );
}
