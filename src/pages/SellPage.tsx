import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import SEO from "../components/SEO";

const STEPS = [
  {
    num: "١",
    numEn: "1",
    title: "سجّلي مجاناً",
    titleEn: "Register free",
    desc: "أنشئي حسابك في دقيقتين. لا رسوم، لا عقود.",
    descEn: "Create your account in 2 minutes. No fees, no contracts.",
  },
  {
    num: "٢",
    numEn: "2",
    title: "أضيفي منتجاتك",
    titleEn: "Add your products",
    desc: "صوّري منتجاتك والذكاء الاصطناعي يكتب لك الوصف تلقائياً.",
    descEn: "Photo your products and AI writes the description automatically.",
  },
  {
    num: "٣",
    numEn: "3",
    title: "استلمي طلباتك",
    titleEn: "Receive your orders",
    desc: "تنبيه فوري عند كل طلب. تواصل مع الزبون عبر واتساب مباشرة.",
    descEn: "Instant alert for every order. Contact buyers via WhatsApp directly.",
  },
];

const TESTIMONIALS = [
  {
    name: "نور العنزي",
    nameEn: "Nour Al-Anazi",
    shop: "Noor Scents",
    text: "أنا أم لثلاثة أطفال وما كنت أتخيل إني أبيع من البيت. بيتي خلّت ذلك ممكناً.",
    textEn: "I'm a mother of three and never imagined selling from home. Bayti made it possible.",
    earned: "AED 2,400",
    month: "الشهر الماضي",
    monthEn: "last month",
  },
  {
    name: "ليلى الراشدي",
    nameEn: "Layla Al-Rashdi",
    shop: "Layla Accessories",
    text: "زباين جدد كل أسبوع من دبي والشارقة وأبوظبي. ما توقعت وصولي ينتشر بهالسرعة.",
    textEn: "New customers every week from Dubai, Sharjah and Abu Dhabi. Didn't expect my reach to grow this fast.",
    earned: "AED 1,800",
    month: "الشهر الماضي",
    monthEn: "last month",
  },
];

const FAQS = [
  {
    q: "هل التسجيل مجاني؟",
    qEn: "Is registration free?",
    a: "نعم، التسجيل مجاني تماماً. نأخذ فقط عمولة صغيرة على كل طلب مكتمل.",
    aEn: "Yes, registration is completely free. We only take a small commission on each completed order.",
  },
  {
    q: "هل أحتاج سجل تجاري؟",
    qEn: "Do I need a trade license?",
    a: "لا. بيتي للبائعين المنزليين. لا نشترط سجل تجاري للبدء.",
    aEn: "No. Bayti is for home sellers. We don't require a trade license to start.",
  },
  {
    q: "كيف أستلم فلوسي؟",
    qEn: "How do I receive my money?",
    a: "الدفع يتم عند الاستلام. الزبون يدفع لك مباشرة عند وصول الطلب.",
    aEn: "Payment is on delivery. The buyer pays you directly when the order arrives.",
  },
  {
    q: "من يوصّل الطلبات؟",
    qEn: "Who delivers the orders?",
    a: "تقدرين توصّلين بنفسك أو تتفقين مع الزبون على طريقة الاستلام.",
    aEn: "You can deliver yourself or arrange pickup with the customer.",
  },
];

export default function SellPage() {
  const { isArabic } = useLanguage();
  const dir = isArabic ? "rtl" : "ltr";

  return (
    <div dir={dir} className="min-h-screen bg-white">
      <SEO
        title={isArabic ? "بيعي من البيت — بيتي" : "Sell from Home — Bayti"}
        description={isArabic
          ? "حوّلي موهبتك إلى دخل. سجّلي مجاناً وابدأي البيع لزباين في كل الإمارات."
          : "Turn your talent into income. Register free and start selling to customers across the UAE."}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-orange-50 to-white pt-16 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block bg-orange-100 text-orange-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            {isArabic ? "للبائعات المنزليات في الإمارات" : "For UAE home sellers"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {isArabic ? (
              <>موهبتك تستحق<br /><span className="text-orange-500">أكثر من الانستقرام</span></>
            ) : (
              <>Your talent deserves<br /><span className="text-orange-500">more than Instagram</span></>
            )}
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
            {isArabic
              ? "بيتي سوق إماراتي للبائعات المنزليات — بدون رسوم شهرية، بدون سجل تجاري، بدون تعقيد."
              : "Bayti is a UAE marketplace for home sellers — no monthly fees, no trade license, no complexity."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/seller-apply"
              className="bg-orange-500 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200">
              {isArabic ? "ابدأي البيع — مجاناً" : "Start Selling — Free"}
            </Link>
            <Link to="/marketplace"
              className="bg-white text-gray-700 font-medium px-8 py-4 rounded-2xl text-lg border border-gray-200 hover:border-orange-300 transition">
              {isArabic ? "تصفّحي السوق أولاً" : "Browse the marketplace first"}
            </Link>
          </div>
          {/* Trust line */}
          <p className="text-sm text-gray-400 mt-5">
            {isArabic ? "انضمت 5+ بائعات هذا الشهر" : "5+ sellers joined this month"}
          </p>
        </div>
      </section>

      {/* Earnings showcase */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-gray-400 text-sm mb-10">
            {isArabic ? "بائعاتنا يكسبن" : "Our sellers earn"}
          </p>
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { num: "AED 1,200+", label: isArabic ? "متوسط الدخل الشهري" : "avg monthly income" },
              { num: "٠ رسوم", label: isArabic ? "تسجيل وإدراج منتجات" : "registration & listing" },
              { num: "24 ساعة", label: isArabic ? "من التسجيل للبيع" : "from signup to selling" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-bold text-orange-400 mb-1">{s.num}</p>
                <p className="text-gray-400 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
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
                  <p className="font-bold text-gray-900 text-lg mb-1">
                    {isArabic ? step.title : step.titleEn}
                  </p>
                  <p className="text-gray-500">
                    {isArabic ? step.desc : step.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/seller-apply"
              className="inline-block bg-orange-500 text-white font-bold px-10 py-4 rounded-2xl text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200">
              {isArabic ? "سجّلي الآن" : "Register Now"}
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-orange-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            {isArabic ? "بائعاتنا يتكلمن" : "Our sellers speak"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
                <p className="text-gray-700 mb-4 leading-relaxed">
                  "{isArabic ? t.text : t.textEn}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{isArabic ? t.name : t.nameEn}</p>
                    <p className="text-sm text-gray-400">{t.shop}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-500">{t.earned}</p>
                    <p className="text-xs text-gray-400">{isArabic ? t.month : t.monthEn}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you can sell */}
      <section className="py-16 px-4">
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
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 text-sm font-medium text-gray-700">
                <img src={c.icon} alt="" aria-hidden="true" className="w-8 h-8 object-contain" />
                {c.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-50">
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
          <h2 className="text-3xl font-bold text-white mb-3">
            {isArabic ? "جاهزة تبدأين؟" : "Ready to start?"}
          </h2>
          <p className="text-orange-100 mb-8">
            {isArabic
              ? "التسجيل مجاني. لا بطاقة ائتمانية. لا التزامات."
              : "Free registration. No credit card. No commitments."}
          </p>
          <Link to="/seller-apply"
            className="inline-block bg-white text-orange-500 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-orange-50 transition">
            {isArabic ? "ابدأي الآن — مجاناً" : "Start Now — Free"}
          </Link>
        </div>
      </section>
    </div>
  );
}
