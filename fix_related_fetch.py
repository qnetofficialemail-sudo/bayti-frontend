path = r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\ProductDetail.tsx'
content = open(path, encoding='utf-8').read()

# Find the seller status fetch and add related products after it
old = "          api.get(`/api/sellers/${r.data.seller.id}/status`)\n            .then(s => setSellerOpen(s.data))\n            .catch(() => {});"
new = "          api.get(`/api/sellers/${r.data.seller.id}/status`)\n            .then(s => setSellerOpen(s.data)).catch(() => {});\n          api.get('/api/products/', { params: { seller_id: r.data.seller.id } })\n            .then(rel => setRelated(rel.data.filter((p: any) => p.id !== Number(id)).slice(0, 3))).catch(() => {});"

if old in content:
    content = content.replace(old, new)
    open(path, 'w', encoding='utf-8').write(content)
    print("✅ Fixed!")
else:
    print("❌ Not found, showing context:")
    idx = content.find("setSellerOpen")
    print(repr(content[max(0,idx-100):idx+200]))
