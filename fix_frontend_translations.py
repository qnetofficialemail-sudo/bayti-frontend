import os

files = {}

files['src/pages/Home.tsx'] = '''import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";

interface Product {
  id: number; name: string; name_ar?: string; description: string; description_ar?: string;
  price: number; image_url: string | null; preparation_time: number;
  seller: { id: number; shop_name: string; area: string; rating: number };
  category: { name: string; name_ar?: string; icon: string } | null;
}
interface Category { id: number; name: string; name_ar?: string; icon: string; }

export default function Home() {
  const { isArabic } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/api/categories").then(r => setCategories(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (selectedCategory) params.category_id = selectedCategory;
    if (search) params.search = search;
    api.get("/api/products/", { params }).then(r => setProducts(r.data)).finally(() => setLoading(false));
  }, [selectedCategory, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          {isArabic
            ? <><span>أكل بيتي،</span> <span className="text-orange-500">يوصلك على بابك</span></>
            : <>Homemade food, <span className="text-orange-500">delivered to your door</span></>
          }
        </h1>
        <p className="text-gray-500 text-lg">
          {isArabic ? "ادعم الطباخين المنزليين في الإمارات" : "Support local home cooks across the UAE"}
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder={isArabic ? "ابحث عن أكلات، حلويات، منتجات..." : "Search for dishes, sweets, crafts..."}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-5 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white shadow-sm"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${!selectedCategory ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"}`}
        >
          {isArabic ? "الكل" : "All"}
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === cat.id ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"}`}
          >
            {cat.icon} {isArabic && cat.name_ar ? cat.name_ar : cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
              <div className="h-48 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🍽️</div>
          <p className="text-lg">{isArabic ? "لا توجد منتجات" : "No products found"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const displayName = isArabic && product.name_ar ? product.name_ar : product.name;
            const displayDesc = isArabic && product.description_ar ? product.description_ar : product.description;
            const displayCat = isArabic && product.category?.name_ar ? product.category.name_ar : product.category?.name;
            return (
              <Link key={product.id} to={`/product/${product.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
                <div className="h-48 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden">
                  {product.image_url
                    ? <img src={`http://localhost:8000${product.image_url}`} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    : <span className="text-6xl">{product.category?.icon || "🍽️"}</span>
                  }
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 leading-tight">{displayName}</h3>
                    <span className="text-orange-500 font-bold text-sm whitespace-nowrap">AED {product.price}</span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">{displayDesc}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>🏠 {product.seller?.shop_name}</span>
                    <span>⏱ {product.preparation_time}{isArabic ? "د" : "min"}</span>
                  </div>
                  {product.seller?.area && (
                    <div className="mt-2">
                      <span className="inline-block bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded-full">📍 {product.seller.area}</span>
                    </div>
                  )}
                  {displayCat && (
                    <div className="mt-1">
                      <span className="inline-block bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded-full">{product.category?.icon} {displayCat}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
'''

