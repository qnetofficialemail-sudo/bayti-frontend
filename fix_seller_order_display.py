path = r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\SellerDashboard.tsx'
content = open(path, encoding='utf-8').read()

old = '''              <div className="text-sm text-gray-500 mb-2">👤 {order.buyer?.full_name} · 📍 {order.delivery_area}</div>
              <div className="text-sm text-gray-600 mb-3">{order.items?.map((item: any) => `${item.quantity}x ${item.product?.name}`).join(", ")}</div>'''

new = '''              <div className="text-sm text-gray-500 mb-1">👤 {order.buyer?.full_name} {order.buyer?.phone ? `· 📞 ${order.buyer.phone}` : ""}</div>
              <div className="text-sm text-gray-500 mb-1">📍 {order.delivery_address} · {order.delivery_area}</div>
              {order.notes && <div className="text-sm text-orange-600 mb-1">📝 {order.notes}</div>}
              <div className="text-sm text-gray-600 mb-3">{order.items?.map((item: any) => `${item.quantity}x ${item.product?.name}`).join(", ")}</div>'''

if old in content:
    content = content.replace(old, new)
    open(path, 'w', encoding='utf-8').write(content)
    print("✅ Seller order display updated")
else:
    print("❌ Pattern not found")
    idx = content.find("delivery_area")
    print(repr(content[max(0,idx-200):idx+300]))
