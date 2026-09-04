import urllib.request, urllib.parse, json

BASE = "https://web-production-63685.up.railway.app"

# Login as seller (Fatima)
login_data = urllib.parse.urlencode({
    "username": "fatima@homemarket.ae",
    "password": "seller123"
}).encode()
req = urllib.request.Request(f"{BASE}/api/auth/login", data=login_data,
    headers={"Content-Type": "application/x-www-form-urlencoded"})
resp = json.loads(urllib.request.urlopen(req).read())
token = resp["access_token"]
print("✅ Logged in as Fatima")

auth_header = {"Authorization": f"Bearer {token}"}

arabic = {
    1: ("مجبوس دجاج", "أرز متبل بالبهارات مع دجاج طري، مطبوخ ببطء مع بهارات الخليج.", 45.0, 90),
    2: ("هريس لحم",   "قمح ولحم بقري مطبوخ ببطء، طبق رمضاني كلاسيكي.", 35.0, 120),
    3: ("لقيمات",     "كرات عجين مقلية مرشوشة بدبس التمر والسمسم.", 25.0, 30),
    4: ("بلاليط",     "شعيرية حلوة مع أومليت البيض فوقها — وجبة الإفطار المفضلة.", 20.0, 20),
}

# Get current products
req = urllib.request.Request(f"{BASE}/api/products/", headers=auth_header)
products = json.loads(urllib.request.urlopen(req).read())

for p in products:
    pid = p["id"]
    if pid not in arabic:
        continue
    name_ar, desc_ar, price, prep = arabic[pid]
    
    # PUT uses form data
    form = urllib.parse.urlencode({
        "name": p["name"],
        "name_ar": name_ar,
        "description": p["description"],
        "description_ar": desc_ar,
        "price": price,
        "preparation_time": prep,
        "is_available": "true",
    }).encode()
    
    req = urllib.request.Request(
        f"{BASE}/api/products/{pid}",
        data=form,
        headers={**auth_header, "Content-Type": "application/x-www-form-urlencoded"},
        method="PUT"
    )
    try:
        urllib.request.urlopen(req)
        print(f"✅ Product {pid}: {name_ar}")
    except Exception as e:
        print(f"❌ Product {pid}: {e}")

print("\n🎉 Done!")
