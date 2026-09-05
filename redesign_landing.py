import os
FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'

# Rewrite Landing.tsx with category selection as the hero
landing_tsx = r'''import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import CookOfWeek from "../components/CookOfWeek";

export default function Landing() {
  const { isArabic, toggleLanguage } = useLanguage();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState({ sellers: 0, products: 0 });
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "seller") navigate("/seller/dashboard", { replace: true });
      else if (user.role === "admin") navigate("/admin", { replace: true });
      else navigate("/marketplace", { replace: true });
    }
  }, [user?.id, isLoading]);

  useEffect(() => {
    api.get("/api/categories").then(r => setCategories(r.data)).catch(() => {});
    Promise.all([api.get("/api/sellers/"), api.get("/api/products/")]).then(([s, p]) => {
      setStats({ sellers: s.data.length, products: p.data.length });
    }).catch(() => {});
  }, []);

  if (isLoading) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/marketplace?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className={`min-h-screen bg-white ${isArabic ? "rtl" : "ltr"}`} dir={isArabic ? "rtl" : "ltr"}>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <span className="font-bold text-gray-900 text-xl">بيتي <span className="text-orange-500">Bayti</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={toggleLanguage} className="text-sm text-gray-500 hover:text-orange-500 transition px-2">
              {isArabic ? "EN" : "عربي"}
            </button>
            <Link to="/login" className="text-sm text-gray-600 hover:text-orange-500 px-3 py-2 rounded-lg transition">
              {isArabic ? "تسجيل الدخول" : "Login"}
            </Link>
            <Link to="/register" className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition font-medium">
              {isArabic ? "انضم إلينا" : "Join Us"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-orange-100 text-orange-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            🇦🇪 {isArabic ? "سوق المنزل الإماراتي الأول" : "UAE's First Home Business Marketplace"}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-4">
            {isArabic ? (
              <>اكتشف منتجات<br /><span className="text-orange-500">منزلية أصيلة</span></>
            ) : (
              <>Discover authentic<br /><span className="text-orange-500">homemade products</span></>
            )}
          </h1>
          <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
            {isArabic
              ? "من المشغولات اليدوية إلى العطور والمأكولات — اختر ما يناسبك"
              : "From handmade crafts to perfumes and food — choose what suits you"}
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
            <div className="flex gap-2 bg-white rounded-2xl shadow-lg p-2 border border-gray-100">
              <input value={search} onChange={e => setSearch(e.target.value)} type="text"
                placeholder={isArabic ? "ابحث عن منتجات، طباخين، حرفيين..." : "Search for products, cooks, artisans..."}
                className="flex-1 px-4 py-2 text-gray-900 focus:outline-none bg-transparent" />
              <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-medium transition">
                {isArabic ? "بحث" : "Search"}
              </button>
            </div>
          </form>

          {/* Live stats */}
          {stats.sellers > 0 && (
            <div className="flex justify-center gap-8 text-center">
              <div>
                <p className="text-3xl font-bold text-orange-500">{stats.sellers}+</p>
                <p className="text-sm text-gray-500">{isArabic ? "بائع منزلي" : "Home Sellers"}</p>
              </div>
              <div className="w-px bg-gray-200" />
              <div>
                <p className="text-3xl font-bold text-orange-500">{stats.products}+</p>
                <p className="text-sm text-gray-500">{isArabic ? "منتج متاح" : "Products Available"}</p>
              </div>
              <div className="w-px bg-gray-200" />
              <div>
                <p className="text-3xl font-bold text-orange-500">🇦🇪</p>
                <p className="text-sm text-gray-500">{isArabic ? "كل الإمارات" : "All UAE"}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Category Selection - THE MAIN FEATURE */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {isArabic ? "ماذا تريد اليوم؟" : "What are you looking for?"}
            </h2>
            <p className="text-gray-500">
              {isArabic ? "اختر الفئة واكتشف أفضل المنتجات المنزلية" : "Choose a category and discover the best homemade products"}
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {isArabic ? "جاري التحميل..." : "Loading..."}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map(cat => (
                <Link key={cat.id} to={`/marketplace?category=${cat.id}`}
                  className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-orange-400 hover:shadow-lg p-6 text-center transition-all duration-200 cursor-pointer">
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-200">{cat.icon}</div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {isArabic && cat.name_ar ? cat.name_ar : cat.name}
                  </h3>
                </Link>
              ))}
              {/* Browse All */}
              <Link to="/marketplace"
                className="group bg-orange-500 hover:bg-orange-600 rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer">
                <div className="text-5xl mb-3">🛍️</div>
                <h3 className="font-semibold text-white text-sm">
                  {isArabic ? "تصفح الكل" : "Browse All"}
                </h3>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Cook/Seller of the Week */}
      <CookOfWeek />

      {/* For Sellers */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-orange-500 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                {isArabic ? "للبائعين المنزليين" : "For Home Sellers"}
              </div>
              <h2 className="text-3xl font-bold mb-6">
                {isArabic ? "حوّل موهبتك إلى مصدر دخل" : "Turn your talent into income"}
              </h2>
              <div className="space-y-4 mb-8">
                {[
                  { icon: "📸", text: isArabic ? "أضف صور منتجاتك والذكاء الاصطناعي يكتب لك الوصف" : "Upload photos and AI writes your listing" },
                  { icon: "⏰", text: isArabic ? "حدد أوقات عملك وأيامك المناسبة" : "Set your own working hours and days" },
                  { icon: "📦", text: isArabic ? "تتبع الطلبات من لوحة تحكم سهلة" : "Track orders from a simple dashboard" },
                  { icon: "💰", text: isArabic ? "استلم مدفوعاتك بعد كل طلب" : "Get paid after every order" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-gray-300">{item.text}</p>
                  </div>
                ))}
              </div>
              <Link to="/register"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition">
                {isArabic ? "ابدأ الآن — مجاناً" : "Start Now — Free"}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "🎨", label: isArabic ? "مشغولات يدوية" : "Handmade Crafts" },
                { icon: "🕯️", label: isArabic ? "شموع وعطور" : "Candles & Perfumes" },
                { icon: "👗", label: isArabic ? "أزياء وإكسسوار" : "Fashion & Accessories" },
                { icon: "🍰", label: isArabic ? "حلويات" : "Sweets" },
                { icon: "🍛", label: isArabic ? "وجبات منزلية" : "Home Meals" },
                { icon: "✨", label: isArabic ? "عناية بالبشرة" : "Skincare" },
              ].map((item, i) => (
                <div key={i} className="bg-gray-700 rounded-2xl p-4 text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <p className="text-sm text-gray-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">
            {isArabic ? "لماذا بيتي؟" : "Why Bayti?"}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "✔️", title: isArabic ? "بائعون موثوقون" : "Verified Sellers", desc: isArabic ? "كل بائع يمر بمراجعة قبل القبول" : "Every seller is reviewed before approval" },
              { icon: "🌍", title: isArabic ? "عربي وإنجليزي" : "Arabic & English", desc: isArabic ? "المنصة تدعم اللغتين بالكامل" : "Full bilingual support for UAE" },
              { icon: "📍", title: isArabic ? "كل الإمارات" : "All UAE", desc: isArabic ? "دبي، الشارقة، أبوظبي وأكثر" : "Dubai, Sharjah, Abu Dhabi and more" },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl border border-gray-100 bg-gray-50">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-orange-500">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            {isArabic ? "جاهز تبدأ؟" : "Ready to start?"}
          </h2>
          <p className="text-orange-100 mb-8 text-lg">
            {isArabic ? "اكتشف أفضل المنتجات المنزلية في الإمارات" : "Discover the best homemade products in the UAE"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/marketplace"
              className="bg-white text-orange-500 hover:bg-orange-50 font-bold px-8 py-4 rounded-2xl text-lg transition">
              {isArabic ? "🛍️ تصفح المنتجات" : "🛍️ Browse Products"}
            </Link>
            <Link to="/register"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition border-2 border-orange-400">
              {isArabic ? "🏪 ابدأ البيع" : "🏪 Start Selling"}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p>© 2026 بيتي Bayti · {isArabic ? "جميع الحقوق محفوظة" : "All rights reserved"} · UAE 🇦🇪</p>
      </footer>
    </div>
  );
}
'''

landing_path = os.path.join(FRONTEND, 'src', 'pages', 'Landing.tsx')
open(landing_path, 'w', encoding='utf-8').write(landing_tsx)
print("✅ Landing.tsx rewritten with category selection")
