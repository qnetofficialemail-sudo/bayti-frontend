path = r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\AdminPanel.tsx'
content = open(path, encoding='utf-8').read()

idx = content.find('api.get("/api/admin/stats")')
print(content[idx-20:idx+500])
