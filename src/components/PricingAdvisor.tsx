import React, { useState, useEffect, useRef } from "react";
import api from "../api/client";

interface Props {
  price: string;
  productName: string;
  categoryName: string;
  categoryId?: number | string;
  isArabic: boolean;
}

export default function PricingAdvisor({ price, productName, categoryName, categoryId, isArabic }: Props) {
  const [advice, setAdvice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    const numPrice = parseFloat(price);
    if (!numPrice || numPrice <= 0 || !productName || !categoryName) {
      setAdvice(null);
      return;
    }

    // Debounce — wait 1.5s after user stops typing
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.post("/api/ai/pricing-advisor", {
          product_name: productName,
          category: categoryName,
          category_id: categoryId ? Number(categoryId) : null,
          price: numPrice,
        });
        setAdvice(res.data);
      } catch {
        setAdvice(null);
      } finally {
        setLoading(false);
      }
    }, 1500);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [price, productName, categoryName]);

  if (!price || parseFloat(price) <= 0) return null;

  const colors = {
    good: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", icon: "✅" },
    high: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: "⚠️" },
    low: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", icon: "💡" },
    unique: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: "✨" },
  };

  const verdict = advice?.verdict || "good";
  const c = colors[verdict as keyof typeof colors] || colors.good;

  return (
    <div className={`mt-2 rounded-xl border px-4 py-3 text-sm transition-all ${c.bg} ${c.border}`}>
      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3"/>
            <path d="M21 12a9 9 0 00-9-9"/>
          </svg>
          <span>{isArabic ? "جارٍ تحليل السعر..." : "Analyzing price..."}</span>
        </div>
      ) : advice ? (
        <div>
          <div className={`font-medium ${c.text} mb-1`}>
            {c.icon} {isArabic ? (
              verdict === "good" ? "سعر تنافسي!" :
              verdict === "high" ? "السعر مرتفع قليلاً" :
              verdict === "unique" ? "منتج فريد!" :
              "يمكنك رفع السعر"
            ) : (
              verdict === "good" ? "Competitive price!" :
              verdict === "high" ? "Price might be too high" :
              verdict === "unique" ? "Unique product!" :
              "You could charge more"
            )}
          </div>
          <div className={`text-xs ${c.text} opacity-80`}>{advice.suggestion}</div>
          {advice.min && advice.max ? (
            <div className={`text-xs ${c.text} mt-1 font-medium`}>
              {isArabic ? `النطاق المقترح: AED ${advice.min} – AED ${advice.max}` : `Suggested range: AED ${advice.min} – AED ${advice.max}`}
            </div>
          ) : verdict === "unique" && (
            <div className={`text-xs ${c.text} mt-1 font-medium`}>
              {isArabic ? "لا توجد منتجات مشابهة — أنت الأول في هذا المجال! 🚀" : "No similar products found — you're pioneering this! 🚀"}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
