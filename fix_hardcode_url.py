import os, glob

RAILWAY_URL = "https://web-production-63685.up.railway.app"

# Fix api client
content = open('src/api/client.ts', encoding='utf-8').read()
content = content.replace(
    'const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";',
    f'const API_URL = "{RAILWAY_URL}";'
)
content = content.replace(
    '"http://localhost:8000"',
    f'"{RAILWAY_URL}"'
)
open('src/api/client.ts', 'w', encoding='utf-8').write(content)
print("✅ src/api/client.ts updated")

# Fix all image URLs in tsx files
files = glob.glob('src/**/*.tsx', recursive=True)
for filepath in files:
    content = open(filepath, encoding='utf-8').read()
    if 'localhost:8000' in content:
        content = content.replace('http://localhost:8000', RAILWAY_URL)
        open(filepath, 'w', encoding='utf-8').write(content)
        print(f"✅ Fixed {filepath}")

print("\nAll hardcoded! Now push.")
