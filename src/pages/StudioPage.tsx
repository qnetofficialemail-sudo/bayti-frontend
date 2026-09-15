import { useState, useRef } from "react";

const BACKEND = "https://web-production-63685.up.railway.app";

// ── فئات المنتجات ──────────────────────────────────────────────────────────────
const PRODUCT_GROUPS = [
  {
    group: "fashion", label: "👗 ملابس وإكسسوارات",
    types: [
      { value: "apparel",  label: "ملابس وعبايات", emoji: "👗" },
      { value: "bag",      label: "حقائب",          emoji: "👜" },
      { value: "jewelry",  label: "مجوهرات",        emoji: "💍" },
      { value: "glasses",  label: "نظارات",         emoji: "👓" },
      { value: "watch",    label: "ساعات",          emoji: "⌚" },
      { value: "shoes",    label: "أحذية",          emoji: "👠" },
    ]
  },
  {
    group: "home", label: "🕯️ منزل وديكور",
    types: [
      { value: "candle",   label: "شموع وعطور",    emoji: "🕯️" },
      { value: "decor",    label: "ديكور منزلي",   emoji: "🏺" },
      { value: "plants",   label: "نباتات وأصص",   emoji: "🪴" },
    ]
  },
  {
    group: "food", label: "🍰 طعام وحلويات",
    types: [
      { value: "food",     label: "طعام وأكلات",   emoji: "🍽️" },
      { value: "sweets",   label: "حلويات وكيك",   emoji: "🍰" },
      { value: "drinks",   label: "مشروبات",        emoji: "🧃" },
    ]
  },
  {
    group: "beauty", label: "✨ جمال وعناية",
    types: [
      { value: "skincare", label: "عناية بالبشرة", emoji: "🧴" },
      { value: "makeup",   label: "مكياج",         emoji: "💄" },
      { value: "haircare", label: "عناية بالشعر",  emoji: "💆" },
    ]
  },
  {
    group: "craft", label: "🎨 أعمال يدوية",
    types: [
      { value: "handcraft",label: "أعمال يدوية وفن", emoji: "🎨" },
    ]
  },
];

// ── خيارات مشتركة ──────────────────────────────────────────────────────────────
const LIGHTING = [
  { value: "soft_natural",   label: "☀️ طبيعي ناعم" },
  { value: "golden_hour",    label: "🌅 ذهبي — غروب" },
  { value: "studio_bright",  label: "💡 استوديو ساطع" },
  { value: "moody_dramatic", label: "🌙 درامي — داكن" },
  { value: "ring_light",     label: "💫 رينج لايت" },
  { value: "backlit_rim",    label: "✨ خلفي — هالة" },
  { value: "candlelight",    label: "🕯️ ضوء شموع" },
];
const SEASON = [
  { value: "none",     label: "🗓️ بدون تحديد" },
  { value: "summer",   label: "☀️ صيف" },
  { value: "winter",   label: "❄️ شتاء" },
  { value: "ramadan",  label: "🌙 رمضان" },
  { value: "eid",      label: "🎉 عيد" },
  { value: "national", label: "🇦🇪 اليوم الوطني" },
];
const OUTPUT_FORMATS = [
  { value: "product_square", label: "◻️ مربع 1:1" },
  { value: "story_vertical", label: "📱 ستوري 9:16" },
  { value: "landscape_wide", label: "🖼️ عريض 16:9" },
];

// ── خيارات الملابس ──────────────────────────────────────────────────────────────
const FASHION_MODELS = [
  { value: "female_gulf_modern", label: "👩 موديل خليجي — بحجاب" },
  { value: "female_modern",      label: "👩 موديل عصري" },
  { value: "female_elegant",     label: "👩 موديل رسمي أنيق" },
  { value: "neutral_studio",     label: "🪆 بدون موديل — استوديو" },
  { value: "ghost_mannequin",    label: "👻 Ghost Mannequin" },
];
const FASHION_POSES = [
  { value: "standing_neutral", label: "🧍 وقوف محايد" },
  { value: "walking",          label: "🚶 مشي ديناميكي" },
  { value: "sitting_elegant",  label: "🪑 جلوس أنيق" },
  { value: "looking_side",     label: "👀 نظرة جانبية" },
  { value: "hand_on_hip",      label: "💁 يد على الخصر" },
  { value: "twirling",         label: "💃 دوران — حركة" },
];
const FASHION_SIZES = [
  { value: "slim",    label: "نحيف" },
  { value: "regular", label: "متوسط" },
  { value: "curvy",   label: "ممتلئ" },
];
const FASHION_BG = [
  { value: "white_studio",  label: "⬜ أبيض استوديو" },
  { value: "warm_beige",    label: "🟫 بيج دافئ" },
  { value: "cream_minimal", label: "🤍 كريمي فاخر" },
  { value: "cafe",          label: "☕ مقهى عصري" },
  { value: "street",        label: "🌇 شارع — دبي" },
  { value: "garden",        label: "🌿 حديقة خضراء" },
  { value: "interior",      label: "🏠 ديكور منزلي" },
  { value: "desert",        label: "🏜️ صحراء ذهبية" },
];

