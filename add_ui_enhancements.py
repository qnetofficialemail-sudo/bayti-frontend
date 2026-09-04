import os
FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'

# ── 1. Add search bar to Landing hero ──
landing_path = os.path.join(FRONTEND, 'src', 'pages', 'Landing.tsx')
content = open(landing_path, encoding='utf-8').read()

old = '''          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/marketplace"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition shadow-lg shadow-orange-200">
              {isArabic ? "🍽️ اطلب الآن" : "🍽️ Order Now"}
            </Link>
            <Link to="/register"
              className="bg-white hover:bg-gray-50 text-gray-900 font-semibold px-8 py-4 rounded-2xl text-lg transition border-2 border-gray-200 hover:border-orange-300">
              {isArabic ? "🏪 ابدأ البيع" : "🏪 Start Selling"}
            </Link>
          </div>'''

new = '''          {/* Search bar */}
          <div className="max-w-xl mx-auto mb-6">
            <form onSubmit={e => { e.preventDefault(); const q = (e.target as any).q.value; if (q) window.location.href = `/marketplace?search=${encodeURIComponent(q)}`; }}
              className="flex gap-2 bg-white rounded-2xl shadow-lg p-2 border border-gray-100">
              <input name="q" type="text"
                placeholder={isArabic ? "ابحث عن مجبوس، حلويات، كنافة..." : "Search for Machboos, sweets, Kunafa..."}
                className="flex-1 px-4 py-2 text-gray-900 focus:outline-none bg-transparent" />
              <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-medium transition">
                {isArabic ? "بحث" : "Search"}
              </button>
            </form>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/marketplace"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition shadow-lg shadow-orange-200">
              {isArabic ? "🍽️ تصفح المنتجات" : "🍽️ Browse Food"}
            </Link>
            <Link to="/register"
              className="bg-white hover:bg-gray-50 text-gray-900 font-semibold px-8 py-4 rounded-2xl text-lg transition border-2 border-gray-200 hover:border-orange-300">
              {isArabic ? "🏪 ابدأ البيع" : "🏪 Start Selling"}
            </Link>
          </div>'''

if old in content:
    content = content.replace(old, new)
    open(landing_path, 'w', encoding='utf-8').write(content)
    print("✅ 1. Landing search bar added")
else:
    print("❌ 1. Landing hero pattern not found")

# ── 2. Add "New" badge to product cards in Home.tsx ──
home_path = os.path.join(FRONTEND, 'src', 'pages', 'Home.tsx')
content = open(home_path, encoding='utf-8').read()

# Add new badge to the image section
old2 = '''                <div className="h-48 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden relative">'''
new2 = '''                <div className="h-48 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden relative">
                  {product.created_at && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                      {isArabic ? "جديد" : "New"}
                    </span>
                  )}'''

content = content.replace(old2, new2)
open(home_path, 'w', encoding='utf-8').write(content)
print("✅ 2. 'New' badge added to product cards")

# ── 3. Add related products to ProductDetail.tsx ──
detail_path = os.path.join(FRONTEND, 'src', 'pages', 'ProductDetail.tsx')
content = open(detail_path, encoding='utf-8').read()

# Add related products state
old3 = "  const [reviews, setReviews] = useState<any[]>([]);"
new3 = "  const [reviews, setReviews] = useState<any[]>([]);\n  const [related, setRelated] = useState<any[]>([]);"

# Load related products
old4 = "        api.get(`/api/reviews/seller/${r.data.seller.id}`).then(rv => setReviews(rv.data)).catch(() => {});"
new4 = '''        api.get(`/api/reviews/seller/${r.data.seller.id}`).then(rv => setReviews(rv.data)).catch(() => {});
        api.get("/api/products/", { params: { seller_id: r.data.seller.id } }).then(rel => {
          setRelated(rel.data.filter((p: any) => p.id !== Number(id)).slice(0, 3));
        }).catch(() => {});'''

content = content.replace(old3, new3).replace(old4, new4)

