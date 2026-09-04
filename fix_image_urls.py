# Fix frontend to handle both Cloudinary URLs (full) and legacy relative URLs

FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'
import os

# Fix Home.tsx
home_path = os.path.join(FRONTEND, 'src', 'pages', 'Home.tsx')
content = open(home_path, encoding='utf-8').read()

old = '{product.image_url ? <img src={`https://web-production-63685.up.railway.app${product.image_url}`}'
new = '{product.image_url ? <img src={product.image_url.startsWith("http") ? product.image_url : `https://web-production-63685.up.railway.app${product.image_url}`}'

content = content.replace(old, new)
open(home_path, 'w', encoding='utf-8').write(content)
print("✅ Home.tsx updated")

# Fix ProductDetail.tsx
detail_path = os.path.join(FRONTEND, 'src', 'pages', 'ProductDetail.tsx')
content = open(detail_path, encoding='utf-8').read()

old2 = '{product.image_url\n              ? <img src={`https://web-production-63685.up.railway.app${product.image_url}`}'
new2 = '{product.image_url\n              ? <img src={product.image_url.startsWith("http") ? product.image_url : `https://web-production-63685.up.railway.app${product.image_url}`}'

content = content.replace(old2, new2)
open(detail_path, 'w', encoding='utf-8').write(content)
print("✅ ProductDetail.tsx updated")

# Fix SellerDashboard.tsx
dash_path = os.path.join(FRONTEND, 'src', 'pages', 'SellerDashboard.tsx')
content = open(dash_path, encoding='utf-8').read()

old3 = '{product.image_url ? <img src={`https://web-production-63685.up.railway.app${product.image_url}`}'
new3 = '{product.image_url ? <img src={product.image_url.startsWith("http") ? product.image_url : `https://web-production-63685.up.railway.app${product.image_url}`}'

content = content.replace(old3, new3)
open(dash_path, 'w', encoding='utf-8').write(content)
print("✅ SellerDashboard.tsx updated")

print("\n🎉 All frontend image URLs fixed for Cloudinary!")
