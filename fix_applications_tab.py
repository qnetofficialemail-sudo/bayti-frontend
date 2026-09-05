import os

FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'
admin_path = os.path.join(FRONTEND, 'src', 'pages', 'AdminPanel.tsx')
content = open(admin_path, encoding='utf-8').read()

# Find and replace the broken applications tab label line
# The escaped backticks \` are invalid in TSX - use a simpler expression instead
old_line = '          { key: "applications", label: isArabic ? `\u0627\u0644\u0637\u0644\u0628\u0627\u062a${applications.filter(a => a.status === "pending").length > 0 ? \\` (${applications.filter(a => a.status === "pending").length})\\` : ""}` : `Applications${applications.filter(a => a.status === "pending").length > 0 ? \\` (${applications.filter(a => a.status === "pending").length})\\` : ""}`, icon: "\U0001f4cb" },'

new_line = '          { key: "applications", label: (isArabic ? "\u0627\u0644\u0637\u0644\u0628\u0627\u062a" : "Applications") + (applications.filter(a => a.status === "pending").length > 0 ? ` (${applications.filter(a => a.status === "pending").length})` : ""), icon: "\U0001f4cb" },'

if old_line in content:
    content = content.replace(old_line, new_line)
    open(admin_path, 'w', encoding='utf-8').write(content)
    print("Done - fixed applications tab label")
else:
    # Try finding by a unique substring
    marker = 'key: "applications"'
    idx = content.find(marker)
    if idx >= 0:
        line_start = content.rfind('\n', 0, idx) + 1
        line_end = content.find('\n', idx)
        old_full_line = content[line_start:line_end]
        print("Found line:")
        print(repr(old_full_line))
        replacement = '          { key: "applications", label: (isArabic ? "\u0627\u0644\u0637\u0644\u0628\u0627\u062a" : "Applications") + (applications.filter(a => a.status === "pending").length > 0 ? ` (${applications.filter(a => a.status === "pending").length})` : ""), icon: "\U0001f4cb" },'
        content = content[:line_start] + replacement + content[line_end:]
        open(admin_path, 'w', encoding='utf-8').write(content)
        print("Done - fixed via line replacement")
    else:
        print("FAIL - could not find applications key")
