import { useState, useRef } from "react";

const BACKEND = "https://web-production-63685.up.railway.app";

const PRODUCT_TYPES = [
  { value: "apparel", label: "ملابس وعبايات", emoji: "👗" },
  { value: "bag",     label: "حقائب",          emoji: "👜" },
  { value: "jewelry", label: "مجوهرات",        emoji: "💍" },
  { value: "glasses", label: "نظارات",         emoji: "👓" },
  { value: "watch",   label: "ساعات",          emoji: "⌚" },
  { value: "belt",    label: "أحزمة",          emoji: "🎗️" },
];
const MODEL_STYLES = [
  { value: "female_gulf_modern", label: "موديل خليجي — بحجاب" },
  { value: "female_modern",      label: "موديل عصري" },
  { value: "neutral_studio",     label: "بدون موديل — استوديو" },
];
const BACKGROUNDS = [
  { value: "white_studio", label: "⬜ أبيض — استوديو" },
  { value: "warm_beige",   label: "🟫 بيج دافئ" },
  { value: "cafe",         label: "☕ مقهى عصري" },
  { value: "street",       label: "🌇 شارع — ذهبي" },
  { value: "interior",     label: "🏠 ديكور منزلي" },
];
const FRAMINGS = [
  { value: "full_body", label: "لقطة كاملة" },
  { value: "half_body", label: "نصفية" },
  { value: "close_up",  label: "قريبة" },
];
const FORMATS = [
  { value: "product_square",  label: "مربع 1:1" },
  { value: "story_vertical",  label: "ستوري 9:16" },
];
const MODEL_SIZES = [
  { value: "slim",    label: "نحيف" },
  { value: "regular", label: "متوسط" },
  { value: "curvy",   label: "ممتلئ" },
];
const LIGHTING = [
  { value: "soft_natural",  label: "☀️ طبيعي ناعم" },
  { value: "golden_hour",   label: "🌅 ذهبي — غروب" },
  { value: "studio_bright", label: "💡 استوديو ساطع" },
  { value: "moody_dark",    label: "🌙 درامي — داكن" },
];
const SEASON = [
  { value: "none",   label: "بدون تحديد" },
  { value: "summer", label: "☀️ صيف" },
  { value: "winter", label: "❄️ شتاء" },
  { value: "ramadan", label: "🌙 رمضان" },
  { value: "eid",    label: "🎉 عيد" },
];
const POSE = [
  { value: "standing_neutral", label: "وقوف — محايد" },
  { value: "walking",          label: "مشي — ديناميكي" },
  { value: "sitting_elegant",  label: "جلوس — أنيق" },
  { value: "looking_side",     label: "نظرة جانبية" },
];

interface Result {
  prompt: string;
  arabic_description: string;
  tips: string[];
  detected_color: string;
  detected_fabric: string;
  detected_details: string;
}

