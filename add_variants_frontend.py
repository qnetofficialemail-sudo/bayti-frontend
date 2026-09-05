import os

FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'

# ── 1. Rewrite AddProduct.tsx with variant builder ──
add_product = r'''import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

interface VariantOption { label: string; price_adj: number; }
interface Variant { name: string; name_ar: string; options: VariantOption[]; is_required: boolean; }

const VARIANT_PRESETS: Record<string, { name: string; name_ar: string; options: string[] }> = {
  size:   { name: "Size",   name_ar: "المقاس",  options: ["XS", "S", "M", "L", "XL", "XXL"] },
  color:  { name: "Color",  name_ar: "اللون",   options: ["Black", "White", "Beige", "Brown", "Navy", "Red", "Pink", "Green"] },
  scent:  { name: "Scent",  name_ar: "العطر",   options: ["Rose", "Oud", "Musk", "Jasmine", "Vanilla", "Lavender"] },
  material: { name: "Material", name_ar: "الخامة", options: ["Cotton", "Silk", "Linen", "Chiffon", "Satin"] },
};

export default function AddProduct() {
  const { user } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", name_ar: "", description: "", description_ar: "", price: "", category_id: "", processing_days: "3", stock_quantity: "10", track_stock: false });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [showVariantBuilder, setShowVariantBuilder] = useState(false);
  const [newVariant, setNewVariant] = useState<Variant>({ name: "", name_ar: "", options: [{ label: "", price_adj: 0 }], is_required: true });

  useEffect(() => {
    if (!user || user.role !== "seller") { navigate("/login"); return; }
    api.get("/api/categories").then(r => setCategories(r.data));
  }, [user]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); setAiSuggestion(null); }
  };

  const generateWithAI = async () => {
    if (!image && !form.name) { setError(isArabic ? "أضف صورة أو اسم المنتج أولاً." : "Add a photo or product name first."); return; }
    setAiLoading(true); setError("");
    try {
      const data = new FormData();
      data.append("product_name", form.name || "Product");
      const selectedCat = categories.find(c => c.id === parseInt(form.category_id));
      data.append("category", selectedCat?.name || "Fashion");
      data.append("language", isArabic ? "ar" : "en");
      if (form.price) data.append("price", form.price);
      if (image) data.append("image", image);
      const response = await api.post("/api/ai/generate-description", data, { headers: { "Content-Type": "multipart/form-data" } });
      if (response.data.success) {
        const suggestion = response.data.data;
        setAiSuggestion(suggestion);
        setForm(f => ({ ...f, description: suggestion.description || f.description, name: suggestion.suggested_name || f.name }));
      }
    } catch (err: any) { setError("AI generation failed."); }
    finally { setAiLoading(false); }
  };

  const applyPreset = (key: string) => {
    const preset = VARIANT_PRESETS[key];
    setNewVariant({
      name: preset.name,
      name_ar: preset.name_ar,
      options: preset.options.map(o => ({ label: o, price_adj: 0 })),
      is_required: true,
    });
  };

  const addVariantOption = () => setNewVariant(v => ({ ...v, options: [...v.options, { label: "", price_adj: 0 }] }));
  const removeVariantOption = (i: number) => setNewVariant(v => ({ ...v, options: v.options.filter((_, idx) => idx !== i) }));
  const updateOption = (i: number, field: "label" | "price_adj", val: string) => {
    setNewVariant(v => ({ ...v, options: v.options.map((o, idx) => idx === i ? { ...o, [field]: field === "price_adj" ? parseFloat(val) || 0 : val } : o) }));
  };

  const saveVariant = () => {
    if (!newVariant.name || newVariant.options.some(o => !o.label)) {
      setError(isArabic ? "أكمل بيانات الخيار" : "Complete all variant option labels"); return;
    }
    setVariants(prev => [...prev, { ...newVariant }]);
    setNewVariant({ name: "", name_ar: "", options: [{ label: "", price_adj: 0 }], is_required: true });
    setShowVariantBuilder(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("description", form.description);
      data.append("price", form.price);
      data.append("preparation_time", form.processing_days);
      if (form.category_id) data.append("category_id", form.category_id);
      data.append("track_stock", String(form.track_stock));
      if (form.track_stock) data.append("stock_quantity", form.stock_quantity);
      if (image) data.append("image", image);
      const res = await api.post("/api/products/", data, { headers: { "Content-Type": "multipart/form-data" } });
      const productId = res.data.id;
      // Save variants
      for (const variant of variants) {
        const vdata = new FormData();
        vdata.append("name", variant.name);
        vdata.append("name_ar", variant.name_ar);
        vdata.append("options", JSON.stringify(variant.options));
        vdata.append("is_required", String(variant.is_required));
        await api.post(`/api/products/${productId}/variants`, vdata, { headers: { "Content-Type": "multipart/form-data" } });
      }
      navigate("/seller/dashboard");
    } catch (err: any) { setError(err.response?.data?.detail || "Failed to create product"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{isArabic ? "إضافة منتج جديد" : "Add a new product"}</h1>
      <p className="text-gray-500 text-sm mb-8">{isArabic ? "ارفع صورة ودع الذكاء الاصطناعي يكتب قائمتك ✨" : "Upload a photo and let AI write your listing ✨"}</p>
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{isArabic ? "الصورة" : "Photo"}</label>
          <label className="block cursor-pointer">
            <div className={`h-56 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition ${preview ? "border-orange-300" : "border-gray-200 hover:border-orange-300"}`}>
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : (
                <div className="text-center text-gray-400">
                  <div className="text-5xl mb-2">📷</div>
                  <p className="text-sm font-medium">{isArabic ? "اضغط لرفع صورة" : "Click to upload a photo"}</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
        </div>

        {/* AI Button */}
        <button type="button" onClick={generateWithAI} disabled={aiLoading}
          className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${aiLoading ? "bg-purple-100 text-purple-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-sm"}`}>
          {aiLoading ? <><span className="animate-spin">⟳</span> {isArabic ? "يحلل الذكاء الاصطناعي..." : "AI is analyzing..."}</> : <>✨ {isArabic ? "توليد بالذكاء الاصطناعي" : "Generate with AI"}</>}
        </button>

        {aiSuggestion && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-purple-600 uppercase">✨ {isArabic ? "اقتراحات الذكاء الاصطناعي" : "AI Suggestions"}</p>
            {aiSuggestion.suggested_price_range && <p className="text-sm text-gray-600">💰 {isArabic ? "السعر المقترح:" : "Suggested:"} <span className="font-semibold">{aiSuggestion.suggested_price_range}</span></p>}
            {aiSuggestion.tags?.length > 0 && <div className="flex flex-wrap gap-1">{aiSuggestion.tags.map((t: string) => <span key={t} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{t}</span>)}</div>}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "اسم المنتج *" : "Product name *"}</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
            placeholder={isArabic ? "مثال: عباية صيفية" : "e.g. Summer Abaya"}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الوصف" : "Description"}{aiSuggestion && <span className="ml-2 text-xs text-purple-500">✨ AI</span>}</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4}
            placeholder={isArabic ? "صف منتجك..." : "Describe your product..."}
            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none ${aiSuggestion ? "border-purple-300 bg-purple-50" : "border-gray-200"}`} />
        </div>

        {/* Price + Processing time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "السعر (درهم) *" : "Price (AED) *"}</label>
            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="1" step="0.5"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "أيام التجهيز" : "Processing days"}</label>
            <input type="number" value={form.processing_days} onChange={e => setForm(f => ({ ...f, processing_days: e.target.value }))} min="1" max="30"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الفئة" : "Category"}</label>
          <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
            <option value="">{isArabic ? "اختر فئة" : "Select a category"}</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {isArabic && cat.name_ar ? cat.name_ar : cat.name}</option>)}
          </select>
        </div>

        {/* Stock */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-blue-900">{isArabic ? "تتبع المخزون" : "Track Stock"}</p>
              <p className="text-xs text-blue-600 mt-0.5">{isArabic ? "حدد كمية محدودة من المنتج" : "Set a limited quantity for this product"}</p>
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, track_stock: !f.track_stock }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.track_stock ? "bg-blue-500" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.track_stock ? "translate-x-6" : ""}`} />
            </button>
          </div>
          {form.track_stock && (
            <input type="number" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))}
              min="1" required={form.track_stock} placeholder={isArabic ? "الكمية المتاحة" : "Available quantity"}
              className="w-full border border-blue-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" />
          )}
        </div>

        {/* Variants */}
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-900">🎨 {isArabic ? "الخيارات (مقاس، لون، عطر...)" : "Variants (size, color, scent...)"}</p>
              <p className="text-xs text-gray-500 mt-0.5">{isArabic ? "أضف خيارات للمشتري يختار منها" : "Let buyers choose from options"}</p>
            </div>
            <button type="button" onClick={() => setShowVariantBuilder(true)}
              className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition">
              + {isArabic ? "إضافة خيار" : "Add Variant"}
            </button>
          </div>

          {variants.length > 0 && (
            <div className="space-y-2 mb-3">
              {variants.map((v, i) => (
                <div key={i} className="flex items-center justify-between bg-orange-50 rounded-lg px-3 py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{v.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{v.options.map(o => o.label).join(", ")}</span>
                  </div>
                  <button type="button" onClick={() => setVariants(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-gray-400 hover:text-red-500 text-sm transition">✕</button>
                </div>
              ))}
            </div>
          )}

          {showVariantBuilder && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
              <p className="text-sm font-medium text-gray-700">{isArabic ? "بناء الخيار" : "Build Variant"}</p>

              {/* Presets */}
              <div>
                <p className="text-xs text-gray-500 mb-2">{isArabic ? "قوالب سريعة:" : "Quick presets:"}</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(VARIANT_PRESETS).map(([key, preset]) => (
                    <button key={key} type="button" onClick={() => applyPreset(key)}
                      className="text-xs bg-white border border-gray-200 hover:border-orange-300 px-3 py-1.5 rounded-lg transition">
                      {isArabic ? preset.name_ar : preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{isArabic ? "اسم الخيار (EN)" : "Variant name (EN)"}</label>
                  <input type="text" value={newVariant.name} onChange={e => setNewVariant(v => ({ ...v, name: e.target.value }))}
                    placeholder="e.g. Size"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{isArabic ? "اسم الخيار (AR)" : "Variant name (AR)"}</label>
                  <input type="text" value={newVariant.name_ar} onChange={e => setNewVariant(v => ({ ...v, name_ar: e.target.value }))}
                    placeholder="مثال: المقاس"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">{isArabic ? "الخيارات المتاحة:" : "Available options:"}</p>
                <div className="space-y-2">
                  {newVariant.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="text" value={opt.label} onChange={e => updateOption(i, "label", e.target.value)}
                        placeholder={isArabic ? "الخيار (مثال: M)" : "Option (e.g. M)"}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">+AED</span>
                        <input type="number" value={opt.price_adj} onChange={e => updateOption(i, "price_adj", e.target.value)}
                          placeholder="0" step="0.5"
                          className="w-16 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                      </div>
                      {newVariant.options.length > 1 && (
                        <button type="button" onClick={() => removeVariantOption(i)}
                          className="text-gray-400 hover:text-red-500 transition">✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addVariantOption}
                  className="text-xs text-orange-500 hover:underline mt-2">
                  + {isArabic ? "إضافة خيار آخر" : "Add another option"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={newVariant.is_required} onChange={e => setNewVariant(v => ({ ...v, is_required: e.target.checked }))}
                  className="rounded" id="required-check" />
                <label htmlFor="required-check" className="text-xs text-gray-600">
                  {isArabic ? "مطلوب (المشتري يجب أن يختار)" : "Required (buyer must choose)"}
                </label>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setShowVariantBuilder(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm transition">
                  {isArabic ? "إلغاء" : "Cancel"}
                </button>
                <button type="button" onClick={saveVariant}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm transition">
                  {isArabic ? "حفظ الخيار" : "Save Variant"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate("/seller/dashboard")}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition">
            {isArabic ? "إلغاء" : "Cancel"}
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition disabled:opacity-60">
            {loading ? (isArabic ? "جارٍ الإضافة..." : "Adding...") : (isArabic ? "إضافة المنتج" : "Add Product")}
          </button>
        </div>
      </form>
    </div>
  );
}
'''

