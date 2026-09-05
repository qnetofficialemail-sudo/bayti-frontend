import os

FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'
detail_path = os.path.join(FRONTEND, 'src', 'pages', 'ProductDetail.tsx')
detail = open(detail_path, encoding='utf-8').read()

if 'activeImageIndex' not in detail or 'allImgs' not in detail:
    # Add state if missing
    if 'activeImageIndex' not in detail:
        detail = detail.replace(
            "  const [quantity, setQuantity] = useState(1);",
            "  const [quantity, setQuantity] = useState(1);\n  const [activeImageIndex, setActiveImageIndex] = useState(0);"
        )

    # Find the exact image block
    idx = detail.find('{product.image_url\n              ? <img src={product.image_url')
    if idx > 0:
        # Find the closing of this ternary expression
        # It ends with : <something> }
        colon_idx = detail.find('\n              :', idx)
        close_brace = detail.find('}', colon_idx + 1)
        old_block = detail[idx:close_brace+1]
        print("Found block:")
        print(repr(old_block))
        new_block = '''(() => {
                    const allImgs = [product.image_url, product.image_2, product.image_3, product.image_4, product.image_5].filter(Boolean);
                    const displayImg = allImgs[activeImageIndex] || allImgs[0];
                    return displayImg
                      ? <img src={displayImg.startsWith("http") ? displayImg : `https://web-production-63685.up.railway.app${displayImg}`}
                          alt={displayName} className="w-full h-full object-cover" />
                      : <span className="text-6xl">🛍️</span>;
                  })()'''
        detail = detail[:idx] + new_block + detail[close_brace+1:]
        open(detail_path, 'w', encoding='utf-8').write(detail)
        print("Done - image display replaced in ProductDetail")
    else:
        print("FAIL - exact block not found")
        idx2 = detail.find('product.image_url')
        print(repr(detail[max(0,idx2-20):idx2+300]))
else:
    print("Skip - already updated")