// ── خيارات المنزل ──────────────────────────────────────────────────────────────
const HOME_SHOTS = [
  { value: "flat_lay_overhead",  label: "📷 Flat Lay — من فوق" },
  { value: "45_angle",           label: "📐 زاوية 45°" },
  { value: "lifestyle_scene",    label: "🏠 ديكور حياتي" },
  { value: "close_up_macro",     label: "🔍 ماكرو — تفاصيل" },
  { value: "hero_shot",          label: "⭐ Hero Shot درامي" },
  { value: "grouped_collection", label: "🎁 مجموعة منتجات" },
];
const HOME_SURFACES = [
  { value: "linen_cream",    label: "🤍 كتان كريمي" },
  { value: "marble_white",   label: "⬜ رخام أبيض" },
  { value: "dark_wood",      label: "🟫 خشب داكن" },
  { value: "light_oak",      label: "🍁 أوك فاتح" },
  { value: "concrete_gray",  label: "🩶 خرسانة رمادية" },
  { value: "travertine",     label: "🪨 تريفرتين دافئ" },
  { value: "rattan_natural", label: "🌾 راتان طبيعي" },
];
const HOME_MOODS = [
  { value: "warm_cozy",       label: "🕯️ دافئ ومريح" },
  { value: "clean_minimal",   label: "🤍 مينيمال نظيف" },
  { value: "luxury_dark",     label: "🖤 فاخر داكن" },
  { value: "botanical",       label: "🌿 بوتانيكال أخضر" },
  { value: "arabic_heritage", label: "🪔 تراث عربي" },
  { value: "modern_chic",     label: "✨ مودرن شيك" },
];
const HOME_PROPS = [
  { value: "none",            label: "✖️ بدون إكسسوار" },
  { value: "botanicals",      label: "🌾 نباتات جافة" },
  { value: "candles_ambient", label: "🕯️ شموع محيطية" },
  { value: "citrus_fresh",    label: "🍋 حمضيات طازجة" },
  { value: "coffee_book",     label: "☕ كتاب وقهوة" },
  { value: "petals_romantic", label: "🌹 بتلات ورد" },
  { value: "seasonal_eid",    label: "🌙 ديكور رمضان/عيد" },
  { value: "herbs_natural",   label: "🌿 أعشاب طبيعية" },
];

// ── خيارات الطعام ──────────────────────────────────────────────────────────────
const FOOD_SHOTS = [
  { value: "overhead_flat",   label: "📷 Flat Lay — من فوق" },
  { value: "45_editorial",    label: "📐 زاوية 45° إيديتوريال" },
  { value: "close_up_steam",  label: "💨 قريب — بخار وتفاصيل" },
  { value: "plated_hero",     label: "🍽️ تقديم فاخر" },
  { value: "rustic_spread",   label: "🪵 مائدة ريفية غنية" },
  { value: "single_hero",     label: "⭐ بطل منفرد" },
];
const FOOD_SURFACES = [
  { value: "white_marble",  label: "⬜ رخام أبيض" },
  { value: "dark_slate",    label: "⬛ سليت داكن" },
  { value: "rustic_wood",   label: "🪵 خشب ريفي" },
  { value: "ceramic_plate", label: "🍽️ صحن سيراميك" },
  { value: "linen_napkin",  label: "🤍 كتان أبيض" },
  { value: "golden_tray",   label: "🥇 صينية ذهبية" },
];
const FOOD_MOODS = [
  { value: "fresh_bright",  label: "☀️ طازج ومضيء" },
  { value: "warm_homemade", label: "🏠 دافئ منزلي" },
  { value: "luxury_fine",   label: "✨ فاين داينينج" },
  { value: "festive_eid",   label: "🌙 رمضاني احتفالي" },
  { value: "cafe_modern",   label: "☕ كافيه مودرن" },
];
const FOOD_GARNISH = [
  { value: "none",           label: "✖️ بدون إضافات" },
  { value: "herbs_fresh",    label: "🌿 أعشاب طازجة" },
  { value: "nuts_honey",     label: "🍯 مكسرات وعسل" },
  { value: "flowers_edible", label: "🌸 زهور صالحة للأكل" },
  { value: "sauce_drizzle",  label: "🎨 صلصة فنية" },
  { value: "powdered_sugar", label: "❄️ سكر بودرة" },
];

