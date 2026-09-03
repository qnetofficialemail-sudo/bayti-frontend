import os

files = {}

# Fix orders router to auto-translate new products
files['routers/products.py'] = '''from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from core.auth import get_current_user, get_current_seller
from models.user import Product, SellerProfile, Category
from schemas.schemas import ProductCreate, ProductOut
from services.translation import translate_product_to_arabic
import shutil, os, uuid

router = APIRouter(prefix="/api/products", tags=["products"])

UPLOAD_DIR = "uploads/products"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[ProductOut])
def list_products(
    category_id: Optional[int] = None,
    area: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product).join(SellerProfile).filter(
        Product.is_available == True,
        SellerProfile.is_approved == True
    )
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if area:
        query = query.filter(SellerProfile.area.ilike(f"%{area}%"))
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    return query.order_by(Product.created_at.desc()).all()

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=ProductOut)
def create_product(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    price: float = Form(...),
    category_id: Optional[int] = Form(None),
    preparation_time: int = Form(60),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_seller)
):
    seller = db.query(SellerProfile).filter(SellerProfile.user_id == current_user.id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller profile not found. Create one first.")

    image_url = None
    if image:
        ext = image.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(image.file, f)
        image_url = f"/uploads/products/{filename}"

    product = Product(
        seller_id=seller.id,
        name=name,
        description=description,
        price=price,
        category_id=category_id,
        preparation_time=preparation_time,
        image_url=image_url,
    )
    db.add(product)
    db.flush()

    # Auto-translate to Arabic
    try:
        category_name = None
        if category_id:
            cat = db.query(Category).filter(Category.id == category_id).first()
            if cat:
                category_name = cat.name
        result = translate_product_to_arabic(name, description or name, category_name)
        if result["success"]:
            product.name_ar = result["name_ar"]
            product.description_ar = result["description_ar"]
            print(f"Auto-translated: {name} -> {result['name_ar']}")
    except Exception as e:
        print(f"Auto-translation failed: {e}")

    db.commit()
    db.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    is_available: Optional[bool] = Form(None),
    preparation_time: Optional[int] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_seller)
):
    seller = db.query(SellerProfile).filter(SellerProfile.user_id == current_user.id).first()
    product = db.query(Product).filter(Product.id == product_id, Product.seller_id == seller.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if name:
        product.name = name
        # Re-translate if name changed
        try:
            result = translate_product_to_arabic(name, description or product.description or name)
            if result["success"]:
                product.name_ar = result["name_ar"]
                product.description_ar = result["description_ar"]
        except Exception as e:
            print(f"Re-translation failed: {e}")
    if description is not None: product.description = description
    if price is not None: product.price = price
    if is_available is not None: product.is_available = is_available
    if preparation_time is not None: product.preparation_time = preparation_time

    if image:
        ext = image.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(image.file, f)
        product.image_url = f"/uploads/products/{filename}"

    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_seller)):
    seller = db.query(SellerProfile).filter(SellerProfile.user_id == current_user.id).first()
    product = db.query(Product).filter(Product.id == product_id, Product.seller_id == seller.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}
'''