add_path = os.path.join(FRONTEND, 'src', 'pages', 'AddProduct.tsx')
open(add_path, 'w', encoding='utf-8').write(add_product)
print("Done - AddProduct.tsx rewritten with variant builder")

# ── 2. Patch ProductDetail.tsx to load and show variants ──
detail_path = os.path.join(FRONTEND, 'src', 'pages', 'ProductDetail.tsx')
detail = open(detail_path, encoding='utf-8').read()

# Add variants state
old_state = "  const [quantity, setQuantity] = useState(1);"
new_state = "  const [quantity, setQuantity] = useState(1);\n  const [variants, setVariants] = useState<any[]>([]);\n  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});\n  const [variantError, setVariantError] = useState(\"\");"

if 'variants' not in detail:
    if old_state in detail:
        detail = detail.replace(old_state, new_state)
        print("Done - variant state added to ProductDetail")
    else:
        print("FAIL - could not find quantity state in ProductDetail")
else:
    print("Skip - variants already in ProductDetail")

# Add variants fetch
old_fetch = "      api.get(`/api/products/${id}`),"
new_fetch = "      api.get(`/api/products/${id}`),\n      api.get(`/api/products/${id}/variants`),"

old_then = "    ]).then(([p, r, related]) => {"
new_then = "    ]).then(([p, r, related, v]) => {"

