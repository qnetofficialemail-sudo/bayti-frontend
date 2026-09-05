import os

FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'
detail_path = os.path.join(FRONTEND, 'src', 'pages', 'ProductDetail.tsx')
content = open(detail_path, encoding='utf-8').read()

# ── 1. Add variant validation to handleOrder ──
old_order = "  const handleOrder = async (e: React.FormEvent) => {\n    setOrdering(true); setError(\"\");"
new_order = '''  const handleOrder = async (e: React.FormEvent) => {
    // Check required variants
    const missingVariant = variants.find((v: any) => v.is_required && !selectedVariants[v.name]);
    if (missingVariant) {
      setVariantError(isArabic ? `\u064a\u0631\u062c\u0649 \u0627\u062e\u062a\u064a\u0627\u0631 ${missingVariant.name_ar || missingVariant.name}` : `Please select ${missingVariant.name}`);
      return;
    }
    setVariantError("");
    setOrdering(true); setError("");'''

if 'missingVariant' not in content:
    if old_order in content:
        content = content.replace(old_order, new_order)
        print("Done - variant validation added to handleOrder")
    else:
        print("FAIL - handleOrder not found, trying alternate...")
        idx = content.find("setOrdering(true); setError")
        if idx > 0:
            line_start = content.rfind('\n', 0, idx) + 1
            insert = content[:line_start] + '''    const missingVariant = variants.find((v: any) => v.is_required && !selectedVariants[v.name]);
    if (missingVariant) {
      setVariantError(isArabic ? `\u064a\u0631\u062c\u0649 \u0627\u062e\u062a\u064a\u0627\u0631 ${missingVariant.name_ar || missingVariant.name}` : `Please select ${missingVariant.name}`);
      return;
    }
    setVariantError("");
''' + content[line_start:]
            content = insert
            print("Done - variant validation added (fallback)")
        else:
            print("FAIL - could not find setOrdering")
else:
    print("Skip - variant validation already added")

# ── 2. Add variant selector UI before Order Form section ──
old_section = "        {/* Order Form */}"
new_section = '''        {/* Variants */}
        {variants.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">{isArabic ? "\u0627\u062e\u062a\u0631 \u0627\u0644\u062e\u064a\u0627\u0631\u0627\u062a" : "Select Options"}</h3>
            <div className="space-y-4">
              {variants.map((variant: any) => {
                const options = JSON.parse(variant.options || "[]");
                return (
                  <div key={variant.id}>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {isArabic && variant.name_ar ? variant.name_ar : variant.name}
                      {variant.is_required && <span className="text-red-400 ml-1">*</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt: any) => (
                        <button key={opt.label} type="button"
                          onClick={() => { setSelectedVariants((prev: any) => ({ ...prev, [variant.name]: opt.label })); setVariantError(""); }}
                          className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition ${
                            selectedVariants[variant.name] === opt.label
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-gray-200 hover:border-orange-300 text-gray-700"
                          }`}>
                          {opt.label}
                          {opt.price_adj > 0 && <span className="text-xs ml-1 text-orange-500">+AED {opt.price_adj}</span>}
                          {opt.price_adj < 0 && <span className="text-xs ml-1 text-green-500">-AED {Math.abs(opt.price_adj)}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {variantError && <p className="text-red-500 text-sm">{variantError}</p>}
            </div>
          </div>
        )}

        {/* Order Form */}'''

if 'variants.length > 0' not in content:
    if old_section in content:
        content = content.replace(old_section, new_section)
        print("Done - variant selector UI added")
    else:
        print("FAIL - Order Form comment not found")
        idx = content.find("Order Form")
        if idx > 0:
            print(repr(content[max(0,idx-50):idx+100]))
else:
    print("Skip - variant UI already added")

open(detail_path, 'w', encoding='utf-8').write(content)
print("Done - ProductDetail.tsx saved")
