path = r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\SellerDashboard.tsx'
content = open(path, encoding='utf-8').read()

# Find advanceOrder and add rejectOrder before it
old = '  const advanceOrder = async (orderId: number, nextStatus: string) => {'
new = '''  const rejectOrder = async (orderId: number) => {
    const confirmed = window.confirm(isArabic ? "هل تريد رفض هذا الطلب؟" : "Reject this order?");
    if (!confirmed) return;
    try {
      await api.patch(`/api/orders/${orderId}/reject`);
      setOrders((prev: any[]) => prev.map(o => o.id === orderId ? { ...o, status: "cancelled" } : o));
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to reject order");
    }
  };

  const advanceOrder = async (orderId: number, nextStatus: string) => {'''

if old in content:
    content = content.replace(old, new)
    open(path, 'w', encoding='utf-8').write(content)
    print("✅ rejectOrder added inside component")
else:
    print("❌ advanceOrder not found")
    idx = content.find('advanceOrder')
    print(repr(content[max(0,idx-50):idx+100]))
