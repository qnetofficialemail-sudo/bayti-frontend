import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

interface VariantOption { label: string; price_adj: number; }
interface Variant { id?: number; name: string; name_ar: string; options: VariantOption[]; is_required: boolean; }

const VARIANT_PRESETS: Record<string, { name: string; name_ar: string; options: string[] }> = {
  size:     { name: "Size",     name_ar: "\u0627\u0644\u0645\u0642\u0627\u0633",  options: ["XS","S","M","L","XL","XXL"] },
  color:    { name: "Color",    name_ar: "\u0627\u0644\u0644\u0648\u0646",   options: ["Black","White","Beige","Brown","Navy","Red","Pink","Green"] },
  scent:    { name: "Scent",    name_ar: "\u0627\u0644\u0639\u0637\u0631",   options: ["Rose","Oud","Musk","Jasmine","Vanilla","Lavender"] },
  material: { name: "Material", name_ar: "\u0627\u0644\u062e\u0627\u0645\u0629", options: ["Cotton","Silk","Linen","Chiffon","Satin"] },
};

export default function EditProduct() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", category_id: "", preparation_time: "3", time_unit: "days", is_available: true });
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
      setForm({
        name: prod.name || "",
        description: prod.description || "",
        price: String(prod.price || ""),
        category_id: String(prod.category?.id || ""),
        preparation_time: String(prod.preparation_time || "3"),
        time_unit: prod.time_unit || "days",
        is_available: prod.is_available,
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
    if (!newVariant.name || newVariant.options.some(o => !o.label)) { setError(isArabic ? "\u0623\u0643\u0645\u0644 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062e\u064a\u0627\u0631" : "Complete all variant labels"); return; }
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
      if (form.category_id) data.append("category_id", form.category_id);
      if (newImages[0]) data.append("image", newImages[0]);
      if (newImages[1]) data.append("image_2", newImages[1]);
      if (newImages[2]) data.append("image_3", newImages[2]);
      if (newImages[3]) data.append("image_4", newImages[3]);
      if (newImages[4]) data.append("image_5", newImages[4]);
      await api.put(`/api/products/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });

      // Save new variants
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

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  const imgUrl = (img: string) => img.startsWith("http") ? img : `https://web-production-63685.up.railway.app${img}`;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{isArabic ? "\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0645\u0646\u062a\u062c" : "Edit Product"}</h1>
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Existing images */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">{isArabic ? "\u0627\u0644\u0635\u0648\u0631 \u0627\u0644\u062d\u0627\u0644\u064a\u0629" : "Current Photos"}</label>
            <span className="text-xs text-gray-400">{isArabic ? "\u2605 \u0644\u062a\u0639\u064a\u064a\u0646 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629" : "\u2605 to set main"}</span>
          </div>
          {existingImages.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {existingImages.map((img, i) => (
                <div key={i} className="relative">
                  <img src={imgUrl(img)} alt={`Image ${i+1}`} className={`w-16 h-16 object-cover rounded-xl border-2 ${primaryIndex === i ? "border-orange-500" : "border-gray-200"}`} />
                  <button type="button" onClick={() => setPrimaryIndex(i)}
                    className={`absolute top-0.5 right-0.5 w-5 h-5 rounded-full text-xs flex items-center justify-center shadow ${primaryIndex === i ? "bg-orange-500 text-white" : "bg-white text-gray-400"}`}>
                    \u2605
                  </button>
                  {primaryIndex === i && <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-orange-500 text-white rounded-b-xl py-0.5">{isArabic ? "\u0631\u0626\u064a\u0633\u064a\u0629" : "Main"}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Upload new images */}
          <p className="text-xs text-gray-500 mb-2">{isArabic ? "\u0625\u0636\u0627\u0641\u0629 \u0635\u0648\u0631 \u062c\u062f\u064a\u062f\u0629 (\u062a\u0633\u062a\u0628\u062f\u0644 \u0627\u0644\u062d\u0627\u0644\u064a\u0629):" : "Add new photos (replaces current):"}</p>
          <div className="grid grid-cols-5 gap-2">
            {[0,1,2,3,4].map(i => (
              <label key={i} className="block cursor-pointer">
                <div className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition ${newPreviews[i] ? "border-orange-300" : "border-gray-200 hover:border-orange-300"}`}>
                  {newPreviews[i]
                    ? <img src={newPreviews[i]!} alt="" className="w-full h-full object-cover" />
                    : <div className="text-center text-gray-300"><div className="text-xl">\U0001f4f7</div><div className="text-xs">{i+1}</div></div>}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => handleNewImage(i, e.target.files?.[0] || null)} />
              </label>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "\u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062a\u062c *" : "Product name *"}</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "\u0627\u0644\u0648\u0635\u0641" : "Description"}</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
        </div>

        {/* Price + Processing time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "\u0627\u0644\u0633\u0639\u0631 (\u062f\u0631\u0647\u0645) *" : "Price (AED) *"}</label>
            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="1" step="0.5"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "\u0648\u0642\u062a \u0627\u0644\u062a\u062c\u0647\u064a\u0632" : "Processing time"}</label>
            <div className="flex gap-2">
              <input type="number" value={form.preparation_time} onChange={e => setForm(f => ({ ...f, preparation_time: e.target.value }))} min="1"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
              <select value={form.time_unit} onChange={e => setForm(f => ({ ...f, time_unit: e.target.value }))}
                className="border border-gray-200 rounded-xl px-2 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-sm">
                <option value="minutes">{isArabic ? "\u062f\u0642\u064a\u0642\u0629" : "mins"}</option>
                <option value="hours">{isArabic ? "\u0633\u0627\u0639\u0629" : "hrs"}</option>
                <option value="days">{isArabic ? "\u064a\u0648\u0645" : "days"}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "\u0627\u0644\u0641\u0626\u0629" : "Category"}</label>
          <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
            <option value="">{isArabic ? "\u0627\u062e\u062a\u0631 \u0641\u0626\u0629" : "Select category"}</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {isArabic && cat.name_ar ? cat.name_ar : cat.name}</option>)}
          </select>
        </div>

        {/* Variants */}
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-900">\U0001f3a8 {isArabic ? "\u0627\u0644\u062e\u064a\u0627\u0631\u0627\u062a (\u0645\u0642\u0627\u0633\u060c \u0644\u0648\u0646\u060c \u0639\u0637\u0631...)" : "Variants (size, color, scent...)"}</p>
            </div>
            <button type="button" onClick={() => setShowVariantBuilder(true)}
              className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition">
              + {isArabic ? "\u0625\u0636\u0627\u0641\u0629" : "Add"}
            </button>
          </div>

          {variants.length > 0 && (
            <div className="space-y-2 mb-3">
              {variants.map((v, i) => (
                <div key={i} className="flex items-center justify-between bg-orange-50 rounded-lg px-3 py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{v.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{v.options.map(o => o.label).join(", ")}</span>
                    {v.id && <span className="text-xs text-green-600 ml-2">\u2713 saved</span>}
                  </div>
                  <button type="button" onClick={() => deleteVariant(v, i)}
                    className="text-gray-400 hover:text-red-500 text-sm transition">\u2715</button>
                </div>
              ))}
            </div>
          )}

          {showVariantBuilder && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
              <p className="text-sm font-medium text-gray-700">{isArabic ? "\u0628\u0646\u0627\u0621 \u0627\u0644\u062e\u064a\u0627\u0631" : "Build Variant"}</p>
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
                  placeholder="\u0627\u0633\u0645 \u0639\u0631\u0628\u064a" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
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
                      <button type="button" onClick={() => removeOption(i)} className="text-gray-400 hover:text-red-500">\u2715</button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addOption} className="text-xs text-orange-500 hover:underline">
                + {isArabic ? "\u0625\u0636\u0627\u0641\u0629 \u062e\u064a\u0627\u0631" : "Add option"}
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowVariantBuilder(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm transition">
                  {isArabic ? "\u0625\u0644\u063a\u0627\u0621" : "Cancel"}
                </button>
                <button type="button" onClick={saveVariant}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm transition">
                  {isArabic ? "\u062d\u0641\u0638" : "Save"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Available toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <p className="font-medium text-gray-900 text-sm">{isArabic ? "\u0645\u062a\u0627\u062d \u0644\u0644\u0637\u0644\u0628" : "Available for orders"}</p>
          <button type="button" onClick={() => setForm(f => ({ ...f, is_available: !f.is_available }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${form.is_available ? "bg-orange-500" : "bg-gray-300"}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_available ? "translate-x-6" : ""}`} />
          </button>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate("/seller/dashboard")}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition">
            {isArabic ? "\u0625\u0644\u063a\u0627\u0621" : "Cancel"}
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition disabled:opacity-60">
            {saving ? (isArabic ? "\u062c\u0627\u0631\u064a \u0627\u0644\u062d\u0641\u0638..." : "Saving...") : (isArabic ? "\u062d\u0641\u0638 \u0627\u0644\u062a\u063a\u064a\u064a\u0631\u0627\u062a" : "Save Changes")}
          </button>
        </div>
      </form>
    </div>
  );
}
