import React from "react";
import SEO from "../components/SEO";
import { useLanguage } from "../context/LanguageContext";

const LAST_UPDATED = { en: "September 15, 2026", ar: "15 سبتمبر 2026" };

const SECTIONS: { titleEn: string; titleAr: string; bodyEn: string[]; bodyAr: string[] }[] = [
  {
    titleEn: "Information We Collect",
    titleAr: "المعلومات التي نجمعها",
    bodyEn: [
      "Account information: your name, email address, phone number, and password when you register as a buyer or seller.",
      "Seller information: shop name, description, area/city, WhatsApp number, Instagram handle, and the product photos you upload.",
      "Order information: items purchased, delivery address, order status, and messages exchanged with a seller about an order.",
      "Usage information: pages you visit, device and browser type, and approximate location, collected automatically as you use Bayti.",
    ],
    bodyAr: [
      "معلومات الحساب: اسمك، بريدك الإلكتروني، رقم هاتفك، وكلمة المرور عند التسجيل كمشترٍ أو بائعة.",
      "معلومات البائعة: اسم المتجر، الوصف، المنطقة/المدينة، رقم الواتساب، حساب الإنستغرام، وصور المنتجات التي تقومين برفعها.",
      "معلومات الطلبات: المنتجات المشتراة، عنوان التوصيل، حالة الطلب، والرسائل المتبادلة مع البائعة بخصوص الطلب.",
      "معلومات الاستخدام: الصفحات التي تزورها، نوع الجهاز والمتصفح، والموقع التقريبي، ويتم جمعها تلقائياً أثناء استخدامك لبيتي.",
    ],
  },
  {
    titleEn: "Product Images (Cloudinary)",
    titleAr: "صور المنتجات (Cloudinary)",
    bodyEn: [
      "Product and shop photos you upload are stored and served through Cloudinary, a third-party media hosting service. Cloudinary processes these images on our behalf — resizing and delivering them — and does not use them for any purpose of its own.",
    ],
    bodyAr: [
      "يتم تخزين صور المنتجات والمتجر التي تقومين برفعها وعرضها عبر Cloudinary، وهي خدمة استضافة وسائط تابعة لجهة خارجية. تقوم Cloudinary بمعالجة هذه الصور نيابة عنا — بتغيير حجمها وعرضها — ولا تستخدمها لأي غرض خاص بها.",
    ],
  },
  {
    titleEn: "Analytics & Cookies (Google Analytics 4)",
    titleAr: "التحليلات وملفات تعريف الارتباط (Google Analytics 4)",
    bodyEn: [
      "We use Google Analytics 4 to understand how people use Bayti — which pages are visited, how searches are used, and which features are popular — so we can improve the marketplace. GA4 uses cookies and collects device, browser, and approximate location data; it does not receive your name, email, or phone number.",
      "You can limit this by disabling cookies in your browser settings or using a browser extension that blocks analytics scripts.",
    ],
    bodyAr: [
      "نستخدم Google Analytics 4 لفهم كيفية استخدام الأشخاص لبيتي — الصفحات التي تتم زيارتها، وكيفية استخدام البحث، والميزات الأكثر استخداماً — لنتمكن من تحسين المنصة. تستخدم أداة GA4 ملفات تعريف الارتباط وتجمع بيانات الجهاز والمتصفح والموقع التقريبي، ولا تحصل على اسمك أو بريدك الإلكتروني أو رقم هاتفك.",
      "يمكنك تقليل ذلك عبر تعطيل ملفات تعريف الارتباط في إعدادات متصفحك أو استخدام إضافة متصفح تحظر أدوات التحليل.",
    ],
  },
  {
    titleEn: "How We Use Your Information",
    titleAr: "كيف نستخدم معلوماتك",
    bodyEn: [
      "To operate your account and connect buyers with sellers for orders.",
      "To send order updates and, where you've agreed, WhatsApp messages related to your order.",
      "To keep Bayti secure and prevent fraud or abuse.",
      "To understand usage patterns and improve the marketplace.",
    ],
    bodyAr: [
      "لتشغيل حسابك وربط المشترين بالبائعات لإتمام الطلبات.",
      "لإرسال تحديثات الطلبات، وعند موافقتك، رسائل واتساب متعلقة بطلبك.",
      "للحفاظ على أمان بيتي ومنع الاحتيال أو إساءة الاستخدام.",
      "لفهم أنماط الاستخدام وتحسين المنصة.",
    ],
  },
  {
    titleEn: "How We Share Your Information",
    titleAr: "كيف نشارك معلوماتك",
    bodyEn: [
      "With the seller or buyer involved in an order, so they can fulfill and communicate about it.",
      "With service providers who support Bayti's operation, namely Cloudinary (image hosting) and Google Analytics (usage analytics).",
      "We do not sell your personal information to third parties.",
    ],
    bodyAr: [
      "مع البائعة أو المشتري المعني بالطلب، حتى يتمكنا من تنفيذه والتواصل بخصوصه.",
      "مع مزودي الخدمات الذين يدعمون تشغيل بيتي، وهما Cloudinary (استضافة الصور) و Google Analytics (تحليلات الاستخدام).",
      "نحن لا نبيع معلوماتك الشخصية لأي طرف ثالث.",
    ],
  },
  {
    titleEn: "Data Retention & Security",
    titleAr: "الاحتفاظ بالبيانات وأمانها",
    bodyEn: [
      "We keep your account and order data for as long as your account is active, or as needed to meet legal and accounting obligations. We use reasonable technical safeguards to protect your data, but no online service can guarantee perfect security.",
    ],
    bodyAr: [
      "نحتفظ ببيانات حسابك وطلباتك طالما أن حسابك نشط، أو حسب الحاجة للوفاء بالالتزامات القانونية والمحاسبية. نستخدم إجراءات حماية تقنية معقولة لحماية بياناتك، لكن لا يمكن لأي خدمة إلكترونية ضمان أمان مطلق.",
    ],
  },
  {
    titleEn: "Your Rights",
    titleAr: "حقوقك",
    bodyEn: [
      "You can ask us to access, correct, or delete your personal information at any time by contacting us below. You can also update most of your account and shop details directly from your profile settings.",
    ],
    bodyAr: [
      "يمكنك أن تطلبي منا الوصول إلى معلوماتك الشخصية أو تصحيحها أو حذفها في أي وقت من خلال التواصل معنا أدناه. كما يمكنك تحديث معظم بيانات حسابك ومتجرك مباشرة من إعدادات ملفك الشخصي.",
    ],
  },
  {
    titleEn: "Children's Privacy",
    titleAr: "خصوصية الأطفال",
    bodyEn: ["Bayti is not intended for children under 18. We do not knowingly collect information from children."],
    bodyAr: ["بيتي غير مخصصة للأطفال دون سن 18 عاماً. نحن لا نجمع معلومات من الأطفال عن علم."],
  },
  {
    titleEn: "Changes to This Policy",
    titleAr: "التغييرات على هذه السياسة",
    bodyEn: ["We may update this policy from time to time. We'll update the date below when we do."],
    bodyAr: ["قد نقوم بتحديث هذه السياسة من وقت لآخر. سنقوم بتحديث التاريخ أدناه عند القيام بذلك."],
  },
];

