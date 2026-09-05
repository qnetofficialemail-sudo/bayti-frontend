import os

FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'

# ── 1. Add routes to App.tsx ──
app_path = os.path.join(FRONTEND, 'src', 'App.tsx')
content = open(app_path, encoding='utf-8').read()

old_imports = 'import Landing from "./pages/Landing";'
new_imports = '''import Landing from "./pages/Landing";
import SellerApplyPage from "./pages/SellerApplyPage";
import SellerRegisterPage from "./pages/SellerRegisterPage";'''

old_route = '              <Route path="/shop/:id" element={<><Navbar /><SellerProfilePage /></>} />'
new_route = '''              <Route path="/shop/:id" element={<><Navbar /><SellerProfilePage /></>} />
              <Route path="/seller-apply" element={<><Navbar /><SellerApplyPage /></>} />
              <Route path="/seller-register" element={<><Navbar /><SellerRegisterPage /></>} />'''

if 'SellerApplyPage' not in content:
    content = content.replace(old_imports, new_imports)
    content = content.replace(old_route, new_route)
    open(app_path, 'w', encoding='utf-8').write(content)
    print("Done - routes added to App.tsx")
else:
    print("Skip - routes already added")

# ── 2. Add Applications tab to AdminPanel.tsx ──
admin_path = os.path.join(FRONTEND, 'src', 'pages', 'AdminPanel.tsx')
admin = open(admin_path, encoding='utf-8').read()

# Add applications state
old_state = '  const [expandedSeller, setExpandedSeller] = useState<number | null>(null);'
new_state = '''  const [expandedSeller, setExpandedSeller] = useState<number | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [appFilter, setAppFilter] = useState("pending");
  const [appActionLoading, setAppActionLoading] = useState<number | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);'''

if 'applications' not in admin:
    admin = admin.replace(old_state, new_state)
    print("Done - applications state added")
else:
    print("Skip - applications state already exists")

# Add applications fetch to loadData
old_fetch = '''        api.get("/api/reviews/admin/pending"),
      ]);'''
new_fetch = '''        api.get("/api/reviews/admin/pending"),
        api.get("/api/applications/admin/list"),
      ]);'''

old_set = '''      setPendingReviews(prods2.data);
      setManagedCategories(cats.data);'''
new_set = '''      setPendingReviews(prods2.data);
      setManagedCategories(cats.data);'''

# Fix the destructuring
old_destruct = '      const [s, sel, o, u, cs, prods, rev, cats, prods2] = await Promise.all(['
new_destruct = '      const [s, sel, o, u, cs, prods, rev, cats, prods2, apps] = await Promise.all(['

old_setapps = '''      setPendingReviews(prods2.data);
      setManagedCategories(cats.data);'''
new_setapps = '''      setPendingReviews(prods2.data);
      setManagedCategories(cats.data);
      setApplications(apps.data);'''

if 'apps.data' not in admin:
    admin = admin.replace(old_fetch, new_fetch)
    admin = admin.replace(old_destruct, new_destruct)
    admin = admin.replace(old_setapps, new_setapps)
    print("Done - applications fetch added to loadData")
else:
    print("Skip - applications fetch already exists")

# Add Applications tab button
old_tab_btn = '          { key: "categories", label: isArabic ? "الفئات" : "Categories", icon: "🏷️" },'
new_tab_btn = '''          { key: "categories", label: isArabic ? "الفئات" : "Categories", icon: "🏷️" },
          { key: "applications", label: isArabic ? `الطلبات${applications.filter(a => a.status === "pending").length > 0 ? \` (\${applications.filter(a => a.status === "pending").length})\` : ""}` : `Applications${applications.filter(a => a.status === "pending").length > 0 ? \` (\${applications.filter(a => a.status === "pending").length})\` : ""}`, icon: "📋" },'''

if 'applications' not in admin or 'key: "applications"' not in admin:
    if old_tab_btn in admin:
        admin = admin.replace(old_tab_btn, new_tab_btn)
        print("Done - Applications tab button added")
    else:
        print("FAIL - could not find categories tab button")

