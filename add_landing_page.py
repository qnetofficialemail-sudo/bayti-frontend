import os

FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'

landing_tsx = r'''import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import api from "../api/client";

export default function Landing() {
  const { isArabic, toggleLanguage } = useLanguage();
  const [stats, setStats] = useState({ sellers: 0, products: 0 });

  useEffect(() => {
    Promise.all([
      api.get("/api/sellers/"),
      api.get("/api/products/"),
    ]).then(([s, p]) => {
      setStats({ sellers: s.data.length, products: p.data.length });
    }).catch(() => {});
  }, []);

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
            <Link to="/marketplace" className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition font-medium">
              {isArabic ? "تصفح المنتجات" : "Browse Food"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-orange-100 text-orange-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            🇦🇪 {isArabic ? "منصة الأكل المنزلي الأولى في الإمارات" : "UAE's First Home Food Marketplace"}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            {isArabic ? (
              <>أكل بيتي،<br /><span className="text-orange-500">يوصلك على بابك</span></>
            ) : (
              <>Homemade food,<br /><span className="text-orange-500">delivered to your door</span></>
            )}
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            {isArabic
              ? "اكتشف أشهى الأكلات المنزلية من طباخين موهوبين في منطقتك. مجبوس، حلويات، معجنات وأكثر."
              : "Discover authentic homemade dishes from talented cooks in your area. Machboos, sweets, pastries and more."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/marketplace"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition shadow-lg shadow-orange-200">
              {isArabic ? "🍽️ اطلب الآن" : "🍽️ Order Now"}
            </Link>
            <Link to="/register"
              className="bg-white hover:bg-gray-50 text-gray-900 font-semibold px-8 py-4 rounded-2xl text-lg transition border-2 border-gray-200 hover:border-orange-300">
              {isArabic ? "🏪 ابدأ البيع" : "🏪 Start Selling"}
            </Link>
          </div>

          {/* Live stats */}
          {(stats.sellers > 0 || stats.products > 0) && (
            <div className="flex justify-center gap-8 mt-12 text-center">
              <div>
                <p className="text-3xl font-bold text-orange-500">{stats.sellers}+</p>
                <p className="text-sm text-gray-500">{isArabic ? "طباخ منزلي" : "Home Cooks"}</p>
              </div>
              <div className="w-px bg-gray-200" />
              <div>
                <p className="text-3xl font-bold text-orange-500">{stats.products}+</p>
                <p className="text-sm text-gray-500">{isArabic ? "منتج طازج" : "Fresh Products"}</p>
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

      {/* How it works - Buyers */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {isArabic ? "كيف تطلب؟" : "How to Order"}
            </h2>
            <p className="text-gray-500">{isArabic ? "ثلاث خطوات بسيطة" : "Three simple steps"}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🔍", step: "1", title: isArabic ? "تصفح" : "Browse", desc: isArabic ? "اكتشف أشهى الأكلات المنزلية من طباخين موثوقين في منطقتك" : "Discover homemade dishes from verified cooks near you" },
              { icon: "🛒", step: "2", title: isArabic ? "اطلب" : "Order", desc: isArabic ? "اختر ما يشتهيك وأضف عنوان التوصيل وأكد طلبك" : "Pick your favorite dish, add your address and confirm" },
              { icon: "🚗", step: "3", title: isArabic ? "استلم" : "Receive", desc: isArabic ? "تتبع طلبك لحظة بلحظة حتى يصل إلى بابك طازجاً" : "Track your order in real time until it arrives fresh" },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-orange-50 border border-orange-100">
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">{item.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Sellers */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-orange-500 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                {isArabic ? "للطباخات المنزليات" : "For Home Cooks"}
              </div>
              <h2 className="text-3xl font-bold mb-6">
                {isArabic ? "حوّلي شغفك بالطبخ إلى مصدر دخل" : "Turn your cooking passion into income"}
              </h2>
              <div className="space-y-4 mb-8">
                {[
                  { icon: "📸", text: isArabic ? "أضيفي صور منتجاتك والذكاء الاصطناعي يكتب لك الوصف" : "Upload photos and AI writes your product listing" },
                  { icon: "⏰", text: isArabic ? "حددي أوقات عملك وأيامك المناسبة" : "Set your own working hours and days" },
                  { icon: "📦", text: isArabic ? "تتبعي الطلبات وأدير متجرك من لوحة تحكم سهلة" : "Track orders and manage your shop from a simple dashboard" },
                  { icon: "💰", text: isArabic ? "استلمي مدفوعاتك بعد كل طلب" : "Get paid after every order" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-gray-300">{item.text}</p>
                  </div>
                ))}
              </div>
              <Link to="/register"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition">
                {isArabic ? "ابدئي الآن — مجاناً" : "Start Now — Free"}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "🍛", label: isArabic ? "وجبات منزلية" : "Home Meals" },
                { icon: "🍰", label: isArabic ? "حلويات" : "Sweets" },
                { icon: "🥐", label: isArabic ? "مخبوزات" : "Baked Goods" },
                { icon: "🧃", label: isArabic ? "عصائر" : "Juices" },
                { icon: "🎨", label: isArabic ? "مشغولات يدوية" : "Crafts" },
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

      {/* Trust section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">
            {isArabic ? "لماذا بيتي؟" : "Why Bayti?"}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "✔️", title: isArabic ? "بائعون موثوقون" : "Verified Sellers", desc: isArabic ? "كل بائع يمر بمراجعة قبل القبول" : "Every seller is reviewed before approval" },
              { icon: "🌍", title: isArabic ? "عربي وإنجليزي" : "Arabic & English", desc: isArabic ? "المنصة تدعم اللغتين بالكامل" : "Full bilingual support for UAE's community" },
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
            {isArabic ? "جاهز تطلب؟" : "Ready to order?"}
          </h2>
          <p className="text-orange-100 mb-8 text-lg">
            {isArabic ? "اكتشف أشهى الأكلات المنزلية في منطقتك الآن" : "Discover the best homemade food in your area right now"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/marketplace"
              className="bg-white text-orange-500 hover:bg-orange-50 font-bold px-8 py-4 rounded-2xl text-lg transition">
              {isArabic ? "🍽️ تصفح المنتجات" : "🍽️ Browse Products"}
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

# Save landing page
landing_path = os.path.join(FRONTEND, 'src', 'pages', 'Landing.tsx')
open(landing_path, 'w', encoding='utf-8').write(landing_tsx)
print("✅ 1. Landing.tsx created")

# Update App.tsx - move Home to /marketplace, Landing to /
app_path = os.path.join(FRONTEND, 'src', 'App.tsx')
content = open(app_path, encoding='utf-8').read()

old1 = 'import SellerProfilePage from "./pages/SellerProfilePage";'
new1 = '''import SellerProfilePage from "./pages/SellerProfilePage";
import Landing from "./pages/Landing";'''

old2 = '''              <Route path="/" element={<Home />} />'''
new2 = '''              <Route path="/" element={<Landing />} />
              <Route path="/marketplace" element={<Home />} />'''

# Hide navbar on landing page
old3 = '''          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/marketplace" element={<Home />} />'''
new3 = '''          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/marketplace" element={<><Navbar /><Home /></>} />'''

