detail_path = r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\ProductDetail.tsx'
content = open(detail_path, encoding='utf-8').read()

related_section = """
      {/* More from this seller */}
      {related.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 pb-8 mt-6">
          <h3 className="font-bold text-gray-900 mb-4">
            {isArabic ? `المزيد من ${product?.seller?.shop_name}` : `More from ${product?.seller?.shop_name}`}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((p: any) => {
              const name = isArabic && p.name_ar ? p.name_ar : p.name;
              const imgUrl = p.image_url ? (p.image_url.startsWith("http") ? p.image_url : `https://web-production-63685.up.railway.app${p.image_url}`) : null;
              return (
                <Link key={p.id} to={`/product/${p.id}`}
                  className="flex gap-3 bg-white rounded-xl border border-gray-100 p-3 hover:border-orange-300 transition shadow-sm">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0 flex items-center justify-center">
                    {imgUrl ? <img src={imgUrl} alt={name} className="w-full h-full object-cover" /> : <span className="text-2xl">{p.category?.icon || "🍽️"}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{name}</p>
                    <p className="text-orange-500 font-bold text-sm">AED {p.price}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
"""

old = '      </div>\n    </div>\n  );\n}'
idx = content.rfind(old)
if idx > 0:
    content = content[:idx] + related_section + '    </div>\n  );\n}'
    open(detail_path, 'w', encoding='utf-8').write(content)
    print("✅ Related products added!")
else:
    print("❌ Pattern not found")
