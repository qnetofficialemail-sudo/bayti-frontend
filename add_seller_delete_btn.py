import os

FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'
admin_tsx = os.path.join(FRONTEND, 'src', 'pages', 'AdminPanel.tsx')
content = open(admin_tsx, encoding='utf-8').read()

# Find the Commission button in the sellers tab and add delete after it
old = '''                    <button onClick={() => { setCommissionModal(seller); setNewRate(String(seller.commission_rate)); }}
                      className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg transition font-medium">
                      \U0001f4b0 {isArabic ? "\u0639\u0645\u0648\u0644\u0629" : "Commission"}
                    </button>
                  </div>'''

new = '''                    <button onClick={() => { setCommissionModal(seller); setNewRate(String(seller.commission_rate)); }}
                      className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg transition font-medium">
                      \U0001f4b0 {isArabic ? "\u0639\u0645\u0648\u0644\u0629" : "Commission"}
                    </button>
                    <button onClick={() => deleteSeller(seller)}
                      className="text-xs bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded-lg transition font-medium">
                      \U0001f5d1\ufe0f {isArabic ? "\u062d\u0630\u0641" : "Delete"}
                    </button>
                  </div>'''

if old in content:
    content = content.replace(old, new)
    open(admin_tsx, 'w', encoding='utf-8').write(content)
    print("✅ Delete button added to sellers tab")
else:
    # Try finding it another way
    marker = 'setNewRate(String(seller.commission_rate)); }}'
    idx = content.find(marker)
    if idx > 0:
        # Find the closing </button> and </div> after it
        close_btn = content.find('</button>', idx)
        close_div = content.find('</div>', close_btn)
        if close_btn > 0 and close_div > 0:
            insert = close_btn + len('</button>')
            delete_btn = '''
                    <button onClick={() => deleteSeller(seller)}
                      className="text-xs bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded-lg transition font-medium">
                      🗑️ {isArabic ? "حذف" : "Delete"}
                    </button>'''
            content = content[:insert] + delete_btn + content[insert:]
            open(admin_tsx, 'w', encoding='utf-8').write(content)
            print("✅ Delete button added to sellers tab (fallback method)")
        else:
            print("❌ Could not find </button> or </div> after Commission button")
    else:
        print("❌ Could not find Commission button marker")
        print("Searching for nearby text...")
        idx2 = content.find('Commission')
        if idx2 > 0:
            print(repr(content[idx2-200:idx2+200]))
