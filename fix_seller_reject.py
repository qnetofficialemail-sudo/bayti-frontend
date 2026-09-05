path = r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\SellerDashboard.tsx'
content = open(path, encoding='utf-8').read()

# Add rejectOrder before advanceOrder
old = '  advanceOrder = async (orderId: number, nextStatus: string) => {'
new = '''  rejectOrder = async (orderId: number) => {
    const confirmed = window.confirm(isArabic ? "هل تريد رفض هذا الطلب؟" : "Reject this order?");
    if (!confirmed) return;
    try {
      await api.patch(`/api/orders/${orderId}/reject`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "cancelled" } : o));
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to reject order");
    }
  };
  advanceOrder = async (orderId: number, nextStatus: string) => {'''

if old in content:
    content = content.replace(old, new)
    print("✅ rejectOrder function added")
else:
    print("❌ advanceOrder not found")

# Find and update the advance button area
idx = content.find('NEXT_STATUS[order.status]')
print(f"\nNEXT_STATUS context:")
print(repr(content[idx-50:idx+300]))
