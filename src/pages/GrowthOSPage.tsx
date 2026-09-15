import { useState, useEffect } from "react";

const BACKEND = "https://web-production-63685.up.railway.app";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  new:           { label: "جديد",        color: "text-gray-600",   bg: "bg-gray-100",   dot: "bg-gray-400" },
  contacted:     { label: "تم التواصل",  color: "text-info",   bg: "bg-info-tint",   dot: "bg-info" },
  replied:       { label: "ردّ",          color: "text-purple-600", bg: "bg-purple-100", dot: "bg-purple-500" },
  interested:    { label: "مهتم",        color: "text-primary-600", bg: "bg-primary-100", dot: "bg-primary-500" },
  confirmed:     { label: "مؤكد ✅",     color: "text-success",  bg: "bg-success-tint",  dot: "bg-success" },
  not_interested:{ label: "غير مهتم",   color: "text-error",    bg: "bg-error-tint",     dot: "bg-error" },
};

interface Account {
  id: number; username: string; display_name: string; category: string;
  emirate: string; product_note: string; status: string; notes: string;
  last_message: string; contacted_at: string | null;
}
interface Stats {
  total: number; new: number; contacted: number; replied: number;
  interested: number; confirmed: number; not_interested: number;
  due_today: number; goal: number; progress_pct: number;
}

