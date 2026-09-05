import os

FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'
path = os.path.join(FRONTEND, 'src', 'pages', 'SellerProfilePage.tsx')
content = open(path, encoding='utf-8').read()

# Add response time display after the rating/orders line
old = '''            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
              <span>\U0001f4cd {seller.area}, {seller.city}</span>
              <span>\u2b50 {seller.rating}</span>
              <span>\U0001f4e6 {seller.total_orders} {isArabic ? "\u0637\u0644\u0628" : "orders"}</span>
            </div>'''

new = '''            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2 flex-wrap">
              <span>\U0001f4cd {seller.area}, {seller.city}</span>
              <span>\u2b50 {seller.rating}</span>
              <span>\U0001f4e6 {seller.total_orders} {isArabic ? "\u0637\u0644\u0628" : "orders"}</span>
              {seller.avg_response_minutes != null && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                  seller.avg_response_minutes <= 30
                    ? "bg-green-50 text-green-700 border-green-200"
                    : seller.avg_response_minutes <= 120
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}>
                  \u26a1 {isArabic ? "\u064a\u0631\u062f \u0639\u0627\u062f\u0629\u064b \u062e\u0644\u0627\u0644 " : "Usually responds in "}
                  {seller.avg_response_minutes < 60
                    ? `${Math.round(seller.avg_response_minutes)} ${isArabic ? "\u062f\u0642\u064a\u0642\u0629" : "min"}`
                    : `${Math.round(seller.avg_response_minutes / 60 * 10) / 10} ${isArabic ? "\u0633\u0627\u0639\u0629" : "hr"}`}
                </span>
              )}
            </div>'''

if 'avg_response_minutes' not in content:
    if old in content:
        content = content.replace(old, new)
        open(path, 'w', encoding='utf-8').write(content)
        print("Done - response time badge added to SellerProfilePage")
    else:
        print("FAIL - could not find target block")
        # Debug
        idx = content.find("seller.rating")
        print(repr(content[max(0,idx-100):idx+200]))
else:
    print("Skip - already added")
