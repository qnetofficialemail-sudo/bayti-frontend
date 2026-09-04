import os
FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'

admin_path = os.path.join(FRONTEND, 'src', 'pages', 'AdminPanel.tsx')
content = open(admin_path, encoding='utf-8').read()

# Add reviews state
old = '  const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);'
new = '  const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);\n  const [pendingReviews, setPendingReviews] = useState<any[]>([]);'
content = content.replace(old, new)

# Add tab type
old2 = '  const [tab, setTab] = useState<"overview"|"sellers"|"orders"|"users"|"commission"|"products"|"revenue">("overview");'
new2 = '  const [tab, setTab] = useState<"overview"|"sellers"|"orders"|"users"|"commission"|"products"|"revenue"|"reviews">("overview");'
content = content.replace(old2, new2)

# Load reviews
old3 = '        api.get("/api/admin/revenue/daily"),\n      ]);'
new3 = '        api.get("/api/admin/revenue/daily"),\n        api.get("/api/reviews/admin/pending"),\n      ]);'
content = content.replace(old3, new3)

old4 = '      setDailyRevenue(rev.data);'
new4 = '      setDailyRevenue(rev.data);\n      setPendingReviews(prods2.data);'
content = content.replace(old4, new4)

# Fix the destructuring
old5 = '      const [s, sel, o, u, cs, prods, rev] = await Promise.all(['
new5 = '      const [s, sel, o, u, cs, prods, rev, prods2] = await Promise.all(['
content = content.replace(old5, new5)

# Add Reviews tab to tab bar
old6 = '''          { key: "products",   label: isArabic ? "المنتجات" : "Products",    icon: "🍽️" },
          { key: "revenue",    label: isArabic ? "الإيرادات" : "Revenue",    icon: "📈" },'''
new6 = '''          { key: "products",   label: isArabic ? "المنتجات" : "Products",    icon: "🍽️" },
          { key: "revenue",    label: isArabic ? "الإيرادات" : "Revenue",    icon: "📈" },
          { key: "reviews",    label: isArabic ? `التقييمات${pendingReviews.length > 0 ? ` (${pendingReviews.length})` : ""}` : `Reviews${pendingReviews.length > 0 ? ` (${pendingReviews.length})` : ""}`, icon: "⭐" },'''
content = content.replace(old6, new6)

# Add reviews tab content before the closing of tabs
old7 = '      {/* Orders Tab */}'
new7 = '''      {/* Reviews Tab */}
      {tab === "reviews" && (
        <div className="space-y-3">
          {pendingReviews.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">✅</div>
              <p>{isArabic ? "لا توجد تقييمات معلقة" : "No pending reviews"}</p>
            </div>
          ) : pendingReviews.map((review: any) => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-400 text-lg">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                    <span className="font-medium text-gray-900">{review.buyer_name}</span>
                    <span className="text-gray-400 text-sm">→ {review.seller_name}</span>
                  </div>
                  {review.comment && <p className="text-sm text-gray-600 mt-1">"{review.comment}"</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={async () => {
                    await api.patch(`/api/reviews/admin/${review.id}/approve`);
                    setPendingReviews(prev => prev.filter(r => r.id !== review.id));
                  }} className="text-xs bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition">
                    ✓ {isArabic ? "موافقة" : "Approve"}
                  </button>
                  <button onClick={async () => {
                    await api.delete(`/api/reviews/admin/${review.id}`);
                    setPendingReviews(prev => prev.filter(r => r.id !== review.id));
                  }} className="text-xs bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-xl font-medium transition">
                    🗑 {isArabic ? "حذف" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Orders Tab */}'''
content = content.replace(old7, new7)

open(admin_path, 'w', encoding='utf-8').write(content)
print("✅ Admin panel updated with Reviews tab")
