# Fix 1: Navbar - add Admin link
content = open('src/components/Navbar.tsx', encoding='utf-8').read()

if 'role === "admin"' not in content:
    content = content.replace(
        '{user.role === "seller" && <Link to="/seller/dashboard"',
        '{user.role === "admin" && <Link to="/admin" className="text-sm text-gray-600 hover:text-orange-500 px-3 py-2 rounded-lg hover:bg-orange-50 transition">{isArabic ? "الإدارة" : "Admin"}</Link>}\n              {user.role === "seller" && <Link to="/seller/dashboard"'
    )
    open('src/components/Navbar.tsx', 'w', encoding='utf-8').write(content)
    print("Navbar updated with Admin link")
else:
    print("Admin link already in Navbar")

# Fix 2: Home.tsx - fix "0" showing on untracked products
content = open('src/pages/Home.tsx', encoding='utf-8').read()
content = content.replace(
    '{product.track_stock && product.stock_quantity <= 3 && product.stock_quantity > 0 && (',
    '{product.track_stock === 1 && product.stock_quantity >= 0 && product.stock_quantity <= 3 && product.stock_quantity > 0 && ('
)
# Fix the stock badge function too
content = content.replace(
    'if (!product.track_stock) return null;',
    'if (!product.track_stock || product.track_stock === 0) return null;'
)
open('src/pages/Home.tsx', 'w', encoding='utf-8').write(content)
print("Home.tsx stock badge fixed")

print("\nAll fixes applied!")
