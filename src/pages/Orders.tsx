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
  const [reviewModal, setReviewModal] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewedOrders, setReviewedOrders] = useState<number[]>([]);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.get("/api/orders/my").then(r => {
      setOrders(r.data);
      // Check which delivered orders have been reviewed
      const delivered = r.data.filter((o: any) => o.status === "delivered");
      if (delivered.length > 0) {
        Promise.all(delivered.map((o: any) =>
          api.get(`/api/reviews/check/${o.id}`).catch(() => ({ data: { reviewed: false } }))
        )).then(results => {
                    const ids: number[] = [];
          results.forEach((res: any, i: number) => {
            if (res.data?.reviewed) ids.push(delivered[i].id);
          });
          setReviewedOrders(ids);
        });
      }
    }).finally(() => setLoading(false));
  }, [user]);

  const submitReview = async () => {
    if (!reviewModal) return;
    setReviewSubmitting(true);
    try {
      await api.post(`/api/reviews/?order_id=${reviewModal.id}&rating=${reviewRating}${reviewComment ? `&comment=${encodeURIComponent(reviewComment)}` : ""}`);
      setReviewedOrders(prev => [...prev, reviewModal.id]);
      setReviewModal(null);
      setReviewComment("");
      setReviewRating(5);
    } catch (e) { console.error(e); }
    finally { setReviewSubmitting(false); }
  };

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
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`inline-block text-xs border px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                      {isArabic ? STATUS_AR[order.status] : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    {order.status === "delivered" && user?.role === "buyer" && (
                      reviewedOrders.includes(order.id) ? (
                        <span className="text-xs text-green-600 font-medium">⭐ {isArabic ? "تم التقييم" : "Reviewed"}</span>
                      ) : (
                        <button onClick={() => { setReviewModal(order); setReviewRating(5); setReviewComment(""); }}
                          className="text-xs bg-orange-50 text-orange-600 hover:bg-orange-100 px-3 py-1 rounded-full font-medium transition">
                          ⭐ {isArabic ? "قيّم الطلب" : "Rate Order"}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Review Modal */}
      {reviewModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <h3 className="font-bold text-gray-900 mb-1">⭐ {isArabic ? "قيّم طلبك" : "Rate Your Order"}</h3>
          <p className="text-sm text-gray-500 mb-4">{reviewModal.seller?.shop_name}</p>

          {/* Star rating */}
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} onClick={() => setReviewRating(star)}
                className={`text-3xl transition ${star <= reviewRating ? "text-yellow-400" : "text-gray-200"}`}>
                ★
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mb-4">
            {reviewRating === 5 ? (isArabic ? "ممتاز! 🎉" : "Excellent! 🎉") :
             reviewRating === 4 ? (isArabic ? "جيد جداً 👍" : "Very Good 👍") :
             reviewRating === 3 ? (isArabic ? "مقبول" : "OK") :
             reviewRating === 2 ? (isArabic ? "يحتاج تحسين" : "Needs improvement") :
             (isArabic ? "سيئ" : "Poor")}
          </p>

          <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)}
            placeholder={isArabic ? "أضف تعليقاً (اختياري)..." : "Add a comment (optional)..."}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none mb-4" />

          <div className="flex gap-3">
            <button onClick={() => setReviewModal(null)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium transition">
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
            <button onClick={submitReview} disabled={reviewSubmitting}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-medium transition disabled:opacity-60">
              {reviewSubmitting ? "..." : (isArabic ? "إرسال" : "Submit")}
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
