path = r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\ProductDetail.tsx'
content = open(path, encoding='utf-8').read()

old = '''useEffect(() => {
    api.get(`/api/products/${id}`)'''

new = '''useEffect(() => {
    if (user) {
      api.get("/api/auth/me/address").then(r => setSavedAddress(r.data)).catch(() => {});
    }
    api.get(`/api/products/${id}`)'''

if old in content:
    content = content.replace(old, new)
    open(path, 'w', encoding='utf-8').write(content)
    print("✅ Address fetch added to useEffect")
else:
    print("❌ Pattern not found")
