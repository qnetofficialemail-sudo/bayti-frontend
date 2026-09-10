import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import SEO from "../components/SEO";

const STEPS = [
  {
    num: "١", numEn: "1",
    title: "سجّلي مجّاناً", titleEn: "Register free",
    desc: "أنشئي حسابك في دقيقتين. بلا رسوم ولا عقود.", descEn: "Create your account in two minutes. No fees and no contracts.",
  },
  {
    num: "٢", numEn: "2",
    title: "أضيفي منتجاتك", titleEn: "Add your products",
    desc: "التقطي صور منتجاتك وسيكتب الذكاء الاصطناعي الوصف تلقائياً.", descEn: "Photograph your products and AI will automatically write the description.",
  },
  {
    num: "٣", numEn: "3",
    title: "استلمي طلباتك", titleEn: "Receive your orders",
    desc: "ستتلقّين إشعاراً فورياً مع كل طلب. تواصلي مع العميل عبر واتساب مباشرةً.", descEn: "You will receive an instant notification for every order. Contact buyers via WhatsApp directly.",
  },
];

const FEATURES = [
  { icon: "🤖", title: "ذكاء اصطناعي يكتب عنك", titleEn: "AI writes for you", desc: "التقطي صورة منتجك وستكتب بيتي الاسم والوصف والسعر المقترح تلقائياً بالعربية والإنجليزية.", descEn: "Photograph your product and Bayti automatically writes the name, description and suggested price in Arabic and English." },
  { icon: "📊", title: "لوحة تحكم كاملة", titleEn: "Full dashboard", desc: "اطّلعي على طلباتك ومنتجاتك وتقييماتك وأرباحك في مكان واحد.", descEn: "View your orders, products, reviews and earnings all in one place." },
  { icon: "🗓", title: "حددي أوقات عملك", titleEn: "Set your schedule", desc: "اختاري الأيام والأوقات التي تناسبك. لن تتلقّي طلبات خارج أوقات عملك.", descEn: "Choose the days and hours that suit you. No orders will be received outside your working hours." },
  { icon: "💬", title: "تواصل مباشر بالواتساب", titleEn: "Direct WhatsApp contact", desc: "يتضمّن كل طلب زر واتساب للتواصل مع العميل مباشرةً دون وسيط.", descEn: "Every order includes a WhatsApp button to contact the buyer directly without intermediaries." },
  { icon: "⭐", title: "تقييمات تبني ثقتك", titleEn: "Reviews build your trust", desc: "يقيّم العملاء تجربتهم وتظهر تقييماتهم على متجرك لاستقطاب عملاء جدد.", descEn: "Customers rate their experience and reviews appear on your store to attract new buyers." },
  { icon: "🇦🇪", title: "عربي وإنجليزي", titleEn: "Arabic & English", desc: "الموقع بالكامل باللغتين. تظهر منتجاتك للناطقين بالعربية والإنجليزية في الإمارات.", descEn: "The entire site is bilingual. Your products appear to both Arabic and English speakers in the UAE." },
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
    desc: "تصلكِ رسالة فورية بتفاصيل الطلب. يمكنكِ التواصل مع العميل عبر واتساب لتأكيد موعد التسليم.",
    descEn: "You receive an instant message with order details and can contact the buyer via WhatsApp to confirm the delivery time.",
  },
  {
    icon: "🚗",
    title: "التوصيل", titleEn: "Delivery",
    desc: "تحدّدين طريقة التوصيل بنفسك — إما توصيل من قِبلك أو استلام مباشر من العميل. كما تحدّدين رسوم التوصيل لكل إمارة.",
    descEn: "You decide the delivery method — either you deliver yourself or the buyer collects. You also set your own delivery fees per emirate.",
  },
  {
    icon: "💵",
    title: "الدفع", titleEn: "Payment",
    desc: "الدفع نقداً عند الاستلام. يدفع العميل لكِ مباشرةً. تأخذ بيتي عمولةً صغيرةً فقط على الطلبات المكتملة.",
    descEn: "Payment is cash on delivery. The buyer pays you directly. Bayti takes a small commission only on successfully completed orders.",
  },
];