// ── خيارات الجمال ──────────────────────────────────────────────────────────────
const BEAUTY_SHOTS = [
  { value: "flat_lay_clean",   label: "📷 Flat Lay نظيف" },
  { value: "hero_product",     label: "⭐ Hero Shot فاخر" },
  { value: "lifestyle_vanity", label: "💄 طاولة المرآة" },
  { value: "grouped_routine",  label: "🧴 روتين عناية" },
  { value: "macro_texture",    label: "🔍 ماكرو — القوام" },
  { value: "open_product",     label: "✨ المنتج مفتوح" },
];
const BEAUTY_BG = [
  { value: "white_clean",      label: "⬜ أبيض نقي" },
  { value: "marble_pink",      label: "🌸 رخام وردي" },
  { value: "cream_linen",      label: "🤍 كتان كريمي" },
  { value: "dark_luxury",      label: "🖤 مخمل داكن فاخر" },
  { value: "botanical_green",  label: "🌿 بوتانيكال" },
  { value: "glass_reflective", label: "💎 زجاج عاكس" },
];
const BEAUTY_PROPS = [
  { value: "none",            label: "✖️ المنتج فقط" },
  { value: "flowers_pink",    label: "🌸 بتلات وردية" },
  { value: "crystals",        label: "💎 كريستال وأحجار" },
  { value: "herbs_botanical", label: "🌿 نباتات عطرية" },
  { value: "gold_accents",    label: "✨ لمسات ذهبية" },
  { value: "mirror_elegant",  label: "🪞 مرآة أنيقة" },
  { value: "water_splash",    label: "💧 رذاذ ماء نقي" },
];

// ── خيارات الأعمال اليدوية ──────────────────────────────────────────────────────
const CRAFT_SHOTS = [
  { value: "flat_lay",          label: "📷 Flat Lay فني" },
  { value: "hands_wearing",     label: "🤲 في الأيدي" },
  { value: "display_stand",     label: "🏆 على حامل عرض" },
  { value: "atelier_scene",     label: "🎨 مشهد الأتيليه" },
  { value: "gift_presentation", label: "🎁 تقديم هدية" },
  { value: "collection_spread", label: "✨ مجموعة متكاملة" },
];

interface Result {
  prompt: string;
  arabic_description: string;
  tips: string[];
  detected_color: string;
  detected_fabric: string;
  detected_details: string;
  product_group: string;
}

