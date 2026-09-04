import os
FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'

landing_path = os.path.join(FRONTEND, 'src', 'pages', 'Landing.tsx')
content = open(landing_path, encoding='utf-8').read()

# Replace the manual localStorage check with useAuth hook
old = '''import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import api from "../api/client";

export default function Landing() {
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

new = '''import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

export default function Landing() {
  const { isArabic, toggleLanguage } = useLanguage();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to appropriate page
  React.useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "seller") navigate("/seller/dashboard");
      else if (user.role === "admin") navigate("/admin");
      else navigate("/marketplace");
    }
  }, [user, isLoading]);

  if (isLoading) return null;'''

if old in content:
    content = content.replace(old, new)
    open(landing_path, 'w', encoding='utf-8').write(content)
    print("✅ Landing.tsx redirect fixed using useAuth")
else:
    print("❌ Pattern not found")
    idx = content.find("export default function Landing")
    print(repr(content[idx:idx+500]))