export default function GrowthOSPage({ embedded = false }: { embedded?: boolean }) {
  const [unlocked, setUnlocked]       = useState(false);
  const [pin, setPin]                 = useState("");
  const [pinError, setPinError]       = useState(false);
  const [tab, setTab]                 = useState<"brief"|"accounts"|"compose"|"proposal"|"objections">("brief");
  const [accounts, setAccounts]       = useState<Account[]>([]);
  const [stats, setStats]             = useState<Stats | null>(null);
  const [brief, setBrief]             = useState<string>("");
  const [briefLoading, setBriefLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedAcc, setSelectedAcc]   = useState<Account | null>(null);
  const [msgType, setMsgType]         = useState("first");
  const [genLoading, setGenLoading]   = useState(false);
  const [generatedMsg, setGeneratedMsg] = useState("");
  const [copied, setCopied]           = useState(false);
  const [statusLoading, setStatusLoading] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAcc, setNewAcc]           = useState({ username: "", display_name: "", category: "", emirate: "", product_note: "" });
  const [seeding, setSeeding]         = useState(false);
  const [expandedObj, setExpandedObj] = useState<number | null>(null);
  const [objection, setObjection]     = useState("");
  const [proposalAcc, setProposalAcc]         = useState<Account | null>(null);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalHtml, setProposalHtml]       = useState("");
  const [proposalFilename, setProposalFilename] = useState("");
  const [proposalError, setProposalError]     = useState("");
  const [proposalCopied, setProposalCopied]   = useState(false);
  const [proposalLang, setProposalLang]       = useState<"en"|"ar">("ar");

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  };

  useEffect(() => { loadAccounts(); loadStats(); }, []);

  async function loadAccounts() {
    const res = await fetch(`${BACKEND}/api/growth/accounts`, { headers: getHeaders() });
    if (res.ok) setAccounts(await res.json());
  }
  async function loadStats() {
    const res = await fetch(`${BACKEND}/api/growth/stats`, { headers: getHeaders() });
    if (res.ok) setStats(await res.json());
  }
  async function loadBrief() {
    setBriefLoading(true);
    const res = await fetch(`${BACKEND}/api/growth/daily-brief`, { method: "POST", headers: getHeaders() });
    if (res.ok) { const d = await res.json(); setBrief(d.brief); }
    setBriefLoading(false);
  }
  async function updateStatus(id: number, status: string) {
    setStatusLoading(id);
    await fetch(`${BACKEND}/api/growth/accounts/${id}`, { method: "PATCH", headers: getHeaders(), body: JSON.stringify({ status }) });
    await loadAccounts(); await loadStats();
    setStatusLoading(null);
  }
  async function generateMessage() {
    if (!selectedAcc) return;
    setGenLoading(true); setGeneratedMsg("");
    const res = await fetch(`${BACKEND}/api/growth/generate-message`, {
      method: "POST", headers: getHeaders(),
      body: JSON.stringify({ username: selectedAcc.username, display_name: selectedAcc.display_name, category: selectedAcc.category, product_note: selectedAcc.product_note, msg_type: msgType, objection }),
    });
    if (res.ok) { const d = await res.json(); setGeneratedMsg(d.message); }
    setGenLoading(false);
  }
  async function generateProposal(acc: Account) {
    setProposalAcc(acc); setProposalLoading(true); setProposalHtml(""); setProposalError(""); setProposalCopied(false);
    try {
      const res = await fetch(`${BACKEND}/api/ai/generate-proposal`, {
        method: "POST", headers: getHeaders(),
        body: JSON.stringify({ account_id: acc.id, language: proposalLang }),
      });
      if (res.ok) {
        const d = await res.json();
        setProposalHtml(d.html_content);
        setProposalFilename(d.suggested_filename);
      } else {
        const err = await res.json().catch(() => ({}));
        setProposalError(err.detail || "تعذّر توليد العرض");
      }
    } catch {
      setProposalError("تعذّر الاتصال بالخادم");
    }
    setProposalLoading(false);
  }
  function copyProposalHtml() {
    if (!proposalHtml) return;
    navigator.clipboard.writeText(proposalHtml);
    setProposalCopied(true); setTimeout(() => setProposalCopied(false), 2000);
  }
  async function seedAccounts() {
    setSeeding(true);
    const res = await fetch(`${BACKEND}/api/growth/seed-accounts`, { method: "POST", headers: getHeaders() });
    const data = await res.json().catch(() => ({}));
    console.log("Seed result:", data);
    await loadAccounts(); await loadStats();
    setSeeding(false);
  }
  async function addAccount() {
    await fetch(`${BACKEND}/api/growth/accounts`, { method: "POST", headers: getHeaders(), body: JSON.stringify(newAcc) });
    setShowAddForm(false); setNewAcc({ username: "", display_name: "", category: "", emirate: "", product_note: "" });
    await loadAccounts(); await loadStats();
  }
  async function deleteAccount(id: number) {
    if (!window.confirm("حذف هذا الحساب؟")) return;
    await fetch(`${BACKEND}/api/growth/accounts/${id}`, { method: "DELETE", headers: getHeaders() });
    await loadAccounts(); await loadStats();
  }
  function copyMsg(msg: string) {
    navigator.clipboard.writeText(msg);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const OBJECTIONS = [
    { q: "ما الرسوم أو العمولة؟",                   a: "نحن في مرحلة الاستكشاف حالياً، والانضمام المبكر مجاني تماماً. هدفنا بناء التجربة معكم وتحديد الرسوم العادلة لاحقاً." },
    { q: "أبيع جيداً عبر إنستقرام، لماذا أحتاجكم؟", a: "بيتي ليست بديلاً لإنستقرام، بل قناة اكتشاف إضافية تضع منتجاتكم أمام جمهور يبحث خصيصاً عن المحلي." },
    { q: "ليس لدي وقت لإدارة منصة أخرى.",           a: "صممنا عملية الانضمام لتكون بسيطة جداً. نحن نتولى الجزء التقني، وكل ما تحتاجونه هو الموافقة على عرض منتجاتكم." },
    { q: "هل تضمنون لي المبيعات؟",                   a: "لا نعد بمبيعات مضمونة، لكننا نوفر قناة اكتشاف وظهوراً احترافياً أمام جمهور مناسب." },
    { q: "هل المنصة جاهزة؟",                          a: "نحن نبني النسخة الأولى مع مجموعة محدودة من البائعين، ولهذا نبحث عن شركاء يشاركوننا الملاحظات قبل التوسع." },
    { q: "هل أحتاج تغيير طريقة عملي؟",               a: "لا. نبدأ بمعلومات المنتجات والصور والبيانات الأساسية، ونحاول جعل المشاركة بأقل جهد ممكن." },
    { q: "لست مهتمة الآن.",                           a: "نحترم ذلك تماماً. يسعدنا التواصل معكم مستقبلاً عندما يكون الوقت مناسباً." },
  ];

  const filtered = filterStatus === "all" ? accounts : accounts.filter(a => a.status === filterStatus);

  // PIN Protection
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-50 flex items-center justify-center" dir="rtl">
        <div className="bg-white rounded-2xl p-8 border border-primary-100 shadow-lg w-full max-w-sm text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">Bayti Growth OS</h1>
          <p className="text-gray-400 text-sm mb-6">ادخل رمز الوصول</p>
          <input type="password" value={pin}
            onChange={e => { setPin(e.target.value); setPinError(false); }}
            onKeyDown={e => { if (e.key === "Enter") { if (pin === "bayti2026") { setUnlocked(true); } else { setPinError(true); setPin(""); } } }}
            placeholder="••••••••"
            className={`w-full text-center text-lg border-2 rounded-xl px-4 py-3 focus:outline-none mb-3 transition ${pinError ? "border-error bg-error-tint" : "border-gray-200 focus:border-primary-400"}`}
            autoFocus />
          {pinError && <p className="text-error text-sm mb-3">رمز الوصول غير صحيح</p>}
          <button onClick={() => { if (pin === "bayti2026") { setUnlocked(true); } else { setPinError(true); setPin(""); } }}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-500 text-white py-3 rounded-xl font-bold hover:opacity-90 transition">
            دخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-500 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">🚀 Bayti Growth OS</h1>
              <p className="text-primary-100 text-sm mt-0.5">نظام تشغيل النمو — استقطاب البائعين</p>
            </div>
            {stats && (
              <div className="flex items-center gap-6 text-white">
                <div className="text-center"><div className="text-2xl font-bold">{stats.confirmed}</div><div className="text-xs text-primary-100">مؤكدون</div></div>
                <div className="text-center"><div className="text-2xl font-bold">{stats.goal}</div><div className="text-xs text-primary-100">الهدف</div></div>
                <div className="bg-white/20 rounded-xl px-4 py-2 text-center"><div className="text-xl font-bold">{stats?.progress_pct ?? 0}%</div><div className="text-xs text-primary-100">التقدم</div></div>
              </div>
            )}
          </div>
          {stats && (
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${stats?.progress_pct ?? 0}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* Stats strip */}
      {stats && (
        <div className="bg-white border-b border-gray-100 px-6 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-6 overflow-x-auto">
            {[
              { label: "الكل",       val: stats.total,         color: "text-gray-700" },
              { label: "جدد",        val: stats.new,           color: "text-gray-500" },
              { label: "تواصلنا",    val: stats.contacted,     color: "text-info" },
              { label: "ردوا",       val: stats.replied,       color: "text-purple-600" },
              { label: "مهتمون",     val: stats.interested,    color: "text-primary-600" },
              { label: "مؤكدون",     val: stats.confirmed,     color: "text-success" },
              { label: "⏰ متابعة اليوم", val: stats.due_today, color: "text-error" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`text-lg font-bold ${s.color}`}>{s.val}</span>
                <span className="text-xs text-gray-400">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-6">
        <div className="max-w-5xl mx-auto flex gap-1">
          {[
            { id: "brief",      label: "🧠 التقرير اليومي" },
            { id: "accounts",   label: "🎯 غرفة العمليات" },
            { id: "compose",    label: "✍️ مصنع الرسائل" },
            { id: "proposal",   label: "📄 توليد Proposal" },
            { id: "objections", label: "💬 ردود الاعتراضات" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${tab === t.id ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Tab 1: Daily Brief */}
        {tab === "brief" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-primary-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">🧠 التقرير اليومي الذكي</h2>
                <button onClick={loadBrief} disabled={briefLoading} className="bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition disabled:opacity-50">
                  {briefLoading ? "⏳ جارٍ التحليل..." : "✨ ولّد التقرير"}
                </button>
              </div>
              {brief ? (
                <div className="bg-gradient-to-br from-primary-50 to-primary-50 rounded-xl p-5 text-gray-700 leading-relaxed whitespace-pre-line border border-primary-100">{brief}</div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">🧠</div>
                  <p>اضغط "ولّد التقرير" للحصول على توصيات Claude اليومية</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3">⏰ تحتاج متابعة اليوم</h3>
                {accounts.filter(a => a.status === "contacted").slice(0,5).map(a => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div><p className="text-sm font-medium text-gray-800">@{a.username}</p><p className="text-xs text-gray-400">{a.category}</p></div>
                    <button onClick={() => { setSelectedAcc(a); setMsgType("followup1"); setTab("compose"); }} className="text-xs bg-primary-100 text-primary-600 px-3 py-1 rounded-lg hover:bg-primary-200 transition">تابع</button>
                  </div>
                ))}
                {accounts.filter(a => a.status === "contacted").length === 0 && <p className="text-sm text-gray-400 text-center py-4">لا يوجد متابعات اليوم ✅</p>}
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3">🎯 اقتراحات للتواصل اليوم</h3>
                {accounts.filter(a => a.status === "new").slice(0,5).map(a => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div><p className="text-sm font-medium text-gray-800">@{a.username}</p><p className="text-xs text-gray-400">{a.category}</p></div>
                    <button onClick={() => { setSelectedAcc(a); setMsgType("first"); setTab("compose"); }} className="text-xs bg-info-tint text-info px-3 py-1 rounded-lg hover:bg-info-tint transition">أرسل</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Accounts */}
        {tab === "accounts" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex gap-2 flex-wrap">
                {["all", "new", "contacted", "replied", "interested", "confirmed", "not_interested"].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${filterStatus === s ? "bg-primary-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300"}`}>
                    {s === "all" ? "الكل" : STATUS_CONFIG[s]?.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={seedAccounts} disabled={seeding} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl hover:bg-gray-200 transition">{seeding ? "⏳" : "📥 استيراد القائمة"}</button>
                <button onClick={() => setShowAddForm(!showAddForm)} className="text-xs bg-primary-500 text-white px-3 py-1.5 rounded-xl hover:bg-primary-600 transition">+ إضافة حساب</button>
              </div>
            </div>

            {showAddForm && (
              <div className="bg-white rounded-2xl p-5 border border-primary-200">
                <h3 className="font-bold text-gray-800 mb-3">إضافة حساب جديد</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "username", placeholder: "اسم المستخدم (بدون @)" },
                    { key: "display_name", placeholder: "اسم العلامة" },
                    { key: "category", placeholder: "الفئة (شموع، عبايات...)" },
                    { key: "emirate", placeholder: "الإمارة" },
                  ].map(f => (
                    <input key={f.key} value={(newAcc as any)[f.key]} onChange={e => setNewAcc({...newAcc, [f.key]: e.target.value})}
                      placeholder={f.placeholder} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-primary-400 focus:outline-none" />
                  ))}
                  <input value={newAcc.product_note} onChange={e => setNewAcc({...newAcc, product_note: e.target.value})}
                    placeholder="ملاحظة عن المنتج" className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-primary-400 focus:outline-none" />
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={addAccount} className="bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium">إضافة</button>
                  <button onClick={() => setShowAddForm(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm">إلغاء</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {filtered.map(acc => (
                <div key={acc.id} className="bg-white rounded-2xl border border-gray-100 hover:border-primary-200 transition overflow-hidden">
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {acc.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800">@{acc.username}</span>
                        {acc.display_name && <span className="text-gray-400 text-sm">{acc.display_name}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[acc.status]?.bg} ${STATUS_CONFIG[acc.status]?.color}`}>
                          {STATUS_CONFIG[acc.status]?.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                        {acc.category && <span>📂 {acc.category}</span>}
                        {acc.emirate && <span>📍 {acc.emirate}</span>}
                        {acc.product_note && <span className="truncate max-w-xs">💡 {acc.product_note}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a href={`https://www.instagram.com/${acc.username}/`} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-lg">📱 إنستقرام</a>
                      <button onClick={() => { setSelectedAcc(acc); setMsgType("first"); setTab("compose"); }}
                        className="text-xs bg-primary-100 text-primary-600 px-3 py-1.5 rounded-lg hover:bg-primary-200 transition">✍️ رسالة</button>
                      <button onClick={() => deleteAccount(acc.id)} className="text-xs text-error hover:text-error px-2 py-1.5 rounded-lg hover:bg-error-tint transition">🗑</button>
                    </div>
                  </div>
                  <div className="px-4 pb-3 flex items-center gap-2">
                    <span className="text-xs text-gray-400">الحالة:</span>
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <button key={key} onClick={() => updateStatus(acc.id, key)} disabled={statusLoading === acc.id}
                          className={`text-xs px-2 py-1 rounded-lg transition ${acc.status === key ? `${cfg.bg} ${cfg.color} font-bold` : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}>
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">📭</div>
                  <p>لا يوجد حسابات في هذه الفئة</p>
                  <button onClick={seedAccounts} className="mt-3 text-sm text-primary-500 underline">استيراد القائمة الأولية</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Compose */}
        {tab === "compose" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">✍️ مصنع الرسائل الذكي</h2>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">اختر الحساب</label>
                <select value={selectedAcc?.id || ""} onChange={e => { const acc = accounts.find(a => a.id === parseInt(e.target.value)); setSelectedAcc(acc || null); setGeneratedMsg(""); }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none">
                  <option value="">-- اختر حساباً --</option>
                  {accounts.map(a => (<option key={a.id} value={a.id}>@{a.username} — {a.category}</option>))}
                </select>
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">نوع الرسالة</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: "first",     l: "📩 أولى" },
                    { v: "followup1", l: "🔔 متابعة أولى" },
                    { v: "followup2", l: "👋 متابعة أخيرة" },
                    { v: "objection", l: "💬 رد اعتراض" },
                  ].map(t => (
                    <button key={t.v} onClick={() => setMsgType(t.v)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition ${msgType === t.v ? "bg-primary-500 text-white" : "bg-gray-50 text-gray-600 hover:bg-primary-50"}`}>
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>
              {msgType === "objection" && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">الاعتراض</label>
                  <input value={objection} onChange={e => setObjection(e.target.value)} placeholder='مثال: "ليس لدي وقت"'
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none" />
                </div>
              )}
              <button onClick={generateMessage} disabled={!selectedAcc || genLoading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-500 text-white py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50">
                {genLoading ? "⏳ Claude يكتب الرسالة..." : "✨ ولّد الرسالة بالذكاء الاصطناعي"}
              </button>
            </div>

            {generatedMsg && (
              <div className="bg-white rounded-2xl p-6 border border-success-tint">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">الرسالة الجاهزة</h3>
                  <div className="flex gap-2">
                    <button onClick={() => copyMsg(generatedMsg)}
                      className={`text-sm px-4 py-1.5 rounded-xl font-medium transition ${copied ? "bg-success-tint text-success" : "bg-primary-100 text-primary-600 hover:bg-primary-200"}`}>
                      {copied ? "✅ تم النسخ!" : "📋 نسخ"}
                    </button>
                    <button onClick={generateMessage} className="text-sm px-4 py-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition">🔄 أعد التوليد</button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-line border border-gray-100">{generatedMsg}</div>
                {selectedAcc && (
                  <div className="mt-3 flex gap-2">
                    <a href={`https://www.instagram.com/${selectedAcc.username}/`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-center text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 rounded-xl font-medium">📱 افتح الحساب على إنستقرام</a>
                    <button onClick={() => updateStatus(selectedAcc.id, "contacted")}
                      className="flex-1 text-sm bg-info text-white py-2.5 rounded-xl font-medium hover:bg-info transition">✅ سجّل كـ "تم التواصل"</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab: Proposal Generator */}
        {tab === "proposal" && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">📄 توليد عرض Proposal</h2>
                <p className="text-xs text-gray-400 mt-1">اختر حساباً لتوليد صفحة عرض HTML مخصصة بالذكاء الاصطناعي، بناءً على قالب auntyzkitchen.html</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-gray-400">لغة العرض:</span>
                  <div className="flex gap-1">
                    <button onClick={() => setProposalLang("en")}
                      className={`text-xs px-3 py-1 rounded-lg font-medium transition ${proposalLang === "en" ? "bg-primary-500 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
                      English
                    </button>
                    <button onClick={() => setProposalLang("ar")}
                      className={`text-xs px-3 py-1 rounded-lg font-medium transition ${proposalLang === "ar" ? "bg-primary-500 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
                      العربية
                    </button>
                  </div>
                </div>
              </div>
              <div className="max-h-[560px] overflow-y-auto divide-y divide-gray-50">
                {accounts.map(acc => (
                  <button key={acc.id} onClick={() => generateProposal(acc)}
                    disabled={proposalLoading}
                    className={`w-full flex items-center gap-3 p-3 text-right hover:bg-primary-50 transition disabled:opacity-50 ${proposalAcc?.id === acc.id ? "bg-primary-50" : ""}`}>
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-400 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {acc.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 text-sm">@{acc.username}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[acc.status]?.bg} ${STATUS_CONFIG[acc.status]?.color}`}>
                          {STATUS_CONFIG[acc.status]?.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 truncate">{acc.category}{acc.emirate ? ` · ${acc.emirate}` : ""}</div>
                    </div>
                    {proposalLoading && proposalAcc?.id === acc.id && <span className="text-xs text-primary-500 flex-shrink-0">⏳</span>}
                  </button>
                ))}
                {accounts.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-sm">لا يوجد حسابات — أضيفي حسابات من تبويب "غرفة العمليات"</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              {proposalLoading ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-3xl mb-3">⏳</div>
                  <p className="text-sm">Claude يكتب عرضاً مخصصاً لـ @{proposalAcc?.username}...</p>
                </div>
              ) : proposalError ? (
                <div className="text-center py-16 text-error">
                  <div className="text-3xl mb-3">⚠️</div>
                  <p className="text-sm">{proposalError}</p>
                </div>
              ) : proposalHtml && proposalAcc ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">عرض @{proposalAcc.username}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        الرابط النهائي بعد الرفع: <span className="font-mono text-primary-600">bayti.ink/p/{proposalAcc.username}</span>
                      </p>
                    </div>
                    <button onClick={copyProposalHtml}
                      className={`text-sm px-4 py-1.5 rounded-xl font-medium transition ${proposalCopied ? "bg-success-tint text-success" : "bg-primary-100 text-primary-600 hover:bg-primary-200"}`}>
                      {proposalCopied ? "✅ تم النسخ!" : "📋 نسخ HTML"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2 border border-gray-100">
                    الصقي الكود في ملف جديد باسم <span className="font-mono">{proposalFilename}</span> داخل مجلد <span className="font-mono">bayti-proposals</span>، ثم ارفعيه إلى <span className="font-mono">public/p/</span> على المستودع.
                  </p>
                  <div className="border border-gray-200 rounded-xl overflow-hidden" style={{ height: 500 }}>
                    <iframe title="proposal-preview" srcDoc={proposalHtml} className="w-full h-full" sandbox="allow-same-origin" />
                  </div>
                  <button onClick={() => generateProposal(proposalAcc)} className="w-full text-sm bg-gray-100 text-gray-600 py-2.5 rounded-xl hover:bg-gray-200 transition">🔄 أعد التوليد</button>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-3xl mb-3">📄</div>
                  <p className="text-sm">اختاري حساباً من القائمة لتوليد عرض Proposal له</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Objections */}
        {tab === "objections" && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-5 border border-primary-100 mb-4">
              <p className="text-sm text-gray-600 text-center">اضغط على أي اعتراض لرؤية الرد الجاهز — ثم انسخه بضغطة واحدة</p>
            </div>
            {OBJECTIONS.map((obj, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button onClick={() => setExpandedObj(expandedObj === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-right hover:bg-primary-50 transition">
                  <span className="font-medium text-gray-800 text-sm">{obj.q}</span>
                  <span className="text-gray-400 text-lg">{expandedObj === i ? "▲" : "▼"}</span>
                </button>
                {expandedObj === i && (
                  <div className="px-4 pb-4">
                    <div className="bg-success-tint rounded-xl p-4 text-sm text-gray-700 leading-relaxed border border-success-tint mb-3">{obj.a}</div>
                    <button onClick={() => copyMsg(obj.a)} className="text-sm bg-primary-100 text-primary-600 px-4 py-2 rounded-xl hover:bg-primary-200 transition font-medium">📋 نسخ الرد</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
