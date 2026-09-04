import urllib.request, urllib.parse, json

BASE = "https://web-production-63685.up.railway.app"

# Login as admin
login_data = urllib.parse.urlencode({
    "username": "admin@homemarket.ae",
    "password": "admin123"
}).encode()
req = urllib.request.Request(f"{BASE}/api/auth/login", data=login_data,
    headers={"Content-Type": "application/x-www-form-urlencoded"})
resp = json.loads(urllib.request.urlopen(req).read())
token = resp["access_token"]
print("✅ Logged in as admin")

headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Get current categories
req = urllib.request.Request(f"{BASE}/api/categories", headers=headers)
categories = json.loads(urllib.request.urlopen(req).read())
print(f"Found {len(categories)} categories: {[c['name'] for c in categories]}")

arabic = {
    "Home Cooked Meals": "وجبات منزلية",
    "Desserts & Sweets": "حلويات وسكريات",
    "Baked Goods": "مخبوزات",
    "Healthy Food": "طعام صحي",
    "Juices & Drinks": "عصائر ومشروبات",
    "Handmade Crafts": "مشغولات يدوية",
}

for cat in categories:
    name_ar = arabic.get(cat["name"])
    if not name_ar:
        print(f"⚠️  No translation for: {cat['name']}")
        continue
    
    data = json.dumps({"name_ar": name_ar}).encode()
    req = urllib.request.Request(
        f"{BASE}/api/categories/{cat['id']}",
        data=data,
        headers=headers,
        method="PUT"
    )
    try:
        urllib.request.urlopen(req)
        print(f"✅ {cat['name']} → {name_ar}")
    except Exception as e:
        # Try PATCH
        req = urllib.request.Request(
            f"{BASE}/api/categories/{cat['id']}",
            data=data,
            headers=headers,
            method="PATCH"
        )
        try:
            urllib.request.urlopen(req)
            print(f"✅ {cat['name']} → {name_ar} (via PATCH)")
        except Exception as e2:
            print(f"❌ {cat['name']}: {e2}")

print("\n🎉 Done!")
