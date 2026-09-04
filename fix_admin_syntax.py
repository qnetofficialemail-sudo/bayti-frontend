path = r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\AdminPanel.tsx'
content = open(path, encoding='utf-8').read()

# Fix the broken structure - the expanded section needs to be inside the seller card div
old = '''                </div>
              </div>
              {/* Expanded seller details */}
              {expandedSeller === seller.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  {/* Sample images */}
                  {(seller.sample_image_1 || seller.sample_image_2 || seller.sample_image_3) && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">{isArabic ? "صور العينات" : "Sample Photos"}</p>
                      <div className="flex gap-2">
                        {[seller.sample_image_1, seller.sample_image_2, seller.sample_image_3].filter(Boolean).map((img: string, i: number) => (
                          <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                            <img src={img} alt={`Sample ${i+1}`} className="w-24 h-24 object-cover rounded-xl border border-gray-200 hover:opacity-80 transition" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {seller.whatsapp_number && (
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{isArabic ? "واتساب" : "WhatsApp"}</p>
                        <p className="font-medium text-gray-900">📱 {seller.whatsapp_number}</p>
                      </div>
                    )}
                    {seller.instagram_handle && (
                      <div className="bg-pink-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{isArabic ? "إنستغرام" : "Instagram"}</p>
                        <p className="font-medium text-gray-900">📸 {seller.instagram_handle}</p>
                      </div>
                    )}
                    {seller.min_order_amount && (
                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{isArabic ? "الحد الأدنى للطلب" : "Min Order"}</p>
                        <p className="font-medium text-gray-900">AED {seller.min_order_amount}</p>
                      </div>
                    )}
                    {seller.delivery_type && (
                      <div className="bg-orange-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{isArabic ? "التوصيل" : "Delivery"}</p>
                        <p className="font-medium text-gray-900">
                          {seller.delivery_type === "self" ? (isArabic ? "🏠 يوصل بنفسه" : "🏠 Self delivery") : (isArabic ? "🚗 يحتاج بيتي" : "🚗 Needs Bayti")}
                        </p>
                      </div>
                    )}
                  </div>
                  {seller.categories_offered && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">{isArabic ? "ما يبيع" : "Sells"}</p>
                      <p className="text-sm text-gray-700">
                        {seller.description || (isArabic ? "لا يوجد وصف" : "No description")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            ))}'''

new = '''                </div>
              </div>
              {expandedSeller === seller.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  {(seller.sample_image_1 || seller.sample_image_2 || seller.sample_image_3) && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">{isArabic ? "صور العينات" : "Sample Photos"}</p>
                      <div className="flex gap-2">
                        {[seller.sample_image_1, seller.sample_image_2, seller.sample_image_3].filter(Boolean).map((img: string, i: number) => (
                          <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                            <img src={img} alt={`Sample ${i+1}`} className="w-24 h-24 object-cover rounded-xl border border-gray-200 hover:opacity-80 transition" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {seller.whatsapp_number && (
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{isArabic ? "واتساب" : "WhatsApp"}</p>
                        <p className="font-medium text-gray-900">📱 {seller.whatsapp_number}</p>
                      </div>
                    )}
                    {seller.instagram_handle && (
                      <div className="bg-pink-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{isArabic ? "إنستغرام" : "Instagram"}</p>
                        <p className="font-medium text-gray-900">📸 {seller.instagram_handle}</p>
                      </div>
                    )}
                    {seller.min_order_amount && (
                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{isArabic ? "الحد الأدنى للطلب" : "Min Order"}</p>
                        <p className="font-medium text-gray-900">AED {seller.min_order_amount}</p>
                      </div>
                    )}
                    {seller.delivery_type && (
                      <div className="bg-orange-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{isArabic ? "التوصيل" : "Delivery"}</p>
                        <p className="font-medium text-gray-900">
                          {seller.delivery_type === "self" ? (isArabic ? "🏠 يوصل بنفسه" : "🏠 Self delivery") : (isArabic ? "🚗 يحتاج بيتي" : "🚗 Needs Bayti")}
                        </p>
                      </div>
                    )}
                  </div>
                  {seller.description && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">{isArabic ? "الوصف" : "Description"}</p>
                      <p className="text-sm text-gray-700">{seller.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            ))}'''

if old in content:
    content = content.replace(old, new)
    open(path, 'w', encoding='utf-8').write(content)
    print("✅ AdminPanel.tsx syntax fixed!")
else:
    print("❌ Pattern not found — checking file length:", len(content))