files['src/pages/AddProduct.tsx'] = '''import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function AddProduct() {
  const { user } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", category_id: "", preparation_time: "60" });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

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
      data.append("product_name", form.name || "Unknown dish");
      const selectedCat = categories.find(c => c.id === parseInt(form.category_id));
      data.append("category", selectedCat?.name || "Food");
      data.append("language", isArabic ? "ar" : "en");
      if (form.price) data.append("price", form.price);
      if (image) data.append("image", image);
      const response = await api.post("/api/ai/generate-description", data, { headers: { "Content-Type": "multipart/form-data" } });
      if (response.data.success) {
        const suggestion = response.data.data;
        setAiSuggestion(suggestion);
        setForm(f => ({ ...f, description: suggestion.description || f.description, name: suggestion.suggested_name || f.name }));
      } else { setError(isArabic ? "فشل الذكاء الاصطناعي. حاول مرة أخرى." : "AI generation failed. Try again."); }
    } catch (err: any) { setError(err.response?.data?.detail || "AI generation failed."); }
    finally { setAiLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const data = new FormData();
      data.append("name", form.name); data.append("description", form.description);
      data.append("price", form.price); data.append("preparation_time", form.preparation_time);
      if (form.category_id) data.append("category_id", form.category_id);
      if (image) data.append("image", image);
      await api.post("/api/products/", data, { headers: { "Content-Type": "multipart/form-data" } });
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{isArabic ? "الصورة" : "Photo"}</label>
          <label className="block cursor-pointer">
            <div className={`h-56 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition ${preview ? "border-orange-300" : "border-gray-200 hover:border-orange-300"}`}>
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : (
                <div className="text-center text-gray-400">
                  <div className="text-5xl mb-2">📷</div>
                  <p className="text-sm font-medium">{isArabic ? "اضغط لرفع صورة" : "Click to upload a photo"}</p>
                  <p className="text-xs mt-1">{isArabic ? "سيحللها الذكاء الاصطناعي ويكتب وصفك" : "AI will analyze it and write your description"}</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
        </div>

        <button type="button" onClick={generateWithAI} disabled={aiLoading}
          className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${aiLoading ? "bg-purple-100 text-purple-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-sm"}`}>
          {aiLoading
            ? <><span className="animate-spin">⟳</span> {isArabic ? "الذكاء الاصطناعي يحلل صورتك..." : "AI is analyzing your photo..."}</>
            : <>✨ {isArabic ? "توليد القائمة بالذكاء الاصطناعي" : "Generate listing with AI"}</>
          }
        </button>

        {aiSuggestion && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">✨ {isArabic ? "اقتراحات الذكاء الاصطناعي" : "AI Suggestions"}</p>
            {aiSuggestion.preparation_note && <p className="text-sm text-gray-600">📝 {aiSuggestion.preparation_note}</p>}
            {aiSuggestion.suggested_price_range && (
              <p className="text-sm text-gray-600">💰 {isArabic ? "السعر المقترح:" : "Suggested price:"} <span className="font-semibold text-gray-900">{aiSuggestion.suggested_price_range}</span></p>
            )}
            {aiSuggestion.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {aiSuggestion.tags.map((tag: string) => <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{tag}</span>)}
              </div>
            )}
            <p className="text-xs text-purple-500 mt-1">{isArabic ? "تم ملء الاسم والوصف تلقائياً. راجع وعدل أدناه." : "Description and name filled automatically. Review and edit below."}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "اسم المنتج *" : "Product name *"}</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
            placeholder={isArabic ? "مثال: مجبوس دجاج" : "e.g. Chicken Machboos"}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isArabic ? "الوصف" : "Description"}
            {aiSuggestion && <span className="ml-2 text-xs text-purple-500">✨ {isArabic ? "من الذكاء الاصطناعي" : "AI generated"}</span>}
          </label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4}
            placeholder={isArabic ? "صف منتجك — المكونات، الطعم، حجم الحصة..." : "Describe your product..."}
            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none transition ${aiSuggestion ? "border-purple-300 bg-purple-50" : "border-gray-200"}`} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "السعر (درهم) *" : "Price (AED) *"}</label>
            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="1" step="0.5"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            {aiSuggestion?.suggested_price_range && <p className="text-xs text-purple-500 mt-1">{isArabic ? "مقترح:" : "AI suggests:"} {aiSuggestion.suggested_price_range}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "وقت التحضير (دقيقة)" : "Prep time (mins)"}</label>
            <input type="number" value={form.preparation_time} onChange={e => setForm(f => ({ ...f, preparation_time: e.target.value }))} min="5"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الفئة" : "Category"}</label>
          <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
            <option value="">{isArabic ? "اختر فئة" : "Select a category"}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {isArabic && cat.name_ar ? cat.name_ar : cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate("/seller/dashboard")}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition">
            {isArabic ? "إلغاء" : "Cancel"}
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition disabled:opacity-60">
            {loading ? (isArabic ? "جاري الإضافة..." : "Adding...") : (isArabic ? "إضافة المنتج" : "Add Product")}
          </button>
        </div>
      </form>
    </div>
  );
}
'''

for path, content in files.items():
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ {path}")

print("\nFrontend fixes written!")
