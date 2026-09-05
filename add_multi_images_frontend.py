import os

FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'

# ── 1. Update AddProduct.tsx - replace single image with multi-image uploader ──
add_path = os.path.join(FRONTEND, 'src', 'pages', 'AddProduct.tsx')
content = open(add_path, encoding='utf-8').read()

# Replace single image state with multi-image state
old_state = "  const [image, setImage] = useState<File | null>(null);\n  const [preview, setPreview] = useState(\"\");"
new_state = '''  const [images, setImages] = useState<(File | null)[]>([null, null, null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null, null, null]);
  const [primaryIndex, setPrimaryIndex] = useState(0);'''

old_handle_image = '''  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); setAiSuggestion(null); }
  };'''

new_handle_image = '''  const handleImage = (index: number, file: File | null) => {
    const newImages = [...images];
    const newPreviews = [...previews];
    newImages[index] = file;
    newPreviews[index] = file ? URL.createObjectURL(file) : null;
    setImages(newImages);
    setPreviews(newPreviews);
    if (file && index === 0) setAiSuggestion(null);
  };'''

# Replace AI generate call to use first image
old_ai = '      if (image) data.append("image", image);'
new_ai = '      if (images[0]) data.append("image", images[0]);'

# Replace submit image append
old_submit_img = '      if (image) data.append("image", image);'
new_submit_img = '''      if (images[0]) data.append("image", images[0]);
      if (images[1]) data.append("image_2", images[1]);
      if (images[2]) data.append("image_3", images[2]);
      if (images[3]) data.append("image_4", images[3]);
      if (images[4]) data.append("image_5", images[4]);
      data.append("primary_image_index", String(primaryIndex));'''

# Replace photo upload UI section
old_photo_ui = '''        {/* Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{isArabic ? "الصورة" : "Photo"}</label>
          <label className="block cursor-pointer">
            <div className={`h-56 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition ${preview ? "border-orange-300" : "border-gray-200 hover:border-orange-300"}`}>
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : (
                <div className="text-center text-gray-400">
                  <div className="text-5xl mb-2">📷</div>
                  <p className="text-sm font-medium">{isArabic ? "اضغط لرفع صورة" : "Click to upload a photo"}</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
        </div>'''

new_photo_ui = '''        {/* Photos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">{isArabic ? "الصور (حتى 5)" : "Photos (up to 5)"}</label>
            <span className="text-xs text-gray-400">{isArabic ? "اضغط النجمة لتعيين الصورة الرئيسية" : "Tap ★ to set main photo"}</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="relative">
                <label className="block cursor-pointer">
                  <div className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition ${previews[i] ? "border-orange-300" : "border-gray-200 hover:border-orange-300"}`}>
                    {previews[i]
                      ? <img src={previews[i]!} alt={`Photo ${i+1}`} className="w-full h-full object-cover" />
                      : <div className="text-center text-gray-300"><div className="text-2xl">📷</div><div className="text-xs mt-1">{i === 0 ? (isArabic ? "رئيسية" : "Main") : i+1}</div></div>
                    }
                  </div>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => handleImage(i, e.target.files?.[0] || null)} />
                </label>
                {previews[i] && (
                  <div className="absolute top-1 right-1 flex flex-col gap-1">
                    <button type="button" onClick={() => setPrimaryIndex(i)}
                      className={`w-5 h-5 rounded-full text-xs flex items-center justify-center shadow ${primaryIndex === i ? "bg-orange-500 text-white" : "bg-white text-gray-400 hover:text-orange-500"}`}>
                      ★
                    </button>
                    <button type="button" onClick={() => handleImage(i, null)}
                      className="w-5 h-5 rounded-full bg-white text-gray-400 hover:text-red-500 text-xs flex items-center justify-center shadow">
                      ✕
                    </button>
                  </div>
                )}
                {primaryIndex === i && previews[i] && (
                  <div className="absolute bottom-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {isArabic ? "رئيسية" : "Main"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>'''

# Replace AI button image reference
old_ai_ref = '      if (images[0]) data.append("image", images[0]);'

if 'images' not in content or 'handleImage(index' not in content:
    content = content.replace(old_state, new_state)
    content = content.replace(old_handle_image, new_handle_image)
    # Fix AI data append (two occurrences - first is in generateWithAI, second in handleSubmit)
    # Replace first occurrence (in generateWithAI)
    content = content.replace('      if (image) data.append("image", image);',
                               '      if (images[0]) data.append("image", images[0]);', 1)
    # Replace second occurrence (in handleSubmit) 
    content = content.replace('      if (image) data.append("image", image);',
                               '''      if (images[0]) data.append("image", images[0]);
      if (images[1]) data.append("image_2", images[1]);
      if (images[2]) data.append("image_3", images[2]);
      if (images[3]) data.append("image_4", images[3]);
      if (images[4]) data.append("image_5", images[4]);
      data.append("primary_image_index", String(primaryIndex));''')
    if old_photo_ui in content:
        content = content.replace(old_photo_ui, new_photo_ui)
        print("Done - multi-image uploader added to AddProduct")
    else:
        print("FAIL - photo UI not found")
    open(add_path, 'w', encoding='utf-8').write(content)
