import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import PricingAdvisor from "../components/PricingAdvisor";

interface VariantOption { label: string; price_adj: number; }
interface Variant { id?: number; name: string; name_ar: string; options: VariantOption[]; is_required: boolean; }

const VARIANT_PRESETS: Record<string, { name: string; name_ar: string; options: string[] }> = {
  size:     { name: "Size",     name_ar: "المقاس",  options: ["XS","S","M","L","XL","XXL"] },
  color:    { name: "Color",    name_ar: "اللون",   options: ["Black","White","Beige","Brown","Navy","Red","Pink","Green"] },
  scent:    { name: "Scent",    name_ar: "العطر",   options: ["Rose","Oud","Musk","Jasmine","Vanilla","Lavender"] },
  material: { name: "Material", name_ar: "الخامة",  options: ["Cotton","Silk","Linen","Chiffon","Satin"] },
};

export default function EditProduct() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", category_id: "", preparation_time: "3", time_unit: "days", is_available: true, discount_percent: "", free_shipping_enabled: false, free_shipping_min_amount: "" });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [newImages, setNewImages] = useState<(File | null)[]>([null, null, null, null, null]);
  const [newPreviews, setNewPreviews] = useState<(string | null)[]>([null, null, null, null, null]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [showVariantBuilder, setShowVariantBuilder] = useState(false);
  const [newVariant, setNewVariant] = useState<Variant>({ name: "", name_ar: "", options: [{ label: "", price_adj: 0 }], is_required: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "seller") { navigate("/login"); return; }
    Promise.all([
      api.get(`/api/products/${id}`),
      api.get("/api/categories"),
      api.get(`/api/products/${id}/variants`),
    ]).then(([p, c, v]) => {
      const prod = p.data;
      const isArabicProduct = prod.name_ar && /[؀-ۿ]/.test(prod.name_ar) && prod.name_ar !== prod.name;
      setForm({
        name: isArabicProduct ? prod.name_ar : (prod.name || ""),
        description: isArabicProduct ? (prod.description_ar || "") : (prod.description || ""),
        price: String(prod.price || ""),
        category_id: String(prod.category?.id || ""),
        preparation_time: String(prod.preparation_time || "3"),
        time_unit: prod.time_unit || "days",
        is_available: prod.is_available,
        discount_percent: prod.discount_percent ? String(prod.discount_percent) : "",
        free_shipping_enabled: !!prod.free_shipping_min_amount,
        free_shipping_min_amount: prod.free_shipping_min_amount ? String(prod.free_shipping_min_amount) : "",
      });
      const imgs = [prod.image_url, prod.image_2, prod.image_3, prod.image_4, prod.image_5].filter(Boolean);
      setExistingImages(imgs);
      setPrimaryIndex(prod.primary_image_index || 0);
      setCategories(c.data);
      if (v.data) {
        setVariants(v.data.map((variant: any) => ({
          id: variant.id,
          name: variant.name,
          name_ar: variant.name_ar || "",
          options: JSON.parse(variant.options || "[]"),
          is_required: variant.is_required,
        })));
      }
    }).finally(() => setLoading(false));
  }, [id, user]);

  const handleNewImage = (index: number, file: File | null) => {
    const imgs = [...newImages]; const prevs = [...newPreviews];
    imgs[index] = file; prevs[index] = file ? URL.createObjectURL(file) : null;
    setNewImages(imgs); setNewPreviews(prevs);
  };

  const applyPreset = (key: string) => {
    const preset = VARIANT_PRESETS[key];
    setNewVariant({ name: preset.name, name_ar: preset.name_ar, options: preset.options.map(o => ({ label: o, price_adj: 0 })), is_required: true });
  };

  const addOption = () => setNewVariant(v => ({ ...v, options: [...v.options, { label: "", price_adj: 0 }] }));
  const removeOption = (i: number) => setNewVariant(v => ({ ...v, options: v.options.filter((_, idx) => idx !== i) }));
  const updateOption = (i: number, field: "label" | "price_adj", val: string) => {
    setNewVariant(v => ({ ...v, options: v.options.map((o, idx) => idx === i ? { ...o, [field]: field === "price_adj" ? parseFloat(val) || 0 : val } : o) }));
  };

  const saveVariant = () => {
    if (!newVariant.name || newVariant.options.some(o => !o.label)) { setError(isArabic ? "أكمل بيانات الخيار" : "Complete all variant labels"); return; }
    setVariants(prev => [...prev, { ...newVariant }]);
    setNewVariant({ name: "", name_ar: "", options: [{ label: "", price_adj: 0 }], is_required: true });
    setShowVariantBuilder(false); setError("");
  };

  const deleteVariant = async (variant: Variant, index: number) => {
    if (variant.id) {
      try { await api.delete(`/api/products/${id}/variants/${variant.id}`); } catch {}
    }
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("description", form.description);
      data.append("price", form.price);
      data.append("preparation_time", form.preparation_time);
      data.append("time_unit", form.time_unit);
      data.append("is_available", String(form.is_available));
      data.append("primary_image_index", String(primaryIndex));
      data.append("discount_percent", form.discount_percent && parseFloat(form.discount_percent) > 0 ? form.discount_percent : "0");
      if (form.free_shipping_enabled && form.free_shipping_min_amount) data.append("free_shipping_min_amount", form.free_shipping_min_amount);
      else data.append("free_shipping_min_amount", "0");
      if (form.category_id) data.append("category_id", form.category_id);
      if (newImages[0]) data.append("image", newImages[0]);
      if (newImages[1]) data.append("image_2", newImages[1]);
      if (newImages[2]) data.append("image_3", newImages[2]);
      if (newImages[3]) data.append("image_4", newImages[3]);
      if (newImages[4]) data.append("image_5", newImages[4]);
      await api.put(`/api/products/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
      for (const variant of variants.filter(v => !v.id)) {
        const vdata = new FormData();
        vdata.append("name", variant.name);
        vdata.append("name_ar", variant.name_ar);
        vdata.append("options", JSON.stringify(variant.options));
        vdata.append("is_required", String(variant.is_required));
        await api.post(`/api/products/${id}/variants`, vdata, { headers: { "Content-Type": "multipart/form-data" } });
      }
      navigate("/seller/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update product");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-100 rounded w-48 mb-6" />
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div className="h-5 bg-gray-100 rounded w-32 mb-4" />
        <div className="h-10 bg-gray-100 rounded-xl w-full mb-4" />
        <div className="h-5 bg-gray-100 rounded w-32 mb-4" />
        <div className="h-24 bg-gray-100 rounded-xl w-full mb-4" />
        <div className="h-5 bg-gray-100 rounded w-32 mb-4" />
        <div className="h-10 bg-gray-100 rounded-xl w-full" />
      </div>
    </div>
  );

  const imgUrl = (img: string) => img.startsWith("http") ? img : `https://web-production-63685.up.railway.app${img}`;
  const selectedCategoryObj = categories.find(c => String(c.id) === form.category_id);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{isArabic ? "تعديل المنتج" : "Edit Product"}</h1>
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Existing images */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">{isArabic ? "الصور الحالية" : "Current Photos"}</label>
            <span className="text-xs text-gray-400">{isArabic ? "★ لتعيين الرئيسية" : "★ to set main"}</span>
          </div>
          {existingImages.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {existingImages.map((img, i) => (
                <div key={i} className="relative">
                  <img src={imgUrl(img)} alt={`Image ${i+1}`} className={`w-16 h-16 object-cover rounded-xl border-2 ${primaryIndex === i ? "border-orange-500" : "border-gray-200"}`} />
                  <button type="button" onClick={() => setPrimaryIndex(i)}
                    className={`absolute top-0.5 right-0.5 w-5 h-5 rounded-full text-xs flex items-center justify-center shadow ${primaryIndex === i ? "bg-orange-500 text-gray-900" : "bg-white text-gray-400"}`}>
                    ★
                  </button>
                  <button type="button" onClick={() => {
                    const updated = existingImages.filter((_, idx) => idx !== i);
                    setExistingImages(updated);
                    if (primaryIndex >= updated.length) setPrimaryIndex(0);
                  }} className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow hover:bg-red-600 transition">
                    ✕
                  </button>
                  {primaryIndex === i && <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-orange-500 text-gray-900 rounded-b-xl py-0.5">{isArabic ? "رئيسية" : "Main"}</span>}
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-500 mb-2">{isArabic ? "إضافة صور جديدة (تستبدل الحالية):" : "Add new photos (replaces current):"}</p>
          <div className="grid grid-cols-5 gap-2">
            {[0,1,2,3,4].map(i => (
              <label key={i} className="block cursor-pointer">
                <div className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition ${newPreviews[i] ? "border-orange-300" : "border-gray-200 hover:border-orange-300"}`}>
                  {newPreviews[i]
                    ? <img src={newPreviews[i]!} alt="" className="w-full h-full object-cover" />
                    : <div className="text-center text-gray-300"><div className="text-xl">📷</div><div className="text-xs">{i+1}</div></div>}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => handleNewImage(i, e.target.files?.[0] || null)} />
              </label>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "اسم المنتج *" : "Product name *"}</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الوصف" : "Description"}</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الفئة" : "Category"}</label>
          <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
            <option value="">{isArabic ? "اختر فئة" : "Select category"}</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{isArabic && cat.name_ar ? cat.name_ar : cat.name}</option>)}
          </select>
        </div>

        {/* Price + Pricing Advisor + Processing time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "السعر (درهم) *" : "Price (AED) *"}</label>
            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="1" step="0.5"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            <PricingAdvisor
              price={form.price}
              productName={form.name}
              category={selectedCategoryObj?.name || ""}
              categoryId={form.category_id ? parseInt(form.category_id) : null}
              isArabic={isArabic}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "وقت التجهيز" : "Processing time"}</label>
            <div className="flex gap-2">
              <input type="number" value={form.preparation_time} onChange={e => setForm(f => ({ ...f, preparation_time: e.target.value }))} min="1"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
              <select value={form.time_unit} onChange={e => setForm(f => ({ ...f, time_unit: e.target.value }))}
                className="border border-gray-200 rounded-xl px-2 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-sm">
                <option value="minutes">{isArabic ? "دقيقة" : "mins"}</option>
                <option value="hours">{isArabic ? "ساعة" : "hrs"}</option>
                <option value="days">{isArabic ? "يوم" : "days"}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-900">🎨 {isArabic ? "الخيارات (مقاس، لون، عطر...)" : "Variants (size, color, scent...)"}</p>
            </div>
            <button type="button" onClick={() => setShowVariantBuilder(true)}
              className="text-xs bg-orange-500 text-gray-900 px-3 py-1.5 rounded-lg hover:bg-orange-600 transition">
              + {isArabic ? "إضافة" : "Add"}
            </button>
          </div>

          {variants.length > 0 && (
            <div className="space-y-2 mb-3">
              {variants.map((v, i) => (
                <div key={i} className="flex items-center justify-between bg-orange-50 rounded-lg px-3 py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{v.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{v.options.map(o => o.label).join(", ")}</span>
                    {v.id && <span className="text-xs text-green-600 ml-2">✓ saved</span>}
                  </div>
                  <button type="button" onClick={() => deleteVariant(v, i)}
                    className="text-gray-400 hover:text-red-500 text-sm transition">✕</button>
                </div>
              ))}
            </div>
          )}

          {showVariantBuilder && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
              <p className="text-sm font-medium text-gray-700">{isArabic ? "بناء الخيار" : "Build Variant"}</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(VARIANT_PRESETS).map(([key, preset]) => (
                  <button key={key} type="button" onClick={() => applyPreset(key)}
                    className="text-xs bg-white border border-gray-200 hover:border-orange-300 px-3 py-1.5 rounded-lg transition">
                    {isArabic ? preset.name_ar : preset.name}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={newVariant.name} onChange={e => setNewVariant(v => ({ ...v, name: e.target.value }))}
                  placeholder="Name (EN)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                <input type="text" value={newVariant.name_ar} onChange={e => setNewVariant(v => ({ ...v, name_ar: e.target.value }))}
                  placeholder="اسم عربي" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div className="space-y-2">
                {newVariant.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" value={opt.label} onChange={e => updateOption(i, "label", e.target.value)}
                      placeholder="Option" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                    <span className="text-xs text-gray-400">+AED</span>
                    <input type="number" value={opt.price_adj} onChange={e => updateOption(i, "price_adj", e.target.value)}
                      placeholder="0" step="0.5" className="w-16 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                    {newVariant.options.length > 1 && (
                      <button type="button" onClick={() => removeOption(i)} className="text-gray-400 hover:text-red-500">✕</button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addOption} className="text-xs text-orange-500 hover:underline">
                + {isArabic ? "إضافة خيار" : "Add option"}
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowVariantBuilder(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm transition">
                  {isArabic ? "إلغاء" : "Cancel"}
                </button>
                <button type="button" onClick={saveVariant}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-gray-900 py-2 rounded-lg text-sm transition">
                  {isArabic ? "حفظ" : "Save"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Discount */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-red-900">{isArabic ? "خصم على المنتج" : "Product Discount"}</p>
            <p className="text-xs text-red-500 mt-0.5">{isArabic ? "اتركه صفراً اذا لا يوجد خصم" : "Leave 0 for no discount"}</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="number" value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))} min="0" max="90" step="1" placeholder="0" className="w-24 border border-red-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-300 bg-white text-center font-bold text-lg" />
            <span className="text-red-700 font-bold text-lg">%</span>
            {form.discount_percent && parseFloat(form.discount_percent) > 0 && form.price && (
              <div className="flex items-center gap-2 text-sm">
                <span className="line-through text-gray-400">AED {parseFloat(form.price).toFixed(0)}</span>
                <span className="text-red-600 font-bold">AED {(parseFloat(form.price) * (1 - parseFloat(form.discount_percent) / 100)).toFixed(0)}</span>
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">-{form.discount_percent}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Free Shipping */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">{isArabic ? "توصيل مجاني" : "Free Shipping"}</p>
              <p className="text-xs text-green-600 mt-0.5">{isArabic ? "يفعل عند طلب بمبلغ محدد او اكثر" : "Activated when order reaches a set amount"}</p>
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, free_shipping_enabled: !f.free_shipping_enabled, free_shipping_min_amount: "" }))} className={`relative w-12 h-6 rounded-full transition-colors ${form.free_shipping_enabled ? "bg-green-500" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.free_shipping_enabled ? "translate-x-6" : ""}`} />
            </button>
          </div>
          {form.free_shipping_enabled && (
            <div className="flex items-center gap-3">
              <span className="text-green-700 text-sm">{isArabic ? "مجاني عند طلب يبلغ" : "Free when order is"}</span>
              <input type="number" value={form.free_shipping_min_amount} onChange={e => setForm(f => ({ ...f, free_shipping_min_amount: e.target.value }))} min="1" placeholder="100" className="w-24 border border-green-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 bg-white text-center font-bold" />
              <span className="text-green-700 font-medium text-sm">AED</span>
            </div>
          )}
        </div>

        {/* Available toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <p className="font-medium text-gray-900 text-sm">{isArabic ? "متاح للطلب" : "Available for orders"}</p>
          <button type="button" onClick={() => setForm(f => ({ ...f, is_available: !f.is_available }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${form.is_available ? "bg-orange-500" : "bg-gray-300"}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_available ? "translate-x-6" : ""}`} />
          </button>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate("/seller/dashboard")}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition">
            {isArabic ? "إلغاء" : "Cancel"}
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-gray-900 py-3 rounded-xl font-medium transition disabled:opacity-60">
            {saving ? (isArabic ? "جاري الحفظ..." : "Saving...") : (isArabic ? "حفظ التغييرات" : "Save Changes")}
          </button>
        </div>
      </form>
    </div>
  );
}
