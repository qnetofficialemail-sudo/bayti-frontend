FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'
import os

path = os.path.join(FRONTEND, 'src', 'pages', 'AdminPanel.tsx')
content = open(path, encoding='utf-8').read()

# Add expandedSeller state and expand button to seller cards
old = '''  const [badgeModal, setBadgeModal] = useState<any>(null);
  const [commissionModal, setCommissionModal] = useState<any>(null);
  const [newRate, setNewRate] = useState("");'''

new = '''  const [badgeModal, setBadgeModal] = useState<any>(null);
  const [commissionModal, setCommissionModal] = useState<any>(null);
  const [newRate, setNewRate] = useState("");
  const [expandedSeller, setExpandedSeller] = useState<number | null>(null);'''

content = content.replace(old, new)

# Add expanded view inside seller card
old2 = '''                    {seller.badge_notes && <p className="text-xs text-orange-500 mt-1">ðŸ" {seller.badge_notes}</p>}
                  </div>'''

new2 = '''                    {seller.badge_notes && <p className="text-xs text-orange-500 mt-1">ðŸ" {seller.badge_notes}</p>}
                    <button onClick={() => setExpandedSeller(expandedSeller === seller.id ? null : seller.id)}
                      className="text-xs text-orange-500 hover:underline mt-1 inline-block">
                      {expandedSeller === seller.id ? (isArabic ? "▲ إخفاء التفاصيل" : "▲ Hide details") : (isArabic ? "▼ عرض التفاصيل" : "▼ View details")}
                    </button>
                  </div>'''

content = content.replace(old2, new2)

# Add expanded detail section after action buttons div
old3 = '''                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab */}'''

new3 = '''                </div>
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
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab */}'''

content = content.replace(old3, new3)

open(path, 'w', encoding='utf-8').write(content)
print("✅ AdminPanel.tsx updated with expandable seller details")
