import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import SEO from "../components/SEO";

export default function NotFound() {
  const { isArabic } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <SEO
        title={isArabic ? "الصفحة غير موجودة | بيتي" : "Page Not Found | Bayti"}
        description={isArabic ? "الصفحة التي تبحث عنها غير موجودة" : "The page you are looking for does not exist"}
      />

      <div className="text-8xl mb-6">🏠</div>

      <h1 className="text-4xl font-bold text-gray-900 mb-3">
        {isArabic ? "٤٠٤" : "404"}
      </h1>

      <p className="text-xl font-semibold text-gray-700 mb-2">
        {isArabic ? "الصفحة غير موجودة" : "Page not found"}
      </p>

      <p className="text-gray-500 mb-8 max-w-sm">
        {isArabic
          ? "يبدو أن هذه الصفحة غير موجودة أو تم نقلها."
          : "This page doesn't exist or may have been moved."}
      </p>

      <div className="flex gap-3">
        <Link
          to="/"
          className="bg-orange-500 hover:bg-orange-600 text-gray-900 font-medium px-6 py-3 rounded-xl transition"
        >
          {isArabic ? "العودة للرئيسية" : "Go Home"}
        </Link>
        <Link
          to="/marketplace"
          className="bg-white hover:bg-gray-100 text-gray-700 font-medium px-6 py-3 rounded-xl border border-gray-200 transition"
        >
          {isArabic ? "تصفح المنتجات" : "Browse Products"}
        </Link>
      </div>
    </div>
  );
}
