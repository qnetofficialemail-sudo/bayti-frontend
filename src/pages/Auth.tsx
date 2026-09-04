import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export function LoginPage() {
  const { login } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === "seller") navigate("/seller/dashboard");
      else if (loggedUser.role === "admin") navigate("/admin");
      else navigate("/marketplace");
    }
    catch (err: any) { setError(err.response?.data?.detail || (isArabic ? "البريد أو كلمة المرور غير صحيحة" : "Login failed")); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏠</div>
          <h1 className="text-2xl font-bold text-gray-900">{isArabic ? "أهلاً بعودتك" : "Welcome back"}</h1>
          <p className="text-gray-500 text-sm mt-1">{isArabic ? "تسجيل الدخول إلى HomeMarket UAE" : "Sign in to HomeMarket UAE"}</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "البريد الإلكتروني" : "Email"}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "كلمة المرور" : "Password"}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-60">
            {loading ? (isArabic ? "جاري الدخول..." : "Signing in...") : (isArabic ? "تسجيل الدخول" : "Sign In")}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">
          {isArabic ? "ليس لديك حساب؟" : "No account?"}{" "}
          <Link to="/register" className="text-orange-500 hover:underline">{isArabic ? "انضم إلينا" : "Join us"}</Link>
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500">
          <p className="font-medium mb-1">{isArabic ? "حسابات تجريبية:" : "Demo accounts:"}</p>
          <p>🍽️ {isArabic ? "بائع:" : "Seller:"} fatima@homemarket.ae / seller123</p>
          <p>⚙️ {isArabic ? "مدير:" : "Admin:"} admin@homemarket.ae / admin123</p>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", full_name: "", phone: "", password: "", role: "buyer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await register(form); navigate(form.role === "seller" ? "/seller/setup" : "/marketplace"); }
    catch (err: any) { setError(err.response?.data?.detail || (isArabic ? "فشل إنشاء الحساب" : "Registration failed")); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">✨</div>
          <h1 className="text-2xl font-bold text-gray-900">{isArabic ? "إنشاء حساب جديد" : "Create your account"}</h1>
          <p className="text-gray-500 text-sm mt-1">{isArabic ? "انضم إلى مجتمع الأعمال المنزلية في الإمارات" : "Join the UAE home business community"}</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { value: "buyer", label: isArabic ? "أريد الشراء" : "I want to buy", icon: "🛍️" },
            { value: "seller", label: isArabic ? "أريد البيع" : "I want to sell", icon: "🍳" }
          ].map(opt => (
            <button key={opt.value} type="button"
              onClick={() => setForm(f => ({ ...f, role: opt.value }))}
              className={`p-4 rounded-xl border-2 text-center transition ${form.role === opt.value ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
              <div className="text-2xl mb-1">{opt.icon}</div>
              <div className="text-sm font-medium text-gray-700">{opt.label}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "الاسم الكامل" : "Full name"}</label>
            <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "البريد الإلكتروني" : "Email"}</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "رقم الهاتف" : "Phone"}</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+971 50 000 0000"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isArabic ? "كلمة المرور" : "Password"}</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-60">
            {loading ? (isArabic ? "جاري الإنشاء..." : "Creating...") : (isArabic ? "إنشاء الحساب" : "Create Account")}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">
          {isArabic ? "لديك حساب بالفعل؟" : "Have an account?"}{" "}
          <Link to="/login" className="text-orange-500 hover:underline">{isArabic ? "تسجيل الدخول" : "Sign in"}</Link>
        </div>
      </div>
    </div>
  );
}
