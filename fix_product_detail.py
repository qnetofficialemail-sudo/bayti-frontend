content = open(r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\ProductDetail.tsx', encoding='utf-8').read()

# Fix useEffect to also fetch seller status
old = '''  useEffect(() => {
    api.get(`/api/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id]);'''

new = '''  useEffect(() => {
    api.get(`/api/products/${id}`)
      .then(r => {
        setProduct(r.data);
        if (r.data?.seller?.id) {
          api.get(`/api/sellers/${r.data.seller.id}/status`)
            .then(s => setSellerOpen(s.data))
            .catch(() => {});
        }
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id]);'''

content = content.replace(old, new)

# Add seller status banner before the order form and disable button when closed
old2 = '''          {!user && (
            <div className="bg-orange-50 text-orange-700 text-sm px-4 py-3 rounded-xl mb-4">
              <Link to="/login" className="font-medium underline">{isArabic ? "سجل الدخول" : "Sign in"}</Link>
              {isArabic ? " لتقديم طلب" : " to place an order"}
            </div>
          )}
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}'''

new2 = '''          {/* Seller schedule status banner */}
          {sellerOpen && !sellerOpen.is_open && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
              <span>🔴</span>
              <span>
                {isArabic ? "لا تقبل طلبات الآن" : "Not accepting orders right now"}
                {sellerOpen.message ? ` · ${sellerOpen.message}` : ""}
              </span>
            </div>
          )}
          {sellerOpen && sellerOpen.is_open && sellerOpen.reason !== "always_open" && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
              <span>🟢</span>
              <span>{isArabic ? "تقبل الطلبات الآن" : "Accepting orders now"}</span>
              {sellerOpen.message ? <span className="text-green-600">· {sellerOpen.message}</span> : null}
            </div>
          )}

          {!user && (
            <div className="bg-orange-50 text-orange-700 text-sm px-4 py-3 rounded-xl mb-4">
              <Link to="/login" className="font-medium underline">{isArabic ? "سجل الدخول" : "Sign in"}</Link>
              {isArabic ? " لتقديم طلب" : " to place an order"}
            </div>
          )}
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}'''

content = content.replace(old2, new2)

# Disable order button when seller is closed
old3 = '            <button type="submit" disabled={!user || ordering}'
new3 = '            <button type="submit" disabled={!user || ordering || (sellerOpen && !sellerOpen.is_open)}'

content = content.replace(old3, new3)

open(r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\ProductDetail.tsx', 'w', encoding='utf-8').write(content)
print("✅ ProductDetail.tsx updated!")
