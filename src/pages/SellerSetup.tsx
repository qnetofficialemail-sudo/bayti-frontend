import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";

const UAE_AREAS = ["Downtown Dubai","Dubai Marina","JBR","Jumeirah","Deira","Bur Dubai","Business Bay","JLT","Al Barsha","Mirdif","Sharjah","Abu Dhabi","Ajman","Ras Al Khaimah"];

export default function SellerSetup() {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const [form, setForm] = useState({ shop_name: "", description: "", area: "", city: "Dubai" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      await api.post("/api/sellers/profile", data, { headers: { "Content-Type": "multipart/form-data" } });
      navigate("/seller/dashboard");
    } catch (err: any) { setError(err.response?.data?.detail || (isArabic ? "فشل الإعداد" : "Setup failed")); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🏪</div>
        <h1 className="text-2xl font-bold text-gray-900">{isArabic ? "إعداد متجرك" : "Set up your shop"}</h1>
        <p className="text-gray-500 text-sm mt-1">{isArabic ? "سيتم مراجعة متجرك خلال 24 ساعة" : "Your shop will be reviewed within 24 hours"}</p>
      </div>
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "اسم المتجر *" : "Shop name *"}</label>
          <input type="text" value={form.shop_name} onChange={e => setForm(f => ({ ...f, shop_name: e.target.value }))} required
            placeholder={isArabic ? "مثال: مطبخ مريم" : "e.g. Maryam Kitchen"}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "عن متجرك" : "About your shop"}</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
            placeholder={isArabic ? "ماذا تصنع؟ ما الذي يميز طعامك؟" : "What do you make? What makes your food special?"}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "منطقتك *" : "Your area *"}</label>
          <select value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
            <option value="">{isArabic ? "اختر منطقتك" : "Select your area"}</option>
            {UAE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-60">
          {loading ? (isArabic ? "جاري الإرسال..." : "Submitting...") : (isArabic ? "إرسال للمراجعة" : "Submit for Approval")}
        </button>
      </form>
    </div>
  );
}
