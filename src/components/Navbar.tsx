import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [installPrompt, setInstallPrompt] = React.useState<any>(null);
  const [showInstall, setShowInstall] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); setShowInstall(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowInstall(false);
  };
  const { language, toggleLanguage, isArabic } = useLanguage();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/"); setMenuOpen(false); };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 52 52" fill="none">
            <rect x="4" y="4" width="44" height="44" rx="12" fill="#FF5A1F"/>
            <path d="M16 36 L16 20 L26 12 L36 20 L36 36 Z" fill="white"/>
            <path d="M22 36 L22 26 L30 26 L30 36 Z" fill="#FF5A1F"/>
            <circle cx="26" cy="22" r="3" fill="#FF5A1F"/>
          </svg>
          <span className="font-bold text-xl text-gray-900 tracking-tight">Bayti<span className="text-[#FF5A1F]">.</span></span>
          <span className="text-gray-400 text-sm">بيتي</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
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
              <Link to="/register" className="text-sm bg-orange-500 hover:bg-orange-600 text-gray-900 px-4 py-2 rounded-lg transition font-medium">
                {isArabic ? "انضم إلينا" : "Join Us"}
              </Link>
            </>
          )}
        </div>

        {/* Mobile: language + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggleLanguage} className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600">
            {isArabic ? "EN" : "AR"}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-700">
            {menuOpen ? (
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : (
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1" dir={isArabic ? "rtl" : "ltr"}>
          {user ? (
            <>
              <div className="text-sm text-gray-500 py-2 font-medium">
                {isArabic ? "مرحبا" : "Hi,"} {user.full_name.split(" ")[0]}
              </div>
              {user.role === "admin" && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-500 py-2.5 px-3 rounded-lg hover:bg-orange-50 transition">
                  🛠 {isArabic ? "الإدارة" : "Admin"}
                </Link>
              )}
              {user.role === "seller" && (
                <Link to="/seller/dashboard" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-500 py-2.5 px-3 rounded-lg hover:bg-orange-50 transition">
                  🏪 {isArabic ? "متجري" : "My Shop"}
                </Link>
              )}
              {user.role === "seller" && (
                <Link to="/studio" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-500 py-2.5 px-3 rounded-lg hover:bg-orange-50 transition">
                  ✨ {isArabic ? "استوديو بيتي" : "Bayti Studio"}
                </Link>
              )}
              <Link to="/orders" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-500 py-2.5 px-3 rounded-lg hover:bg-orange-50 transition">
                📦 {isArabic ? "طلباتي" : "My Orders"}
              </Link>
              <div className="pt-1 border-t border-gray-100">
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 py-2.5 px-3 rounded-lg transition font-medium">
                  🚪 {isArabic ? "تسجيل الخروج" : "Logout"}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-gray-700 py-2.5 px-3 rounded-lg hover:bg-orange-50 transition">
                {isArabic ? "تسجيل الدخول" : "Login"}
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 text-sm bg-orange-500 text-gray-900 py-2.5 px-3 rounded-lg font-medium">
                {isArabic ? "انضم إلينا" : "Join Us"}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
