content = '''import React from "react";
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
          <span className="font-bold text-gray-900 text-lg">HomeMarket<span className="text-orange-500">UAE</span></span>
        </Link>

        <div className="flex items-center gap-2">
          <button onClick={toggleLanguage} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-orange-300 text-sm font-medium text-gray-600 transition">
            {isArabic ? "🇬🇧 EN" : "🇦🇪 AR"}
          </button>

          {user ? (
            <>
              {user.role === "admin" && (
                <Link to="/admin" className="text-sm text-gray-600 hover:text-orange-500 px-3 py-2 rounded-lg hover:bg-orange-50 transition">
                  {isArabic ? "الإدارة" : "Admin"}
                </Link>
              )}
              {user.role === "seller" && (
                <Link to="/seller/dashboard" className="text-sm text-gray-600 hover:text-orange-500 px-3 py-2 rounded-lg hover:bg-orange-50 transition">
                  {isArabic ? "متجري" : "My Shop"}
                </Link>
              )}
              <Link to="/orders" className="text-sm text-gray-600 hover:text-orange-500 px-3 py-2 rounded-lg hover:bg-orange-50 transition">
                {isArabic ? "طلباتي" : "Orders"}
              </Link>
              <span className="text-sm text-gray-500">{isArabic ? "مرحبا" : "Hi,"} {user.full_name.split(" ")[0]}</span>
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

with open('src/components/Navbar.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Navbar rewritten successfully")
