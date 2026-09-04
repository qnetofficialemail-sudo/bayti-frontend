path = r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\AdminPanel.tsx'
content = open(path, encoding='utf-8').read()

# Update deleteUser to handle sellers too
old = '''  const deleteUser = async (user: any) => {
    if (!window.confirm(`⚠️ Permanently delete user "${user.full_name}" (${user.email})? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/users/${user.id}`);
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (e: any) {
      alert(e.response?.data?.detail || "Delete failed");
    }
  };'''

new = '''  const deleteUser = async (user: any) => {
    if (!window.confirm(`⚠️ Permanently delete "${user.full_name}" (${user.email}) and ALL their data? This cannot be undone.`)) return;
    try {
      if (user.role === "seller") {
        // Find seller profile id from sellers list
        const seller = sellers.find(s => s.user?.id === user.id);
        if (seller) {
          await api.delete(`/api/admin/sellers/${seller.id}`);
          setSellers(prev => prev.filter(s => s.id !== seller.id));
        } else {
          await api.delete(`/api/admin/users/${user.id}`);
        }
      } else {
        await api.delete(`/api/admin/users/${user.id}`);
      }
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (e: any) {
      alert(e.response?.data?.detail || "Delete failed");
    }
  };'''

# Also update Users tab to show Delete for sellers too (not just buyers)
old2 = '''                  {u.role === "buyer" && (
                    <button onClick={() => deleteUser(u)}
                      className="text-xs px-3 py-2 rounded-lg transition font-medium bg-red-700 text-white hover:bg-red-800">
                      🗑 {isArabic ? "حذف" : "Delete"}
                    </button>
                  )}'''

new2 = '''                  {(u.role === "buyer" || u.role === "seller") && (
                    <button onClick={() => deleteUser(u)}
                      className="text-xs px-3 py-2 rounded-lg transition font-medium bg-red-700 text-white hover:bg-red-800">
                      🗑 {isArabic ? "حذف" : "Delete"}
                    </button>
                  )}'''

if old in content and old2 in content:
    content = content.replace(old, new).replace(old2, new2)
    open(path, 'w', encoding='utf-8').write(content)
    print("✅ Fixed — sellers can now be deleted from Users tab too")
else:
    print("❌ Pattern not found")
    if old not in content:
        print("  - deleteUser function not found")
    if old2 not in content:
        print("  - buyer-only condition not found")
