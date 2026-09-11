import { useState, useEffect } from "react";

const BACKEND = "https://web-production-63685.up.railway.app";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  new:           { label: "جديد",        color: "text-gray-600",   bg: "bg-gray-100",   dot: "bg-gray-400" },
  contacted:     { label: "تم التواصل",  color: "text-blue-600",   bg: "bg-blue-100",   dot: "bg-blue-500" },
  replied:       { label: "ردّ",          color: "text-purple-600", bg: "bg-purple-100", dot: "bg-purple-500" },
  interested:    { label: "مهتم",        color: "text-orange-600", bg: "bg-orange-100", dot: "bg-orange-500" },
  confirmed:     { label: "مؤكد ✅",     color: "text-green-700",  bg: "bg-green-100",  dot: "bg-green-500" },
  not_interested:{ label: "غير مهتم",   color: "text-red-500",    bg: "bg-red-50",     dot: "bg-red-400" },
};

const OBJECTIONS = [
  { q: "ما الرسوم أو العمولة؟",                 a: "نحن في مرحلة الاستكشاف حالياً، والانضمام المبكر مجاني تماماً. هدفنا بناء التجربة معكم وتحديد الرسوم العادلة لاحقاً." },
  { q: "أبيع جيداً عبر إنستقرام، لماذا أحتاجكم؟", a: "بيتي ليست بديلاً لإنستقرام، بل قناة اكتشاف إضافية تضع منتجاتكم أمام جمهور يبحث خصيصاً عن المحلي." },
  { q: "ليس لدي وقت لإدارة منصة أخرى.",        a: "صممنا عملية الانضمام لتكون بسيطة جداً. نحن نتولى الجزء التقني، وكل ما تحتاجونه هو الموافقة على عرض منتجاتكم." },
  { q: "هل تضمنون لي المبيعات؟",               a: "لا نعد بمبيعات مضمونة، لكننا نوفر قناة اكتشاف وظهوراً احترافياً أمام جمهور مناسب." },
  { q: "هل المنصة جاهزة؟",                      a: "نحن نبني النسخة الأولى مع مجموعة محدودة من البائعين، ولهذا نبحث عن شركاء يشاركوننا الملاحظات قبل التوسع." },
  { q: "هل أحتاج تغيير طريقة عملي؟",           a: "لا. نبدأ بمعلومات المنتجات والصور والبيانات الأساسية، ونحاول جعل المشاركة بأقل جهد ممكن." },
];

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