function OptionGrid({ options, value, onChange, cols = 2 }: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  cols?: number;
}) {
  return (
    <div className={`grid grid-cols-${cols} gap-2`}>
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={`text-right px-3 py-2.5 rounded-xl border-2 transition text-sm font-medium
            ${value === o.value ? "border-primary-400 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:border-primary-200"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-primary-100">
      <h3 className="font-bold text-gray-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function StudioPage() {
  const [step, setStep]             = useState<"upload"|"options"|"analyzing"|"result">("upload");
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult]         = useState<Result | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [copied, setCopied]         = useState(false);
  const [autoCopied, setAutoCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem("token");

  // المنتج
  const [productType, setProductType] = useState("apparel");
  const productGroup = PRODUCT_GROUPS.find(g => g.types.some(t => t.value === productType))?.group || "fashion";

  // مشتركة
  const [lighting, setLighting]       = useState("soft_natural");
  const [season, setSeason]           = useState("none");
  const [outputFormat, setOutputFormat] = useState("product_square");
  const [extraNotes, setExtraNotes]   = useState("");

  // ملابس
  const [modelStyle, setModelStyle]   = useState("female_gulf_modern");
  const [modelSize, setModelSize]     = useState("regular");
  const [pose, setPose]               = useState("standing_neutral");
  const [background, setBackground]   = useState("white_studio");

  // منزل
  const [homeShotStyle, setHomeShotStyle] = useState("flat_lay_overhead");
  const [homeSurface, setHomeSurface]     = useState("linen_cream");
  const [homeMood, setHomeMood]           = useState("warm_cozy");
  const [homeProps, setHomeProps]         = useState("botanicals");

  // طعام
  const [foodShotStyle, setFoodShotStyle] = useState("overhead_flat");
  const [foodSurface, setFoodSurface]     = useState("white_marble");
  const [foodMood, setFoodMood]           = useState("warm_homemade");
  const [foodGarnish, setFoodGarnish]     = useState("none");

  // جمال
  const [beautyShotStyle, setBeautyShotStyle] = useState("hero_product");
  const [beautyBackground, setBeautyBackground] = useState("white_clean");
  const [beautyProps, setBeautyProps]           = useState("none");

  // يدوي
  const [craftShotStyle, setCraftShotStyle] = useState("flat_lay");

  function handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) { setError("الصورة أكبر من 10MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setStep("options");
    setError(null);
  }

  async function analyze() {
    if (!imageFile || !token) return;
    setStep("analyzing"); setError(null);
    try {
      const form = new FormData();
      form.append("image", imageFile);
      form.append("product_type",   productType);
      form.append("output_format",  outputFormat);
      form.append("lighting",       lighting);
      form.append("season",         season);
      if (extraNotes) form.append("extra_notes", extraNotes);
      // ملابس
      form.append("model_style",    modelStyle);
      form.append("model_size",     modelSize);
      form.append("pose",           pose);
      form.append("background",     background);
      // منزل
      form.append("home_shot_style", homeShotStyle);
      form.append("home_surface",    homeSurface);
      form.append("home_mood",       homeMood);
      form.append("home_props",      homeProps);
      // طعام
      form.append("food_shot_style", foodShotStyle);
      form.append("food_surface",    foodSurface);
      form.append("food_mood",       foodMood);
      form.append("food_garnish",    foodGarnish);
      // جمال
      form.append("beauty_shot_style",  beautyShotStyle);
      form.append("beauty_background",  beautyBackground);
      form.append("beauty_props",       beautyProps);
      // يدوي
      form.append("craft_shot_style",   craftShotStyle);

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
    navigator.clipboard.writeText(result.prompt)
      .then(() => { setAutoCopied(true); setTimeout(() => window.open("https://gemini.google.com", "_blank"), 400); })
      .catch(() => { setAutoCopied(true); window.open("https://gemini.google.com", "_blank"); });
  }

  function reset() {
    setStep("upload"); setImageFile(null); setImagePreview(null);
    setResult(null); setError(null); setAutoCopied(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-primary-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-primary-500 rounded-xl flex items-center justify-center text-white text-lg">✨</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">استوديو بيتي الذكي</h1>
            <p className="text-sm text-gray-500">يحلل منتجك ويولّد prompt احترافي لـ Gemini — مجاناً</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {error && <div className="mb-4 bg-error-tint border border-error-tint text-error rounded-xl px-4 py-3 text-sm">⚠️ {error}</div>}

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              className="bg-white rounded-2xl border-2 border-dashed border-primary-300 p-12 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all"
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            >
              <div className="text-5xl mb-4">📸</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">ارفع صورة منتجك</h2>
              <p className="text-gray-500 text-sm mb-4">JPG أو PNG أو WebP — حد أقصى 10MB</p>
              <button className="bg-primary-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-600 transition">اختر صورة</button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
            <div className="bg-white rounded-2xl p-5 border border-primary-100">
              <h3 className="font-bold text-gray-800 mb-3">كيف يعمل؟</h3>
              <div className="space-y-3">
                {[
                  { n: "١", text: "ارفع صورة منتجك واختر خياراتك" },
                  { n: "٢", text: "الاستوديو يحلل المنتج ويولّد prompt مخصص لنوعه" },
                  { n: "٣", text: "انسخ الـ prompt وافتح Gemini مجاناً" },
                  { n: "٤", text: "الصق الـ prompt → صورة احترافية في ثوانٍ!" },
                ].map(s => (
                  <div key={s.n} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 font-bold text-sm flex items-center justify-center flex-shrink-0">{s.n}</span>
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
            <div className="bg-white rounded-2xl p-4 border border-primary-100 flex gap-4 items-center">
              <img src={imagePreview!} alt="preview" className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
              <div className="flex-1">
                <p className="font-semibold text-gray-800">صورة المنتج</p>
                <p className="text-sm text-gray-400">{imageFile?.name}</p>
              </div>
              <button onClick={reset} className="text-sm text-gray-400 hover:text-error">تغيير</button>
            </div>

            {/* نوع المنتج */}
            <Section title="نوع المنتج">
              <div className="space-y-4">
                {PRODUCT_GROUPS.map(g => (
                  <div key={g.group}>
                    <p className="text-xs font-bold text-gray-400 mb-2 uppercase">{g.label}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {g.types.map(t => (
                        <button key={t.value} type="button" onClick={() => setProductType(t.value)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition text-xs font-medium
                            ${productType === t.value ? "border-primary-400 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:border-primary-200"}`}>
                          <span className="text-xl">{t.emoji}</span>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* خيارات الملابس */}
            {productGroup === "fashion" && (
              <>
                <Section title="نمط الموديل">
                  <OptionGrid options={FASHION_MODELS} value={modelStyle} onChange={setModelStyle} cols={2} />
                </Section>
                {(modelStyle !== "neutral_studio" && modelStyle !== "ghost_mannequin") && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Section title="الوضعية">
                        <OptionGrid options={FASHION_POSES} value={pose} onChange={setPose} cols={1} />
                      </Section>
                      <Section title="مقاس الموديل">
                        <OptionGrid options={FASHION_SIZES} value={modelSize} onChange={setModelSize} cols={1} />
                      </Section>
                    </div>
                  </>
                )}
                <Section title="الخلفية">
                  <OptionGrid options={FASHION_BG} value={background} onChange={setBackground} cols={2} />
                </Section>
              </>
            )}

            {/* خيارات المنزل */}
            {productGroup === "home" && (
              <>
                <Section title="أسلوب التصوير">
                  <OptionGrid options={HOME_SHOTS} value={homeShotStyle} onChange={setHomeShotStyle} cols={2} />
                </Section>
                <Section title="السطح والقاعدة">
                  <OptionGrid options={HOME_SURFACES} value={homeSurface} onChange={setHomeSurface} cols={2} />
                </Section>
                <Section title="الجو والأجواء">
                  <OptionGrid options={HOME_MOODS} value={homeMood} onChange={setHomeMood} cols={2} />
                </Section>
                <Section title="الإكسسوارات والتنسيق">
                  <OptionGrid options={HOME_PROPS} value={homeProps} onChange={setHomeProps} cols={2} />
                </Section>
              </>
            )}

            {/* خيارات الطعام */}
            {productGroup === "food" && (
              <>
                <Section title="أسلوب التصوير">
                  <OptionGrid options={FOOD_SHOTS} value={foodShotStyle} onChange={setFoodShotStyle} cols={2} />
                </Section>
                <Section title="السطح">
                  <OptionGrid options={FOOD_SURFACES} value={foodSurface} onChange={setFoodSurface} cols={2} />
                </Section>
                <Section title="الجو والأجواء">
                  <OptionGrid options={FOOD_MOODS} value={foodMood} onChange={setFoodMood} cols={2} />
                </Section>
                <Section title="التزيين والتحسين">
                  <OptionGrid options={FOOD_GARNISH} value={foodGarnish} onChange={setFoodGarnish} cols={2} />
                </Section>
              </>
            )}

            {/* خيارات الجمال */}
            {productGroup === "beauty" && (
              <>
                <Section title="أسلوب التصوير">
                  <OptionGrid options={BEAUTY_SHOTS} value={beautyShotStyle} onChange={setBeautyShotStyle} cols={2} />
                </Section>
                <Section title="الخلفية">
                  <OptionGrid options={BEAUTY_BG} value={beautyBackground} onChange={setBeautyBackground} cols={2} />
                </Section>
                <Section title="الإكسسوارات">
                  <OptionGrid options={BEAUTY_PROPS} value={beautyProps} onChange={setBeautyProps} cols={2} />
                </Section>
              </>
            )}

            {/* خيارات الأعمال اليدوية */}
            {productGroup === "craft" && (
              <Section title="أسلوب العرض">
                <OptionGrid options={CRAFT_SHOTS} value={craftShotStyle} onChange={setCraftShotStyle} cols={2} />
              </Section>
            )}

            {/* خيارات مشتركة */}
            <Section title="الإضاءة">
              <OptionGrid options={LIGHTING} value={lighting} onChange={setLighting} cols={2} />
            </Section>

            <div className="grid grid-cols-2 gap-4">
              <Section title="الإخراج">
                <OptionGrid options={OUTPUT_FORMATS} value={outputFormat} onChange={setOutputFormat} cols={1} />
              </Section>
              <Section title="المناسبة (اختياري)">
                <OptionGrid options={SEASON} value={season} onChange={setSeason} cols={1} />
              </Section>
            </div>

            <Section title="ملاحظات إضافية (اختياري)">
              <p className="text-xs text-gray-400 mb-2">أي تفاصيل تريد إضافتها</p>
              <textarea value={extraNotes} onChange={e => setExtraNotes(e.target.value)}
                placeholder="مثال: أريد اللون الأصفر يبرز أكثر، مع تأثير الدخان..."
                rows={2}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none transition resize-none" dir="rtl" />
            </Section>

            <button onClick={analyze}
              className="w-full bg-gradient-to-r from-purple-500 to-primary-500 text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition shadow-lg">
              ✨ حلّل المنتج وولّد الـ Prompt
            </button>
          </div>
        )}

        {/* Step 3: Analyzing */}
        {step === "analyzing" && (
          <div className="bg-white rounded-2xl p-12 text-center border border-primary-100">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="w-20 h-20 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-2xl">🔍</div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">بيتي يحلل منتجك...</h2>
            <p className="text-gray-500 text-sm">يستخرج التفاصيل ويبني الـ prompt المثالي</p>
            <p className="text-gray-400 text-xs mt-4">~15 ثانية</p>
          </div>
        )}

        {/* Step 4: Result */}
        {step === "result" && result && (
          <div className="space-y-4">
            {result.arabic_description && (
              <div className="bg-white rounded-2xl p-4 border border-purple-100">
                <p className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">✨</span>
                  {result.arabic_description}
                </p>
              </div>
            )}

            <details className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
              <summary className="px-5 py-4 cursor-pointer font-bold text-gray-700 flex items-center gap-2 hover:bg-primary-50 transition list-none">
                <span>📋</span> عرض الـ Prompt
                <span className="mr-auto text-xs text-gray-400 font-normal">اضغط للعرض</span>
              </summary>
              <div className="px-5 pb-5">
                <div className="flex justify-end mb-2">
                  <button onClick={copyPrompt}
                    className={`text-sm px-4 py-1.5 rounded-lg font-medium transition ${copied ? "bg-success-tint text-success" : "bg-primary-100 text-primary-600 hover:bg-primary-200"}`}>
                    {copied ? "✅ تم النسخ!" : "نسخ"}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed font-mono text-left" dir="ltr">
                  {result.prompt}
                </div>
              </div>
            </details>

            {result.tips?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-primary-100">
                <h3 className="font-bold text-gray-800 mb-3">💡 نصائح للحصول على أفضل نتيجة</h3>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-primary-400 mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button onClick={openGemini}
              className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-info to-purple-500 text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition shadow-lg">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              {autoCopied ? "✅ Gemini مفتوح!" : "انسخ الـ Prompt وافتح Gemini ✨"}
            </button>

            {autoCopied && (
              <div className="bg-success-tint border border-success-tint rounded-xl p-5 text-success text-sm">
                <p className="font-bold text-base mb-3 text-center">✅ تم النسخ — Gemini مفتوح!</p>
                <div className="space-y-2">
                  {[
                    { n: "١", text: "في Gemini، اضغط على صندوق النص" },
                    { n: "٢", text: "موبايل: اضغط مطولاً ← اختر \"لصق\"" },
                    { n: "٣", text: "كمبيوتر: اضغط Ctrl+V" },
                    { n: "٤", text: "اضغط إرسال ← صورة احترافية! 🎉" },
                  ].map(s => (
                    <div key={s.n} className="flex items-start gap-2">
                      <span className="bg-success text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{s.n}</span>
                      <p>{s.text}</p>
                    </div>
                  ))}
                </div>
                <button onClick={copyPrompt} className="mt-3 w-full text-center text-xs text-success underline">
                  {copied ? "✅ تم النسخ مجدداً" : "انسخ مجدداً إذا فقدت النسخ"}
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setStep("options"); setResult(null); setAutoCopied(false); }}
                className="bg-white border-2 border-primary-300 text-primary-600 py-3 rounded-xl font-medium hover:bg-primary-50 transition text-sm">
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