const FAQS = [
  { q: "هل التسجيل مجّاني؟", qEn: "Is registration free?", a: "نعم، تماماً. لا توجد رسوم شهرية ولا رسوم لإدراج المنتجات. نأخذ فقط عمولةً صغيرةً على كل طلب مكتمل.", aEn: "Yes completely. No monthly fees, no listing fees. We only take a small commission on each completed order." },

  { q: "من يتولّى توصيل الطلبات؟", qEn: "Who delivers the orders?", a: "تختارين أنتِ — إما أن توصّلي بنفسك أو يستلم العميل مباشرةً. كما تحدّدين رسوم التوصيل لكل إمارة.", aEn: "The choice is yours — either deliver yourself or have the buyer collect. You set your own delivery fees per emirate." },
  { q: "كيف أستلم مبالغي؟", qEn: "How do I receive my money?", a: "الدفع نقداً عند الاستلام مباشرةً. يدفع العميل لكِ عند استلام المنتج.", aEn: "Payment is cash on delivery. The buyer pays you directly upon receiving the product." },
  { q: "متى سيكون الإطلاق الرسمي؟", qEn: "When is the official launch?", a: "الموقع حالياً في مرحلة تجريبية والإطلاق الرسمي قريب. من تسجّل الآن ستكون من أوائل البائعات وستحصل على مزايا إضافية.", aEn: "The site is currently in beta and the official launch is approaching. Those who register now will be among the first sellers and will receive additional benefits." },
];

