import React from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { useLanguage } from "../context/LanguageContext";

const SECTIONS: { titleEn: string; titleAr: string; bodyEn: string[]; bodyAr: string[] }[] = [
  {
    titleEn: "What You'll Find",
    titleAr: "ماذا ستجدين",
    bodyEn: [
      "Handmade crafts",
      "Candles & perfumes",
      "Fashion, accessories & abayas",
      "Home cooking & sweets",
      "Skincare & beauty",
      "Home decor",
    ],
    bodyAr: [
      "مشغولات يدوية",
      "شموع وعطور",
      "أزياء وإكسسوارات وعبايات",
      "طعام منزلي وحلويات",
      "عناية بالبشرة والجمال",
      "لمسات منزلية",
    ],
  },
  {
    titleEn: "How It Works",
    titleAr: "كيف تعمل المنصة",
    bodyEn: [
      "Buyers browse products by category, message sellers directly, and place orders for local pickup or delivery.",
      "Sellers set up a shop profile, list products with AI-assisted descriptions, and track orders from a simple dashboard — connecting with buyers over WhatsApp.",
      "Every seller is reviewed before being approved to sell on Bayti.",
    ],
    bodyAr: [
      "يتصفح المشترون المنتجات حسب الفئة، ويتواصلون مع البائعات مباشرة، ويقومون بالطلب للاستلام المحلي أو التوصيل.",
      "تقوم البائعات بإعداد ملف المتجر، وإدراج المنتجات بوصف بمساعدة الذكاء الاصطناعي، ومتابعة الطلبات من لوحة تحكم بسيطة — والتواصل مع المشترين عبر واتساب.",
      "يتم مراجعة كل بائعة قبل الموافقة على البيع في بيتي.",
    ],
  },
  {
    titleEn: "Why Bayti",
    titleAr: "لماذا بيتي",
    bodyEn: [
      "Verified sellers, reviewed before approval.",
      "Fully bilingual — Arabic and English, built for the UAE.",
      "Covers all of the UAE: Dubai, Sharjah, Abu Dhabi, and more.",
    ],
    bodyAr: [
      "بائعات موثوقات، تتم مراجعتهن قبل الموافقة.",
      "ثنائية اللغة بالكامل — عربي وإنجليزي، مصممة للإمارات.",
      "تغطي جميع إمارات الدولة: دبي، الشارقة، أبوظبي وأكثر.",
    ],
  },
];

export default function About() {
  const { isArabic } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir={isArabic ? "rtl" : "ltr"}>
      <SEO
        title={isArabic ? "عن بيتي" : "About Bayti"}
        description={isArabic ? "بيتي هو سوق محلي في الإمارات يربط البائعات المنزليات بالمشترين." : "Bayti is a UAE local marketplace connecting home-based sellers with buyers."}
        url="/about"
      />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {isArabic ? "عن بيتي" : "About Bayti"}
      </h1>

      <p className="text-gray-700 mb-10 leading-relaxed text-lg">
        {isArabic
          ? "بيتي (Bayti) هو سوق محلي في الإمارات يربط البائعات المنزليات بالمشترين. سواء كنتِ تبحثين عن هدية فريدة أو منتج يدوي أو وجبة منزلية، بيتي يجمعك مباشرة بأصحاب المواهب في حيّك."
          : "Bayti is a local UAE marketplace connecting home-based sellers with buyers. Whether you're looking for a unique gift, a handmade product, or a home-cooked meal, Bayti connects you directly with talented sellers in your neighborhood."}
      </p>

      <div className="space-y-10">
        {SECTIONS.map((s, i) => (
          <section key={i}>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{isArabic ? s.titleAr : s.titleEn}</h2>
            <ul className="list-disc pl-5 rtl:pl-0 rtl:pr-5 space-y-2 text-gray-700 leading-relaxed">
              {(isArabic ? s.bodyAr : s.bodyEn).map((p, j) => <li key={j}>{p}</li>)}
            </ul>
          </section>
        ))}

        <section className="bg-cream-subtle border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <p className="text-gray-700 font-medium">
            {isArabic ? "جاهزة تبدئين البيع على بيتي؟" : "Ready to start selling on Bayti?"}
          </p>
          <div className="flex gap-3">
            <Link to="/marketplace" className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:border-primary-300 transition">
              {isArabic ? "تصفح المنتجات" : "Browse Products"}
            </Link>
            <Link to="/seller-apply" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              {isArabic ? "ابدئي البيع" : "Start Selling"}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
