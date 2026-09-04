import os
FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'

# Fix Auth.tsx - use navigate with replace
auth_path = os.path.join(FRONTEND, 'src', 'pages', 'Auth.tsx')
content = open(auth_path, encoding='utf-8').read()

old = '''      const loggedUser = await login(email, password);
      if (loggedUser.role === "seller") navigate("/seller/dashboard");
      else if (loggedUser.role === "admin") navigate("/admin");
      else navigate("/marketplace");'''
new = '''      const loggedUser = await login(email, password);
      if (loggedUser.role === "seller") navigate("/seller/dashboard", { replace: true });
      else if (loggedUser.role === "admin") navigate("/admin", { replace: true });
      else navigate("/marketplace", { replace: true });'''

content = content.replace(old, new)
open(auth_path, 'w', encoding='utf-8').write(content)
print("✅ Auth.tsx navigate with replace")

# Fix Landing.tsx - use replace too, and add delay to let auth settle
landing_path = os.path.join(FRONTEND, 'src', 'pages', 'Landing.tsx')
content = open(landing_path, encoding='utf-8').read()

old2 = '''  // If already logged in, redirect to appropriate page
  React.useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "seller") navigate("/seller/dashboard");
      else if (user.role === "admin") navigate("/admin");
      else navigate("/marketplace");
    }
  }, [user, isLoading]);

  if (isLoading) return null;'''

new2 = '''  // If already logged in, redirect to appropriate page
  React.useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "seller") navigate("/seller/dashboard", { replace: true });
      else if (user.role === "admin") navigate("/admin", { replace: true });
      else navigate("/marketplace", { replace: true });
    }
  }, [user?.id, isLoading]);

  if (isLoading) return null;'''

if old2 in content:
    content = content.replace(old2, new2)
    open(landing_path, 'w', encoding='utf-8').write(content)
    print("✅ Landing.tsx navigate with replace")
else:
    print("❌ Landing pattern not found")