export default function GrowthOSPage() {
  const [tab, setTab]               = useState<"brief"|"accounts"|"compose"|"objections">("brief");
  const [accounts, setAccounts]     = useState<Account[]>([]);
  const [stats, setStats]           = useState<Stats | null>(null);
  const [brief, setBrief]           = useState<string>("");
  const [briefLoading, setBriefLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedAcc, setSelectedAcc]   = useState<Account | null>(null);
  const [msgType, setMsgType]       = useState("first");
  const [genLoading, setGenLoading] = useState(false);
  const [generatedMsg, setGeneratedMsg] = useState("");
  const [copied, setCopied]         = useState(false);
  const [statusLoading, setStatusLoading] = useState<number | null>(null);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [newAcc, setNewAcc]         = useState({ username: "", display_name: "", category: "", emirate: "", product_note: "" });
  const [seeding, setSeeding]       = useState(false);
  const [expandedObj, setExpandedObj]   = useState<number | null>(null);
  const [objection, setObjection]   = useState("");

  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => { loadAccounts(); loadStats(); }, []);

  async function loadAccounts() {
    const res = await fetch(`${BACKEND}/api/growth/accounts`, { headers });
    if (res.ok) setAccounts(await res.json());
  }
  async function loadStats() {
    const res = await fetch(`${BACKEND}/api/growth/stats`, { headers });
    if (res.ok) setStats(await res.json());
  }
  async function loadBrief() {
    setBriefLoading(true);
    const res = await fetch(`${BACKEND}/api/growth/daily-brief`, { method: "POST", headers });
    if (res.ok) { const d = await res.json(); setBrief(d.brief); }
    setBriefLoading(false);
  }
  async function updateStatus(id: number, status: string) {
    setStatusLoading(id);
    await fetch(`${BACKEND}/api/growth/accounts/${id}`, { method: "PATCH", headers, body: JSON.stringify({ status }) });
    await loadAccounts(); await loadStats();
    setStatusLoading(null);
  }
  async function generateMessage() {
    if (!selectedAcc) return;
    setGenLoading(true); setGeneratedMsg("");
    const res = await fetch(`${BACKEND}/api/growth/generate-message`, {
      method: "POST", headers,
      body: JSON.stringify({ username: selectedAcc.username, display_name: selectedAcc.display_name, category: selectedAcc.category, product_note: selectedAcc.product_note, msg_type: msgType, objection }),
    });
    if (res.ok) { const d = await res.json(); setGeneratedMsg(d.message); }
    setGenLoading(false);
  }
  async function seedAccounts() {
    setSeeding(true);
    await fetch(`${BACKEND}/api/growth/seed-accounts`, { method: "POST", headers });
    await loadAccounts(); await loadStats();
    setSeeding(false);
  }
  async function addAccount() {
    await fetch(`${BACKEND}/api/growth/accounts`, { method: "POST", headers, body: JSON.stringify(newAcc) });
    setShowAddForm(false); setNewAcc({ username: "", display_name: "", category: "", emirate: "", product_note: "" });
    await loadAccounts(); await loadStats();
  }
  async function deleteAccount(id: number) {
    if (!confirm("حذف هذا الحساب؟")) return;
    await fetch(`${BACKEND}/api/growth/accounts/${id}`, { method: "DELETE", headers });
    await loadAccounts(); await loadStats();
  }
  function copyMsg(msg: string) {
    navigator.clipboard.writeText(msg);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const filtered = filterStatus === "all" ? accounts : accounts.filter(a => a.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">🚀 Bayti Growth OS</h1>
              <p className="text-orange-100 text-sm mt-0.5">نظام تشغيل النمو — استقطاب البائعين</p>
            </div>
            {stats && (
              <div className="flex items-center gap-6 text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.confirmed}</div>
                  <div className="text-xs text-orange-100">مؤكدون</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.goal}</div>
                  <div className="text-xs text-orange-100">الهدف</div>
                </div>
                <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                  <div className="text-xl font-bold">{stats.progress_pct}%</div>
                  <div className="text-xs text-orange-100">التقدم</div>
                </div>
              </div>
            )}
          </div>
          {/* Progress bar */}
          {stats && (
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${stats.progress_pct}%` }} />
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
              { label: "تواصلنا",    val: stats.contacted,     color: "text-blue-600" },
              { label: "ردوا",       val: stats.replied,       color: "text-purple-600" },
              { label: "مهتمون",     val: stats.interested,    color: "text-orange-600" },
              { label: "مؤكدون",     val: stats.confirmed,     color: "text-green-600" },
              { label: "⏰ متابعة اليوم", val: stats.due_today, color: "text-red-500" },
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
            { id: "objections", label: "💬 ردود الاعتراضات" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${tab === t.id ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ── Tab 1: Daily Brief ── */}
        {tab === "brief" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">🧠 التقرير اليومي الذكي</h2>
                <button onClick={loadBrief} disabled={briefLoading}
                  className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50">
                  {briefLoading ? "⏳ جارٍ التحليل..." : "✨ ولّد التقرير"}
                </button>
              </div>
              {brief ? (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 text-gray-700 leading-relaxed whitespace-pre-line border border-orange-100">
                  {brief}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">🧠</div>
                  <p>اضغط "ولّد التقرير" للحصول على توصيات Claude اليومية</p>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3">⏰ تحتاج متابعة اليوم</h3>
                {accounts.filter(a => a.status === "contacted").slice(0,5).map(a => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">@{a.username}</p>
                      <p className="text-xs text-gray-400">{a.category}</p>
                    </div>
                    <button onClick={() => { setSelectedAcc(a); setMsgType("followup1"); setTab("compose"); }}
                      className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-lg hover:bg-orange-200 transition">
                      تابع
                    </button>
                  </div>
                ))}
                {accounts.filter(a => a.status === "contacted").length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">لا يوجد متابعات اليوم ✅</p>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3">🎯 اقتراحات للتواصل اليوم</h3>
                {accounts.filter(a => a.status === "new").slice(0,5).map(a => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">@{a.username}</p>
                      <p className="text-xs text-gray-400">{a.category}</p>
                    </div>
                    <button onClick={() => { setSelectedAcc(a); setMsgType("first"); setTab("compose"); }}
                      className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-200 transition">
                      أرسل
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Accounts ── */}
        {tab === "accounts" && (
          <div className="space-y-4">
            {/* Filter + Add */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex gap-2 flex-wrap">
                {["all", "new", "contacted", "replied", "interested", "confirmed", "not_interested"].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${filterStatus === s ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300"}`}>
                    {s === "all" ? "الكل" : STATUS_CONFIG[s]?.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={seedAccounts} disabled={seeding}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl hover:bg-gray-200 transition">
                  {seeding ? "⏳" : "📥 استيراد القائمة"}
                </button>
                <button onClick={() => setShowAddForm(!showAddForm)}
                  className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-xl hover:bg-orange-600 transition">
                  + إضافة حساب
                </button>
              </div>
            </div>

            {/* Add form */}
            {showAddForm && (
              <div className="bg-white rounded-2xl p-5 border border-orange-200">
                <h3 className="font-bold text-gray-800 mb-3">إضافة حساب جديد</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "username", placeholder: "اسم المستخدم (بدون @)" },
                    { key: "display_name", placeholder: "اسم العلامة" },
                    { key: "category", placeholder: "الفئة (شموع، عبايات...)" },
                    { key: "emirate", placeholder: "الإمارة" },
                  ].map(f => (
                    <input key={f.key} value={(newAcc as any)[f.key]} onChange={e => setNewAcc({...newAcc, [f.key]: e.target.value})}
                      placeholder={f.placeholder} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
                  ))}
                  <input value={newAcc.product_note} onChange={e => setNewAcc({...newAcc, product_note: e.target.value})}
                    placeholder="ملاحظة عن المنتج" className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={addAccount} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium">إضافة</button>
                  <button onClick={() => setShowAddForm(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm">إلغاء</button>
                </div>
              </div>
            )}

            {/* Accounts list */}
            <div className="space-y-2">
              {filtered.map(acc => (
                <div key={acc.id} className="bg-white rounded-2xl border border-gray-100 hover:border-orange-200 transition overflow-hidden">
                  <div className="p-4 flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {acc.username[0].toUpperCase()}
                    </div>
                    {/* Info */}
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
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a href={`https://instagram.com/${acc.username}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-lg">
                        📱 إنستقرام
                      </a>
                      <button onClick={() => { setSelectedAcc(acc); setMsgType("first"); setTab("compose"); }}
                        className="text-xs bg-orange-100 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-200 transition">
                        ✍️ رسالة
                      </button>
                      <button onClick={() => deleteAccount(acc.id)}
                        className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition">
                        🗑
                      </button>
                    </div>
                  </div>
                  {/* Status changer */}
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
                  <button onClick={seedAccounts} className="mt-3 text-sm text-orange-500 underline">استيراد القائمة الأولية</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab 3: Compose ── */}
        {tab === "compose" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">✍️ مصنع الرسائل الذكي</h2>

              {/* Account selector */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">اختر الحساب</label>
                <select value={selectedAcc?.id || ""} onChange={e => {
                    const acc = accounts.find(a => a.id === parseInt(e.target.value));
                    setSelectedAcc(acc || null); setGeneratedMsg("");
                  }} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none">
                  <option value="">-- اختر حساباً --</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>@{a.username} — {a.category}</option>
                  ))}
                </select>
              </div>

              {/* Message type */}
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
                      className={`py-2.5 rounded-xl text-sm font-medium transition ${msgType === t.v ? "bg-orange-500 text-white" : "bg-gray-50 text-gray-600 hover:bg-orange-50"}`}>
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Objection input */}
              {msgType === "objection" && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">الاعتراض</label>
                  <input value={objection} onChange={e => setObjection(e.target.value)}
                    placeholder='مثال: "ليس لدي وقت"' className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none" />
                </div>
              )}

              <button onClick={generateMessage} disabled={!selectedAcc || genLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50">
                {genLoading ? "⏳ Claude يكتب الرسالة..." : "✨ ولّد الرسالة بالذكاء الاصطناعي"}
              </button>
            </div>

            {/* Generated message */}
            {generatedMsg && (
              <div className="bg-white rounded-2xl p-6 border border-green-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">الرسالة الجاهزة</h3>
                  <div className="flex gap-2">
                    <button onClick={() => copyMsg(generatedMsg)}
                      className={`text-sm px-4 py-1.5 rounded-xl font-medium transition ${copied ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600 hover:bg-orange-200"}`}>
                      {copied ? "✅ تم النسخ!" : "📋 نسخ"}
                    </button>
                    <button onClick={generateMessage}
                      className="text-sm px-4 py-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                      🔄 أعد التوليد
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-line border border-gray-100">
                  {generatedMsg}
                </div>
                {selectedAcc && (
                  <div className="mt-3 flex gap-2">
                    <a href={`https://instagram.com/${selectedAcc.username}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-center text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 rounded-xl font-medium">
                      📱 افتح الحساب على إنستقرام
                    </a>
                    <button onClick={() => updateStatus(selectedAcc.id, "contacted")}
                      className="flex-1 text-sm bg-blue-500 text-white py-2.5 rounded-xl font-medium hover:bg-blue-600 transition">
                      ✅ سجّل كـ "تم التواصل"
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 4: Objections ── */}
        {tab === "objections" && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-5 border border-orange-100 mb-4">
              <p className="text-sm text-gray-600 text-center">اضغط على أي اعتراض لرؤية الرد الجاهز — ثم انسخه بضغطة واحدة</p>
            </div>
            {OBJECTIONS.map((obj, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button onClick={() => setExpandedObj(expandedObj === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-right hover:bg-orange-50 transition">
                  <span className="font-medium text-gray-800 text-sm">{obj.q}</span>
                  <span className="text-gray-400 text-lg">{expandedObj === i ? "▲" : "▼"}</span>
                </button>
                {expandedObj === i && (
                  <div className="px-4 pb-4">
                    <div className="bg-green-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed border border-green-100 mb-3">
                      {obj.a}
                    </div>
                    <button onClick={() => copyMsg(obj.a)}
                      className="text-sm bg-orange-100 text-orange-600 px-4 py-2 rounded-xl hover:bg-orange-200 transition font-medium">
                      📋 نسخ الرد
                    </button>
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
