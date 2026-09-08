import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import SEO from "../components/SEO";

const STEPS = [
  {
    num: "١", numEn: "1",
    title: "سجّلي مجاناً", titleEn: "Register free",
    desc: "أنشئي حسابك في دقيقتين. لا رسوم، لا عقود.", descEn: "Create your account in 2 minutes. No fees, no contracts.",
  },
  {
    num: "٢", numEn: "2",
    title: "أضيفي منتجاتك", titleEn: "Add your products",
    desc: "صوّري منتجاتك والذكاء الاصطناعي يكتب لك الوصف تلقائياً.", descEn: "Photo your products and AI writes the description automatically.",
  },
  {
    num: "٣", numEn: "3",
    title: "استلمي طلباتك", titleEn: "Receive your orders",
    desc: "تنبيه فوري عند كل طلب. تواصل مع الزبون عبر واتساب مباشرة.", descEn: "Instant alert for every order. Contact buyers via WhatsApp directly.",
  },
];

const FEATURES = [
  { icon: "🤖", title: "ذكاء اصطناعي يكتب عنك", titleEn: "AI writes for you", desc: "صوّري منتجك وبيتي يكتب الاسم والوصف والسعر المقترح تلقائياً بالعربي والانجليزي.", descEn: "Photo your product and Bayti auto-writes name, description and suggested price in Arabic and English." },
  { icon: "📊", title: "لوحة تحكم كاملة", titleEn: "Full dashboard", desc: "شوفي طلباتك، منتجاتك، تقييماتك وأرباحك في مكان واحد.", descEn: "See your orders, products, reviews and earnings in one place." },
  { icon: "🗓", title: "حددي أوقات عملك", titleEn: "Set your schedule", desc: "اختاري الأيام والأوقات اللي تناسبك. لا طلبات خارج أوقاتك.", descEn: "Choose the days and hours that suit you. No orders outside your hours." },
  { icon: "💬", title: "تواصل مباشر بالواتساب", titleEn: "Direct WhatsApp contact", desc: "كل طلب فيه زر واتساب للتواصل مع الزبون مباشرة بدون وسيط.", descEn: "Every order has a WhatsApp button to contact the buyer directly." },
  { icon: "⭐", title: "تقييمات تبني ثقتك", titleEn: "Reviews build your trust", desc: "الزباين يقيّمون وتقييماتك تظهر على متجرك وتجيب زباين جدد.", descEn: "Customers review you and your ratings appear on your store to attract new buyers." },
  { icon: "🇦🇪", title: "عربي وإنجليزي", titleEn: "Arabic & English", desc: "الموقع بالكامل باللغتين. منتجاتك تظهر للعرب والأجانب في الإمارات.", descEn: "The entire site is bilingual. Your products appear to both Arabic and English speakers in the UAE." },
];

const HOW_IT_WORKS = [
  {
    icon: "🛍️",
    title: "الزبون يطلب", titleEn: "Customer orders",
    desc: "الزبون يختار منتجك ويملأ بياناته (الاسم، رقم الهاتف، منطقة التوصيل) ويضغط طلب.",
    descEn: "The customer selects your product, fills in their details (name, phone, delivery area) and places the order.",
  },
  {
    icon: "🔔",
    title: "تنبيه فوري لك", titleEn: "Instant alert to you",
    desc: "تصلك رسالة فورية بتفاصيل الطلب. تقدرين تتواصلين مع الزبون عبر واتساب لتأكيد الموعد.",
    descEn: "You get an instant message with order details. You can contact the buyer via WhatsApp to confirm timing.",
  },
  {
    icon: "🚗",
    title: "التوصيل", titleEn: "Delivery",
    desc: "أنتِ تحددين طريقة التوصيل — إما توصّلين بنفسك أو الزبون يمر يستلم. تحددين رسوم التوصيل لكل إمارة بنفسك.",
    descEn: "You decide delivery — either you deliver yourself or the buyer picks up. You set your own delivery fees per emirate.",
  },
  {
    icon: "💵",
    title: "الدفع", titleEn: "Payment",
    desc: "الدفع نقداً عند الاستلام. الزبون يدفع لك مباشرة. بيتي تأخذ عمولة صغيرة فقط على الطلبات المكتملة.",
    descEn: "Payment is cash on delivery. The buyer pays you directly. Bayti takes a small commission only on completed orders.",
  },
];

const FAQS = [
  { q: "هل التسجيل مجاني؟", qEn: "Is registration free?", a: "نعم تماماً. لا رسوم شهرية ولا رسوم إدراج منتجات. نأخذ فقط عمولة صغيرة على كل طلب مكتمل.", aEn: "Yes completely. No monthly fees, no listing fees. We only take a small commission on each completed order." },
  { q: "هل أحتاج سجل تجاري؟", qEn: "Do I need a trade license?", a: "لا. بيتي للبائعات المنزليات. لا نشترط سجل تجاري للبدء.", aEn: "No. Bayti is for home sellers. We don't require a trade license to start." },
  { q: "من يوصّل الطلبات؟", qEn: "Who delivers the orders?", a: "أنتِ تختارين — إما توصّلين بنفسك أو الزبون يمر يستلم. تحددين رسوم التوصيل لكل إمارة.", aEn: "You choose — either you deliver yourself or the buyer picks up. You set delivery fees per emirate." },
  { q: "كيف أستلم فلوسي؟", qEn: "How do I receive my money?", a: "الدفع نقداً عند الاستلام مباشرة. الزبون يدفع لك عند وصول المنتج.", aEn: "Cash on delivery directly. The buyer pays you when the product arrives." },
  { q: "متى يصير اللانش الرسمي؟", qEn: "When is the official launch?", a: "الموقع حالياً في مرحلة تجريبية. اللانش الرسمي قريباً. اللي تسجّل الآن يكون من أوائل البائعات ويحصل على ميزات إضافية.", aEn: "The site is currently in beta. Official launch is coming soon. Those who register now will be among the first sellers and get extra benefits." },
];

