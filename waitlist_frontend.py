import os

BACKEND = r'C:\Users\Dell\Desktop\homemarketplace\backend'
FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'

# ── 1. Add SellerApplication to main.py imports so create_all picks it up ──
main_path = os.path.join(BACKEND, 'main.py')
main = open(main_path, encoding='utf-8').read()

old_import = 'from models.user import User, SellerProfile, Category, Product, Order, OrderItem'
new_import = 'from models.user import User, SellerProfile, Category, Product, Order, OrderItem, SellerApplication'

if 'SellerApplication' not in main:
    if old_import in main:
        main = main.replace(old_import, new_import)
        open(main_path, 'w', encoding='utf-8').write(main)
        print("Done - SellerApplication added to main.py imports")
    else:
        print("FAIL - could not find import line in main.py")
else:
    print("Skip - SellerApplication already imported")

# ── 2. Patch Auth.tsx - remove seller option from register ──
auth_path = os.path.join(FRONTEND, 'src', 'pages', 'Auth.tsx')
auth = open(auth_path, encoding='utf-8').read()

old_roles = '''        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { value: "buyer", label: isArabic ? "\\u0623\\u0631\\u064a\\u062f \\u0627\\u0644\\u0634\\u0631\\u0627\\u0621" : "I want to buy", icon: "\\U0001f6d2" },
            { value: "seller", label: isArabic ? "\\u0623\\u0631\\u064a\\u062f \\u0627\\u0644\\u0628\\u064a\\u0639" : "I want to sell", icon: "\\U0001f373" }
          ].map(opt => (
            <button key={opt.value} type="button"
              onClick={() => setForm(f => ({ ...f, role: opt.value }))}
              className={`p-4 rounded-xl border-2 text-center transition ${form.role === opt.value ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
              <div className="text-2xl mb-1">{opt.icon}</div>
              <div className="text-sm font-medium text-gray-700">{opt.label}</div>
            </button>
          ))}
        </div>'''

new_roles = '''        <div className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-100 text-center">
          <p className="text-sm text-orange-700 font-medium">
            {isArabic ? "\\u0647\\u0630\\u0627 \\u0627\\u0644\\u062a\\u0633\\u062c\\u064a\\u0644 \\u0644\\u0644\\u0645\\u0634\\u062a\\u0631\\u064a\\u0646 \\u0641\\u0642\\u0637" : "This registration is for buyers only"}
          </p>
          <p className="text-xs text-orange-500 mt-1">
            {isArabic ? "\\u0644\\u0644\\u0628\\u064a\\u0639\\u060c " : "Want to sell? "}
            <a href="/seller-apply" className="underline font-medium">
              {isArabic ? "\\u0642\\u062f\\u0645 \\u0637\\u0644\\u0628\\u0643 \\u0647\\u0646\\u0627" : "Apply as a seller"}
            </a>
          </p>
        </div>'''

if 'seller-apply' not in auth:
    if old_roles in auth:
        auth = auth.replace(old_roles, new_roles)
        # Also remove the role from form state default
        auth = auth.replace(
            '{ email: "", full_name: "", phone: "", password: "", role: "buyer" }',
            '{ email: "", full_name: "", phone: "", password: "", role: "buyer" }'
        )
        # Remove the seller redirect
        auth = auth.replace(
            'navigate(form.role === "seller" ? "/seller/setup" : "/marketplace")',
            'navigate("/marketplace")'
        )
        open(auth_path, 'w', encoding='utf-8').write(auth)
        print("Done - seller option removed from RegisterPage")
    else:
        print("FAIL - could not find role selector in Auth.tsx")
        idx = auth.find('I want to sell')
        print(repr(auth[max(0,idx-200):idx+200]))
else:
    print("Skip - already patched")

