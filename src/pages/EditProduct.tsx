import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function EditProduct() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", category_id: "", preparation_time: "60", is_available: true });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "seller") { navigate("/login"); return; }
    Promise.all([
      api.get(`/api/products/${id}`),
      api.get("/api/categories"),
    ]).then(([p, c]) => {
      const prod = p.data;
      setForm({
        name: prod.name || "",
        description: prod.description || "",
        price: String(prod.price || ""),
        category_id: String(prod.category?.id || ""),
        preparation_time: String(prod.preparation_time || "60"),
        is_available: prod.is_available,
      });
      setCurrentImage(prod.image_url || "");
      setCategories(c.data);
    }).finally(() => setLoading(false));
  }, [id, user]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("description", form.description);
      data.append("price", form.price);
      data.append("preparation_time", form.preparation_time);
      data.append("is_available", String(form.is_available));
      if (form.category_id) data.append("category_id", form.category_id);
      if (image) data.append("image", image);
      await api.put(`/api/products/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
      navigate("/seller/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update product");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  const imageUrl = preview || (currentImage ? (currentImage.startsWith("http") ? currentImage : `https://web-production-63685.up.railway.app${currentImage}`) : "");

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{isArabic ? "تعديل المنتج" : "Edit Product"}</h1>
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{isArabic ? "الصور" : "Photos"}</label>
          {/* Show existing images */}
          <div className="flex gap-2 flex-wrap mb-2">
            {[currentImage].filter(Boolean).map((img: string, i: number) => (
              <div key={i} className="relative">
                <img src={img.startsWith("http") ? img : `https://web-production-63685.up.railway.app${img}`}
                  alt="Current" className="w-16 h-16 object-cover rounded-xl border border-orange-300" />
                <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-orange-500 text-white rounded-b-xl py-0.5">Main</span>
              </div>
            ))}
          </div>
          <label className="block cursor-pointer">
            <div className="h-48 rounded-2xl border-2 border-dashed border-gray-200 hover:border-orange-300 flex items-center justify-center overflow-hidden transition">
              {imageUrl ? <img src={imageUrl} alt="Product" className="w-full h-full object-cover" /> :
                <div className="text-center text-gray-400"><div className="text-4xl mb-2">📷</div><p className="text-sm">{isArabic ? "اضغط لتغيير الصورة" : "Click to change photo"}</p></div>}
            </div>
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "اسم المنتج *" : "Product name *"}</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الوصف" : "Description"}</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "السعر (درهم) *" : "Price (AED) *"}</label>
            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="1" step="0.5"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "وقت التحضير (د)" : "Prep time (mins)"}</label>
            <input type="number" value={form.preparation_time} onChange={e => setForm(f => ({ ...f, preparation_time: e.target.value }))} min="5"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الفئة" : "Category"}</label>
          <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
            <option value="">{isArabic ? "اختر فئة" : "Select category"}</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {isArabic && cat.name_ar ? cat.name_ar : cat.name}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium text-gray-900 text-sm">{isArabic ? "متاح للطلب" : "Available for orders"}</p>
          </div>
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
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition disabled:opacity-60">
            {saving ? (isArabic ? "جاري الحفظ..." : "Saving...") : (isArabic ? "حفظ التغييرات" : "Save Changes")}
          </button>
        </div>
      </form>
    </div>
  );
}
