content = open(r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\components\Navbar.tsx', encoding='utf-8').read()

# Replace brand name
content = content.replace(
    '<span className="font-bold text-gray-900 text-lg">HomeMarket<span className="text-orange-500">UAE</span></span>',
    '<span className="font-bold text-gray-900 text-lg">بيتي<span className="text-orange-500"> Bayti</span></span>'
)

open(r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\components\Navbar.tsx', 'w', encoding='utf-8').write(content)
print("Done!")
