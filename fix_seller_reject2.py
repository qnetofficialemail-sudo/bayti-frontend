path = r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\SellerDashboard.tsx'
content = open(path, encoding='utf-8').read()

# Fix 1: Add rejectOrder function
old1 = '  advanceOrder = async (orderId: number, nextStatus: string) => {\n    await api.patch(`/api/orders/${orderId}/status`, null, { params: { status: nextStatus } });\n    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));\n  };'

new1 = '''  rejectOrder = async (orderId: number) => {
    const confirmed = window.confirm(isArabic ? "هل تريد رفض هذا الطلب؟" : "Reject this order?");
    if (!confirmed) return;
    try {
      await api.patch(`/api/orders/${orderId}/reject`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "cancelled" } : o));
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to reject order");
    }
  };
  advanceOrder = async (orderId: number, nextStatus: string) => {
    await api.patch(`/api/orders/${orderId}/status`, null, { params: { status: nextStatus } });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
  };'''

# Fix 2: Add reject button next to advance button
old2 = '{NEXT_STATUS[order.status] && (\n                <button onClick={() => advanceOrder(order.id, NEXT_STATUS[order.status])} className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition font-medium">'
new2 = '''{!["delivered", "cancelled"].includes(order.status) && (
                  <button onClick={() => rejectOrder(order.id)}
                    className="text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl transition font-medium">
                    {isArabic ? "✕ رفض" : "✕ Reject"}
                  </button>
                )}
                {NEXT_STATUS[order.status] && (
                <button onClick={() => advanceOrder(order.id, NEXT_STATUS[order.status])} className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition font-medium">'''

for old, new, label in [(old1, new1, "rejectOrder function"), (old2, new2, "reject button")]:
    if old in content:
        content = content.replace(old, new)
        print(f"✅ {label}")
    else:
        print(f"❌ {label} not found")

open(path, 'w', encoding='utf-8').write(content)
