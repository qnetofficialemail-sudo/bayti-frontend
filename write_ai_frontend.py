import os

files = {}

files['src/pages/AddProduct.tsx'] = '''import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AddProduct() {
  const { user } = useAuth();
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
    if (!image && !form.name) {
      setError("Add a photo or product name first for AI to analyze.");
      return;
    }
    setAiLoading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("product_name", form.name || "Unknown dish");
      const selectedCat = categories.find(c => c.id === parseInt(form.category_id));
      data.append("category", selectedCat?.name || "Food");
      if (form.price) data.append("price", form.price);
      if (image) data.append("image", image);

      const response = await api.post("/api/ai/generate-description", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        const suggestion = response.data.data;
        setAiSuggestion(suggestion);
        setForm(f => ({
          ...f,
          description: suggestion.description || f.description,
          name: suggestion.suggested_name || f.name,
        }));
      } else {
        setError("AI generation failed. Try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "AI generation failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("description", form.description);
      data.append("price", form.price);
      data.append("preparation_time", form.preparation_time);
      if (form.category_id) data.append("category_id", form.category_id);
      if (image) data.append("image", image);
      await api.post("/api/products/", data, { headers: { "Content-Type": "multipart/form-data" } });
      navigate("/seller/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Add a new product</h1>
      <p className="text-gray-500 text-sm mb-8">Upload a photo and let AI write your listing ✨</p>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Photo upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
          <label className="block cursor-pointer">
            <div className={`h-56 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition ${preview ? "border-orange-300" : "border-gray-200 hover:border-orange-300"}`}>
              {preview
                ? <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                : <div className="text-center text-gray-400">
                    <div className="text-5xl mb-2">📷</div>
                    <p className="text-sm font-medium">Click to upload a photo</p>
                    <p className="text-xs mt-1">AI will analyze it and write your description</p>
                  </div>
              }
            </div>
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
        </div>

        {/* AI Generate button */}
        <button
          type="button"
          onClick={generateWithAI}
          disabled={aiLoading}
          className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
            aiLoading
              ? "bg-purple-100 text-purple-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-sm"
          }`}
        >
          {aiLoading ? (
            <>
              <span className="animate-spin">⟳</span>
              AI is analyzing your photo...
            </>
          ) : (
            <>
              ✨ Generate listing with AI
            </>
          )}
        </button>

        {/* AI suggestion box */}
        {aiSuggestion && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">✨ AI Suggestions</p>
            {aiSuggestion.preparation_note && (
              <p className="text-sm text-gray-600">📝 {aiSuggestion.preparation_note}</p>
            )}
            {aiSuggestion.suggested_price_range && (
              <p className="text-sm text-gray-600">💰 Suggested price: <span className="font-semibold text-gray-900">{aiSuggestion.suggested_price_range}</span></p>
            )}
            {aiSuggestion.tags && aiSuggestion.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {aiSuggestion.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            )}
            <p className="text-xs text-purple-500 mt-1">Description and name have been filled in automatically. Review and edit below.</p>
          </div>
        )}

        {/* Product name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product name *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
            placeholder="e.g. Chicken Machboos"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
            {aiSuggestion && <span className="ml-2 text-xs text-purple-500">✨ AI generated</span>}
          </label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={4}
            placeholder="Describe your product — ingredients, taste, serving size..."
            className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none transition ${
              aiSuggestion ? "border-purple-300 bg-purple-50" : "border-gray-200"
            }`}
          />
        </div>

        {/* Price and prep time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (AED) *</label>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              required
              min="1"
              step="0.5"
              placeholder={aiSuggestion?.suggested_price_range || ""}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            {aiSuggestion?.suggested_price_range && (
              <p className="text-xs text-purple-500 mt-1">AI suggests: {aiSuggestion.suggested_price_range}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prep time (mins)</label>
            <input
              type="number"
              value={form.preparation_time}
              onChange={e => setForm(f => ({ ...f, preparation_time: e.target.value }))}
              min="5"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={form.category_id}
            onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          >
            <option value="">Select a category</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/seller/dashboard")}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add Product"}
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

print("\nDone!")