# ── 3. Create SellerApplyPage.tsx ──
apply_page = r'''import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";

const AREAS = [
  "Abu Dhabi", "Al Ain", "Dubai", "Sharjah", "Ajman",
  "Umm Al Quwain", "Ras Al Khaimah", "Fujairah",
  "Jumeirah", "Deira", "Bur Dubai", "Mirdif", "Al Barsha",
  "Downtown Dubai", "Marina", "JLT", "Sports City", "Discovery Gardens",
];

export default function SellerApplyPage() {
  const { isArabic } = useLanguage();
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", area: "", city: "Dubai", what_they_sell: "",
  });
  const [docs, setDocs] = useState<(File | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleDoc = (i: number, file: File | null) => {
    const updated = [...docs];
    updated[i] = file;
    setDocs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      docs.forEach((doc, i) => { if (doc) fd.append(`doc_${i + 1}`, doc); });
      await api.post("/api/applications/apply", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitted(true);
    } catch (e: any) {
      setError(e.response?.data?.detail || (isArabic ? "فشل الإرسال، حاول مجددًا" : "Submission failed, please try again"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isArabic ? "تم استلام طلبك!" : "Application Received!"}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {isArabic
            ? "سنراجع طلبك ونتواصل معك قريبًا على بريدك الإلكتروني."
            : "We'll review your application and get back to you soon via email."}
        </p>
        <Link to="/" className="text-orange-500 hover:underline text-sm">
          {isArabic ? "← العودة للرئيسية" : "← Back to home"}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏠</div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isArabic ? "انضم كبائع في بيتي" : "Apply to Sell on Bayti"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isArabic
              ? "أرسل طلبك وسنتواصل معك للموافقة"
              : "Submit your application and we'll be in touch"}
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? "الاسم الكامل" : "Full Name"} *
            </label>
            <input type="text" required value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? "البريد الإلكتروني" : "Email"} *
            </label>
            <input type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? "رقم الهاتف" : "Phone Number"}
            </label>
            <input type="tel" value={form.phone} placeholder="+971 50 000 0000"
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? "المنطقة" : "Area"} *
            </label>
            <select required value={form.area}
              onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
              <option value="">{isArabic ? "اختر المنطقة" : "Select area"}</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? "ماذا ستبيع؟" : "What will you sell?"} *
            </label>
            <textarea required value={form.what_they_sell} rows={3}
              placeholder={isArabic ? "مثال: وجبات منزلية، حلويات، مخبوزات..." : "e.g. Home-cooked meals, desserts, baked goods..."}
              onChange={e => setForm(f => ({ ...f, what_they_sell: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
          </div>

          {/* Document uploads */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isArabic ? "المستندات (اختياري — حتى 3 ملفات)" : "Documents (optional — up to 3 files)"}
            </label>
            <p className="text-xs text-gray-400 mb-3">
              {isArabic
                ? "مثال: رخصة تجارية، شهادة سلامة غذائية، هوية"
                : "e.g. Trade license, food safety certificate, Emirates ID"}
            </p>
            <div className="space-y-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className={`border-2 border-dashed rounded-xl px-4 py-3 text-center transition ${docs[i] ? "border-orange-300 bg-orange-50" : "border-gray-200 hover:border-orange-300"}`}>
                      {docs[i] ? (
                        <span className="text-sm text-orange-600 font-medium">📄 {docs[i]!.name}</span>
                      ) : (
                        <span className="text-sm text-gray-400">
                          {isArabic ? `مستند ${i + 1} (اختياري)` : `Document ${i + 1} (optional)`}
                        </span>
                      )}
                    </div>
                    <input type="file" className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={e => handleDoc(i, e.target.files?.[0] || null)} />
                  </label>
                  {docs[i] && (
                    <button type="button" onClick={() => handleDoc(i, null)}
                      className="text-gray-400 hover:text-red-500 text-lg transition">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-60 mt-2">
            {loading
              ? (isArabic ? "جارٍ الإرسال..." : "Submitting...")
              : (isArabic ? "إرسال الطلب" : "Submit Application")}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          {isArabic ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
          <a href="/login" className="text-orange-500 hover:underline">
            {isArabic ? "تسجيل الدخول" : "Sign in"}
          </a>
        </div>
      </div>
    </div>
  );
}
'''

apply_path = os.path.join(FRONTEND, 'src', 'pages', 'SellerApplyPage.tsx')
open(apply_path, 'w', encoding='utf-8').write(apply_page)
print("Done - SellerApplyPage.tsx created")

# ── 4. Create SellerRegisterPage.tsx (token-gated registration) ──
register_page = r'''import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function SellerRegisterPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { register } = useAuth();
  const { isArabic } = useLanguage();
  const [tokenData, setTokenData] = useState<any>(null);
  const [tokenError, setTokenError] = useState("");
  const [form, setForm] = useState({ email: "", full_name: "", phone: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setTokenError("No invite token provided"); setLoading(false); return; }
    api.get(`/api/applications/validate-token/${token}`)
      .then(res => {
        setTokenData(res.data);
        setForm(f => ({ ...f, email: res.data.email, full_name: res.data.full_name, phone: res.data.phone || "" }));
      })
      .catch(() => setTokenError("This invite link is invalid or has already been used."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      await register({ ...form, role: "seller" });
      navigate("/seller/setup");
    } catch (e: any) {
      setError(e.response?.data?.detail || "Registration failed");
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Validating invite...</div>;

  if (tokenError) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-10 w-full max-w-md text-center">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{isArabic ? "رابط غير صالح" : "Invalid Invite Link"}</h1>
        <p className="text-gray-500 text-sm">{tokenError}</p>
        <a href="/seller-apply" className="mt-4 inline-block text-orange-500 hover:underline text-sm">
          {isArabic ? "تقديم طلب جديد" : "Submit a new application"}
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900">{isArabic ? "مرحبًا بك في بيتي!" : "Welcome to Bayti!"}</h1>
          <p className="text-gray-500 text-sm mt-1">{isArabic ? "طلبك موافق عليه — أنشئ حسابك الآن" : "Your application was approved — complete your account"}</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الاسم الكامل" : "Full Name"}</label>
            <input type="text" required value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "البريد الإلكتروني" : "Email"}</label>
            <input type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-gray-50" readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "رقم الهاتف" : "Phone"}</label>
            <input type="tel" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "كلمة المرور" : "Password"}</label>
            <input type="password" required minLength={6} value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-60">
            {submitting ? (isArabic ? "جارٍ الإنشاء..." : "Creating...") : (isArabic ? "إنشاء الحساب" : "Create Account")}
          </button>
        </form>
      </div>
    </div>
  );
}
'''

register_path = os.path.join(FRONTEND, 'src', 'pages', 'SellerRegisterPage.tsx')
open(register_path, 'w', encoding='utf-8').write(register_page)
print("Done - SellerRegisterPage.tsx created")

print("\nAll done - now add routes in App.tsx and Applications tab in AdminPanel")