export default function SellPage() {
  const { isArabic } = useLanguage();
  const dir = isArabic ? "rtl" : "ltr";

  return (
    <div dir={dir} className="min-h-screen bg-white">
      <SEO
        title={isArabic ? "بيعي من البيت — بيتي" : "Sell from Home — Bayti"}
        description={isArabic ? "حوّلي موهبتك إلى دخل. سجّلي مجاناً وابدأي البيع لزباين في كل الإمارات." : "Turn your talent into income. Register free and start selling to customers across the UAE."}
      />

      {/* Beta Banner */}
      <div className="bg-amber-50 border-b border-amber-200 py-3 px-4 text-center">
        <p className="text-amber-800 text-sm font-medium">
          {isArabic
            ? "🚀 بيتي حالياً في مرحلة تجريبية — اللانش الرسمي قريباً. سجّلي الآن وكوني من أوائل البائعات وأحصلي على مميزات حصرية!"
            : "🚀 Bayti is currently in beta — official launch coming soon. Register now and be among the first sellers for exclusive benefits!"}
        </p>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-orange-50 to-white pt-14 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block bg-orange-100 text-orange-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            {isArabic ? "للبائعات المنزليات في الإمارات" : "For UAE home sellers"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {isArabic ? (<>موهبتك تستحق<br /><span className="text-orange-500">أكثر من الانستقرام</span></>) : (<>Your talent deserves<br /><span className="text-orange-500">more than Instagram</span></>)}
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
            {isArabic ? "بيتي سوق إماراتي للبائعات المنزليات — بدون رسوم شهرية، بدون سجل تجاري، بدون تعقيد." : "Bayti is a UAE marketplace for home sellers — no monthly fees, no trade license, no complexity."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/seller-apply" className="bg-orange-500 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200">
              {isArabic ? "سجّلي الآن — مجاناً" : "Register Now — Free"}
            </Link>
            <Link to="/marketplace" className="bg-white text-gray-700 font-medium px-8 py-4 rounded-2xl text-lg border border-gray-200 hover:border-orange-300 transition">
              {isArabic ? "تصفّحي السوق أولاً" : "Browse marketplace first"}
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-5">
            {isArabic ? "✨ من تسجّل الآن تحصل على أولوية في الظهور عند اللانش الرسمي" : "✨ Early registrants get priority visibility at official launch"}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { num: "٠ رسوم", numEn: "0 Fees", label: isArabic ? "تسجيل وإدراج منتجات" : "registration & listing" },
            { num: "24 ساعة", numEn: "24 hrs", label: isArabic ? "من التسجيل للبدء" : "from signup to live" },
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
            {isArabic ? "إيش تحصلين عليه؟" : "What do you get?"}
          </h2>
          <p className="text-center text-gray-500 mb-12">
            {isArabic ? "كل ما تحتاجينه لتبيعي بثقة" : "Everything you need to sell with confidence"}
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
            {isArabic ? "كيف يشتغل السوق؟" : "How does it work?"}
          </h2>
          <p className="text-center text-gray-500 mb-12">
            {isArabic ? "من الطلب إلى الدفع — كل شي واضح" : "From order to payment — everything clear"}
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
            {isArabic ? "ثلاث خطوات وتبدأين" : "Three steps and you're live"}
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
            {isArabic ? "إيش تقدرين تبيعين؟" : "What can you sell?"}
          </h2>
          <p className="text-gray-500 mb-8">
            {isArabic ? "كل ما تصنعينه بيديكِ أو تبيعينه من البيت" : "Anything you make by hand or sell from home"}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: "/icons/bayti/categories/perfumes-candles.png", label: isArabic ? "شموع وعطور" : "Candles & Perfumes" },
              { icon: "/icons/bayti/categories/handmade-crafts.png", label: isArabic ? "مشغولات يدوية" : "Handmade Crafts" },
              { icon: "/icons/bayti/categories/clothing-abayas.png", label: isArabic ? "عبايات وأزياء" : "Abayas & Fashion" },
              { icon: "/icons/bayti/categories/accessories.png", label: isArabic ? "إكسسوارات" : "Accessories" },
              { icon: "/icons/bayti/categories/beauty-skincare.png", label: isArabic ? "عناية بالبشرة" : "Skincare" },
              { icon: "/icons/bayti/categories/makeup-beauty.png", label: isArabic ? "مكياج" : "Makeup" },
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
            {isArabic ? "🚀 مرحلة تجريبية — اللانش الرسمي قريباً" : "🚀 Beta phase — official launch coming soon"}
          </p>
          <h2 className="text-3xl font-bold text-white mb-3">
            {isArabic ? "سجّلي الآن وكوني من الأوائل" : "Register now and be among the first"}
          </h2>
          <p className="text-orange-100 mb-8">
            {isArabic ? "التسجيل مجاني. أضيفي منتجاتك اليوم. لما نطلق رسمياً تكونين جاهزة." : "Free registration. Add your products today. When we officially launch you'll be ready."}
          </p>
          <Link to="/seller-apply" className="inline-block bg-white text-orange-500 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-orange-50 transition">
            {isArabic ? "ابدأي الآن — مجاناً" : "Start Now — Free"}
          </Link>
        </div>
      </section>
    </div>
  );
}
