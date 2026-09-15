import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import SEO from "../components/SEO";

const STEPS = [
  {
    num: "١", numEn: "1",
    title: "سجّل مجّاناً", titleEn: "Register free",
    desc: "أنشئ حسابك في دقيقتين. بلا رسوم ولا عقود.", descEn: "Create your account in two minutes. No fees and no contracts.",
  },
  {
    num: "٢", numEn: "2",
    title: "أضف منتجاتك", titleEn: "Add your products",
    desc: "التقط صور منتجاتك وسيكتب الذكاء الاصطناعي الوصف والسعر تلقائياً.", descEn: "Photograph your products and AI will automatically write the description and suggest the price.",
  },
  {
    num: "٣", numEn: "3",
    title: "استلم طلباتك", titleEn: "Receive your orders",
    desc: "ستتلقّى إشعاراً فورياً مع كل طلب. تواصل مع العميل عبر واتساب مباشرةً.", descEn: "You will receive an instant notification for every order. Contact buyers via WhatsApp directly.",
  },
];

const FEATURES = [
  {
    icon: "🤖",
    title: "ذكاء اصطناعي يكتب عنك", titleEn: "AI writes for you",
    desc: "التقط صورة منتجك وستكتب بيتي الاسم والوصف والسعر المقترح تلقائياً بالعربية والإنجليزية.",
    descEn: "Photograph your product and Bayti automatically writes the name, description and suggested price in Arabic and English.",
    badge: "", badgeEn: "",
  },
  {
    icon: "📊",
    title: "مستشار التسعير الذكي", titleEn: "Smart Pricing Advisor",
    desc: "يحلل أسعار المنافسين الفعليين في السوق الإماراتي ويقترح السعر الأمثل لمنتجك تلقائياً — بلا تخمين ولا مقارنة يدوية.",
    descEn: "Scans real competitor prices across the UAE market and suggests the optimal price for your product automatically — no guessing, no manual research.",
    badge: "جديد", badgeEn: "New",
  },
  {
    icon: "✨",
    title: "استوديو بيتي الذكي", titleEn: "Bayti Smart Studio",
    desc: "يحوّل صور منتجاتك العادية إلى صور تسويقية احترافية جاهزة للنشر — مجاناً.",
    descEn: "Transforms your everyday product photos into stunning professional marketing images ready to publish — completely free.",
    badge: "جديد", badgeEn: "New",
  },
  {
    icon: "🚀",
    title: "رفع متعدد ذكي", titleEn: "Smart Bulk Upload",
    desc: "ارفع حتى 20 صورة دفعة واحدة، جمّعها حسب المنتج، والذكاء الاصطناعي يكتب الاسم والوصف تلقائياً لكل مجموعة.",
    descEn: "Upload up to 20 photos at once, group them by product, and AI automatically writes the name and description for each group.",
    badge: "جديد", badgeEn: "New",
  },
  {
    icon: "🏷️",
    title: "خاصية الخصم الذكي", titleEn: "Smart Discount Feature",
    desc: "أضف نسبة خصم على أي منتج — يظهر السعر الأصلي مشطوباً وبادج أحمر للمشتري مما يرفع نسبة الشراء.",
    descEn: "Add a discount percentage to any product — the original price appears crossed out with a red badge, increasing buyer conversion.",
    badge: "", badgeEn: "",
  },
  {
    icon: "🚚",
    title: "توصيل مجاني تلقائي", titleEn: "Automatic Free Shipping",
    desc: "حدد مبلغاً أدنى للطلب ويتحول التوصيل لمجاني تلقائياً — يشجّع العميل على إضافة منتجات أكثر.",
    descEn: "Set a minimum order amount and shipping automatically becomes free — encouraging customers to add more products.",
    badge: "", badgeEn: "",
  },
  {
    icon: "📋",
    title: "لوحة تحكم كاملة", titleEn: "Full Dashboard",
    desc: "اطّلع على طلباتك ومنتجاتك وتقييماتك وأرباحك في مكان واحد.",
    descEn: "View your orders, products, reviews and earnings all in one place.",
    badge: "", badgeEn: "",
  },
  {
    icon: "💬",
    title: "تواصل مباشر بالواتساب", titleEn: "Direct WhatsApp Contact",
    desc: "يتضمّن كل طلب زر واتساب للتواصل مع العميل مباشرةً دون وسيط.",
    descEn: "Every order includes a WhatsApp button to contact the buyer directly without intermediaries.",
    badge: "", badgeEn: "",
  },
  {
    icon: "🇦🇪",
    title: "عربي وإنجليزي", titleEn: "Arabic & English",
    desc: "الموقع بالكامل باللغتين. تظهر منتجاتك للناطقين بالعربية والإنجليزية في الإمارات.",
    descEn: "The entire site is bilingual. Your products appear to both Arabic and English speakers in the UAE.",
    badge: "", badgeEn: "",
  },
];

