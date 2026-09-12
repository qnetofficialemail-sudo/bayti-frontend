import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const BACKEND = "https://web-production-63685.up.railway.app";

export default function ForgotPasswordPage() {
  const { isArabic } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) { setError(isArabic ? "أدخل بريدك الإلكتروني" : "Enter your email"); return; }
    setLoading(true); setError("");
    try {
      await fetch(`${BACKEND}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setError(isArabic ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong, try again");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4" dir={isArabic ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-orange-100">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔑</div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isArabic ? "نسيت كلمة المرور؟" : "Forgot Password?"}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {isArabic ? "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين" : "Enter your email and we will send you a reset link"}
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {isArabic ? "تم إرسال الرابط!" : "Link Sent!"}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {isArabic ? "إذا كان البريد مسجلاً، ستصلك رسالة خلال دقائق. تحقق من مجلد الـ Spam أيضاً." : "If this email is registered, you will receive a message shortly. Check your Spam folder too."}
            </p>
            <Link to="/login" className="text-orange-500 hover:underline text-sm font-medium">
              {isArabic ? "العودة لتسجيل الدخول" : "Back to Login"}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isArabic ? "البريد الإلكتروني" : "Email"}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder={isArabic ? "example@email.com" : "example@email.com"}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                autoFocus
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? (isArabic ? "جارٍ الإرسال..." : "Sending...") : (isArabic ? "إرسال رابط إعادة التعيين" : "Send Reset Link")}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-gray-400 hover:text-gray-600 text-sm">
                {isArabic ? "العودة لتسجيل الدخول" : "Back to Login"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
