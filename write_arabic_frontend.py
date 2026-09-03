import os

files = {}

files['src/context/LanguageContext.tsx'] = '''import React, { createContext, useContext, useState } from "react";

interface LanguageContextType {
  language: "en" | "ar";
  toggleLanguage: () => void;
  isArabic: boolean;
}

const LanguageContext = createContext<LanguageContextType>(null!);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<"en" | "ar">(
    (localStorage.getItem("language") as "en" | "ar") || "en"
  );

  const toggleLanguage = () => {
    const newLang = language === "en" ? "ar" : "en";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, isArabic: language === "ar" }}>
      <div dir={language === "ar" ? "rtl" : "ltr"} lang={language}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
'''

files['src/components/Navbar.tsx'] = '''import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, isArabic } = useLanguage();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <span className="font-bold text-gray-900 text-lg">
            HomeMarket<span className="text-orange-500">UAE</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-orange-300 text-sm font-medium text-gray-600 transition"
          >
            {isArabic ? "🇬🇧 EN" : "🇦🇪 AR"}
          </button>

          {user ? (
            <>
              {user.role === "seller" && (
                <Link to="/seller/dashboard" className="text-sm text-gray-600 hover:text-orange-500 px-3 py-2 rounded-lg hover:bg-orange-50 transition">
                  {isArabic ? "متجري" : "My Shop"}
                </Link>
              )}
              <Link to="/orders" className="text-sm text-gray-600 hover:text-orange-500 px-3 py-2 rounded-lg hover:bg-orange-50 transition">
                {isArabic ? "طلباتي" : "Orders"}
              </Link>
              <span className="text-sm text-gray-500">
                {isArabic ? "مرحبا" : "Hi,"} {user.full_name.split(" ")[0]}
              </span>
              <button onClick={handleLogout} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition">
                {isArabic ? "خروج" : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-orange-500 px-3 py-2 rounded-lg transition">
                {isArabic ? "تسجيل الدخول" : "Login"}
              </Link>
              <Link to="/register" className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition font-medium">
                {isArabic ? "انضم إلينا" : "Join Us"}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
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
  seller: { id: number; shop_name: string; area: string; rating: number };
  category: { name: string; icon: string } | null;
}
interface Category { id: number; name: string; icon: string; }

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          {isArabic
            ? <><span>أكل بيتي،</span> <span className="text-orange-500">يوصلك على بابك</span></>
            : <>Homemade food, <span className="text-orange-500">delivered to your door</span></>
          }
        </h1>
        <p className="text-gray-500 text-lg">
          {isArabic ? "ادعم الطباخين المنزليين في الإمارات" : "Support local home cooks across the UAE"}
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder={isArabic ? "ابحث عن أكلات، حلويات، منتجات..." : "Search for dishes, sweets, crafts..."}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-5 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white shadow-sm"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${!selectedCategory ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"}`}
        >
          {isArabic ? "الكل" : "All"}
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === cat.id ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"}`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
              <div className="h-48 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🍽️</div>
          <p className="text-lg">{isArabic ? "لا توجد منتجات" : "No products found"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const displayName = isArabic && product.name_ar ? product.name_ar : product.name;
            const displayDesc = isArabic && product.description_ar ? product.description_ar : product.description;
            return (
              <Link key={product.id} to={`/product/${product.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
                <div className="h-48 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden">
                  {product.image_url
                    ? <img src={`http://localhost:8000${product.image_url}`} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    : <span className="text-6xl">{product.category?.icon || "🍽️"}</span>
                  }
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 leading-tight">{displayName}</h3>
                    <span className="text-orange-500 font-bold text-sm whitespace-nowrap">AED {product.price}</span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">{displayDesc}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>🏠 {product.seller?.shop_name}</span>
                    <span>⏱ {product.preparation_time}{isArabic ? "د" : "min"}</span>
                  </div>
                  {product.seller?.area && (
                    <div className="mt-2">
                      <span className="inline-block bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded-full">📍 {product.seller.area}</span>
                    </div>
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

files['src/App.tsx'] = '''import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { LoginPage, RegisterPage } from "./pages/Auth";
import ProductDetail from "./pages/ProductDetail";
import SellerDashboard from "./pages/SellerDashboard";
import SellerSetup from "./pages/SellerSetup";
import AddProduct from "./pages/AddProduct";
import Orders from "./pages/Orders";

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/seller/setup" element={<SellerSetup />} />
              <Route path="/seller/products/new" element={<AddProduct />} />
            </Routes>
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
'''

for path, content in files.items():
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ {path}")

print("\nFrontend Arabic support written!")
