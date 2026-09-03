content = open('src/App.tsx', encoding='utf-8').read()

if 'AdminPanel' not in content:
    content = content.replace(
        'import Orders from "./pages/Orders";',
        'import Orders from "./pages/Orders";\nimport AdminPanel from "./pages/AdminPanel";'
    )
    open('src/App.tsx', 'w', encoding='utf-8').write(content)
    print("Import added successfully")
else:
    print("AdminPanel already imported")

# Verify
content = open('src/App.tsx', encoding='utf-8').read()
print("AdminPanel in file:", 'AdminPanel' in content)
print("Route in file:", '/admin' in content)
