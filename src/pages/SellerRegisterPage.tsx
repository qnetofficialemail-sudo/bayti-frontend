import React, { useState, useEffect } from "react";
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
