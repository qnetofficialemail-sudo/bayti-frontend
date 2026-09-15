import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import PricingAdvisor from "../components/PricingAdvisor";

interface VariantOption { label: string; price_adj: number; }
interface Variant { name: string; name_ar: string; options: VariantOption[]; is_required: boolean; }

const VARIANT_PRESETS: Record<string, { name: string; name_ar: string; options: string[] }> = {
  size:     { name: "Size",     name_ar: "المقاس",  options: ["XS", "S", "M", "L", "XL", "XXL"] },
  color:    { name: "Color",    name_ar: "اللون",   options: ["Black / أسود", "White / أبيض", "Beige / بيج", "Brown / بني", "Navy / كحلي", "Red / أحمر", "Pink / وردي", "Green / أخضر"] },
  scent:    { name: "Scent",    name_ar: "العطر",   options: ["Rose / ورد", "Oud / عود", "Musk / مسك", "Jasmine / ياسمين", "Vanilla / فانيلا", "Lavender / لافندر"] },
  material: { name: "Material", name_ar: "الخامة",  options: ["Cotton / قطن", "Silk / حرير", "Linen / كتان", "Chiffon / شيفون", "Satin / ساتان"] },
};

const CATEGORY_SPECS: Record<string, { key: string; label: string; label_ar: string; type: "select" | "text" | "multiselect"; options?: string[] }[]> = {
  "Clothing & Abayas": [
    { key: "sizes_available", label: "Available Sizes", label_ar: "المقاسات المتاحة", type: "multiselect", options: ["XS", "S", "M", "L", "XL", "XXL", "Custom / مقاس مخصص"] },
    { key: "colors_available", label: "Available Colors", label_ar: "الألوان المتاحة", type: "multiselect", options: ["Black / أسود", "White / أبيض", "Beige / بيج", "Navy / كحلي", "Brown / بني", "Grey / رمادي", "Other / أخرى"] },
    { key: "material", label: "Material", label_ar: "الخامة", type: "select", options: ["Nida / نيدا", "Crepe / كريب", "Linen / كتان", "Chiffon / شيفون", "Cotton / قطن", "Silk / حرير", "Satin / ساتان", "Other / أخرى"] },
    { key: "care_instructions", label: "Care Instructions", label_ar: "تعليمات العناية", type: "select", options: ["غسيل يدوي / Hand wash", "غسيل آلي / Machine wash", "تنظيف جاف / Dry clean only"] },
    { key: "custom_sizing", label: "Custom Sizing Available", label_ar: "مقاس مخصص", type: "select", options: ["متاح / Available", "غير متاح / Not available"] },
  ],
  "Perfumes & Candles": [
    { key: "scent_family", label: "Scent Family", label_ar: "عائلة العطر", type: "select", options: ["عود / Oud", "زهري / Floral", "مسك / Musk", "حمضي / Citrus", "خشبي / Woody", "شرقي / Oriental", "منعش / Fresh"] },
    { key: "volume_ml", label: "Volume / Weight", label_ar: "الحجم / الوزن", type: "text" },
    { key: "burn_time", label: "Burn Time (candles)", label_ar: "مدة الاحتراق (شموع)", type: "text" },
    { key: "ingredients", label: "Key Ingredients", label_ar: "المكونات الرئيسية", type: "text" },
  ],
  "Handmade Crafts": [
    { key: "material", label: "Material", label_ar: "الخامة", type: "text" },
    { key: "dimensions", label: "Dimensions", label_ar: "الأبعاد", type: "text" },
    { key: "customizable", label: "Customizable", label_ar: "قابل للتخصيص", type: "select", options: ["نعم / Yes", "لا / No"] },
    { key: "occasion", label: "Occasion", label_ar: "المناسبة", type: "select", options: ["هدية / Gift", "زفاف / Wedding", "رمضان / Ramadan", "عيد / Eid", "ديكور / Home Decor", "أخرى / Other"] },
  ],
  "Accessories": [
    { key: "material", label: "Material", label_ar: "الخامة", type: "select", options: ["ذهبي مطلي / Gold plated", "فضة / Silver", "ستانلس ستيل / Stainless steel", "جلد / Leather", "قماش / Fabric", "أخرى / Other"] },
    { key: "colors_available", label: "Available Colors", label_ar: "الألوان المتاحة", type: "multiselect", options: ["ذهبي / Gold", "فضي / Silver", "أسود / Black", "أبيض / White", "بني / Brown", "أخرى / Other"] },
    { key: "occasion", label: "Occasion", label_ar: "المناسبة", type: "select", options: ["يومي / Casual", "رسمي / Formal", "زفاف / Wedding", "عملي / Everyday"] },
  ],
  "Beauty & Skincare": [
    { key: "skin_type", label: "Skin Type", label_ar: "نوع البشرة", type: "select", options: ["جميع أنواع البشرة / All skin types", "جافة / Dry", "دهنية / Oily", "مختلطة / Combination", "حساسة / Sensitive"] },
    { key: "volume_ml", label: "Volume (ml)", label_ar: "الحجم (مل)", type: "text" },
    { key: "key_ingredients", label: "Key Ingredients", label_ar: "المكونات الرئيسية", type: "text" },
    { key: "natural", label: "Natural / Organic", label_ar: "طبيعي / عضوي", type: "select", options: ["نعم / Yes", "لا / No"] },
  ],
  "Makeup & Beauty": [
    { key: "shade", label: "Available Shades", label_ar: "الألوان المتاحة", type: "text" },
    { key: "finish", label: "Finish", label_ar: "النهاية", type: "select", options: ["ماتي / Matte", "لامع / Glossy", "ساتاني / Satin", "طبيعي / Natural"] },
    { key: "longevity", label: "Longevity", label_ar: "مدة الثبات", type: "select", options: ["حتى 4 ساعات / Up to 4 hrs", "4-8 ساعات / 4-8 hrs", "8-12 ساعة / 8-12 hrs", "24 ساعة / 24 hrs"] },
  ],
  "Home Cooked Meals": [
    { key: "serves", label: "Serves", label_ar: "عدد الأشخاص", type: "select", options: ["شخص واحد / 1 person", "شخصان / 2 persons", "4 أشخاص / 4 persons", "6 أشخاص / 6 persons", "عائلة / Family size"] },
    { key: "allergens", label: "Allergens", label_ar: "مسببات الحساسية", type: "text" },
    { key: "halal", label: "Halal", label_ar: "حلال", type: "select", options: ["نعم / Yes", "لا / No"] },
    { key: "heating", label: "Heating Required", label_ar: "يحتاج تسخين", type: "select", options: ["جاهز للأكل / Ready to eat", "ميكروويف / Microwave", "فرن / Oven", "موقد / Stovetop"] },
    { key: "dietary", label: "Dietary", label_ar: "النظام الغذائي", type: "select", options: ["عادي / Regular", "نباتي / Vegetarian", "نباتي صرف / Vegan", "خالي من الجلوتين / Gluten-free", "خالي من الألبان / Dairy-free"] },
  ],
  "Home Decor & Touches": [
    { key: "item_type", label: "Item Type", label_ar: "نوع القطعة", type: "select", options: ["Vase / مزهرية", "Candle Holder / شمعدان", "Picture Frame / إطار صورة", "Cushion / وسادة", "Plant Pot / أصيص نبات", "Wall Art / لوحة جدارية", "Tray / صينية", "Other / أخرى"] },
    { key: "material", label: "Material", label_ar: "المادة", type: "text" },
    { key: "dimensions", label: "Dimensions", label_ar: "الأبعاد", type: "text" },
    { key: "color_style", label: "Color / Style", label_ar: "اللون / الطراز", type: "text" },
  ],
};

