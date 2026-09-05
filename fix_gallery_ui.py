import os

FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'

# ── Fix ProductDetail.tsx ──
detail_path = os.path.join(FRONTEND, 'src', 'pages', 'ProductDetail.tsx')
detail = open(detail_path, encoding='utf-8').read()

# Add activeImageIndex state
old_state = "  const [quantity, setQuantity] = useState(1);"
new_state = "  const [quantity, setQuantity] = useState(1);\n  const [activeImageIndex, setActiveImageIndex] = useState(0);"

if 'activeImageIndex' not in detail:
    detail = detail.replace(old_state, new_state)

# Find and replace the image display - use the pattern from the debug output
idx = detail.find('product.image_url ? <img src={product.image_url')
if idx > 0:
    # Find the start of the containing div
    block_start = detail.rfind('<div', 0, idx)
    # Find the end - the closing > of the img tag
    img_end = detail.find('/>', idx)
    if img_end < 0:
        img_end = detail.find('</img>', idx)
    # Find the } after that closes the ternary
    close_brace = detail.find('}', img_end)
    
    old_block = detail[idx:close_brace+1]
    print("=== Old image block ===")
    print(repr(old_block[:300]))
    
    new_block = '''(() => {
                    const allImgs = [product.image_url, product.image_2, product.image_3, product.image_4, product.image_5].filter(Boolean);
                    const displayImg = allImgs[activeImageIndex] || allImgs[0];
                    return displayImg
                      ? <img src={displayImg.startsWith("http") ? displayImg : `https://web-production-63685.up.railway.app${displayImg}`}
                          alt={displayName} className="w-full h-full object-cover" />
                      : <span className="text-6xl">🛍️</span>;
                  })()'''
    
    detail = detail[:idx] + new_block + detail[close_brace+1:]
    print("Done - image display replaced in ProductDetail")
else:
    print("FAIL - product.image_url not found in ProductDetail")
    idx2 = detail.find('image_url')
    print(repr(detail[max(0,idx2-100):idx2+200]))

# Add thumbnail strip - find a good insertion point after the main image area
# Look for the closing div of the image container
if 'thumbnail' not in detail:
    # Find after the image section closes - look for the flex-1 div that contains product info
    thumb_marker = detail.find('"flex-1">')
    if thumb_marker < 0:
        thumb_marker = detail.find('"flex-1 min-w-0">')
    if thumb_marker < 0:
        thumb_marker = detail.find('className="flex-1')
    
    if thumb_marker > 0:
        # Find the line start
        line_start = detail.rfind('\n', 0, thumb_marker)
        thumbnail_strip = '''
              {/* Thumbnail strip */}
              {[product.image_url, product.image_2, product.image_3, product.image_4, product.image_5].filter(Boolean).length > 1 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[product.image_url, product.image_2, product.image_3, product.image_4, product.image_5].filter(Boolean).map((img: string, i: number) => (
                    <button key={i} type="button" onClick={() => setActiveImageIndex(i)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition flex-shrink-0 ${activeImageIndex === i ? "border-orange-500" : "border-gray-200 hover:border-orange-300"}`}>
                      <img src={img.startsWith("http") ? img : `https://web-production-63685.up.railway.app${img}`}
                        alt={`View ${i+1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}'''
        detail = detail[:line_start] + thumbnail_strip + detail[line_start:]
        print("Done - thumbnail strip added to ProductDetail")
    else:
        print("FAIL - could not find flex-1 div in ProductDetail")

open(detail_path, 'w', encoding='utf-8').write(detail)

# ── Fix Home.tsx ──
home_path = os.path.join(FRONTEND, 'src', 'pages', 'Home.tsx')
home = open(home_path, encoding='utf-8').read()

if 'primary_image_index' not in home:
    # Find the image_url pattern shown in debug
    idx3 = home.find('product.image_url ? <img src={product.image_url')
    if idx3 > 0:
        # Find the closing brace of the ternary
        close = home.find('}', home.find('/>', idx3))
        old_img = home[idx3:close+1]
        new_img = '''(() => { const imgs = [product.image_url, product.image_2, product.image_3, product.image_4, product.image_5].filter(Boolean); const main = imgs[product.primary_image_index || 0] || imgs[0]; return main ? <img src={main.startsWith("http") ? main : `https://web-production-63685.up.railway.app${main}`} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" /> : <span className="text-5xl">{product.category?.icon || "🛍️"}</span>; })()'''
        home = home[:idx3] + new_img + home[close+1:]
        open(home_path, 'w', encoding='utf-8').write(home)
        print("Done - Home.tsx uses primary image")
    else:
        print("FAIL - image_url pattern not found in Home.tsx")
        idx4 = home.find('image_url')
        print(repr(home[max(0,idx4-50):idx4+200]))
else:
    print("Skip - Home.tsx already updated")
