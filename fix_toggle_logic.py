path = r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\AdminPanel.tsx'
content = open(path, encoding='utf-8').read()

old = '''  const toggleUser = async (user: any) => {
    if (user.role === "seller") {
      // For sellers, find their seller profile and use seller disable/approve endpoint
      const seller = sellers.find(s => s.user?.id === user.id);
      if (seller) {
        if (seller.is_approved) {
          await api.patch(`/api/admin/sellers/${seller.id}/disable`);
          setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, is_approved: false } : s));
        } else {
          await api.patch(`/api/admin/sellers/${seller.id}/approve`);
          setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, is_approved: true } : s));
        }
      }
    }
    await api.patch(`/api/admin/users/${user.id}/toggle`);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
  };'''

new = '''  const toggleUser = async (user: any) => {
    if (user.role === "seller") {
      const seller = sellers.find(s => s.user?.id === user.id);
      if (seller) {
        // Use user.is_active to decide: if currently active, disable; if inactive, approve
        if (user.is_active) {
          await api.patch(`/api/admin/sellers/${seller.id}/disable`);
          setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, is_approved: false } : s));
        } else {
          await api.patch(`/api/admin/sellers/${seller.id}/approve`);
          setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, is_approved: true } : s));
        }
      }
    }
    await api.patch(`/api/admin/users/${user.id}/toggle`);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
  };'''

if old in content:
    content = content.replace(old, new)
    open(path, 'w', encoding='utf-8').write(content)
    print("✅ Toggle logic fixed - now uses user.is_active")
else:
    print("❌ Pattern not found")
