import os
FRONTEND = r'C:\Users\Dell\Desktop\homemarketplace\frontend'

# ── 1. Fix AuthContext to return user from login ──
auth_ctx_path = os.path.join(FRONTEND, 'src', 'context', 'AuthContext.tsx')
content = open(auth_ctx_path, encoding='utf-8').read()

old1 = 'interface AuthContextType { user: User | null; token: string | null; login: (email: string, password: string) => Promise<void>; register: (data: any) => Promise<void>; logout: () => void; isLoading: boolean; }'
new1 = 'interface AuthContextType { user: User | null; token: string | null; login: (email: string, password: string) => Promise<User>; register: (data: any) => Promise<User>; logout: () => void; isLoading: boolean; }'

old2 = '''  const login = async (email: string, password: string) => {
    const form = new FormData();
    form.append("username", email);
    form.append("password", password);
    const { data } = await api.post("/api/auth/login", form, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  };
  const register = async (formData: any) => {
    const { data } = await api.post("/api/auth/register", formData);
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  };'''

new2 = '''  const login = async (email: string, password: string): Promise<User> => {
    const form = new FormData();
    form.append("username", email);
    form.append("password", password);
    const { data } = await api.post("/api/auth/login", form, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };
  const register = async (formData: any): Promise<User> => {
    const { data } = await api.post("/api/auth/register", formData);
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };'''

content = content.replace(old1, new1).replace(old2, new2)
open(auth_ctx_path, 'w', encoding='utf-8').write(content)
print("✅ AuthContext.tsx updated - login/register now return user")

# ── 2. Fix Auth.tsx to use returned user for redirect ──
auth_path = os.path.join(FRONTEND, 'src', 'pages', 'Auth.tsx')
content = open(auth_path, encoding='utf-8').read()

old3 = '''    try {
      const loggedUser = await login(email, password);
      if (loggedUser?.role === "seller") navigate("/seller/dashboard");
      else if (loggedUser?.role === "admin") navigate("/admin");
      else navigate("/marketplace");
    }'''
new3 = '''    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === "seller") navigate("/seller/dashboard");
      else if (loggedUser.role === "admin") navigate("/admin");
      else navigate("/marketplace");
    }'''

content = content.replace(old3, new3)
open(auth_path, 'w', encoding='utf-8').write(content)
print("✅ Auth.tsx redirect fixed")
print("\n🎉 Done! Push frontend.")
