import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";

const UAE_AREAS = ["Downtown Dubai","Dubai Marina","JBR","Jumeirah","Deira","Bur Dubai","Business Bay","JLT","Al Barsha","Mirdif","Sharjah","Abu Dhabi","Ajman","Ras Al Khaimah"];

export default function SellerSetup() {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    shop_name: "", description: "", area: "", city: "Dubai",
    whatsapp_number: "", instagram_handle: "",
    min_order_amount: "", delivery_type: "bayti",
    categories_offered: [] as number[],
  });
  const [samples, setSamples] = useState<(File | null)[]>([null, null, null]);
  const [previews, setPreviews] = useState<string[]>(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  useEffect(() => {
    api.get("/api/categories").then(r => setCategories(r.data));
  }, []);

  const handleSample = (index: number, file: File | null) => {
    const newSamples = [...samples];
    const newPreviews = [...previews];
    newSamples[index] = file;
    newPreviews[index] = file ? URL.createObjectURL(file) : "";
    setSamples(newSamples);
    setPreviews(newPreviews);
  };

  const toggleCategory = (id: number) => {
    setForm(f => ({
      ...f,
      categories_offered: f.categories_offered.includes(id)
        ? f.categories_offered.filter(c => c !== id)
        : [...f.categories_offered, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = new FormData();
      data.append("shop_name", form.shop_name);
      data.append("description", form.description);
      data.append("area", form.area);
      data.append("city", form.city);
      data.append("delivery_type", form.delivery_type);
      if (form.whatsapp_number) data.append("whatsapp_number", form.whatsapp_number);
      if (form.instagram_handle) data.append("instagram_handle", form.instagram_handle);
      if (form.min_order_amount) data.append("min_order_amount", form.min_order_amount);
      if (form.categories_offered.length > 0)
        data.append("categories_offered", form.categories_offered.join(","));
      if (samples[0]) data.append("sample_image_1", samples[0]);
      if (samples[1]) data.append("sample_image_2", samples[1]);
      if (samples[2]) data.append("sample_image_3", samples[2]);

      await api.post("/api/sellers/profile", data, { headers: { "Content-Type": "multipart/form-data" } });
      navigate("/seller/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Setup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🪺</div>
        <h1 className="text-2xl font-bold text-gray-900">{isArabic ? "إعداد متجرك" : "Set up your shop"}</h1>
        <p className="text-gray-500 text-sm mt-1">{isArabic ? "سيتم مراجعة متجرك خلال 24 ساعة" : "Your shop will be reviewed within 24 hours"}</p>
        {/* Step indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {[1, 2, 3].map(s => (
            <div key={s} className={`w-2.5 h-2.5 rounded-full transition ${step >= s ? "bg-orange-500" : "bg-gray-200"}`} />
          ))}
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Step 1: Basic Info ── */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-gray-800 text-lg">{isArabic ? "معلومات المتجر" : "Shop Information"}</h2>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "واتساب (للطلبات)" : "WhatsApp (for orders)"}</label>
                <input type="tel" value={form.whatsapp_number} onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))}
                  placeholder="+971 50 000 0000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "إنستغرام / تيك توك" : "Instagram / TikTok"}</label>
                <input type="text" value={form.instagram_handle} onChange={e => setForm(f => ({ ...f, instagram_handle: e.target.value }))}
                  placeholder="@handle"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
            </div>

            <button type="button" onClick={() => { if (!form.shop_name || !form.area) { setError(isArabic ? "يرجى ملء اسم المتجر والمنطقة" : "Please fill shop name and area"); return; } setError(""); setStep(2); }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition">
              {isArabic ? "التالي ←" : "Next →"}
            </button>
          </div>
        )}

        {/* ── Step 2: What you sell ── */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-gray-800 text-lg">{isArabic ? "ماذا تبيع؟" : "What do you sell?"}</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{isArabic ? "اختر الفئات (يمكن اختيار أكثر من واحدة)" : "Select categories (choose all that apply)"}</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => (
                  <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition ${
                      form.categories_offered.includes(cat.id)
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 text-gray-600 hover:border-orange-300"
                    }`}>
                    <span>{cat.icon}</span>
                    <span>{isArabic && cat.name_ar ? cat.name_ar : cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{isArabic ? "طريقة التوصيل" : "Delivery type"}</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "bayti", icon: "🚗", label: isArabic ? "بيتي يرتب التوصيل" : "Bayti arranges delivery" },
                  { value: "self", icon: "🏠", label: isArabic ? "أوصل بنفسي" : "I deliver myself" },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, delivery_type: opt.value }))}
                    className={`p-4 rounded-xl border-2 text-center transition ${form.delivery_type === opt.value ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className="text-2xl mb-1">{opt.icon}</div>
                    <div className="text-sm font-medium text-gray-700">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الحد الأدنى للطلب (درهم)" : "Minimum order (AED)"}</label>
              <input type="number" value={form.min_order_amount} onChange={e => setForm(f => ({ ...f, min_order_amount: e.target.value }))}
                placeholder={isArabic ? "مثال: 50" : "e.g. 50"} min="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition">
                {isArabic ? "→ السابق" : "← Back"}
              </button>
              <button type="button" onClick={() => setStep(3)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition">
                {isArabic ? "التالي ←" : "Next →"}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Sample photos ── */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-gray-800 text-lg">{isArabic ? "صور عينات منتجاتك" : "Sample product photos"}</h2>
            <p className="text-sm text-gray-500">{isArabic ? "أضف حتى 3 صور لمنتجاتك لمساعدتنا في المراجعة" : "Add up to 3 photos of your products to help us review your application"}</p>

            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map(i => (
                <label key={i} className="cursor-pointer">
                  <div className={`h-32 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition ${previews[i] ? "border-orange-300" : "border-gray-200 hover:border-orange-300"}`}>
                    {previews[i]
                      ? <img src={previews[i]} alt={`Sample ${i + 1}`} className="w-full h-full object-cover" />
                      : <div className="text-center text-gray-400">
                          <div className="text-3xl mb-1">📷</div>
                          <p className="text-xs">{isArabic ? `صورة ${i + 1}` : `Photo ${i + 1}`}</p>
                        </div>
                    }
                  </div>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => handleSample(i, e.target.files?.[0] || null)} />
                </label>
              ))}
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700">
              {isArabic
                ? "💡 نصيحة: الصور عالية الجودة تزيد فرص قبول متجرك وتجذب المزيد من الطلبات"
                : "💡 Tip: High-quality photos increase your chances of approval and attract more orders"}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition">
                {isArabic ? "→ السابق" : "← Back"}
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-60">
                {loading ? (isArabic ? "جاري الإرسال..." : "Submitting...") : (isArabic ? "إرسال للمراجعة" : "Submit for Approval")}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
