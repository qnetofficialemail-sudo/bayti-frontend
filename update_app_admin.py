import os

# Update App.tsx
content = open('src/App.tsx', encoding='utf-8').read()
content = content.replace(
    "import Orders from './pages/Orders';",
    "import Orders from './pages/Orders';\nimport AdminPanel from './pages/AdminPanel';"
)
content = content.replace(
    "<Route path=\"/seller/products/new\" element={<AddProduct />} />",
    "<Route path=\"/seller/products/new\" element={<AddProduct />} />\n            <Route path=\"/admin\" element={<AdminPanel />} />"
)
open('src/App.tsx', 'w', encoding='utf-8').write(content)
print("✅ App.tsx updated")

# Update Navbar
content = open('src/components/Navbar.tsx', encoding='utf-8').read()
if 'role === "admin"' not in content:
    content = content.replace(
        '{user.role === "seller" && <Link to="/seller/dashboard"',
        '{user.role === "admin" && <Link to="/admin" className="text-sm text-gray-600 hover:text-orange-500 px-3 py-2 rounded-lg hover:bg-orange-50 transition">{isArabic ? "الإدارة" : "Admin"}</Link>}\n              {user.role === "seller" && <Link to="/seller/dashboard"'
    )
    open('src/components/Navbar.tsx', 'w', encoding='utf-8').write(content)
    print("✅ Navbar.tsx updated")
else:
    print("✅ Navbar already has admin link")

print("\nAll done!")
