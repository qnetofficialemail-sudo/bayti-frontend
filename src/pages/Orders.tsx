import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const STATUS_COLORS: Record<string, string> = { pending: "bg-yellow-50 text-yellow-700 border-yellow-200", confirmed: "bg-blue-50 text-blue-700 border-blue-200", preparing: "bg-purple-50 text-purple-700 border-purple-200", ready: "bg-green-50 text-green-700 border-green-200", delivering: "bg-orange-50 text-orange-700 border-orange-200", delivered: "bg-gray-50 text-gray-600 border-gray-200", cancelled: "bg-red-50 text-red-600 border-red-200" };
const STATUS_AR: Record<string, string> = { pending: "قيد الانتظار", confirmed: "مؤكد", preparing: "جاري التحضير", ready: "جاهز", delivering: "في الطريق", delivered: "تم التوصيل", cancelled: "ملغي" };
const STATUS_STEPS = ["pending", "confirmed", "preparing", "ready", "delivering", "delivered"];
const STEP_LABELS_EN = ["Placed", "Confirmed", "Cooking", "Ready", "On way"];
const STEP_LABELS_AR = ["تم الطلب", "مؤكد", "جاري الطبخ", "جاهز", "في الطريق"];

export default function Orders() {
  const { user } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.get("/api/orders/my").then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">{isArabic ? "جاري التحميل..." : "Loading..."}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{isArabic ? "طلباتي" : "My Orders"}</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-lg mb-4">{isArabic ? "لا توجد طلبات بعد" : "No orders yet"}</p>
          <Link to="/" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition">{isArabic ? "تصفح المنتجات" : "Browse Products"}</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const stepIndex = STATUS_STEPS.indexOf(order.status);
            const stepLabels = isArabic ? STEP_LABELS_AR : STEP_LABELS_EN;
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">{isArabic ? "طلب" : "Order"} #{order.id}</span>
                    <span className="font-bold text-gray-900">AED {(order.total_amount + order.delivery_fee).toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {user?.role === "buyer" ? `🏠 ${order.seller?.shop_name}` : `👤 ${order.buyer?.full_name}`} · 📍 {order.delivery_area} · {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
                {order.status !== "cancelled" && (
                  <div className="px-5 py-4 bg-gray-50">
                    <div className="flex items-center gap-1">
                      {STATUS_STEPS.slice(0, -1).map((step, i) => (
                        <React.Fragment key={step}>
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= stepIndex ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-400"}`}>{i < stepIndex ? "✓" : i + 1}</div>
                          {i < STATUS_STEPS.length - 2 && <div className={`flex-1 h-1 rounded ${i < stepIndex ? "bg-orange-500" : "bg-gray-200"}`} />}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      {stepLabels.map((label, i) => (
                        <span key={label} className={`text-xs ${i <= stepIndex ? "text-orange-500 font-medium" : "text-gray-400"}`}>{label}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="px-5 py-4">
                  <div className="text-sm text-gray-600 mb-1">{order.items?.map((item: any) => `${item.quantity}x ${item.product?.name}`).join(", ")}</div>
                  <span className={`inline-block mt-2 text-xs border px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                    {isArabic ? STATUS_AR[order.status] : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
