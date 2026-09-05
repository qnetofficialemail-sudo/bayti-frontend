path = r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\Home.tsx'
content = open(path, encoding='utf-8').read()

# Add useSearchParams import
old1 = 'import { Link } from "react-router-dom";'
new1 = 'import { Link, useSearchParams } from "react-router-dom";'

# Add useSearchParams hook and init selectedCategory from URL
old2 = '  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);'
new2 = '''  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    searchParams.get("category") ? Number(searchParams.get("category")) : null
  );'''

# Also read search from URL
old3 = '  const [search, setSearch] = useState("");'
new3 = '  const [search, setSearch] = useState(searchParams.get("search") || "");'

for old, new, label in [(old1, new1, "import"), (old2, new2, "selectedCategory"), (old3, new3, "search")]:
    if old in content:
        content = content.replace(old, new)
        print(f"✅ {label} fixed")
    else:
        print(f"❌ {label} not found")

open(path, 'w', encoding='utf-8').write(content)
