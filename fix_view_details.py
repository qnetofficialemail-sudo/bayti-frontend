path = r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\AdminPanel.tsx'
content = open(path, encoding='utf-8').read()

# Add view details button right after the seller info div closes, before action buttons
old = '''                    <p className="text-sm text-gray-500">{seller.user.full_name} · {seller.user.email}</p>
                    <p className="text-sm text-gray-500">📍 {seller.area}, {seller.city} · ⭐ {seller.rating} · 📦 {seller.total_orders} {isArabic ? "طلب" : "orders"}</p>
                    {seller.badge_notes && <p className="text-xs text-orange-500 mt-1">📝 {seller.badge_notes}</p>}'''

new = '''                    <p className="text-sm text-gray-500">{seller.user.full_name} · {seller.user.email}</p>
                    <p className="text-sm text-gray-500">📍 {seller.area}, {seller.city} · ⭐ {seller.rating} · 📦 {seller.total_orders} {isArabic ? "طلب" : "orders"}</p>
                    {seller.badge_notes && <p className="text-xs text-orange-500 mt-1">📝 {seller.badge_notes}</p>}
                    <button onClick={() => setExpandedSeller(expandedSeller === seller.id ? null : seller.id)}
                      className="text-xs text-orange-500 hover:underline mt-2 inline-block">
                      {expandedSeller === seller.id ? "▲ Hide details" : "▼ View details"}
                    </button>'''

if old in content:
    content = content.replace(old, new)
    open(path, 'w', encoding='utf-8').write(content)
    print("✅ View details button added!")
else:
    # Try to find what's actually there
    idx = content.find('badge_notes && <p')
    if idx > 0:
        print("Found badge_notes at:", idx)
        print(repr(content[idx-100:idx+200]))
    else:
        print("❌ badge_notes pattern not found")
        # Search for the seller info section
        idx2 = content.find('seller.user.full_name')
        if idx2 > 0:
            print("Found full_name at:", idx2)
            print(repr(content[idx2-50:idx2+300]))