export default function SellPage() {
  const { isArabic } = useLanguage();
  const dir = isArabic ? "rtl" : "ltr";

  return (
    <div dir={dir} className="min-h-screen bg-white">
      <SEO
        title={isArabic ? "بيعي من البيت — بيتي" : "Sell from Home — Bayti"}
        description={isArabic ? "حوّلي موهبتك إلى دخل. سجّلي مجّاناً وابدأي البيع لزباين في كل الإمارات." : "Turn your talent into income. Register free and start selling to customers across the UAE."}
      />

      {/* Beta Banner */}
      <div className="bg-amber-50 border-b border-amber-200 py-3 px-4 text-center">
        <p className="text-amber-800 text-sm font-medium">
          {isArabic
            ? "🚀 بيتي حالياً في مرحلة تجريبية — الإطلاق الرسمي قريباً. سجّلي الآن لتكوني من أوائل البائعات وتحصلي على مزايا حصرية!"
            : "🚀 Bayti is currently in beta — the official launch is coming soon. Register now to be among the first sellers and receive exclusive benefits!"}
        </p>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-orange-50 to-white pt-14 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block bg-orange-100 text-orange-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            {isArabic ? "للبائعات المنزليات في الإمارات العربية المتحدة" : "For UAE home sellers"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {isArabic ? (<>موهبتك تستحقّ<br /><span className="text-orange-500">أكثر من الانستقرام</span></>) : (<>Your talent deserves<br /><span className="text-orange-500">more than Instagram</span></>)}
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
            {isArabic ? "بيتي سوق إماراتي للبائعات المنزليات — بلا رسوم شهرية، بلا تعقيد." : "Bayti is a UAE marketplace for home sellers — no monthly fees, no complexity."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/seller-apply" className="bg-orange-500 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200">
              {isArabic ? "سجّلي الآن — مجّاناً" : "Register Now — Free"}
            </Link>
            <Link to="/marketplace" className="bg-white text-gray-700 font-medium px-8 py-4 rounded-2xl text-lg border border-gray-200 hover:border-orange-300 transition">
              {isArabic ? "تصفّحي السوق أولاً" : "Browse the marketplace first"}
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-5">
            {isArabic ? "✨ من تسجّل الآن ستحصل على الأولوية في الظهور عند الإطلاق الرسمي" : "✨ Early registrants will receive priority visibility at the official launch"}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { num: "بلا رسوم", numEn: "0 Fees", label: isArabic ? "تسجيل وإدراج منتجات" : "registration & listing" },
            { num: "24 ساعة", numEn: "24 hrs", label: isArabic ? "من التسجيل حتى البداية" : "from signup to live" },
            { num: "١١ فئة", numEn: "11 cats", label: isArabic ? "منتج تقدرين تبيعينه" : "product categories" },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-3xl md:text-4xl font-bold text-orange-400 mb-1">{isArabic ? s.num : s.numEn}</p>
              <p className="text-gray-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            {isArabic ? "ما الذي ستحصلين عليه؟" : "What do you get?"}
          </h2>
          <p className="text-center text-gray-500 mb-12">
            {isArabic ? "كل ما تحتاجينه لتبيعي بثقة واطمئنان" : "Everything you need to sell with confidence"}
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-orange-200 transition bg-white">
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

      {/* How it works — Order / Delivery / Payment */}
      <section className="py-20 px-4 bg-orange-50">
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
            {isArabic ? "ثلاث خطوات وتنطلقين" : "Three steps and you are live"}
          </h2>
          <div className="space-y-8">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
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
            <Link to="/seller-apply" className="inline-block bg-orange-500 text-white font-bold px-10 py-4 rounded-2xl text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200">
              {isArabic ? "سجّلي الآن" : "Register Now"}
            </Link>
          </div>
        </div>
      </section>

      {/* What you can sell */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {isArabic ? "ما الذي يمكنكِ بيعه؟" : "What can you sell?"}
          </h2>
          <p className="text-gray-500 mb-8">
            {isArabic ? "كل ما تصنعينه بيديكِ أو تبيعينه من المنزل" : "Anything you make by hand or sell from home"}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: "/icons/bayti/categories/perfumes-candles.png", label: isArabic ? "شموع وعطور" : "Candles & Perfumes" },
              { icon: "/icons/bayti/categories/handmade-crafts.png", label: isArabic ? "مشغولات يدوية" : "Handmade Crafts" },
              { icon: "/icons/bayti/categories/clothing-abayas.png", label: isArabic ? "عبايات وأزياء" : "Abayas & Fashion" },
              { icon: "/icons/bayti/categories/accessories.png", label: isArabic ? "إكسسوارات" : "Accessories" },
              { icon: "/icons/bayti/categories/beauty-skincare.png", label: isArabic ? "عناية بالبشرة" : "Skincare" },
              { icon: "/icons/bayti/categories/makeup-beauty.png", label: isArabic ? "مكياج" : "Makeup" },
              { icon: "/icons/bayti/categories/home-decor.png", label: isArabic ? "لمسات منزلية" : "Home Decor" },
              { icon: "/icons/bayti/categories/desserts-sweets.png", label: isArabic ? "حلويات" : "Sweets" },
              { icon: "/icons/bayti/categories/home-cooked-meals.png", label: isArabic ? "وجبات منزلية" : "Home Meals" },
              { icon: "/icons/bayti/categories/baked-goods.png", label: isArabic ? "مخبوزات" : "Baked Goods" },
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
      <section className="py-20 px-4 bg-orange-500">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-orange-200 text-sm mb-3">
            {isArabic ? "🚀 مرحلة تجريبية — الإطلاق الرسمي قريباً" : "🚀 Beta phase — the official launch is coming soon"}
          </p>
          <h2 className="text-3xl font-bold text-white mb-3">
            {isArabic ? "سجّلي الآن لتكوني من الأوائل" : "Register now to be among the first"}
          </h2>
          <p className="text-orange-100 mb-8">
            {isArabic ? "التسجيل مجّاني. أضيفي منتجاتك اليوم. وحين نُطلق رسمياً ستكونين جاهزة تماماً." : "Registration is free. Add your products today and when we officially launch, you will be ready."}
          </p>
          <Link to="/seller-apply" className="inline-block bg-white text-orange-500 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-orange-50 transition">
            {isArabic ? "ابدأي الآن — مجّاناً" : "Start Now — Free"}
          </Link>
        </div>
      </section>
    </div>
  );
}
