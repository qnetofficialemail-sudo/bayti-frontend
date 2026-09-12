import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const BACKEND = "https://web-production-63685.up.railway.app";

export default function ResetPasswordPage() {
  const { isArabic } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setValidating(false); return; }
    fetch(`${BACKEND}/api/auth/verify-reset-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(r => {
      setTokenValid(r.ok);
      setValidating(false);
    }).catch(() => { setTokenValid(false); setValidating(false); });
  }, [token]);

  const handleReset = async () => {
    if (password.length < 6) {
      setError(isArabic ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError(isArabic ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BACKEND}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        const data = await res.json();
        setError(data.detail || (isArabic ? "حدث خطأ" : "Something went wrong"));
      }
    } catch {
      setError(isArabic ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4" dir={isArabic ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-orange-100">

        {validating && (
          <div className="text-center py-8">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-500">{isArabic ? "جارٍ التحقق..." : "Verifying..."}</p>
          </div>
        )}

        {!validating && !tokenValid && (
          <div className="text-center">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {isArabic ? "الرابط غير صالح أو منتهي الصلاحية" : "Invalid or Expired Link"}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {isArabic ? "الرابط صالح لمدة 30 دقيقة فقط. اطلب رابطاً جديداً." : "Links are valid for 30 minutes only. Request a new one."}
            </p>
            <Link to="/forgot-password" className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition">
              {isArabic ? "طلب رابط جديد" : "Request New Link"}
            </Link>
          </div>
        )}

        {!validating && tokenValid && !success && (
          <div>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔐</div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isArabic ? "إعادة تعيين كلمة المرور" : "Reset Password"}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {isArabic ? "أدخل كلمة مرور جديدة" : "Enter your new password"}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? "كلمة المرور الجديدة" : "New Password"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? "تأكيد كلمة المرور" : "Confirm Password"}
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleReset()}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
              >
                {loading ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : (isArabic ? "حفظ كلمة المرور" : "Save Password")}
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {isArabic ? "تم تغيير كلمة المرور!" : "Password Changed!"}
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              {isArabic ? "سيتم توجيهك لصفحة الدخول..." : "Redirecting to login..."}
            </p>
            <Link to="/login" className="text-orange-500 hover:underline text-sm font-medium">
              {isArabic ? "تسجيل الدخول الآن" : "Login Now"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
