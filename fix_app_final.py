content = open('src/App.tsx', encoding='utf-8').read()

# Add import after Orders import
content = content.replace(
    'import Orders from "./pages/Orders";',
    'import Orders from "./pages/Orders";\nimport AdminPanel from "./pages/AdminPanel";'
)

open('src/App.tsx', 'w', encoding='utf-8').write(content)

# Verify
lines = content.split('\n')[:15]
for i, line in enumerate(lines, 1):
    print(i, line)