# Add Applications tab content before the closing Badge Modal comment
old_badge_modal = '      {/* Badge Modal */}'
new_applications_tab = '''      {/* Applications Tab */}
      {tab === "applications" && (
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            {[
              { key: "pending", label: isArabic ? "معلق" : "Pending" },
              { key: "approved", label: isArabic ? "موافق" : "Approved" },
              { key: "rejected", label: isArabic ? "مرفوض" : "Rejected" },
              { key: "all", label: isArabic ? "الكل" : "All" },
            ].map(f => (
              <button key={f.key} onClick={() => setAppFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${appFilter === f.key ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200"}`}>
                {f.label}
              </button>
            ))}
          </div>

          {inviteLink && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
              <p className="text-sm font-medium text-green-800 mb-2">✅ {isArabic ? "رابط التسجيل (أرسله للبائع):" : "Registration link (send this to the seller):"}</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-white border border-green-200 rounded-lg px-3 py-2 break-all">
                  {`${window.location.origin}${inviteLink}`}
                </code>
                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}${inviteLink}`); alert("Copied!"); }}
                  className="text-xs bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition flex-shrink-0">
                  📋 {isArabic ? "نسخ" : "Copy"}
                </button>
              </div>
              <button onClick={() => setInviteLink(null)} className="text-xs text-green-600 hover:underline mt-2 block">
                {isArabic ? "إخفاء" : "Dismiss"}
              </button>
            </div>
          )}

          {applications.filter(a => appFilter === "all" ? true : a.status === appFilter).length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <p>{isArabic ? "لا توجد طلبات" : "No applications"}</p>
            </div>
          ) : applications.filter(a => appFilter === "all" ? true : a.status === appFilter).map((app: any) => (
            <div key={app.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{app.full_name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      app.status === "pending" ? "bg-yellow-50 text-yellow-700" :
                      app.status === "approved" ? "bg-green-50 text-green-700" :
                      "bg-red-50 text-red-600"}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{app.email} · {app.phone}</p>
                  <p className="text-sm text-gray-500">📍 {app.area}, {app.city}</p>
                  <p className="text-sm text-gray-700 mt-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="font-medium text-gray-500 text-xs block mb-0.5">{isArabic ? "ماذا سيبيع:" : "What they sell:"}</span>
                    {app.what_they_sell}
                  </p>
                  {(app.doc_1_url || app.doc_2_url || app.doc_3_url) && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {[app.doc_1_url, app.doc_2_url, app.doc_3_url].filter(Boolean).map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                          className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition font-medium">
                          📄 {isArabic ? `مستند ${i + 1}` : `Document ${i + 1}`}
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">{new Date(app.created_at).toLocaleDateString()}</p>
                </div>
                {app.status === "pending" && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      disabled={appActionLoading === app.id}
                      onClick={async () => {
                        setAppActionLoading(app.id);
                        try {
                          const res = await api.patch(`/api/applications/admin/${app.id}/approve`);
                          setInviteLink(res.data.registration_link);
                          setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "approved", invite_token: res.data.invite_token } : a));
                        } catch (e: any) { alert(e.response?.data?.detail || "Failed"); }
                        setAppActionLoading(null);
                      }}
                      className="text-xs bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition disabled:opacity-60">
                      ✓ {isArabic ? "موافقة" : "Approve"}
                    </button>
                    <button
                      disabled={appActionLoading === app.id}
                      onClick={async () => {
                        setAppActionLoading(app.id);
                        try {
                          await api.patch(`/api/applications/admin/${app.id}/reject`);
                          setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "rejected" } : a));
                        } catch (e: any) { alert(e.response?.data?.detail || "Failed"); }
                        setAppActionLoading(null);
                      }}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition disabled:opacity-60">
                      ✕ {isArabic ? "رفض" : "Reject"}
                    </button>
                  </div>
                )}
                {app.status === "approved" && app.invite_token && (
                  <button onClick={() => setInviteLink(`/seller-register?token=${app.invite_token}`)}
                    className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-xl transition font-medium flex-shrink-0">
                    🔗 {isArabic ? "عرض الرابط" : "Show Link"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Badge Modal */}'''

if 'tab === "applications"' not in admin:
    if old_badge_modal in admin:
        admin = admin.replace(old_badge_modal, new_applications_tab)
        print("Done - Applications tab content added to AdminPanel")
    else:
        print("FAIL - could not find Badge Modal comment")
else:
    print("Skip - Applications tab already exists")

# Update tab type to include applications
old_type = '"overview"|"sellers"|"orders"|"users"|"commission"|"products"|"revenue"|"reviews"|"categories"'
new_type = '"overview"|"sellers"|"orders"|"users"|"commission"|"products"|"revenue"|"reviews"|"categories"|"applications"'
admin = admin.replace(old_type, new_type)

open(admin_path, 'w', encoding='utf-8').write(admin)
print("Done - AdminPanel.tsx updated")
