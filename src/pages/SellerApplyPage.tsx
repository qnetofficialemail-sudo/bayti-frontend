import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";

const AREAS = [
  "Abu Dhabi", "Al Ain", "Dubai", "Sharjah", "Ajman",
  "Umm Al Quwain", "Ras Al Khaimah", "Fujairah",
  "Jumeirah", "Deira", "Bur Dubai", "Mirdif", "Al Barsha",
  "Downtown Dubai", "Marina", "JLT", "Sports City", "Discovery Gardens",
];

export default function SellerApplyPage() {
  const { isArabic } = useLanguage();
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", area: "", city: "Dubai", what_they_sell: "",
  });
  const [docs, setDocs] = useState<(File | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleDoc = (i: number, file: File | null) => {
    const updated = [...docs];
    updated[i] = file;
    setDocs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      docs.forEach((doc, i) => { if (doc) fd.append(`doc_${i + 1}`, doc); });
      await api.post("/api/applications/apply", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitted(true);
    } catch (e: any) {
      setError(e.response?.data?.detail || (isArabic ? "فشل الإرسال، حاول مجددًا" : "Submission failed, please try again"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isArabic ? "تم استلام طلبك!" : "Application Received!"}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {isArabic
            ? "سنراجع طلبك ونتواصل معك قريبًا على بريدك الإلكتروني."
            : "We'll review your application and get back to you soon via email."}
        </p>
        <Link to="/" className="text-orange-500 hover:underline text-sm">
          {isArabic ? "← العودة للرئيسية" : "← Back to home"}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏠</div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isArabic ? "انضم كبائع في بيتي" : "Apply to Sell on Bayti"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isArabic
              ? "أرسل طلبك وسنتواصل معك للموافقة"
              : "Submit your application and we'll be in touch"}
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? "الاسم الكامل" : "Full Name"} *
            </label>
            <input type="text" required value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? "البريد الإلكتروني" : "Email"} *
            </label>
            <input type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? "رقم الهاتف" : "Phone Number"}
            </label>
            <input type="tel" value={form.phone} placeholder="+971 50 000 0000"
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? "المنطقة" : "Area"} *
            </label>
            <select required value={form.area}
              onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
              <option value="">{isArabic ? "اختر المنطقة" : "Select area"}</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? "ماذا ستبيع؟" : "What will you sell?"} *
            </label>
            <textarea required value={form.what_they_sell} rows={3}
              placeholder={isArabic ? "مثال: وجبات منزلية، حلويات، مخبوزات..." : "e.g. Home-cooked meals, desserts, baked goods..."}
              onChange={e => setForm(f => ({ ...f, what_they_sell: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
          </div>

          {/* Document uploads */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isArabic ? "المستندات (اختياري — حتى 3 ملفات)" : "Documents (optional — up to 3 files)"}
            </label>
            <p className="text-xs text-gray-400 mb-3">
              {isArabic
                ? "مثال: رخصة تجارية، شهادة سلامة غذائية، هوية"
                : "e.g. Trade license, food safety certificate, Emirates ID"}
            </p>
            <div className="space-y-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className={`border-2 border-dashed rounded-xl px-4 py-3 text-center transition ${docs[i] ? "border-orange-300 bg-orange-50" : "border-gray-200 hover:border-orange-300"}`}>
                      {docs[i] ? (
                        <span className="text-sm text-orange-600 font-medium">📄 {docs[i]!.name}</span>
                      ) : (
                        <span className="text-sm text-gray-400">
                          {isArabic ? `مستند ${i + 1} (اختياري)` : `Document ${i + 1} (optional)`}
                        </span>
                      )}
                    </div>
                    <input type="file" className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={e => handleDoc(i, e.target.files?.[0] || null)} />
                  </label>
                  {docs[i] && (
                    <button type="button" onClick={() => handleDoc(i, null)}
                      className="text-gray-400 hover:text-red-500 text-lg transition">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-60 mt-2">
            {loading
              ? (isArabic ? "جارٍ الإرسال..." : "Submitting...")
              : (isArabic ? "إرسال الطلب" : "Submit Application")}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          {isArabic ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
          <a href="/login" className="text-orange-500 hover:underline">
            {isArabic ? "تسجيل الدخول" : "Sign in"}
          </a>
        </div>
      </div>
    </div>
  );
}
