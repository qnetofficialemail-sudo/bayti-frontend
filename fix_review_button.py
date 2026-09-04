path = r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\Orders.tsx'
content = open(path, encoding='utf-8').read()

# Simplify - remove the check API call, just show button and handle error on submit
old = '''    api.get("/api/orders/my").then(r => {
      setOrders(r.data);
      // Check which delivered orders have been reviewed
      const delivered = r.data.filter((o: any) => o.status === "delivered");
      Promise.all(delivered.map((o: any) => api.get(`/api/reviews/check/${o.id}`))).then(results => {
        const reviewed = new Set<number>();
        results.forEach((res, i) => { if (res.data.reviewed) reviewed.add(delivered[i].id); });
        setReviewedOrders(reviewed);
      }).catch(() => {});
    }).finally(() => setLoading(false));'''

new = '''    api.get("/api/orders/my").then(r => {
      setOrders(r.data);
      // Check which delivered orders have been reviewed
      const delivered = r.data.filter((o: any) => o.status === "delivered");
      if (delivered.length > 0) {
        Promise.all(delivered.map((o: any) =>
          api.get(`/api/reviews/check/${o.id}`).catch(() => ({ data: { reviewed: false } }))
        )).then(results => {
          const reviewed = new Set<number>();
          results.forEach((res: any, i: number) => {
            if (res.data?.reviewed) reviewed.add(delivered[i].id);
          });
          setReviewedOrders(reviewed);
        });
      }
    }).finally(() => setLoading(false));'''

if old in content:
    content = content.replace(old, new)
    open(path, 'w', encoding='utf-8').write(content)
    print("✅ Fixed review check")
else:
    print("❌ Pattern not found")
    # Check what's there
    idx = content.find("api.get(\"/api/orders/my\")")
    print(repr(content[idx:idx+500]))