old_set = "      setRelated(related.data.filter((r: any) => r.id !== parseInt(id!)));"
new_set = "      setRelated(related.data.filter((r: any) => r.id !== parseInt(id!)));\n      setVariants(v.data || []);"

if 'variants' not in detail or '/variants`' not in detail:
    detail = detail.replace(old_fetch, new_fetch)
    detail = detail.replace(old_then, new_then)
    detail = detail.replace(old_set, new_set)
    print("Done - variants fetch added to ProductDetail")

# Add variant validation before add to cart
old_add = "  const handleAddToCart = () => {"
new_add = '''  const handleAddToCart = () => {
    // Check required variants
    const missingVariant = variants.find(v => v.is_required && !selectedVariants[v.name]);
    if (missingVariant) {
      setVariantError(isArabic ? `يرجى اختيار ${missingVariant.name_ar || missingVariant.name}` : `Please select ${missingVariant.name}`);
      return;
    }
    setVariantError("");'''

if 'missingVariant' not in detail:
    if old_add in detail:
        detail = detail.replace(old_add, new_add)
        print("Done - variant validation added")
    else:
        print("FAIL - could not find handleAddToCart")

# Add variant price to total price calculation - find price display
old_price_display = "{product.price}"
new_price_display = "{(product.price + variants.reduce((sum: number, v: any) => { const sel = selectedVariants[v.name]; if (!sel) return sum; const opt = JSON.parse(v.options || '[]').find((o: any) => o.label === sel); return sum + (opt?.price_adj || 0); }, 0)).toFixed(2)}"