content = content.replace(old1, new1).replace(old2, new2)

# Make other routes keep navbar
old4 = '''              <Route path="/marketplace" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />'''
new4 = '''              <Route path="/marketplace" element={<><Navbar /><Home /></>} />
              <Route path="/login" element={<><Navbar /><LoginPage /></>} />'''

old5 = '''              <Route path="/login" element={<><Navbar /><LoginPage /></>} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/seller/setup" element={<SellerSetup />} />
              <Route path="/seller/products/new" element={<AddProduct />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/shop/:id" element={<SellerProfilePage />} />'''
new5 = '''              <Route path="/login" element={<><Navbar /><LoginPage /></>} />
              <Route path="/register" element={<><Navbar /><RegisterPage /></>} />
              <Route path="/product/:id" element={<><Navbar /><ProductDetail /></>} />
              <Route path="/orders" element={<><Navbar /><Orders /></>} />
              <Route path="/seller/dashboard" element={<><Navbar /><SellerDashboard /></>} />
              <Route path="/seller/setup" element={<><Navbar /><SellerSetup /></>} />
              <Route path="/seller/products/new" element={<><Navbar /><AddProduct /></>} />
              <Route path="/admin" element={<><Navbar /><AdminPanel /></>} />
              <Route path="/shop/:id" element={<><Navbar /><SellerProfilePage /></>} />'''

content = content.replace(old4, new4).replace(old5, new5)

# Remove the wrapping Navbar from the top level
old6 = '''          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Landing />} />'''
new6 = '''          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Landing />} />'''

content = content.replace(old6, new6)

open(app_path, 'w', encoding='utf-8').write(content)
print("✅ 2. App.tsx updated — / shows Landing, /marketplace shows Home")
print("\n🎉 Done! Push frontend.")