const HOW_IT_WORKS = [
  {
    icon: "🛍️",
    title: "العميل يطلب", titleEn: "The customer places an order",
    desc: "يختار العميل منتجك ويُدخل بياناته (الاسم ورقم الهاتف ومنطقة التوصيل) ثم يؤكّد الطلب.",
    descEn: "The customer selects your product, enters their details (name, phone number, delivery area) and confirms the order.",
  },
  {
    icon: "🔔",
    title: "إشعار فوري", titleEn: "Instant alert to you",
    desc: "تصلك رسالة فورية بتفاصيل الطلب. يمكنك التواصل مع العميل عبر واتساب لتأكيد موعد التسليم.",
    descEn: "You receive an instant message with order details and can contact the buyer via WhatsApp to confirm the delivery time.",
  },
  {
    icon: "🚗",
    title: "التوصيل", titleEn: "Delivery",
    desc: "تحدّد طريقة التوصيل بنفسك — إما توصيل من قِبلك أو استلام مباشر من العميل. كما تحدّد رسوم التوصيل لكل إمارة.",
    descEn: "You decide the delivery method — either you deliver yourself or the buyer collects. You also set your own delivery fees per emirate.",
  },
  {
    icon: "💵",
    title: "الدفع", titleEn: "Payment",
    desc: "الدفع نقداً عند الاستلام. يدفع العميل لك مباشرةً. تأخذ بيتي عمولةً صغيرةً فقط على الطلبات المكتملة.",
    descEn: "Payment is cash on delivery. The buyer pays you directly. Bayti takes a small commission only on successfully completed orders.",
  },
];

const FAQS = [
  { q: "هل التسجيل مجّاني؟", qEn: "Is registration free?", a: "نعم، تماماً. لا توجد رسوم شهرية ولا رسوم لإدراج المنتجات. نأخذ فقط عمولةً صغيرةً على كل طلب مكتمل.", aEn: "Yes completely. No monthly fees, no listing fees. We only take a small commission on each completed order." },
  { q: "من يتولّى توصيل الطلبات؟", qEn: "Who delivers the orders?", a: "تختار أنت — إما أن توصّل بنفسك أو يستلم العميل مباشرةً. كما تحدّد رسوم التوصيل لكل إمارة.", aEn: "The choice is yours — either deliver yourself or have the buyer collect. You set your own delivery fees per emirate." },
  { q: "كيف أستلم مبالغي؟", qEn: "How do I receive my money?", a: "الدفع نقداً عند الاستلام مباشرةً. يدفع العميل لك عند استلام المنتج.", aEn: "Payment is cash on delivery. The buyer pays you directly upon receiving the product." },
  { q: "ما هو مستشار التسعير الذكي؟", qEn: "What is the Smart Pricing Advisor?", a: "أداة تحلل أسعار المنافسين الفعليين في السوق الإماراتي (من متاجر إلكترونية وبائعين محليين) وتوصي بالسعر الأمثل لكل منتج تلقائياً — بلا تخمين ولا بحث يدوي.", aEn: "A tool that scans real competitor prices across the UAE market (from online stores and local sellers) and recommends the optimal price for each product automatically — no guessing, no manual research." },
  { q: "ما هو استوديو بيتي الذكي؟", qEn: "What is Bayti Smart Studio?", a: "ميزة مجانية حصرية لبائعي بيتي — ترفع صورة منتجك العادية وتختار الأجواء والخلفية، والاستوديو يولّد prompt احترافي لتحويلها إلى صورة تسويقية احترافية في ثوانٍ.", aEn: "A free feature exclusive to Bayti sellers — upload your everyday product photo, choose the mood and background, and the studio generates a professional prompt to transform it into a stunning marketing image in seconds." },
  { q: "متى سيكون الإطلاق الرسمي؟", qEn: "When is the official launch?", a: "الموقع حالياً في مرحلة تجريبية والإطلاق الرسمي قريب. من سجّل الآن سيكون من أوائل البائعين ويحصل على مزايا حصرية.", aEn: "The site is currently in beta and the official launch is approaching. Those who register now will be among the first sellers and will receive exclusive benefits." },
];