# Frontend - translated seller dashboard, orders, add product
files['src/pages/SellerDashboard.tsx'] = '''import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const STATUS_COLORS: Record<string, string> = { pending: "bg-yellow-50 text-yellow-700", confirmed: "bg-blue-50 text-blue-700", preparing: "bg-purple-50 text-purple-700", ready: "bg-green-50 text-green-700", delivering: "bg-orange-50 text-orange-700", delivered: "bg-gray-50 text-gray-600", cancelled: "bg-red-50 text-red-600" };
const NEXT_STATUS: Record<string, string> = { pending: "confirmed", confirmed: "preparing", preparing: "ready", ready: "delivering", delivering: "delivered" };
const STATUS_AR: Record<string, string> = { pending: "قيد الانتظار", confirmed: "مؤكد", preparing: "جاري التحضير", ready: "جاهز", delivering: "في الطريق", delivered: "تم التوصيل", cancelled: "ملغي" };
const NEXT_STATUS_AR: Record<string, string> = { pending: "تأكيد", confirmed: "بدء التحضير", preparing: "جاهز", ready: "في الطريق", delivering: "تم التوصيل" };

export default function SellerDashboard() {
  const { user } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"orders"|"products">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "seller") { navigate("/login"); return; }
    Promise.all([api.get("/api/orders/my"), api.get("/api/sellers/")]).then(([o, s]) => {
      setOrders(o.data);
      const myProfile = s.data.find((sel: any) => sel.user?.id === user.id);
      setProfile(myProfile);
      if (myProfile) { api.get("/api/products/").then(p => { setProducts(p.data.filter((prod: any) => prod.seller?.id === myProfile.id)); }); }
    }).finally(() => setLoading(false));
  }, [user]);

  const advanceOrder = async (orderId: number, nextStatus: string) => {
    await api.patch(`/api/orders/${orderId}/status`, null, { params: { status: nextStatus } });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
  };

  const toggleProduct = async (productId: number, currentlyAvailable: boolean) => {
    const form = new FormData();
    form.append("is_available", String(!currentlyAvailable));
    await api.put(`/api/products/${productId}`, form, { headers: { "Content-Type": "multipart/form-data" } });
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_available: !currentlyAvailable } : p));
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">{isArabic ? "جاري التحميل..." : "Loading..."}</div>;
  const pendingCount = orders.filter(o => o.status === "pending").length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {profile?.shop_name || (isArabic ? "متجري" : "My Shop")}
            {!profile?.is_approved && <span className="ml-3 text-sm bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-normal">{isArabic ? "قيد المراجعة" : "Pending approval"}</span>}
          </h1>
          <p className="text-gray-500 text-sm mt-1">📍 {profile?.area}, {profile?.city}</p>
        </div>
        <Link to="/seller/products/new" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
          {isArabic ? "+ إضافة منتج" : "+ Add Product"}
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: isArabic ? "إجمالي الطلبات" : "Total Orders", value: profile?.total_orders || 0, icon: "📦" },
          { label: isArabic ? "طلبات جديدة" : "New Orders", value: pendingCount, icon: "🔔", highlight: pendingCount > 0 },
          { label: isArabic ? "التقييم" : "Rating", value: `${profile?.rating || 0} ⭐`, icon: "⭐" },
        ].map(stat => (
          <div key={stat.label} className={`bg-white rounded-2xl p-5 border ${(stat as any).highlight ? "border-orange-300" : "border-gray-100"} shadow-sm`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {(["orders", "products"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition ${tab === t ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"}`}>
            {t === "orders"
              ? (isArabic ? `الطلبات${pendingCount > 0 ? ` (${pendingCount} جديد)` : ""}` : `Orders${pendingCount > 0 ? ` (${pendingCount} new)` : ""}`)
              : (isArabic ? "منتجاتي" : "My Products")
            }
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400"><div className="text-4xl mb-3">📭</div><p>{isArabic ? "لا توجد طلبات بعد." : "No orders yet."}</p></div>
          ) : orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-semibold text-gray-900">{isArabic ? "طلب" : "Order"} #{order.id}</span>
                  <span className={`ml-3 text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                    {isArabic ? STATUS_AR[order.status] : order.status}
                  </span>
                </div>
                <span className="font-bold text-gray-900">AED {(order.total_amount + order.delivery_fee).toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-500 mb-2">👤 {order.buyer?.full_name} · 📍 {order.delivery_area}</div>
              <div className="text-sm text-gray-600 mb-3">{order.items?.map((item: any) => `${item.quantity}x ${item.product?.name}`).join(", ")}</div>
              {NEXT_STATUS[order.status] && (
                <button onClick={() => advanceOrder(order.id, NEXT_STATUS[order.status])} className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition font-medium">
                  {isArabic ? `تحديد كـ ${NEXT_STATUS_AR[order.status]}` : `Mark as ${NEXT_STATUS[order.status]}`}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "products" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {products.length === 0 && (
            <div className="col-span-2 text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">🍳</div>
              <p>{isArabic ? "لا توجد منتجات بعد." : "No products yet."}</p>
              <Link to="/seller/products/new" className="text-orange-500 hover:underline text-sm mt-2 inline-block">{isArabic ? "أضف منتجك الأول" : "Add your first product"}</Link>
            </div>
          )}
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-3xl">
                {product.image_url ? <img src={`http://localhost:8000${product.image_url}`} alt={product.name} className="w-full h-full object-cover rounded-xl" /> : product.category?.icon || "🍽️"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{isArabic && product.name_ar ? product.name_ar : product.name}</p>
                <p className="text-orange-500 font-bold text-sm">AED {product.price}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${product.is_available ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {product.is_available ? (isArabic ? "متاح" : "Available") : (isArabic ? "مخفي" : "Hidden")}
                </span>
                <button onClick={() => toggleProduct(product.id, product.is_available)} className="text-xs text-gray-500 hover:text-orange-500 transition">
                  {product.is_available ? (isArabic ? "إخفاء" : "Hide") : (isArabic ? "إظهار" : "Show")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
'''

