import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const UAE_AREAS = ["Downtown Dubai","Dubai Marina","JBR","Jumeirah","Deira","Bur Dubai","Business Bay","JLT","Al Barsha","Mirdif","Sharjah","Abu Dhabi","Ajman","Ras Al Khaimah"];

export default function EditShop() {
  const { user } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ shop_name: "", description: "", area: "", city: "Dubai", whatsapp_number: "", instagram_handle: "", min_order_amount: "" });
  const [existingImages, setExistingImages] = useState<(string|null)[]>([null, null, null]);
  const [newImages, setNewImages] = useState<(File|null)[]>([null, null, null]);
  const [newPreviews, setNewPreviews] = useState<(string|null)[]>([null, null, null]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "seller") { navigate("/login"); return; }
    api.get("/api/sellers/").then(r => {
      const myShop = r.data.find((s: any) => s.user?.id === user.id);
      if (myShop) {
        setExistingImages([myShop.sample_image_1 || null, myShop.sample_image_2 || null, myShop.sample_image_3 || null]);
        setForm({
          shop_name: myShop.shop_name || "",
          description: myShop.description || "",
          area: myShop.area || "",
          city: myShop.city || "Dubai",
          whatsapp_number: myShop.whatsapp_number || "",
          instagram_handle: myShop.instagram_handle || "",
          min_order_amount: myShop.min_order_amount ? String(myShop.min_order_amount) : "",
        });
      }
    }).finally(() => setLoading(false));
  }, [user]);

  const handleNewImage = (i: number, file: File | null) => {
    const imgs = [...newImages]; const prevs = [...newPreviews];
    imgs[i] = file; prevs[i] = file ? URL.createObjectURL(file) : null;
    setNewImages(imgs); setNewPreviews(prevs);
  };

  const imgUrl = (img: string) => img.startsWith("http") ? img : `https://web-production-63685.up.railway.app${img}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(""); setSuccess(false);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== "") data.append(k, v); });
      newImages.forEach((img, i) => { if (img) data.append(`sample_image_${i+1}`, img); });
      await api.patch("/api/sellers/profile/edit", data, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess(true);
      setTimeout(() => navigate("/seller/dashboard"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Update failed");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isArabic ? "تعديل معلومات المتجر" : "Edit Shop Profile"}</h1>
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">✅ {isArabic ? "تم الحفظ!" : "Saved!"}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Shop images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{isArabic ? "صور المتجر (حتى 3)" : "Shop Photos (up to 3)"}</label>
          <p className="text-xs text-gray-400 mb-3">{isArabic ? "تظهر في صفحة متجرك للعملاء" : "Shown on your public shop page"}</p>
          <div className="grid grid-cols-3 gap-3">
            {[0,1,2].map(i => (
              <div key={i} className="space-y-1">
                <div className="aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
                  {newPreviews[i]
                    ? <img src={newPreviews[i]!} alt="" className="w-full h-full object-cover" />
                    : existingImages[i]
                    ? <img src={imgUrl(existingImages[i]!)} alt="" className="w-full h-full object-cover" />
                    : <div className="text-center text-gray-300"><div className="text-3xl">📷</div><div className="text-xs mt-1">{i+1}</div></div>
                  }
                </div>
                <label className="block cursor-pointer">
                  <div className="text-center text-xs text-orange-500 hover:text-orange-600 py-1 border border-orange-200 rounded-lg hover:bg-orange-50 transition">
                    {isArabic ? "تغيير" : "Upload"}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleNewImage(i, e.target.files?.[0] || null)} />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "اسم المتجر *" : "Shop name *"}</label>
          <input type="text" value={form.shop_name} onChange={e => setForm(f => ({ ...f, shop_name: e.target.value }))} required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "وصف المتجر" : "Shop description"}</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "المنطقة *" : "Area *"}</label>
          <select value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
            <option value="">{isArabic ? "اختر منطقتك" : "Select your area"}</option>
            {UAE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "واتساب" : "WhatsApp"}</label>
            <input type="tel" value={form.whatsapp_number} onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))}
              placeholder="+971 50 000 0000"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "إنستغرام" : "Instagram"}</label>
            <input type="text" value={form.instagram_handle} onChange={e => setForm(f => ({ ...f, instagram_handle: e.target.value }))}
              placeholder="@handle"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الحد الأدنى للطلب (درهم)" : "Minimum order (AED)"}</label>
          <input type="number" value={form.min_order_amount} onChange={e => setForm(f => ({ ...f, min_order_amount: e.target.value }))}
            placeholder="e.g. 50" min="0"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate("/seller/dashboard")}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition">
            {isArabic ? "إلغاء" : "Cancel"}
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition disabled:opacity-60">
            {saving ? (isArabic ? "جاري الحفظ..." : "Saving...") : (isArabic ? "حفظ" : "Save Changes")}
          </button>
        </div>
      </form>
    </div>
  );
}
