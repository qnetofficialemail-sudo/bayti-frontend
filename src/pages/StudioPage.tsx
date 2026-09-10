import { useState, useRef } from "react";

const BACKEND = "https://web-production-63685.up.railway.app";

const PRODUCT_TYPES = [
  { value: "apparel", label: "ملابس وعبايات", icon: "/icons/bayti/categories/clothing-abayas.png" },
  { value: "bag",     label: "حقائب",          icon: "/icons/bayti/categories/accessories.png" },
  { value: "jewelry", label: "مجوهرات",        icon: "/icons/bayti/categories/accessories.png" },
  { value: "glasses", label: "نظارات",         icon: "/icons/bayti/categories/beauty-skincare.png" },
  { value: "watch",   label: "ساعات",          icon: "/icons/bayti/categories/accessories.png" },
  { value: "belt",    label: "أحزمة",          icon: "/icons/bayti/categories/accessories.png" },
];

const MODEL_STYLES = [
  { value: "female_gulf_modern", label: "موديل خليجي عصري" },
  { value: "female_modern",      label: "موديل عصري" },
  { value: "neutral_studio",     label: "بدون موديل — استوديو" },
];

const BACKGROUNDS = [
  { value: "white_studio", label: "أبيض — استوديو" },
  { value: "warm_beige",   label: "بيج دافئ" },
  { value: "cafe",         label: "مقهى عصري" },
  { value: "street",       label: "شارع — في الهواء الطلق" },
  { value: "interior",     label: "ديكور منزلي أنيق" },
];

const FRAMINGS = [
  { value: "full_body",  label: "لقطة كاملة" },
  { value: "half_body",  label: "نصفية" },
  { value: "close_up",   label: "قريبة — للإكسسوارات" },
];

const FORMATS = [
  { value: "product_square",  label: "مربع — صفحة المنتج (1:1)" },
  { value: "story_vertical",  label: "ستوري — إنستقرام (9:16)" },
];

export default function StudioPage() {
  const [step, setStep] = useState<"upload" | "options" | "generating" | "result">("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productType, setProductType]   = useState("apparel");
  const [modelStyle, setModelStyle]     = useState("female_gulf_modern");
  const [background, setBackground]     = useState("white_studio");
  const [framing, setFraming]           = useState("full_body");
  const [outputFormat, setOutputFormat] = useState("product_square");
  const [resultUrl, setResultUrl]       = useState<string | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg]     = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem("token");

  function handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) { setError("الصورة أكبر من 10MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setStep("options");
    setError(null);
  }

  async function generate() {
    if (!imageFile || !token) return;
    setStep("generating");
    setError(null);

    const msgs = ["جارٍ تحليل الصورة...", "جارٍ إنشاء الصورة على الموديل...", "يُرجى الانتظار..."];
    let i = 0;
    setLoadingMsg(msgs[0]);
    const interval = setInterval(() => { i = (i + 1) % msgs.length; setLoadingMsg(msgs[i]); }, 4000);

    try {
      const form = new FormData();
      form.append("image", imageFile);
      form.append("product_type",  productType);
      form.append("model_style",   modelStyle);
      form.append("background",    background);
      form.append("framing",       framing);
      form.append("output_format", outputFormat);

      const res = await fetch(`${BACKEND}/api/studio/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "فشل التوليد");
      setResultUrl(data.image_url);
      setStep("result");
    } catch (e: any) {
      setError(e.message || "حدث خطأ غير متوقع");
      setStep("options");
    } finally {
      clearInterval(interval);
    }
  }

  function reset() {
    setStep("upload");
    setImageFile(null);
    setImagePreview(null);
    setResultUrl(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-orange-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">✨</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">استوديو بيتي الذكي</h1>
            <p className="text-sm text-gray-500">حوّل صورة منتجك إلى صورة تسويقية احترافية</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div
            className="bg-white rounded-2xl border-2 border-dashed border-orange-300 p-12 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          >
            <div className="text-5xl mb-4">📸</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">ارفع صورة منتجك</h2>
            <p className="text-gray-500 text-sm mb-4">JPG أو PNG أو WebP — حد أقصى 10MB</p>
            <button className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition">
              اختر صورة
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        )}

        {/* Step 2: Options */}
        {step === "options" && (
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-white rounded-2xl p-4 border border-orange-100 flex gap-4 items-center">
              <img src={imagePreview!} alt="preview" className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
              <div className="flex-1">
                <p className="font-semibold text-gray-800">صورة المنتج</p>
                <p className="text-sm text-gray-500">{imageFile?.name}</p>
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
                    <img src={p.icon} alt={p.label} className="w-8 h-8 object-contain" />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Style */}
            <div className="bg-white rounded-2xl p-5 border border-orange-100">
              <h3 className="font-bold text-gray-800 mb-3">نمط الموديل</h3>
              <div className="space-y-2">
                {MODEL_STYLES.map(m => (
                  <button key={m.value} onClick={() => setModelStyle(m.value)}
                    className={`w-full text-right px-4 py-3 rounded-xl border-2 transition text-sm font-medium
                      ${modelStyle === m.value ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600 hover:border-orange-200"}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background */}
            <div className="bg-white rounded-2xl p-5 border border-orange-100">
              <h3 className="font-bold text-gray-800 mb-3">الخلفية</h3>
              <div className="space-y-2">
                {BACKGROUNDS.map(b => (
                  <button key={b.value} onClick={() => setBackground(b.value)}
                    className={`w-full text-right px-4 py-3 rounded-xl border-2 transition text-sm font-medium
                      ${background === b.value ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600 hover:border-orange-200"}`}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Framing + Format in 2 cols */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-orange-100">
                <h3 className="font-bold text-gray-800 mb-3 text-sm">اللقطة</h3>
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
              <div className="bg-white rounded-2xl p-5 border border-orange-100">
                <h3 className="font-bold text-gray-800 mb-3 text-sm">الإخراج</h3>
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

            {/* Generate Button */}
            <button onClick={generate}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-amber-600 transition shadow-lg shadow-orange-200">
              ✨ إنشاء الصورة
            </button>

            <p className="text-center text-xs text-gray-400">
              الصورة الناتجة مولّدة بالذكاء الاصطناعي لأغراض العرض التسويقي فقط
            </p>
          </div>
        )}

        {/* Step 3: Generating */}
        {step === "generating" && (
          <div className="bg-white rounded-2xl p-12 text-center border border-orange-100">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="w-20 h-20 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">جارٍ الإنشاء</h2>
            <p className="text-gray-500 text-sm">{loadingMsg}</p>
            <p className="text-gray-400 text-xs mt-4">قد يستغرق حتى 30 ثانية</p>
          </div>
        )}

        {/* Step 4: Result */}
        {step === "result" && resultUrl && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-orange-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-800">النتيجة</h2>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                  ✨ مولّدة بالذكاء الاصطناعي
                </span>
              </div>
              <img src={resultUrl} alt="Studio result"
                className="w-full rounded-xl border border-gray-100" />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <a href={resultUrl} download="bayti_studio.png"
                className="flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition">
                ⬇️ تنزيل
              </a>
              <button onClick={() => { setStep("options"); setResultUrl(null); }}
                className="flex items-center justify-center gap-2 bg-white border-2 border-orange-300 text-orange-600 py-3 rounded-xl font-medium hover:bg-orange-50 transition">
                🔄 إعادة التوليد
              </button>
            </div>

            <button onClick={reset}
              className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-200 transition">
              منتج جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
