path = r'C:\Users\Dell\Desktop\homemarketplace\frontend\src\pages\Orders.tsx'
content = open(path, encoding='utf-8').read()

# Find the broken structure around line 125-127
# The issue is the Review Modal is outside the main return div
# Find and fix it
old = '''    </div>

    {/* Review Modal */}
    {reviewModal && ('''

new = '''      {/* Review Modal */}
      {reviewModal && ('''

# Also need to fix the closing
old2 = '''        </div>
      </div>
    )}
  );
}'''

new2 = '''        </div>
      </div>
    )}
    </div>
  );
}'''

if old in content:
    content = content.replace(old, new)
    print("✅ Fixed modal placement")
else:
    print("❌ Pattern 1 not found")
    # Try to find what's there
    idx = content.find("Review Modal")
    print(repr(content[idx-100:idx+200]))

if old2 in content:
    content = content.replace(old2, new2)
    print("✅ Fixed closing structure")
else:
    print("❌ Pattern 2 not found")

open(path, 'w', encoding='utf-8').write(content)