export default function StudioPage() {
  const [step, setStep]               = useState<"upload"|"options"|"analyzing"|"result">("upload");
  const [imageFile, setImageFile]     = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productType, setProductType] = useState("apparel");
  const [modelStyle, setModelStyle]   = useState("female_gulf_modern");
  const [background, setBackground]   = useState("white_studio");
  const [framing, setFraming]         = useState("full_body");
  const [outputFormat, setOutputFormat] = useState("product_square");
  const [modelSize, setModelSize]     = useState("regular");
  const [lighting, setLighting]       = useState("soft_natural");
  const [season, setSeason]           = useState("none");
  const [pose, setPose]               = useState("standing_neutral");
  const [extraNotes, setExtraNotes]   = useState("");
  const [result, setResult]           = useState<Result | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [copied, setCopied]           = useState(false);
  const [autoCopied, setAutoCopied]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem("token");

  function handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) { setError("الصورة أكبر من 10MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setStep("options");
    setError(null);
  }

  async function analyze() {
    if (!imageFile || !token) return;
    setStep("analyzing");
    setError(null);
    try {
      const form = new FormData();
      form.append("image", imageFile);
      form.append("product_type",  productType);
      form.append("model_style",   modelStyle);
      form.append("background",    background);
      form.append("framing",       framing);
      form.append("output_format", outputFormat);
      form.append("model_size",    modelSize);
      form.append("lighting",      lighting);
      form.append("season",        season);
      form.append("pose",          pose);
      if (extraNotes) form.append("extra_notes", extraNotes);

      const res = await fetch(`${BACKEND}/api/studio/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "فشل التحليل");
      setResult(data);
      setStep("result");
    } catch (e: any) {
      setError(e.message);
      setStep("options");
    }
  }

  function copyPrompt() {
    if (!result) return;
    navigator.clipboard.writeText(result.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openGemini() {
    if (!result) return;
    // Try deep link first (works on desktop + some mobile)
    const encodedPrompt = encodeURIComponent(result.prompt);
    const geminiUrl = `https://gemini.google.com/app?q=${encodedPrompt}`;
    // Also copy to clipboard as fallback
    navigator.clipboard.writeText(result.prompt).catch(() => {});
    setAutoCopied(true);
    window.open(geminiUrl, "_blank");
  }

  function reset() {
    setStep("upload"); setImageFile(null); setImagePreview(null);
    setResult(null); setError(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-orange-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-orange-500 rounded-xl flex items-center justify-center text-white text-lg">✨</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">استوديو بيتي الذكي</h1>
            <p className="text-sm text-gray-500">Claude يحلل منتجك ويولّد prompt احترافي لـ Gemini مجاناً</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">⚠️ {error}</div>}

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              className="bg-white rounded-2xl border-2 border-dashed border-orange-300 p-12 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all"
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            >
              <div className="text-5xl mb-4">📸</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">ارفع صورة منتجك</h2>
              <p className="text-gray-500 text-sm mb-4">JPG أو PNG أو WebP — حد أقصى 10MB</p>
              <button className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition">اختر صورة</button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>

            {/* How it works */}
            <div className="bg-white rounded-2xl p-5 border border-orange-100">
              <h3 className="font-bold text-gray-800 mb-3">كيف يعمل؟</h3>
              <div className="space-y-3">
                {[
                  { n: "١", text: "ارفع صورة منتجك واختر الخيارات" },
                  { n: "٢", text: "Claude يحلل المنتج ويولّد prompt مخصص" },
                  { n: "٣", text: "انسخ الـ prompt وافتح Gemini مجاناً" },
                  { n: "٤", text: "الصق الـ prompt وارفع صورة المنتج → صورة احترافية!" },
                ].map(s => (
                  <div key={s.n} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center flex-shrink-0">{s.n}</span>
                    <p className="text-sm text-gray-600 pt-0.5">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Options */}
        {step === "options" && (
          <div className="space-y-4">
            {/* Preview */}
            <div className="bg-white rounded-2xl p-4 border border-orange-100 flex gap-4 items-center">
              <img src={imagePreview!} alt="preview" className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
              <div className="flex-1">
                <p className="font-semibold text-gray-800">صورة المنتج</p>
                <p className="text-sm text-gray-400">{imageFile?.name}</p>
              </div>
              <button onClick={reset} className="text-sm text-gray-400 hover:text-red-500">تغيير</button>
            </div>

            {/* Product Type */}
            <div className="bg-white rounded-2xl p-5 border border-orange-100">
              <h3 className="font-bold text-gray-800 mb-3">نوع المنتج</h3>
              <div className="grid grid-cols-3 gap-2">
                {PRODUCT_TYPES.map(p => (
                  <button key={p.value} onClick={() => setProductType(p.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition text-sm font-medium
                      ${productType === p.value ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600 hover:border-orange-200"}`}>
                    <span className="text-2xl">{p.emoji}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Model + Background */}
            <div className="bg-white rounded-2xl p-5 border border-orange-100">
              <h3 className="font-bold text-gray-800 mb-3">نمط الموديل</h3>
              <div className="space-y-2">
                {MODEL_STYLES.map(m => (
                  <button key={m.value} onClick={() => setModelStyle(m.value)}
                    className={`w-full text-right px-4 py-2.5 rounded-xl border-2 transition text-sm font-medium
                      ${modelStyle === m.value ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600 hover:border-orange-200"}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-orange-100">
              <h3 className="font-bold text-gray-800 mb-3">الخلفية</h3>
              <div className="space-y-2">
                {BACKGROUNDS.map(b => (
                  <button key={b.value} onClick={() => setBackground(b.value)}
                    className={`w-full text-right px-4 py-2.5 rounded-xl border-2 transition text-sm font-medium
                      ${background === b.value ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600 hover:border-orange-200"}`}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-orange-100">
                <h3 className="font-bold text-gray-800 mb-2 text-sm">اللقطة</h3>
                <div className="space-y-2">
                  {FRAMINGS.map(f => (
                    <button key={f.value} onClick={() => setFraming(f.value)}
                      className={`w-full text-right px-3 py-2 rounded-xl border-2 transition text-xs font-medium
                        ${framing === f.value ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600 hover:border-orange-200"}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-orange-100">
                <h3 className="font-bold text-gray-800 mb-2 text-sm">الإخراج</h3>
                <div className="space-y-2">
                  {FORMATS.map(f => (
                    <button key={f.value} onClick={() => setOutputFormat(f.value)}
                      className={`w-full text-right px-3 py-2 rounded-xl border-2 transition text-xs font-medium
                        ${outputFormat === f.value ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600 hover:border-orange-200"}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Model Size + Pose */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-orange-100">
                <h3 className="font-bold text-gray-800 mb-2 text-sm">مقاس الموديل</h3>
                <div className="space-y-2">
                  {MODEL_SIZES.map(s => (
                    <button key={s.value} onClick={() => setModelSize(s.value)}
                      className={`w-full text-right px-3 py-2 rounded-xl border-2 transition text-xs font-medium
                        ${modelSize === s.value ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600 hover:border-orange-200"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-orange-100">
                <h3 className="font-bold text-gray-800 mb-2 text-sm">الوضعية</h3>
                <div className="space-y-2">
                  {POSE.map(p => (
                    <button key={p.value} onClick={() => setPose(p.value)}
                      className={`w-full text-right px-3 py-2 rounded-xl border-2 transition text-xs font-medium
                        ${pose === p.value ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600 hover:border-orange-200"}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lighting */}
            <div className="bg-white rounded-2xl p-5 border border-orange-100">
              <h3 className="font-bold text-gray-800 mb-3">الإضاءة</h3>
              <div className="grid grid-cols-2 gap-2">
                {LIGHTING.map(l => (
                  <button key={l.value} onClick={() => setLighting(l.value)}
                    className={`text-right px-4 py-2.5 rounded-xl border-2 transition text-sm font-medium
                      ${lighting === l.value ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600 hover:border-orange-200"}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Season / Occasion */}
            <div className="bg-white rounded-2xl p-5 border border-orange-100">
              <h3 className="font-bold text-gray-800 mb-3">المناسبة <span className="text-gray-400 font-normal text-sm">(اختياري)</span></h3>
              <div className="grid grid-cols-3 gap-2">
                {SEASON.map(s => (
                  <button key={s.value} onClick={() => setSeason(s.value)}
                    className={`text-center px-3 py-2.5 rounded-xl border-2 transition text-sm font-medium
                      ${season === s.value ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600 hover:border-orange-200"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Notes */}
            <div className="bg-white rounded-2xl p-5 border border-orange-100">
              <h3 className="font-bold text-gray-800 mb-1">ملاحظات إضافية <span className="text-gray-400 font-normal text-sm">(اختياري)</span></h3>
              <p className="text-xs text-gray-400 mb-3">أي تفاصيل تريد إضافتها — مثال: "مع إكسسوار ذهبي"، "أريد الكم يظهر بوضوح"</p>
              <textarea
                value={extraNotes}
                onChange={e => setExtraNotes(e.target.value)}
                placeholder="اكتب ملاحظاتك هنا..."
                rows={2}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none transition resize-none"
                dir="rtl"
              />
            </div>

            <button onClick={analyze}
              className="w-full bg-gradient-to-r from-purple-500 to-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition shadow-lg">
              ✨ حلّل المنتج وولّد الـ Prompt
            </button>
          </div>
        )}

        {/* Step 3: Analyzing */}
        {step === "analyzing" && (
          <div className="bg-white rounded-2xl p-12 text-center border border-orange-100">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="w-20 h-20 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-2xl">🔍</div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Claude يحلل منتجك...</h2>
            <p className="text-gray-500 text-sm">يستخرج اللون والتصميم والتفاصيل</p>
            <p className="text-gray-400 text-xs mt-4">~10 ثوانٍ</p>
          </div>
        )}

        {/* Step 4: Result */}
        {step === "result" && result && (
          <div className="space-y-4">
            {/* What Claude detected */}
            <div className="bg-white rounded-2xl p-5 border border-purple-100">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-purple-500">🔍</span> ما اكتشفه Claude
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-1">اللون</p>
                  <p className="font-semibold text-gray-800">{result.detected_color || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-1">القماش</p>
                  <p className="font-semibold text-gray-800">{result.detected_fabric || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-1">التصميم</p>
                  <p className="font-semibold text-gray-800 text-xs">{result.detected_details || "—"}</p>
                </div>
              </div>
              {result.arabic_description && (
                <p className="text-sm text-gray-600 mt-3 bg-orange-50 rounded-xl p-3">{result.arabic_description}</p>
              )}
            </div>

            {/* The Prompt — hidden by default, show on demand */}
            <details className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
              <summary className="px-5 py-4 cursor-pointer font-bold text-gray-700 flex items-center gap-2 hover:bg-orange-50 transition list-none">
                <span>📋</span> عرض الـ Prompt
                <span className="mr-auto text-xs text-gray-400 font-normal">اضغط للعرض</span>
              </summary>
              <div className="px-5 pb-5">
                <div className="flex justify-end mb-2">
                  <button onClick={copyPrompt}
                    className={`text-sm px-4 py-1.5 rounded-lg font-medium transition ${copied ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600 hover:bg-orange-200"}`}>
                    {copied ? "✅ تم النسخ!" : "نسخ"}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed font-mono text-left" dir="ltr">
                  {result.prompt}
                </div>
              </div>
            </details>

            {/* Tips */}
            {result.tips?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-orange-100">
                <h3 className="font-bold text-gray-800 mb-3">💡 نصائح للحصول على أفضل نتيجة</h3>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-orange-400 mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Open Gemini — auto copy */}
            <button onClick={openGemini}
              className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition shadow-lg">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              {autoCopied ? "✅ Gemini مفتوح — ارفع صورتك!" : "افتح Gemini مع الـ Prompt جاهزاً ✨"}
            </button>

            {autoCopied && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm text-center">
                ✅ فُتح Gemini مع الـ Prompt جاهزاً!<br/>
                <span className="font-bold">ارفع صورة المنتج واضغط إرسال فقط 🎉</span>
              </div>
            )}

            {!autoCopied && (
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 border border-blue-100">
                <p className="font-bold mb-1">📌 بضغطة واحدة فقط:</p>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>يفتح Gemini مع الـ prompt مكتوباً تلقائياً</li>
                  <li>ارفع صورة منتجك</li>
                  <li>اضغط إرسال ← صورة احترافية! 🎉</li>
                </ol>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setStep("options"); setResult(null); }}
                className="bg-white border-2 border-orange-300 text-orange-600 py-3 rounded-xl font-medium hover:bg-orange-50 transition text-sm">
                🔄 تغيير الخيارات
              </button>
              <button onClick={reset}
                className="bg-gray-100 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-200 transition text-sm">
                منتج جديد
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