export default function SellPage() {
  const { isArabic } = useLanguage();
  const dir = isArabic ? "rtl" : "ltr";

  return (
    <>
    <div dir={dir} className="min-h-screen bg-cream">
      <SEO
        title={isArabic ? "بيع من البيت — بيتي" : "Sell from Home — Bayti"}
        description={isArabic ? "حوّل موهبتك إلى دخل. سجّل مجّاناً وابدأ البيع لزباين في كل الإمارات." : "Turn your talent into income. Register free and start selling to customers across the UAE."}
        url="/sell"
      />

      {/* Beta Banner */}
      <div className="bg-primary-50 border-b border-primary-200 py-3 px-4 text-center">
        <p className="text-primary-800 text-sm font-medium">
          {isArabic
            ? "🚀 بيتي حالياً في مرحلة تجريبية — الإطلاق الرسمي قريباً. سجّل الآن لتكون من أوائل البائعين وتحصل على مزايا حصرية!"
            : "🚀 Bayti is currently in beta — the official launch is coming soon. Register now to be among the first sellers and receive exclusive benefits!"}
        </p>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-white pt-14 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block bg-primary-100 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            {isArabic ? "للبائعين في الإمارات العربية المتحدة" : "For UAE sellers"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {isArabic ? (<>موهبتك تستحقّ<br /><span className="text-primary-500">أكثر من الانستقرام</span></>) : (<>Your talent deserves<br /><span className="text-primary-500">more than Instagram</span></>)}
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
            {isArabic ? "بيتي سوق إماراتي للبائعين — بلا رسوم شهرية، بلا تعقيد، مع أدوات ذكاء اصطناعي تساعدك تنجح." : "Bayti is a UAE marketplace for sellers — no monthly fees, no complexity, with AI tools to help you succeed."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/seller-apply" className="bg-primary-500 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-primary-600 transition shadow-lg shadow-primary-200">
              {isArabic ? "سجّل الآن — مجّاناً" : "Register Now — Free"}
            </Link>
            <Link to="/marketplace" className="bg-white text-gray-700 font-medium px-8 py-4 rounded-2xl text-lg border border-gray-200 hover:border-primary-300 transition">
              {isArabic ? "تصفّح السوق أولاً" : "Browse the marketplace first"}
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-5">
            {isArabic ? "✨ من سجّل الآن سيحصل على الأولوية في الظهور عند الإطلاق الرسمي" : "✨ Early registrants will receive priority visibility at the official launch"}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { num: "بلا رسوم", numEn: "0 Fees", label: isArabic ? "تسجيل وإدراج منتجات" : "registration & listing" },
            { num: "24 ساعة", numEn: "24 hrs", label: isArabic ? "من التسجيل حتى البداية" : "from signup to live" },
            { num: "٣ أدوات", numEn: "3 AI Tools", label: isArabic ? "ذكاء اصطناعي مجانية" : "free AI tools" },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-3xl md:text-4xl font-bold text-primary-400 mb-1">{isArabic ? s.num : s.numEn}</p>
              <p className="text-gray-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Tools Highlight */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-primary-50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-primary-500 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            {isArabic ? "✨ حصري لبائعي بيتي" : "✨ Exclusive to Bayti Sellers"}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {isArabic ? "٣ أدوات ذكاء اصطناعي مجانية" : "3 Free AI Tools"}
          </h2>
          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            {isArabic ? "لا تحتاج خبرة تقنية — الأدوات تعمل تلقائياً وتوفّر عليك ساعات من العمل" : "No technical skills needed — the tools work automatically and save you hours of work"}
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: "📊",
                title: isArabic ? "مستشار التسعير الذكي" : "Smart Pricing Advisor",
                desc: isArabic
                  ? "يحلل أسعار السوق الإماراتي الفعلية ويقترح السعر الأمثل لمنتجك"
                  : "Analyzes real UAE market prices and suggests the optimal price for your product",
                color: "bg-info-tint border-info-tint",
                iconBg: "bg-info-tint",
              },
              {
                icon: "✨",
                title: isArabic ? "استوديو بيتي الذكي" : "Bayti Smart Studio",
                desc: isArabic
                  ? "يحوّل صورك العادية إلى صور تسويقية احترافية في ثوانٍ"
                  : "Transforms your everyday photos into professional marketing images in seconds",
                color: "bg-purple-50 border-purple-200",
                iconBg: "bg-purple-100",
              },
              {
                icon: "🤖",
                title: isArabic ? "كاتب الأوصاف الذكي" : "AI Description Writer",
                desc: isArabic
                  ? "يكتب اسم منتجك ووصفه بالعربية والإنجليزية من صورة واحدة فقط"
                  : "Writes your product name and description in Arabic and English from a single photo",
                color: "bg-primary-50 border-primary-200",
                iconBg: "bg-primary-100",
              },
            ].map((tool, i) => (
              <div key={i} className={`rounded-2xl border-2 p-6 text-${isArabic ? "right" : "left"} ${tool.color}`}>
                <div className={`w-12 h-12 ${tool.iconBg} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                  {tool.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{tool.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            {isArabic ? "كل ما ستحصل عليه" : "Everything you get"}
          </h2>
          <p className="text-center text-gray-500 mb-12">
            {isArabic ? "كل ما تحتاجه لتبيع بثقة واطمئنان" : "Everything you need to sell with confidence"}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-primary-200 transition bg-white relative">
                {(isArabic ? f.badge : f.badgeEn) && (
                  <span className={`absolute top-3 ${isArabic ? "left-3" : "right-3"} bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
                    {isArabic ? f.badge : f.badgeEn}
                  </span>
                )}
                <span className="text-2xl flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 mb-1">{isArabic ? f.title : f.titleEn}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{isArabic ? f.desc : f.descEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-primary-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            {isArabic ? "كيف يعمل السوق؟" : "How does it work?"}
          </h2>
          <p className="text-center text-gray-500 mb-12">
            {isArabic ? "من الطلب إلى الدفع — كل شيء واضح" : "From order to payment — everything clear"}
          </p>
          <div className="space-y-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 flex gap-5 items-start shadow-sm">
                <span className="text-3xl flex-shrink-0">{step.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 text-lg mb-1">{isArabic ? step.title : step.titleEn}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{isArabic ? step.desc : step.descEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            {isArabic ? "ثلاث خطوات وتنطلق" : "Three steps and you are live"}
          </h2>
          <div className="space-y-8">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                  {isArabic ? step.num : step.numEn}
                </div>
                <div className="pt-1">
                  <p className="font-bold text-gray-900 text-lg mb-1">{isArabic ? step.title : step.titleEn}</p>
                  <p className="text-gray-500">{isArabic ? step.desc : step.descEn}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/seller-apply" className="inline-block bg-primary-500 text-white font-bold px-10 py-4 rounded-2xl text-lg hover:bg-primary-600 transition shadow-lg shadow-primary-200">
              {isArabic ? "سجّل الآن" : "Register Now"}
            </Link>
          </div>
        </div>
      </section>

      {/* What you can sell */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {isArabic ? "ما الذي يمكنك بيعه؟" : "What can you sell?"}
          </h2>
          <p className="text-gray-500 mb-8">
            {isArabic ? "كل ما تصنعه بيديك أو تبيعه أو تستورده" : "Anything you make, sell, or import"}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: "/icons/bayti/categories/perfumes-candles.png", label: isArabic ? "شموع وعطور" : "Candles & Perfumes" },
              { icon: "/icons/bayti/categories/handmade-crafts.png",  label: isArabic ? "مشغولات يدوية" : "Handmade Crafts" },
              { icon: "/icons/bayti/categories/clothing-abayas.png",  label: isArabic ? "عبايات وأزياء" : "Abayas & Fashion" },
              { icon: "/icons/bayti/categories/accessories.png",      label: isArabic ? "إكسسوارات" : "Accessories" },
              { icon: "/icons/bayti/categories/beauty-skincare.png",  label: isArabic ? "عناية بالبشرة" : "Skincare" },
              { icon: "/icons/bayti/categories/makeup-beauty.png",    label: isArabic ? "مكياج" : "Makeup" },
              { icon: "/icons/bayti/categories/home-decor.png",       label: isArabic ? "لمسات منزلية" : "Home Decor" },
              { icon: "/icons/bayti/categories/desserts-sweets.png",  label: isArabic ? "حلويات" : "Sweets" },
              { icon: "/icons/bayti/categories/home-cooked-meals.png",label: isArabic ? "وجبات منزلية" : "Home Meals" },
              { icon: "/icons/bayti/categories/baked-goods.png",      label: isArabic ? "مخبوزات" : "Baked Goods" },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 text-sm font-medium text-gray-700 border border-gray-100">
                <img src={c.icon} alt="" aria-hidden="true" className="w-8 h-8 object-contain" />
                {c.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            {isArabic ? "أسئلة شائعة" : "Common questions"}
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
                <p className="font-bold text-gray-900 mb-2">{isArabic ? faq.q : faq.qEn}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{isArabic ? faq.a : faq.aEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-primary-500">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-primary-200 text-sm mb-3">
            {isArabic ? "🚀 مرحلة تجريبية — الإطلاق الرسمي قريباً" : "🚀 Beta phase — the official launch is coming soon"}
          </p>
          <h2 className="text-3xl font-bold text-white mb-3">
            {isArabic ? "سجّل الآن لتكون من الأوائل" : "Register now to be among the first"}
          </h2>
          <p className="text-primary-100 mb-8">
            {isArabic ? "التسجيل مجّاني. أضف منتجاتك اليوم. وحين نُطلق رسمياً ستكون جاهزاً تماماً." : "Registration is free. Add your products today and when we officially launch, you will be ready."}
          </p>
          <Link to="/seller-apply" className="inline-block bg-white text-primary-500 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-primary-50 transition">
            {isArabic ? "ابدأ الآن — مجّاناً" : "Start Now — Free"}
          </Link>
        </div>
      </section>
    </div>
    </>
  );
}
