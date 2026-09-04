path = r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\Orders.tsx'
content = open(path, encoding='utf-8').read()

old = '      setReviewedOrders(prev => new Set([...prev, reviewModal.id]));'
new = '      setReviewedOrders(prev => { const s = new Set(Array.from(prev)); s.add(reviewModal.id); return s; });'

old2 = '  const [reviewedOrders, setReviewedOrders] = useState<Set<number>>(new Set());'
new2 = '  const [reviewedOrders, setReviewedOrders] = useState<number[]>([]);'

old3 = 'results.forEach((res: any, i: number) => {\n            if (res.data?.reviewed) reviewed.add(delivered[i].id);\n          });\n          setReviewedOrders(reviewed);'
new3 = 'const ids: number[] = [];\n          results.forEach((res: any, i: number) => {\n            if (res.data?.reviewed) ids.push(delivered[i].id);\n          });\n          setReviewedOrders(ids);'

old4 = 'const reviewed = new Set<number>();'
new4 = ''

old5 = 'reviewedOrders.has(order.id)'
new5 = 'reviewedOrders.includes(order.id)'

old6 = 'setReviewedOrders(prev => { const s = new Set(Array.from(prev)); s.add(reviewModal.id); return s; });'
new6 = 'setReviewedOrders(prev => [...prev, reviewModal.id]);'

for o, n in [(old, new), (old2, new2), (old5, new5), (old6, new6)]:
    if o in content:
        content = content.replace(o, n)
        print(f"✅ Fixed: {o[:50]}")
    else:
        print(f"⚠️ Not found: {o[:50]}")

# Fix the reviewed set issue
content = content.replace(
    'const ids: number[] = [];\n          results.forEach((res: any, i: number) => {\n            if (res.data?.reviewed) ids.push(delivered[i].id);\n          });\n          setReviewedOrders(ids);',
    'const ids: number[] = [];\n          results.forEach((res: any, i: number) => {\n            if (res.data?.reviewed) ids.push(delivered[i].id);\n          });\n          setReviewedOrders(ids);'
)

content = content.replace(
    'const reviewed = new Set<number>();\n',
    ''
).replace(
    'const reviewed = new Set<number>();',
    ''
)

# Fix the forEach that uses reviewed.add
content = content.replace(
    'results.forEach((res: any, i: number) => {\n            if (res.data?.reviewed) reviewed.add(delivered[i].id);\n          });\n          setReviewedOrders(reviewed);',
    'const ids: number[] = [];\n          results.forEach((res: any, i: number) => {\n            if (res.data?.reviewed) ids.push(delivered[i].id);\n          });\n          setReviewedOrders(ids);'
)

open(path, 'w', encoding='utf-8').write(content)
print("✅ Done")
