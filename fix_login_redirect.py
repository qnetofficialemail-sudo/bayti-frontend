import os
FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'

# ── 1. Fix login redirect in Auth.tsx ──
auth_path = os.path.join(FRONTEND, 'src', 'pages', 'Auth.tsx')
content = open(auth_path, encoding='utf-8').read()

# Fix login redirect
old1 = '    try { await login(email, password); navigate("/"); }'
new1 = '''    try {
      const loggedUser = await login(email, password);
      if (loggedUser?.role === "seller") navigate("/seller/dashboard");
      else if (loggedUser?.role === "admin") navigate("/admin");
      else navigate("/marketplace");
    }'''

# Fix register redirect
old2 = '    try { await register(form); navigate(form.role === "seller" ? "/seller/setup" : "/"); }'
new2 = '    try { await register(form); navigate(form.role === "seller" ? "/seller/setup" : "/marketplace"); }'

content = content.replace(old1, new1).replace(old2, new2)
open(auth_path, 'w', encoding='utf-8').write(content)
print("✅ 1. Auth.tsx login redirect fixed")

# ── 2. Fix Landing page - redirect logged in users away ──
landing_path = os.path.join(FRONTEND, 'src', 'pages', 'Landing.tsx')
content = open(landing_path, encoding='utf-8').read()

old3 = 'import { Link } from "react-router-dom";'
new3 = 'import { Link, useNavigate } from "react-router-dom";'

old4 = 'export default function Landing() {\n  const { isArabic, toggleLanguage } = useLanguage();'
new4 = '''export default function Landing() {
  const { isArabic, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  // If already logged in, redirect to appropriate page
  React.useEffect(() => {
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "seller") navigate("/seller/dashboard");
        else if (user.role === "admin") navigate("/admin");
        else navigate("/marketplace");
      } catch {}
    }
  }, []);'''

content = content.replace(old3, new3).replace(old4, new4)
open(landing_path, 'w', encoding='utf-8').write(content)
print("✅ 2. Landing.tsx redirects logged-in users")

# ── 3. Fix AuthContext to return user from login ──
auth_ctx_path = os.path.join(FRONTEND, 'src', 'context', 'AuthContext.tsx')
content = open(auth_ctx_path, encoding='utf-8').read()
print(f"\nAuthContext length: {len(content)}")
# Check what login returns
idx = content.find('const login')
print(content[idx:idx+300])
