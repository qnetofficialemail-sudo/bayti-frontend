import os

FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'
auth_path = os.path.join(FRONTEND, 'src', 'pages', 'Auth.tsx')
content = open(auth_path, encoding='utf-8').read()

# Find the exact grid block and replace it
start_marker = '        <div className="grid grid-cols-2 gap-3 mb-6">'
end_marker = '        </div>\n\n        <form'

if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker, start_idx)
    
    new_block = '''        <div className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-100 text-center">
          <p className="text-sm text-orange-700 font-medium">
            {isArabic ? "هذا التسجيل للمشترين فقط" : "This registration is for buyers only"}
          </p>
          <p className="text-xs text-orange-500 mt-1">
            {isArabic ? "للبيع، " : "Want to sell? "}
            <a href="/seller-apply" className="underline font-medium">
              {isArabic ? "قدم طلبك هنا" : "Apply as a seller"}
            </a>
          </p>
        </div>'''
    
    content = content[:start_idx] + new_block + '\n\n        <form' + content[end_idx + len(end_marker):]
    
    # Fix the navigate line
    content = content.replace(
        'navigate(form.role === "seller" ? "/seller/setup" : "/marketplace")',
        'navigate("/marketplace")'
    )
    
    open(auth_path, 'w', encoding='utf-8').write(content)
    print("Done - seller option removed from RegisterPage")
else:
    print("FAIL - markers not found")
    print("start_marker found:", start_marker in content)
    print("end_marker found:", end_marker in content)
    # Show what's around the grid
    idx = content.find('grid-cols-2 gap-3 mb-6')
    if idx > 0:
        print(repr(content[idx:idx+400]))