# Add related products section after reviews
old5 = '''          <Link to="/" className='''
new5 = '''          {/* More from this seller */}
          {related.length > 0 && (
            <div className="mt-8">
              <h3 className="font-bold text-gray-900 mb-4">
                🏠 {isArabic ? `المزيد من ${product.seller?.shop_name}` : `More from ${product.seller?.shop_name}`}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {related.map(p => {
                  const name = isArabic && p.name_ar ? p.name_ar : p.name;
                  const imgUrl = p.image_url ? (p.image_url.startsWith("http") ? p.image_url : `https://web-production-63685.up.railway.app${p.image_url}`) : null;
                  return (
                    <Link key={p.id} to={`/product/${p.id}`}
                      className="flex gap-3 bg-gray-50 rounded-xl p-3 hover:bg-orange-50 transition">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                        {imgUrl ? <img src={imgUrl} alt={name} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-2xl">{p.category?.icon || "🍽️"}</span>}
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

          <Link to="/" className='''

content = content.replace(old5, new5)
open(detail_path, 'w', encoding='utf-8').write(content)
print("✅ 3. Related products added to product detail")

# ── 4. Create Categories page ──
categories_tsx = r'''import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";

export default function CategoriesPage() {
  const { isArabic } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/categories"),
      api.get("/api/products/"),
    ]).then(([c, p]) => {
      setCategories(c.data);
      const countMap: Record<number, number> = {};
      p.data.forEach((prod: any) => {
        if (prod.category?.id) countMap[prod.category.id] = (countMap[prod.category.id] || 0) + 1;
      });
      setCounts(countMap);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{isArabic ? "تصفح الفئات" : "Browse Categories"}</h1>
      <p className="text-gray-500 mb-8">{isArabic ? "اكتشف ما يناسب ذوقك" : "Discover what suits your taste"}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map(cat => (
          <Link key={cat.id} to={`/marketplace?category=${cat.id}`}
            className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:border-orange-300 hover:shadow-md transition group">
            <div className="text-5xl mb-3">{cat.icon}</div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              {isArabic && cat.name_ar ? cat.name_ar : cat.name}
            </h3>
            <p className="text-xs text-orange-500 font-medium">
              {counts[cat.id] || 0} {isArabic ? "منتج" : "products"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
'''

cat_path = os.path.join(FRONTEND, 'src', 'pages', 'CategoriesPage.tsx')
open(cat_path, 'w', encoding='utf-8').write(categories_tsx)
print("✅ 4. CategoriesPage.tsx created")

# ── 5. Add categories route and link in navbar ──
app_path = os.path.join(FRONTEND, 'src', 'App.tsx')
content = open(app_path, encoding='utf-8').read()

old6 = 'import EditShop from "./pages/EditShop";'
new6 = 'import EditShop from "./pages/EditShop";\nimport CategoriesPage from "./pages/CategoriesPage";'

old7 = '              <Route path="/seller/shop/edit" element={<><Navbar /><EditShop /></>} />'
new7 = '              <Route path="/seller/shop/edit" element={<><Navbar /><EditShop /></>} />\n              <Route path="/categories" element={<><Navbar /><CategoriesPage /></>} />'

content = content.replace(old6, new6).replace(old7, new7)
open(app_path, 'w', encoding='utf-8').write(content)
print("✅ 5. Categories route added to App.tsx")

# ── 6. Add categories link to Home.tsx ──
content = open(home_path, encoding='utf-8').read()
old8 = '      <div className="max-w-6xl mx-auto px-4 py-8">'
new8 = '''      <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-end mb-2">
        <Link to="/categories" className="text-sm text-orange-500 hover:underline">
          {isArabic ? "تصفح جميع الفئات ←" : "Browse all categories →"}
        </Link>
      </div>'''
content = content.replace(old8, new8)
open(home_path, 'w', encoding='utf-8').write(content)
print("✅ 6. Categories link added to marketplace")

print("\n🎉 All done! Push frontend.")