files['src/pages/Orders.tsx'] = '''import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const STATUS_COLORS: Record<string, string> = { pending: "bg-yellow-50 text-yellow-700 border-yellow-200", confirmed: "bg-blue-50 text-blue-700 border-blue-200", preparing: "bg-purple-50 text-purple-700 border-purple-200", ready: "bg-green-50 text-green-700 border-green-200", delivering: "bg-orange-50 text-orange-700 border-orange-200", delivered: "bg-gray-50 text-gray-600 border-gray-200", cancelled: "bg-red-50 text-red-600 border-red-200" };
const STATUS_AR: Record<string, string> = { pending: "قيد الانتظار", confirmed: "مؤكد", preparing: "جاري التحضير", ready: "جاهز", delivering: "في الطريق", delivered: "تم التوصيل", cancelled: "ملغي" };
const STATUS_STEPS = ["pending", "confirmed", "preparing", "ready", "delivering", "delivered"];
const STEP_LABELS_EN = ["Placed", "Confirmed", "Cooking", "Ready", "On way"];
const STEP_LABELS_AR = ["تم الطلب", "مؤكد", "جاري الطبخ", "جاهز", "في الطريق"];

export default function Orders() {
  const { user } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.get("/api/orders/my").then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">{isArabic ? "جاري التحميل..." : "Loading..."}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{isArabic ? "طلباتي" : "My Orders"}</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-lg mb-4">{isArabic ? "لا توجد طلبات بعد" : "No orders yet"}</p>
          <Link to="/" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition">{isArabic ? "تصفح المنتجات" : "Browse Products"}</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const stepIndex = STATUS_STEPS.indexOf(order.status);
            const stepLabels = isArabic ? STEP_LABELS_AR : STEP_LABELS_EN;
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">{isArabic ? "طلب" : "Order"} #{order.id}</span>
                    <span className="font-bold text-gray-900">AED {(order.total_amount + order.delivery_fee).toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {user?.role === "buyer" ? `🏠 ${order.seller?.shop_name}` : `👤 ${order.buyer?.full_name}`} · 📍 {order.delivery_area} · {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
                {order.status !== "cancelled" && (
                  <div className="px-5 py-4 bg-gray-50">
                    <div className="flex items-center gap-1">
                      {STATUS_STEPS.slice(0, -1).map((step, i) => (
                        <React.Fragment key={step}>
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= stepIndex ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-400"}`}>{i < stepIndex ? "✓" : i + 1}</div>
                          {i < STATUS_STEPS.length - 2 && <div className={`flex-1 h-1 rounded ${i < stepIndex ? "bg-orange-500" : "bg-gray-200"}`} />}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      {stepLabels.map((label, i) => (
                        <span key={label} className={`text-xs ${i <= stepIndex ? "text-orange-500 font-medium" : "text-gray-400"}`}>{label}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="px-5 py-4">
                  <div className="text-sm text-gray-600 mb-1">{order.items?.map((item: any) => `${item.quantity}x ${item.product?.name}`).join(", ")}</div>
                  <span className={`inline-block mt-2 text-xs border px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                    {isArabic ? STATUS_AR[order.status] : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
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
          {aiLoading ? <><span className="animate-spin">⟳</span> {isArabic ? "الذكاء الاصطناعي يحلل صورتك..." : "AI is analyzing your photo..."}</> : <>✨ {isArabic ? "توليد القائمة بالذكاء الاصطناعي" : "Generate listing with AI"}</>}
        </button>

        {aiSuggestion && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">✨ {isArabic ? "اقتراحات الذكاء الاصطناعي" : "AI Suggestions"}</p>
            {aiSuggestion.preparation_note && <p className="text-sm text-gray-600">📝 {aiSuggestion.preparation_note}</p>}
            {aiSuggestion.suggested_price_range && <p className="text-sm text-gray-600">💰 {isArabic ? "السعر المقترح:" : "Suggested price:"} <span className="font-semibold text-gray-900">{aiSuggestion.suggested_price_range}</span></p>}
            {aiSuggestion.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {aiSuggestion.tags.map((tag: string) => <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{tag}</span>)}
              </div>
            )}
            <p className="text-xs text-purple-500 mt-1">{isArabic ? "تم ملء الاسم والوصف تلقائياً. راجع وعدل أدناه." : "Description and name have been filled in automatically. Review and edit below."}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "اسم المنتج *" : "Product name *"}</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder={isArabic ? "مثال: مجبوس دجاج" : "e.g. Chicken Machboos"} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الوصف" : "Description"}{aiSuggestion && <span className="ml-2 text-xs text-purple-500">✨ {isArabic ? "من الذكاء الاصطناعي" : "AI generated"}</span>}</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder={isArabic ? "صف منتجك — المكونات، الطعم، حجم الحصة..." : "Describe your product..."} className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none transition ${aiSuggestion ? "border-purple-300 bg-purple-50" : "border-gray-200"}`} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "السعر (درهم) *" : "Price (AED) *"}</label>
            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="1" step="0.5" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            {aiSuggestion?.suggested_price_range && <p className="text-xs text-purple-500 mt-1">{isArabic ? "مقترح:" : "AI suggests:"} {aiSuggestion.suggested_price_range}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "وقت التحضير (دقيقة)" : "Prep time (mins)"}</label>
            <input type="number" value={form.preparation_time} onChange={e => setForm(f => ({ ...f, preparation_time: e.target.value }))} min="5" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الفئة" : "Category"}</label>
          <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
            <option value="">{isArabic ? "اختر فئة" : "Select a category"}</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate("/seller/dashboard")} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition">{isArabic ? "إلغاء" : "Cancel"}</button>
          <button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition disabled:opacity-60">{loading ? (isArabic ? "جاري الإضافة..." : "Adding...") : (isArabic ? "إضافة المنتج" : "Add Product")}</button>
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

print("\nAll fixes written!")