else:
    print("Skip - already updated")

# ── 2. Update ProductDetail.tsx - show image gallery ──
detail_path = os.path.join(FRONTEND, 'src', 'pages', 'ProductDetail.tsx')
detail = open(detail_path, encoding='utf-8').read()

# Add activeImage state
old_detail_state = "  const [quantity, setQuantity] = useState(1);"
new_detail_state = "  const [quantity, setQuantity] = useState(1);\n  const [activeImageIndex, setActiveImageIndex] = useState(0);"

# Find the main product image display and replace with gallery
old_img_display = '''                {product.image_url
                    ? <img src={product.image_url.startsWith("http") ? product.image_url : `https://web-production-63685.up.railway.app${product.image_url}`}
                        alt={displayName} className="w-full h-full object-cover" />
                    : <span className="text-6xl">🏠</span>
                  }'''

new_img_display = '''                {(() => {
                    const allImages = [product.image_url, product.image_2, product.image_3, product.image_4, product.image_5].filter(Boolean);
                    const primary = allImages[product.primary_image_index || 0] || allImages[0];
                    const displayImg = allImages[activeImageIndex] || primary;
                    return displayImg
                      ? <img src={displayImg.startsWith("http") ? displayImg : `https://web-production-63685.up.railway.app${displayImg}`}
                          alt={displayName} className="w-full h-full object-cover" />
                      : <span className="text-6xl">🏠</span>;
                  })()}'''

# Add thumbnail strip after main image
old_after_img = '              </div>\n            </div>\n\n            <div className="flex-1">'
new_after_img = '''              </div>
              {/* Thumbnail strip */}
              {[product.image_url, product.image_2, product.image_3, product.image_4, product.image_5].filter(Boolean).length > 1 && (
                <div className="flex gap-2 mt-3 px-1">
                  {[product.image_url, product.image_2, product.image_3, product.image_4, product.image_5].filter(Boolean).map((img: string, i: number) => (
                    <button key={i} type="button" onClick={() => setActiveImageIndex(i)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition flex-shrink-0 ${activeImageIndex === i ? "border-orange-500" : "border-gray-200 hover:border-orange-300"}`}>
                      <img src={img.startsWith("http") ? img : `https://web-production-63685.up.railway.app${img}`}
                        alt={`View ${i+1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1">'''

if 'activeImageIndex' not in detail:
    detail = detail.replace(old_detail_state, new_detail_state)
    if old_img_display in detail:
        detail = detail.replace(old_img_display, new_img_display)
        print("Done - main image replaced with gallery in ProductDetail")
    else:
        print("FAIL - image display pattern not found in ProductDetail")
    if old_after_img in detail:
        detail = detail.replace(old_after_img, new_after_img)
        print("Done - thumbnail strip added to ProductDetail")
    else:
        print("FAIL - could not find thumbnail insertion point")
    open(detail_path, 'w', encoding='utf-8').write(detail)
else:
    print("Skip - already updated ProductDetail")

# ── 3. Update marketplace card (Home.tsx) to use primary image ──
home_path = os.path.join(FRONTEND, 'src', 'pages', 'Home.tsx')
home = open(home_path, encoding='utf-8').read()

old_home_img = 'product.image_url\n                    ? <img src={product.image_url'
new_home_img = '''(() => { const imgs = [product.image_url, product.image_2, product.image_3, product.image_4, product.image_5].filter(Boolean); const main = imgs[product.primary_image_index || 0] || imgs[0]; return main; })()\n                    ? <img src={(() => { const imgs = [product.image_url, product.image_2, product.image_3, product.image_4, product.image_5].filter(Boolean); const main = imgs[product.primary_image_index || 0] || imgs[0]; return main?.startsWith("http") ? main : `https://web-production-63685.up.railway.app${main}`; })()'''

if 'primary_image_index' not in home:
    if old_home_img in home:
        home = home.replace(old_home_img, new_home_img)
        open(home_path, 'w', encoding='utf-8').write(home)
        print("Done - marketplace uses primary image")
    else:
        print("FAIL - image pattern not found in Home.tsx")
        idx = home.find('product.image_url')
        print(repr(home[max(0,idx-50):idx+150]))
else:
    print("Skip - Home.tsx already updated")

print("\nAll frontend done!")