export default function PrivacyPolicy() {
  const { isArabic } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir={isArabic ? "rtl" : "ltr"}>
      <SEO
        title={isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
        description={isArabic ? "سياسة الخصوصية الخاصة بمنصة بيتي." : "Bayti's privacy policy: what we collect, how we use it, and your rights."}
        url="/privacy-policy"
      />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        {isArabic ? `آخر تحديث: ${LAST_UPDATED.ar}` : `Last updated: ${LAST_UPDATED.en}`}
      </p>

      <p className="text-gray-700 mb-10 leading-relaxed">
        {isArabic
          ? "بيتي هي سوق محلي في الإمارات يربط البائعات المنزليات بالمشترين. تشرح هذه السياسة المعلومات التي نجمعها منك، وكيف نستخدمها ونشاركها، وحقوقك بخصوصها."
          : "Bayti is a local UAE marketplace connecting home-based sellers with buyers. This policy explains what information we collect from you, how we use and share it, and your rights over it."}
      </p>

      <div className="space-y-10">
        {SECTIONS.map((s, i) => (
          <section key={i}>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{isArabic ? s.titleAr : s.titleEn}</h2>
            {(isArabic ? s.bodyAr : s.bodyEn).length > 1 ? (
              <ul className="list-disc pl-5 rtl:pl-0 rtl:pr-5 space-y-2 text-gray-700 leading-relaxed">
                {(isArabic ? s.bodyAr : s.bodyEn).map((p, j) => <li key={j}>{p}</li>)}
              </ul>
            ) : (
              <p className="text-gray-700 leading-relaxed">{(isArabic ? s.bodyAr : s.bodyEn)[0]}</p>
            )}
          </section>
        ))}

        <section className="bg-cream-subtle border border-gray-100 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">{isArabic ? "تواصل معنا" : "Contact Us"}</h2>
          <p className="text-gray-700 leading-relaxed">
            {isArabic
              ? "لأي أسئلة حول هذه السياسة أو لطلب الوصول إلى بياناتك أو تصحيحها أو حذفها، يرجى التواصل معنا على:"
              : "For questions about this policy, or to request access to, correction of, or deletion of your data, contact us at:"}
          </p>
          <a href="mailto:privacy@bayti.ink" className="inline-block mt-2 text-primary-500 font-medium hover:underline" dir="ltr">
            privacy@bayti.ink
          </a>
        </section>
      </div>
    </div>
  );
}
