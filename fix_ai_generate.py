import os

FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'
path = os.path.join(FRONTEND, 'src', 'pages', 'AddProduct.tsx')
content = open(path, encoding='utf-8').read()

# Fix 1: Replace old image check with images[0]
old_check = 'if (!image && !form.name) { setError(isArabic ? "\u0623\u0636\u0641 \u0635\u0648\u0631\u0629 \u0623\u0648 \u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062a\u062c \u0623\u0648\u0644\u0627\u064b." : "Add a photo or product name first."); return; }'
new_check = 'if (!images[0] && !form.name) { setError(isArabic ? "\u0623\u0636\u0641 \u0635\u0648\u0631\u0629 \u0623\u0648 \u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062a\u062c \u0623\u0648\u0644\u0627\u064b." : "Add a photo or product name first."); return; }'

# Fix 2: Show actual error in catch
old_catch = '} catch (err: any) { setError("AI generation failed."); }'
new_catch = '} catch (err: any) { setError(err.response?.data?.detail || "AI generation failed."); console.error("AI error:", err); }'

# Fix 3: Handle case where response.data.success is false
old_success = '      if (response.data.success) {\n        const suggestion = response.data.data;\n        setAiSuggestion(suggestion);\n        setForm(f => ({ ...f, description: suggestion.description || f.description, name: suggestion.suggested_name || f.name }));\n      }'
new_success = '''      if (response.data.success) {
        const suggestion = response.data.data;
        setAiSuggestion(suggestion);
        setForm(f => ({ ...f, description: suggestion.description || f.description, name: suggestion.suggested_name || f.name }));
      } else {
        setError(isArabic ? "\u0641\u0634\u0644 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a." : "AI generation failed.");
      }'''

if '!image &&' in content:
    content = content.replace(old_check, new_check)
    print("Done - fixed image check in generateWithAI")
else:
    print("Skip - already uses images[0]")

content = content.replace(old_catch, new_catch)
print("Done - improved error display in AI catch")

if 'response.data.success' in content and 'else {' not in content[content.find('response.data.success'):content.find('response.data.success')+200]:
    if old_success in content:
        content = content.replace(old_success, new_success)
        print("Done - added else case for AI failure")

open(path, 'w', encoding='utf-8').write(content)
print("Saved AddProduct.tsx")