# Add variant selector UI before the add to cart button area
old_qty = "      {/* Quantity */}"
new_qty = '''      {/* Variants */}
      {variants.length > 0 && (
        <div className="space-y-4 mb-4">
          {variants.map((variant: any) => {
            const options = JSON.parse(variant.options || "[]");
            return (
              <div key={variant.id}>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {isArabic && variant.name_ar ? variant.name_ar : variant.name}
                  {variant.is_required && <span className="text-red-400 ml-1">*</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {options.map((opt: any) => (
                    <button key={opt.label} type="button"
                      onClick={() => { setSelectedVariants(prev => ({ ...prev, [variant.name]: opt.label })); setVariantError(""); }}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition ${
                        selectedVariants[variant.name] === opt.label
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 hover:border-orange-300 text-gray-700"
                      }`}>
                      {opt.label}
                      {opt.price_adj > 0 && <span className="text-xs ml-1 text-orange-500">+AED {opt.price_adj}</span>}
                      {opt.price_adj < 0 && <span className="text-xs ml-1 text-green-500">-AED {Math.abs(opt.price_adj)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {variantError && <p className="text-red-500 text-sm">{variantError}</p>}
        </div>
      )}

      {/* Quantity */}'''

if 'variants.length > 0' not in detail:
    if old_qty in detail:
        detail = detail.replace(old_qty, new_qty)
        print("Done - variant selector UI added to ProductDetail")
    else:
        print("FAIL - could not find Quantity comment in ProductDetail")

open(detail_path, 'w', encoding='utf-8').write(detail)
print("Done - ProductDetail.tsx updated")
