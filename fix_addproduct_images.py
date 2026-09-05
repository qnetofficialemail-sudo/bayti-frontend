import os

FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'
path = os.path.join(FRONTEND, 'src', 'pages', 'AddProduct.tsx')
content = open(path, encoding='utf-8').read()

# Check current state
print("Has 'images' state:", 'const [images,' in content)
print("Has 'image' state:", 'const [image,' in content)
print("Has grid-cols-5:", 'grid-cols-5' in content)

# Find the single image state
idx = content.find('const [image,')
if idx > 0:
    print("\nFound single image state:")
    print(repr(content[idx:idx+100]))

# Find the photo section
idx2 = content.find('Photo')
if idx2 > 0:
    print("\nFound Photo section at:", idx2)
    print(repr(content[idx2:idx2+300]))
