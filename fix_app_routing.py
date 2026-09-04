import os
FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'

app_path = os.path.join(FRONTEND, 'src', 'App.tsx')
content = open(app_path, encoding='utf-8').read()

# Add a smart home route component that redirects based on auth
old = '''import Landing from "./pages/Landing";'''
new = '''import Landing from "./pages/Landing";
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

function HomeRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user?.role === "seller") return <Navigate to="/seller/dashboard" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user?.role === "buyer") return <Navigate to="/marketplace" replace />;
  return <Landing />;
}'''

content = content.replace(old, new)

# Use HomeRoute instead of Landing for /
old2 = '              <Route path="/" element={<Landing />} />'
new2 = '              <Route path="/" element={<HomeRoute />} />'

content = content.replace(old2, new2)

# Remove the useEffect redirect from Landing.tsx since HomeRoute handles it
open(app_path, 'w', encoding='utf-8').write(content)
print("✅ App.tsx updated with HomeRoute")

# Clean up Landing.tsx - remove the redirect logic
landing_path = os.path.join(FRONTEND, 'src', 'pages', 'Landing.tsx')
content = open(landing_path, encoding='utf-8').read()

old3 = '''import { useAuth } from "../context/AuthContext";
import api from "../api/client";

export default function Landing() {
  const { isArabic, toggleLanguage } = useLanguage();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to appropriate page
  React.useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "seller") navigate("/seller/dashboard", { replace: true });
      else if (user.role === "admin") navigate("/admin", { replace: true });
      else navigate("/marketplace", { replace: true });
    }
  }, [user?.id, isLoading]);

  if (isLoading) return null;'''

new3 = '''import api from "../api/client";

export default function Landing() {
  const { isArabic, toggleLanguage } = useLanguage();'''

if old3 in content:
    content = content.replace(old3, new3)
    # Also remove useNavigate import if no longer needed in Landing
    content = content.replace('import { Link, useNavigate } from "react-router-dom";', 'import { Link } from "react-router-dom";')
    open(landing_path, 'w', encoding='utf-8').write(content)
    print("✅ Landing.tsx cleaned up - redirect logic moved to App.tsx")
else:
    print("❌ Landing pattern not found")
    idx = content.find("export default function Landing")
    print(repr(content[idx:idx+400]))
