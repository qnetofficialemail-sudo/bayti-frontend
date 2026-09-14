import React, { useState, useEffect, useRef } from "react";
import api from "../api/client";

interface Props {
  price: string;
  productName: string;
  category?: string;
  categoryId?: number | null;
  isArabic: boolean;
}

export default function PricingAdvisor({ price, productName, category = "", categoryId = null, isArabic }: Props) {
  const [advice, setAdvice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    const numPrice = parseFloat(price);
    if (!numPrice || numPrice <= 0 || !productName || productName.length < 2) {
      setAdvice(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setAdvice(null);
      try {
        const res = await api.post("/api/ai/pricing-advisor", {
          product_name: productName,
          category: category,
          category_id: categoryId,
          price: numPrice,
          lang: isArabic ? "ar" : "en",
        });
        setAdvice(res.data);
      } catch {
        setAdvice(null);
      } finally {
        setLoading(false);
      }
    }, 2000);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [price, productName, category, categoryId, isArabic]);

  if (!price || parseFloat(price) <= 0) return null;

  const config = {
    good: {
      bg: "bg-green-50", border: "border-green-200", text: "text-green-700",
      icon: "✅",
      label_ar: "سعر تنافسي!", label_en: "Competitive price!"
    },
    high: {
      bg: "bg-red-50", border: "border-red-200", text: "text-red-700",
      icon: "⚠️",
      label_ar: "السعر مرتفع قليلاً", label_en: "Price might be too high"
    },
    low: {
      bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700",
      icon: "💡",
      label_ar: "يمكنك رفع السعر", label_en: "You could charge more"
    },
    unique: {
      bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700",
      icon: "✨",
      label_ar: "منتج نادر في السوق!", label_en: "Unique in the UAE market!"
    },
  };

  const verdict = advice?.verdict || "good";
  const c = config[verdict as keyof typeof config] || config.good;

  return (
    <div
      className={`mt-2 rounded-xl border px-4 py-3 text-sm transition-all ${c.bg} ${c.border}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="animate-spin w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3" />
            <path d="M21 12a9 9 0 00-9-9" />
          </svg>
          <span>{isArabic ? "جارٍ تحليل أسعار السوق الإماراتي..." : "Searching UAE market prices..."}</span>
        </div>
      )}

      {/* Result */}
      {!loading && advice && (
        <div className="space-y-2">

          {/* Header */}
          <div className={`font-semibold ${c.text} flex items-center gap-1`}>
            <span>{c.icon}</span>
            <span>{isArabic ? c.label_ar : c.label_en}</span>
          </div>

          {/* Price Range */}
          {advice.min && advice.max && (
            <div className={`text-xs font-medium ${c.text} bg-white bg-opacity-60 rounded-lg px-3 py-1.5 inline-block`}>
              {isArabic
                ? `نطاق السوق الإماراتي: AED ${advice.min} – AED ${advice.max}`
                : `UAE market range: AED ${advice.min} – AED ${advice.max}`}
            </div>
          )}

          {/* Unique product */}
          {verdict === "unique" && (
            <div className={`text-xs font-medium ${c.text}`}>
              {isArabic
                ? "لم نجد منتجات مشابهة في السوق — أنت من الأوائل! 🚀"
                : "No similar products found in UAE market — you're pioneering! 🚀"}
            </div>
          )}

          {/* Suggestion */}
          {advice.suggestion && (
            <div className={`text-xs ${c.text} opacity-90 leading-relaxed`}>
              {advice.suggestion}
            </div>
          )}

          {/* Sources */}
          {advice.sources && advice.sources.length > 0 && (
            <div className={`text-xs ${c.text} opacity-60 flex items-center gap-1 flex-wrap`}>
              <span>{isArabic ? "المصادر:" : "Sources:"}</span>
              {advice.sources.map((s: string, i: number) => (
                <span key={i} className="bg-white bg-opacity-50 rounded px-1.5 py-0.5">{s}</span>
              ))}
            </div>
          )}

          {/* Search summary */}
          {advice.search_summary && (
            <div className={`text-xs ${c.text} opacity-50 italic`}>
              🔍 {advice.search_summary}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