export default function AddProduct() {
  const { user } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", name_ar: "", description: "", description_ar: "", price: "", category_id: "", processing_days: "3", time_unit: "days", stock_quantity: "10", track_stock: false, discount_percent: "", free_shipping_enabled: false, free_shipping_min_amount: "" });
  const [specs, setSpecs] = useState<Record<string, string | string[]>>({});
  const [images, setImages] = useState<(File | null)[]>([null, null, null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null, null, null]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkPreviews, setBulkPreviews] = useState<string[]>([]);
  const [bulkProducts, setBulkProducts] = useState<any[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkAnalyzed, setBulkAnalyzed] = useState(false);
  const [bulkGroups, setBulkGroups] = useState<string[]>([]);
  const [showVariantBuilder, setShowVariantBuilder] = useState(false);
  const [newVariant, setNewVariant] = useState<Variant>({ name: "", name_ar: "", options: [{ label: "", price_adj: 0 }], is_required: true });

  useEffect(() => {
    if (!user || user.role !== "seller") { navigate("/login"); return; }
    api.get("/api/categories").then(r => setCategories(r.data));
  }, [user]);

  const selectedCategory = categories.find(c => String(c.id) === form.category_id);
  const categorySpecsConfig = selectedCategory
    ? CATEGORY_SPECS[selectedCategory.name] || null
    : null;

  const handleSpecChange = (key: string, value: string) => {
    setSpecs(prev => ({ ...prev, [key]: value }));
  };

  const handleSpecMultiselect = (key: string, option: string) => {
    setSpecs(prev => {
      const current = (prev[key] as string[]) || [];
      const updated = current.includes(option) ? current.filter(o => o !== option) : [...current, option];
      return { ...prev, [key]: updated };
    });
  };

  const handleImage = (index: number, file: File | null) => {
    const newImages = [...images];
    const newPreviews = [...previews];
    newImages[index] = file;
    newPreviews[index] = file ? URL.createObjectURL(file) : null;
    setImages(newImages);
    setPreviews(newPreviews);
    if (file && index === 0) setAiSuggestion(null);
  };

  const generateWithAI = async () => {
    if (!images[0] && !form.name) { setError(isArabic ? "أضف صورة أو اسم المنتج أولاً." : "Add a photo or product name first."); return; }
    setAiLoading(true); setError("");
    try {
      const data = new FormData();
      data.append("product_name", form.name || "Product");
      const selectedCat = categories.find(c => c.id === parseInt(form.category_id));
      data.append("category", selectedCat?.name || "Fashion");
      data.append("language", isArabic ? "ar" : "en");
      if (form.price) data.append("price", form.price);
      if (images[0]) data.append("image", images[0]);
      const response = await api.post("/api/ai/generate-description", data, { headers: { "Content-Type": "multipart/form-data" } });
      if (response.data.success) {
        const suggestion = response.data.data;
        setAiSuggestion(suggestion);
        setForm(f => ({ ...f, description: suggestion.description || f.description, name: suggestion.suggested_name || f.name }));
      } else {
        setError(isArabic ? "فشل الذكاء الاصطناعي." : "AI generation failed.");
      }
    } catch (err: any) { setError(err.response?.data?.detail || "AI generation failed."); }
    finally { setAiLoading(false); }
  };

  const applyPreset = (key: string) => {
    const preset = VARIANT_PRESETS[key];
    setNewVariant({ name: preset.name, name_ar: preset.name_ar, options: preset.options.map(o => ({ label: o, price_adj: 0 })), is_required: true });
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

  const analyzeBulk = async () => {
    if (bulkFiles.length === 0) return;
    setBulkLoading(true);

    const groupMap: Record<string, {files: File[], previews: string[]}> = {};
    bulkFiles.forEach((file, i) => {
      const group = bulkGroups[i] || "product_1";
      if (!groupMap[group]) groupMap[group] = { files: [], previews: [] };
      groupMap[group].files.push(file);
      groupMap[group].previews.push(bulkPreviews[i]);
    });

    const results = [];
    for (const group of Object.keys(groupMap).sort()) {
      const { files, previews } = groupMap[group];
      const mainFile = files[0];
      let name = "";
      let description = "";
      try {
        const formData = new FormData();
        formData.append("image", mainFile);
        formData.append("name", mainFile.name);
        formData.append("category_name", isArabic ? "منتج" : "Product");
        const res = await api.post("/api/studio/analyze", formData);
        const data = res.data;
        name = data.name_suggestion || mainFile.name;
        description = data.arabic_description || "";
      } catch {
        name = mainFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      }
      results.push({
        files,
        images: previews,
        name,
        description,
        price: "",
        category_id: "",
        processing_days: "3",
        time_unit: "days",
        done: false,
      });
    }
    setBulkProducts(results);
    setBulkAnalyzed(true);
    setBulkLoading(false);
  };

  const submitBulkProduct = async (prod: any, index: number) => {
    const data = new FormData();
    data.append("name", prod.name);
    data.append("description", prod.description);
    data.append("price", prod.price);
    if (prod.category_id) data.append("category_id", prod.category_id);
    data.append("preparation_time", prod.processing_days);
    data.append("time_unit", prod.time_unit);
    if (prod.files && prod.files[0]) data.append("image", prod.files[0]);
    const extraKeys = ["image_2", "image_3", "image_4", "image_5"];
    if (prod.files) {
      prod.files.slice(1, 5).forEach((f: File, i: number) => {
        data.append(extraKeys[i], f);
      });
    }
    await api.post("/api/products", data, { headers: { "Content-Type": "multipart/form-data" } });
    setBulkProducts((prev: any) => prev.map((p: any, i: number) => i === index ? { ...p, done: true } : p));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("description", form.description);
      data.append("price", form.price);
      data.append("preparation_time", form.processing_days);
      data.append("time_unit", form.time_unit);
      if (form.discount_percent && parseFloat(form.discount_percent) > 0) data.append("discount_percent", form.discount_percent);
      if (form.free_shipping_enabled && form.free_shipping_min_amount) data.append("free_shipping_min_amount", form.free_shipping_min_amount);
      if (form.category_id) data.append("category_id", form.category_id);
      data.append("track_stock", String(form.track_stock));
      if (form.track_stock) data.append("stock_quantity", form.stock_quantity);
      if (Object.keys(specs).length > 0) data.append("specs", JSON.stringify(specs));
      if (images[0]) data.append("image", images[0]);
      if (images[1]) data.append("image_2", images[1]);
      if (images[2]) data.append("image_3", images[2]);
      if (images[3]) data.append("image_4", images[3]);
      if (images[4]) data.append("image_5", images[4]);
      data.append("primary_image_index", String(primaryIndex));
      const res = await api.post("/api/products", data, { headers: { "Content-Type": "multipart/form-data" } });
      const productId = res.data.id;
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

      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl mb-5">
        <button type="button" onClick={() => setMode("single")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${mode === "single" ? "bg-white shadow text-primary-500" : "text-gray-500 hover:text-gray-700"}`}>
          {isArabic ? "➕ منتج واحد" : "➕ Single Product"}
        </button>
        <button type="button" onClick={() => { setMode("bulk"); setBulkAnalyzed(false); setBulkProducts([]); setBulkFiles([]); setBulkPreviews([]); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${mode === "bulk" ? "bg-white shadow text-primary-500" : "text-gray-500 hover:text-gray-700"}`}>
          {isArabic ? "🚀 رفع متعدد بالذكاء الاصطناعي" : "🚀 Bulk AI Upload"}
        </button>
      </div>

      {/* Bulk Upload Mode */}
      {mode === "bulk" && (
        <div className="space-y-5">
          {bulkFiles.length === 0 && (
            <div className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4">
                <p className="text-sm font-medium text-primary-900">{isArabic ? "🤖 رفع متعدد ذكي" : "🤖 Smart Bulk Upload"}</p>
                <p className="text-xs text-primary-600 mt-1">{isArabic ? "ارفع صور منتجاتك — ثم حددي أي صور تنتمي لنفس المنتج" : "Upload your product photos — then group photos that belong to the same product"}</p>
              </div>
              <label className="block border-2 border-dashed border-primary-200 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition">
                <div className="text-4xl mb-3">📸</div>
                <p className="text-sm font-medium text-gray-700">{isArabic ? "اختر صور منتجاتك" : "Select your product photos"}</p>
                <p className="text-xs text-gray-400 mt-1">{isArabic ? "حتى 20 صورة دفعة واحدة" : "Up to 20 photos at once"}</p>
                <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                  const files = Array.from(e.target.files || []).slice(0, 20);
                  setBulkFiles(files);
                  setBulkPreviews(files.map(f => URL.createObjectURL(f)));
                  setBulkGroups(files.map((_, i) => `product_${Math.floor(i/1)+1}`));
                }} />
              </label>
            </div>
          )}

          {bulkFiles.length > 0 && !bulkAnalyzed && (
            <div className="space-y-4">
              <div className="bg-info-tint border border-info-tint rounded-2xl p-4">
                <p className="text-sm font-medium text-info">{isArabic ? "📌 حددي المنتج لكل صورة" : "📌 Assign each photo to a product"}</p>
                <p className="text-xs text-info mt-1">{isArabic ? "الصور التي تحمل نفس رقم المنتج ستُجمع معاً في صفحة منتج واحدة" : "Photos with the same product number will be grouped into one product page"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {bulkPreviews.map((src, i) => {
                  const currentGroup = bulkGroups[i] || "product_1";
                  const groupNum = parseInt(currentGroup.split("_")[1]);
                  const groupColors = ["bg-primary-500","bg-info","bg-success","bg-purple-500","bg-error","bg-yellow-500","bg-pink-500","bg-indigo-500"];
                  const color = groupColors[(groupNum - 1) % groupColors.length];
                  return (
                    <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
                      <div className="relative">
                        <img src={src} alt="" className="w-full h-32 object-cover" />
                        <div className={`absolute top-2 right-2 ${color} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                          {isArabic ? `م${groupNum}` : `P${groupNum}`}
                        </div>
                      </div>
                      <div className="p-2">
                        <select
                          value={bulkGroups[i] || "product_1"}
                          onChange={e => {
                            const newGroups = [...bulkGroups];
                            newGroups[i] = e.target.value;
                            setBulkGroups(newGroups);
                          }}
                          className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        >
                          {Array.from({length: Math.min(bulkFiles.length, 10)}, (_, j) => (
                            <option key={j+1} value={`product_${j+1}`}>
                              {isArabic ? `منتج ${j+1}` : `Product ${j+1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-50 rounded-2xl p-3">
                <p className="text-xs font-medium text-gray-600 mb-2">{isArabic ? "ملخص المجموعات:" : "Groups summary:"}</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(bulkGroups)).sort().map(group => {
                    const count = bulkGroups.filter(g => g === group).length;
                    const num = parseInt(group.split("_")[1]);
                    return (
                      <span key={group} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                        {isArabic ? `منتج ${num}: ${count} صور` : `Product ${num}: ${count} photo${count>1?"s":""}`}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => { setBulkFiles([]); setBulkPreviews([]); setBulkGroups([]); }}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-2xl text-sm hover:bg-gray-50 transition">
                  {isArabic ? "إعادة الاختيار" : "Reselect"}
                </button>
                <button type="button" onClick={analyzeBulk} disabled={bulkLoading}
                  className="flex-1 bg-primary-500 text-white py-3 rounded-2xl font-bold text-sm hover:bg-primary-600 disabled:opacity-50 transition">
                  {bulkLoading ? (isArabic ? "جاري التحليل..." : "Analyzing...") : (isArabic ? "تحليل بالذكاء الاصطناعي" : "Analyze with AI")}
                </button>
              </div>
            </div>
          )}

          {bulkAnalyzed && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  {isArabic ? `${bulkProducts.filter((p:any)=>p.done).length}/${bulkProducts.length} منتج تم نشره` : `${bulkProducts.filter((p:any)=>p.done).length}/${bulkProducts.length} published`}
                </p>
                <button type="button" onClick={() => { setBulkAnalyzed(false); setBulkFiles([]); setBulkPreviews([]); setBulkProducts([]); setBulkGroups([]); }}
                  className="text-xs text-primary-500 hover:underline">{isArabic ? "ابدأ من جديد" : "Start over"}</button>
              </div>

              {bulkProducts.map((prod: any, index: number) => (
                <div key={index} className={`border rounded-2xl overflow-hidden ${prod.done ? "border-success-tint bg-success-tint" : "border-gray-200"}`}>
                  <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-100">
                    {prod.images.map((src: string, imgIdx: number) => (
                      <img key={imgIdx} src={src} alt="" className={`h-16 w-16 object-cover rounded-lg ${imgIdx === 0 ? "ring-2 ring-primary-400" : ""}`} />
                    ))}
                    {prod.images.length > 1 && (
                      <div className="flex items-center text-xs text-gray-400 px-2">
                        {isArabic ? `${prod.images.length} صور` : `${prod.images.length} photos`}
                      </div>
                    )}
                  </div>

                  <div className="p-3 space-y-2">
                    {prod.done ? (
                      <p className="text-sm font-medium text-success">✅ {isArabic ? "تم النشر" : "Published"}</p>
                    ) : (
                      <>
                        <input value={prod.name} onChange={e => setBulkProducts((prev:any) => prev.map((p:any,i:number) => i===index ? {...p, name: e.target.value} : p))}
                          placeholder={isArabic ? "اسم المنتج" : "Product name"}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                        <input type="number" value={prod.price} onChange={e => setBulkProducts((prev:any) => prev.map((p:any,i:number) => i===index ? {...p, price: e.target.value} : p))}
                          placeholder={isArabic ? "السعر (درهم)" : "Price (AED)"}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                        <select value={prod.category_id} onChange={e => setBulkProducts((prev:any) => prev.map((p:any,i:number) => i===index ? {...p, category_id: e.target.value} : p))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                          <option value="">{isArabic ? "اختر فئة" : "Select category"}</option>
                          {categories.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>{isArabic && cat.name_ar ? cat.name_ar : cat.name}</option>
                          ))}
                        </select>
                        <button type="button" disabled={!prod.price || !prod.name}
                          onClick={() => submitBulkProduct(prod, index)}
                          className="w-full bg-primary-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-primary-600 disabled:opacity-40 transition">
                          {isArabic ? "نشر المنتج" : "Publish Product"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {bulkProducts.length > 0 && bulkProducts.every((p:any) => p.done) && (
                <div className="bg-success-tint border border-success-tint rounded-2xl p-4 text-center">
                  <p className="text-success font-bold text-sm">✅ {isArabic ? "تم نشر جميع المنتجات!" : "All products published!"}</p>
                  <button type="button" onClick={() => navigate("/seller/dashboard")}
                    className="mt-2 text-sm text-primary-500 hover:underline">{isArabic ? "عرض منتجاتي" : "View my products"}</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Single Product Mode */}
      {mode === "single" && (
      <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{isArabic ? "إضافة منتج جديد" : "Add a new product"}</h1>
      <p className="text-gray-500 text-sm mb-8">{isArabic ? "ارفع صورة ودع الذكاء الاصطناعي يكتب قائمتك ✨" : "Upload a photo and let AI write your listing ✨"}</p>
      {error && <div className="bg-error-tint text-error text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Photos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">{isArabic ? "الصور (حتى 5)" : "Photos (up to 5)"}</label>
            <span className="text-xs text-gray-400">{isArabic ? "اضغط النجمة لتعيين الصورة الرئيسية" : "Tap ★ to set main photo"}</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="relative">
                <label className="block cursor-pointer">
                  <div className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition ${previews[i] ? "border-primary-300" : "border-gray-200 hover:border-primary-300"}`}>
                    {previews[i] ? <img src={previews[i]!} alt={`Photo ${i+1}`} className="w-full h-full object-cover" />
                      : <div className="text-center text-gray-300"><div className="text-2xl">📷</div><div className="text-xs mt-1">{i === 0 ? (isArabic ? "رئيسية" : "Main") : i+1}</div></div>}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImage(i, e.target.files?.[0] || null)} />
                </label>
                {previews[i] && (
                  <div className="absolute top-1 right-1 flex flex-col gap-1">
                    <button type="button" onClick={() => setPrimaryIndex(i)}
                      className={`w-5 h-5 rounded-full text-xs flex items-center justify-center shadow ${primaryIndex === i ? "bg-primary-500 text-gray-900" : "bg-white text-gray-400 hover:text-primary-500"}`}>★</button>
                    <button type="button" onClick={() => handleImage(i, null)}
                      className="w-5 h-5 rounded-full bg-white text-gray-400 hover:text-error text-xs flex items-center justify-center shadow">✕</button>
                  </div>
                )}
                {primaryIndex === i && previews[i] && (
                  <div className="absolute bottom-1 left-1 bg-primary-500 text-gray-900 text-xs px-1.5 py-0.5 rounded-full">{isArabic ? "رئيسية" : "Main"}</div>
                )}
              </div>
            ))}
          </div>
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

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "اسم المنتج *" : "Product name *"}</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
            placeholder={isArabic ? "مثال: عباية صيفية" : "e.g. Summer Abaya"}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الوصف" : "Description"}{aiSuggestion && <span className="ml-2 text-xs text-purple-500">✨ AI</span>}</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4}
            placeholder={isArabic ? "صف منتجك..." : "Describe your product..."}
            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none ${aiSuggestion ? "border-purple-300 bg-purple-50" : "border-gray-200"}`} />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الفئة" : "Category"}</label>
          <select value={form.category_id} onChange={e => { setForm(f => ({ ...f, category_id: e.target.value })); setSpecs({}); }}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white">
            <option value="">{isArabic ? "اختر فئة" : "Select a category"}</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{isArabic && cat.name_ar ? cat.name_ar : cat.name}</option>)}
          </select>
        </div>

        {/* Dynamic Category Specs */}
        {categorySpecsConfig && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 space-y-4">
            <p className="text-sm font-semibold text-primary-700">📋 {isArabic ? "مواصفات المنتج" : "Product Specifications"}</p>
            {categorySpecsConfig.map(spec => (
              <div key={spec.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? spec.label_ar : spec.label}</label>
                {spec.type === "select" && (
                  <select value={(specs[spec.key] as string) || ""}
                    onChange={e => handleSpecChange(spec.key, e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white text-sm">
                    <option value="">{isArabic ? "اختر..." : "Select..."}</option>
                    {spec.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
                {spec.type === "text" && (
                  <input type="text" value={(specs[spec.key] as string) || ""}
                    onChange={e => handleSpecChange(spec.key, e.target.value)}
                    placeholder={isArabic ? spec.label_ar : spec.label}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm" />
                )}
                {spec.type === "multiselect" && (
                  <div className="flex flex-wrap gap-2">
                    {spec.options?.map(o => {
                      const selected = ((specs[spec.key] as string[]) || []).includes(o);
                      return (
                        <button key={o} type="button" onClick={() => handleSpecMultiselect(spec.key, o)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition ${selected ? "bg-primary-500 text-gray-900 border-primary-500" : "bg-white text-gray-600 border-gray-200 hover:border-primary-300"}`}>
                          {o}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Price + Pricing Advisor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "السعر (درهم) *" : "Price (AED) *"}</label>
          <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="1" step="0.5"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300" />
          <PricingAdvisor
            price={form.price}
            productName={form.name}
            category={selectedCategory?.name || ""}
            categoryId={selectedCategory?.id || null}
            isArabic={isArabic}
          />
        </div>

        {/* Processing Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "وقت التجهيز" : "Processing time"}</label>
          <div className="flex gap-2">
            <input type="number" value={form.processing_days} onChange={e => setForm(f => ({ ...f, processing_days: e.target.value }))} min="1" max="999"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300" />
            <select value={form.time_unit} onChange={e => setForm(f => ({ ...f, time_unit: e.target.value }))}
              className="border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white text-sm">
              <option value="minutes">{isArabic ? "دقيقة" : "mins"}</option>
              <option value="hours">{isArabic ? "ساعة" : "hrs"}</option>
              <option value="days">{isArabic ? "يوم" : "days"}</option>
            </select>
          </div>
        </div>

        {/* Stock */}
        <div className="bg-info-tint border border-info-tint rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-info">{isArabic ? "تتبع المخزون" : "Track Stock"}</p>
              <p className="text-xs text-info mt-0.5">{isArabic ? "حدد كمية محدودة من المنتج" : "Set a limited quantity for this product"}</p>
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, track_stock: !f.track_stock }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.track_stock ? "bg-info" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.track_stock ? "translate-x-6" : ""}`} />
            </button>
          </div>
          {form.track_stock && (
            <input type="number" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))}
              min="1" required={form.track_stock} placeholder={isArabic ? "الكمية المتاحة" : "Available quantity"}
              className="w-full border border-info rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-info bg-white" />
          )}
        </div>

        {/* Discount */}
        <div className="bg-error-tint border border-error-tint rounded-xl p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-error">{isArabic ? "خصم على المنتج" : "Product Discount"}</p>
            <p className="text-xs text-error mt-0.5">{isArabic ? "اتركه صفراً اذا لا يوجد خصم" : "Leave 0 for no discount"}</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="number" value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))} min="0" max="90" step="1" placeholder="0" className="w-24 border border-error-tint rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-error bg-white text-center font-bold text-lg" />
            <span className="text-error font-bold text-lg">%</span>
            {form.discount_percent && parseFloat(form.discount_percent) > 0 && form.price && (
              <div className="flex items-center gap-2 text-sm">
                <span className="line-through text-gray-400">AED {parseFloat(form.price).toFixed(0)}</span>
                <span className="text-error font-bold">AED {(parseFloat(form.price) * (1 - parseFloat(form.discount_percent) / 100)).toFixed(0)}</span>
                <span className="bg-error text-white text-xs px-2 py-0.5 rounded-full">-{form.discount_percent}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Free Shipping */}
        <div className="bg-success-tint border border-success-tint rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-success">{isArabic ? "توصيل مجاني" : "Free Shipping"}</p>
              <p className="text-xs text-success mt-0.5">{isArabic ? "يفعل عند طلب بمبلغ محدد او اكثر" : "Activated when order reaches a set amount"}</p>
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, free_shipping_enabled: !f.free_shipping_enabled, free_shipping_min_amount: "" }))} className={`relative w-12 h-6 rounded-full transition-colors ${form.free_shipping_enabled ? "bg-success" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.free_shipping_enabled ? "translate-x-6" : ""}`} />
            </button>
          </div>
          {form.free_shipping_enabled && (
            <div className="flex items-center gap-3">
              <span className="text-success text-sm">{isArabic ? "مجاني عند طلب يبلغ" : "Free when order is"}</span>
              <input type="number" value={form.free_shipping_min_amount} onChange={e => setForm(f => ({ ...f, free_shipping_min_amount: e.target.value }))} min="1" placeholder="100" className="w-24 border border-success rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-success bg-white text-center font-bold" />
              <span className="text-success font-medium text-sm">AED</span>
            </div>
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
              className="text-xs bg-primary-500 text-gray-900 px-3 py-1.5 rounded-lg hover:bg-primary-600 transition">
              + {isArabic ? "إضافة خيار" : "Add Variant"}
            </button>
          </div>
          {variants.length > 0 && (
            <div className="space-y-2 mb-3">
              {variants.map((v, i) => (
                <div key={i} className="flex items-center justify-between bg-primary-50 rounded-lg px-3 py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{v.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{v.options.map(o => o.label).join(", ")}</span>
                  </div>
                  <button type="button" onClick={() => setVariants(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-gray-400 hover:text-error text-sm transition">✕</button>
                </div>
              ))}
            </div>
          )}
          {showVariantBuilder && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
              <p className="text-sm font-medium text-gray-700">{isArabic ? "بناء الخيار" : "Build Variant"}</p>
              <div>
                <p className="text-xs text-gray-500 mb-2">{isArabic ? "قوالب سريعة:" : "Quick presets:"}</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(VARIANT_PRESETS).map(([key, preset]) => (
                    <button key={key} type="button" onClick={() => applyPreset(key)}
                      className="text-xs bg-white border border-gray-200 hover:border-primary-300 px-3 py-1.5 rounded-lg transition">
                      {isArabic ? preset.name_ar : preset.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{isArabic ? "اسم الخيار (EN)" : "Variant name (EN)"}</label>
                  <input type="text" value={newVariant.name} onChange={e => setNewVariant(v => ({ ...v, name: e.target.value }))}
                    placeholder="e.g. Size" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{isArabic ? "اسم الخيار (AR)" : "Variant name (AR)"}</label>
                  <input type="text" value={newVariant.name_ar} onChange={e => setNewVariant(v => ({ ...v, name_ar: e.target.value }))}
                    placeholder="مثال: المقاس" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">{isArabic ? "الخيارات المتاحة:" : "Available options:"}</p>
                <div className="space-y-2">
                  {newVariant.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="text" value={opt.label} onChange={e => updateOption(i, "label", e.target.value)}
                        placeholder={isArabic ? "الخيار (مثال: M)" : "Option (e.g. M)"}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">+AED</span>
                        <input type="number" value={opt.price_adj} onChange={e => updateOption(i, "price_adj", e.target.value)}
                          placeholder="0" step="0.5" className="w-16 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                      </div>
                      {newVariant.options.length > 1 && (
                        <button type="button" onClick={() => removeVariantOption(i)} className="text-gray-400 hover:text-error transition">✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addVariantOption} className="text-xs text-primary-500 hover:underline mt-2">
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
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-gray-900 py-2 rounded-lg text-sm transition">
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
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-gray-900 py-3 rounded-xl font-medium transition disabled:opacity-60">
            {loading ? (isArabic ? "جارٍ الإضافة..." : "Adding...") : (isArabic ? "إضافة المنتج" : "Add Product")}
          </button>
        </div>
      </form>
    </>
    )}
    </div>
  );
}
