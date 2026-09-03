import os

os.makedirs('src/pages', exist_ok=True)
os.makedirs('src/components', exist_ok=True)
os.makedirs('src/context', exist_ok=True)
os.makedirs('src/api', exist_ok=True)

files = {}

files['src/api/client.ts'] = '''import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:8000", headers: { "Content-Type": "application/json" } });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
export default api;
'''

files['src/context/AuthContext.tsx'] = '''import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";
interface User { id: number; email: string; full_name: string; role: string; }
interface AuthContextType { user: User | null; token: string | null; login: (email: string, password: string) => Promise<void>; register: (data: any) => Promise<void>; logout: () => void; isLoading: boolean; }
const AuthContext = createContext<AuthContextType>(null!);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    setIsLoading(false);
  }, []);
  const login = async (email: string, password: string) => {
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
  };
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };
  return <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
'''

files['src/components/Navbar.tsx'] = '''import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/"); };
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <span className="font-bold text-gray-900 text-lg">HomeMarket<span className="text-orange-500">UAE</span></span>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "seller" && <Link to="/seller/dashboard" className="text-sm text-gray-600 hover:text-orange-500 px-3 py-2 rounded-lg hover:bg-orange-50 transition">My Shop</Link>}
              <Link to="/orders" className="text-sm text-gray-600 hover:text-orange-500 px-3 py-2 rounded-lg hover:bg-orange-50 transition">Orders</Link>
              <span className="text-sm text-gray-500">Hi, {user.full_name.split(" ")[0]}</span>
              <button onClick={handleLogout} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-orange-500 px-3 py-2 rounded-lg transition">Login</Link>
              <Link to="/register" className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition font-medium">Join Us</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
'''

files['src/App.tsx'] = '''import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { LoginPage, RegisterPage } from "./pages/Auth";
import ProductDetail from "./pages/ProductDetail";
import SellerDashboard from "./pages/SellerDashboard";
import SellerSetup from "./pages/SellerSetup";
import AddProduct from "./pages/AddProduct";
import Orders from "./pages/Orders";
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/setup" element={<SellerSetup />} />
            <Route path="/seller/products/new" element={<AddProduct />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
'''

files['src/index.css'] = '''@tailwind base;
@tailwind components;
@tailwind utilities;
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background-color: #fafaf9; }
'''

files['tailwind.config.js'] = '''module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: { colors: { brand: { 50: "#fff7ed", 100: "#ffedd5", 500: "#f97316", 600: "#ea580c", 700: "#c2410c" } } } },
  plugins: [],
}
'''

files['src/pages/Home.tsx'] = '''import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
interface Product { id: number; name: string; description: string; price: number; image_url: string | null; preparation_time: number; seller: { id: number; shop_name: string; area: string; rating: number }; category: { name: string; icon: string } | null; }
interface Category { id: number; name: string; icon: string; }
export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/api/categories").then(r => setCategories(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (selectedCategory) params.category_id = selectedCategory;
    if (search) params.search = search;
    api.get("/api/products/", { params }).then(r => setProducts(r.data)).finally(() => setLoading(false));
  }, [selectedCategory, search]);
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Homemade food, <span className="text-orange-500">delivered to your door</span></h1>
        <p className="text-gray-500 text-lg">Support local home cooks across the UAE</p>
      </div>
      <div className="mb-6">
        <input type="text" placeholder="Search for dishes, sweets, crafts..." value={search} onChange={e => setSearch(e.target.value)} className="w-full border border-gray-200 rounded-xl px-5 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white shadow-sm" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        <button onClick={() => setSelectedCategory(null)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${!selectedCategory ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"}`}>All</button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === cat.id ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"}`}>{cat.icon} {cat.name}</button>
        ))}
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (<div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"><div className="h-48 bg-gray-100" /><div className="p-4 space-y-2"><div className="h-4 bg-gray-100 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div></div>))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400"><div className="text-5xl mb-4">🍽️</div><p className="text-lg">No products found</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <Link key={product.id} to={`/product/${product.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="h-48 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden">
                {product.image_url ? <img src={`http://localhost:8000${product.image_url}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" /> : <span className="text-6xl">{product.category?.icon || "🍽️"}</span>}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 leading-tight">{product.name}</h3>
                  <span className="text-orange-500 font-bold text-sm whitespace-nowrap">AED {product.price}</span>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 mb-3">{product.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>🏠 {product.seller?.shop_name}</span>
                  <span>⏱ {product.preparation_time}min</span>
                </div>
                {product.seller?.area && <div className="mt-2"><span className="inline-block bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded-full">📍 {product.seller.area}</span></div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
'''

files['src/pages/Auth.tsx'] = '''import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await login(email, password); navigate("/"); }
    catch (err: any) { setError(err.response?.data?.detail || "Login failed"); }
    finally { setLoading(false); }
  };
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-8"><div className="text-4xl mb-3">🏠</div><h1 className="text-2xl font-bold text-gray-900">Welcome back</h1><p className="text-gray-500 text-sm mt-1">Sign in to HomeMarket UAE</p></div>
        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
          <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-60">{loading ? "Signing in..." : "Sign In"}</button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">No account? <Link to="/register" className="text-orange-500 hover:underline">Join us</Link></div>
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500">
          <p className="font-medium mb-1">Demo accounts:</p>
          <p>🍽️ Seller: fatima@homemarket.ae / seller123</p>
          <p>⚙️ Admin: admin@homemarket.ae / admin123</p>
        </div>
      </div>
    </div>
  );
}
export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", full_name: "", phone: "", password: "", role: "buyer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await register(form); navigate(form.role === "seller" ? "/seller/setup" : "/"); }
    catch (err: any) { setError(err.response?.data?.detail || "Registration failed"); }
    finally { setLoading(false); }
  };
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-8"><div className="text-4xl mb-3">✨</div><h1 className="text-2xl font-bold text-gray-900">Create your account</h1></div>
        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[{ value: "buyer", label: "I want to buy", icon: "🛍️" }, { value: "seller", label: "I want to sell", icon: "🍳" }].map(opt => (
            <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, role: opt.value }))} className={`p-4 rounded-xl border-2 text-center transition ${form.role === opt.value ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
              <div className="text-2xl mb-1">{opt.icon}</div>
              <div className="text-sm font-medium text-gray-700">{opt.label}</div>
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Full name</label><input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+971 50 000 0000" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
          <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-60">{loading ? "Creating..." : "Create Account"}</button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">Have an account? <Link to="/login" className="text-orange-500 hover:underline">Sign in</Link></div>
      </div>
    </div>
  );
}
'''

files['src/pages/ProductDetail.tsx'] = '''import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    api.get(`/api/products/${id}`).then(r => setProduct(r.data)).catch(() => navigate("/")).finally(() => setLoading(false));
  }, [id]);
  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    setOrdering(true); setError("");
    try {
      await api.post("/api/orders/", { seller_id: product.seller.id, delivery_address: address, delivery_area: area, notes, items: [{ product_id: product.id, quantity }] });
      setSuccess(true);
    } catch (err: any) { setError(err.response?.data?.detail || "Order failed. Try again."); }
    finally { setOrdering(false); }
  };
  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;
  if (!product) return null;
  const total = (product.price * quantity + 10).toFixed(2);
  if (success) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Order placed!</h2>
      <p className="text-gray-500 mb-6">{product.seller.shop_name} has received your order.</p>
      <div className="flex gap-3 justify-center">
        <Link to="/orders" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition">Track Order</Link>
        <Link to="/" className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition">Browse More</Link>
      </div>
    </div>
  );
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-gray-500 hover:text-orange-500 mb-6 inline-block">← Back</Link>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 h-72 flex items-center justify-center mb-6">
            {product.image_url ? <img src={`http://localhost:8000${product.image_url}`} alt={product.name} className="w-full h-full object-cover" /> : <span className="text-8xl">{product.category?.icon || "🍽️"}</span>}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-500 mb-4">{product.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span>⏱ {product.preparation_time} min prep</span>
            {product.category && <span>{product.category.icon} {product.category.name}</span>}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 font-medium mb-1">🏠 {product.seller.shop_name}</p>
            <p className="text-sm text-gray-500">📍 {product.seller.area}</p>
            <p className="text-sm text-gray-500">⭐ {product.seller.rating} · {product.seller.total_orders} orders</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Place Order</h2>
            <span className="text-2xl font-bold text-orange-500">AED {product.price}</span>
          </div>
          {!user && <div className="bg-orange-50 text-orange-700 text-sm px-4 py-3 rounded-xl mb-4"><Link to="/login" className="font-medium underline">Sign in</Link> to place an order</div>}
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
          <form onSubmit={handleOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-lg transition">−</button>
                <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
                <button type="button" onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-lg transition">+</button>
              </div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label><textarea value={address} onChange={e => setAddress(e.target.value)} required rows={2} placeholder="Building, street, flat number..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Area</label><input type="text" value={area} onChange={e => setArea(e.target.value)} required placeholder="e.g. JBR, Downtown, Mirdif..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label><input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="No onions, extra spicy..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-500">
              <div className="flex justify-between"><span>Subtotal</span><span>AED {(product.price * quantity).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>AED 10.00</span></div>
              <div className="flex justify-between font-bold text-gray-900 text-base"><span>Total</span><span>AED {total}</span></div>
            </div>
            <button type="submit" disabled={!user || ordering} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-60">{ordering ? "Placing order..." : `Order for AED ${total}`}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
'''

files['src/pages/Orders.tsx'] = '''import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
const STATUS_COLORS: Record<string, string> = { pending: "bg-yellow-50 text-yellow-700 border-yellow-200", confirmed: "bg-blue-50 text-blue-700 border-blue-200", preparing: "bg-purple-50 text-purple-700 border-purple-200", ready: "bg-green-50 text-green-700 border-green-200", delivering: "bg-orange-50 text-orange-700 border-orange-200", delivered: "bg-gray-50 text-gray-600 border-gray-200", cancelled: "bg-red-50 text-red-600 border-red-200" };
const STATUS_STEPS = ["pending", "confirmed", "preparing", "ready", "delivering", "delivered"];
export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.get("/api/orders/my").then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, [user]);
  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-lg mb-4">No orders yet</p>
          <Link to="/" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const stepIndex = STATUS_STEPS.indexOf(order.status);
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">Order #{order.id}</span>
                    <span className="font-bold text-gray-900">AED {(order.total_amount + order.delivery_fee).toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-500">{user?.role === "buyer" ? `🏠 ${order.seller?.shop_name}` : `👤 ${order.buyer?.full_name}`} · 📍 {order.delivery_area} · {new Date(order.created_at).toLocaleDateString()}</div>
                </div>
                {order.status !== "cancelled" && (
                  <div className="px-5 py-4 bg-gray-50">
                    <div className="flex items-center gap-1">
                      {STATUS_STEPS.slice(0, -1).map((step, i) => (
                        <React.Fragment key={step}>
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= stepIndex ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-400"}`}>{i < stepIndex ? "✓" : i + 1}</div>
                          {i < STATUS_STEPS.length - 2 && <div className={`flex-1 h-1 rounded ${i < stepIndex ? "bg-orange-500" : "bg-gray-200"}`} />}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      {["Placed", "Confirmed", "Cooking", "Ready", "On way"].map((label, i) => (
                        <span key={label} className={`text-xs ${i <= stepIndex ? "text-orange-500 font-medium" : "text-gray-400"}`}>{label}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="px-5 py-4">
                  <div className="text-sm text-gray-600 mb-1">{order.items?.map((item: any) => `${item.quantity}x ${item.product?.name}`).join(", ")}</div>
                  <span className={`inline-block mt-2 text-xs border px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
'''

files['src/pages/SellerSetup.tsx'] = '''import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
const UAE_AREAS = ["Downtown Dubai","Dubai Marina","JBR","Jumeirah","Deira","Bur Dubai","Business Bay","JLT","Al Barsha","Mirdif","Sharjah","Abu Dhabi","Ajman","Ras Al Khaimah"];
export default function SellerSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ shop_name: "", description: "", area: "", city: "Dubai" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      await api.post("/api/sellers/profile", data, { headers: { "Content-Type": "multipart/form-data" } });
      navigate("/seller/dashboard");
    } catch (err: any) { setError(err.response?.data?.detail || "Setup failed"); }
    finally { setLoading(false); }
  };
  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8"><div className="text-4xl mb-3">🏪</div><h1 className="text-2xl font-bold text-gray-900">Set up your shop</h1><p className="text-gray-500 text-sm mt-1">Your shop will be reviewed within 24 hours</p></div>
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Shop name *</label><input type="text" value={form.shop_name} onChange={e => setForm(f => ({ ...f, shop_name: e.target.value }))} required placeholder="e.g. Maryam Kitchen" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">About your shop</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="What do you make?" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Your area *</label><select value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"><option value="">Select your area</option>{UAE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
        <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-60">{loading ? "Submitting..." : "Submit for Approval"}</button>
      </form>
    </div>
  );
}
'''

files['src/pages/AddProduct.tsx'] = '''import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
export default function AddProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", category_id: "", preparation_time: "60" });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!user || user.role !== "seller") { navigate("/login"); return; }
    api.get("/api/categories").then(r => setCategories(r.data));
  }, [user]);
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("description", form.description);
      data.append("price", form.price);
      data.append("preparation_time", form.preparation_time);
      if (form.category_id) data.append("category_id", form.category_id);
      if (image) data.append("image", image);
      await api.post("/api/products/", data, { headers: { "Content-Type": "multipart/form-data" } });
      navigate("/seller/dashboard");
    } catch (err: any) { setError(err.response?.data?.detail || "Failed to create product"); }
    finally { setLoading(false); }
  };
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Add a new product</h1>
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
          <label className="block cursor-pointer">
            <div className={`h-48 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition ${preview ? "border-orange-300" : "border-gray-200 hover:border-orange-300"}`}>
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <div className="text-center text-gray-400"><div className="text-4xl mb-2">📷</div><p className="text-sm">Click to upload</p></div>}
            </div>
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Product name *</label><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (AED) *</label><input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="1" step="0.5" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Prep time (mins)</label><input type="number" value={form.preparation_time} onChange={e => setForm(f => ({ ...f, preparation_time: e.target.value }))} min="5" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300" /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"><option value="">Select a category</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}</select></div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate("/seller/dashboard")} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition disabled:opacity-60">{loading ? "Adding..." : "Add Product"}</button>
        </div>
      </form>
    </div>
  );
}
'''

files['src/pages/SellerDashboard.tsx'] = '''import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
const STATUS_COLORS: Record<string, string> = { pending: "bg-yellow-50 text-yellow-700", confirmed: "bg-blue-50 text-blue-700", preparing: "bg-purple-50 text-purple-700", ready: "bg-green-50 text-green-700", delivering: "bg-orange-50 text-orange-700", delivered: "bg-gray-50 text-gray-600", cancelled: "bg-red-50 text-red-600" };
const NEXT_STATUS: Record<string, string> = { pending: "confirmed", confirmed: "preparing", preparing: "ready", ready: "delivering", delivering: "delivered" };
export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"orders"|"products">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user || user.role !== "seller") { navigate("/login"); return; }
    Promise.all([api.get("/api/orders/my"), api.get("/api/sellers/")]).then(([o, s]) => {
      setOrders(o.data);
      const myProfile = s.data.find((sel: any) => sel.user?.id === user.id);
      setProfile(myProfile);
      if (myProfile) { api.get("/api/products/").then(p => { setProducts(p.data.filter((prod: any) => prod.seller?.id === myProfile.id)); }); }
    }).finally(() => setLoading(false));
  }, [user]);
  const advanceOrder = async (orderId: number, nextStatus: string) => {
    await api.patch(`/api/orders/${orderId}/status`, null, { params: { status: nextStatus } });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
  };
  const toggleProduct = async (productId: number, currentlyAvailable: boolean) => {
    const form = new FormData();
    form.append("is_available", String(!currentlyAvailable));
    await api.put(`/api/products/${productId}`, form, { headers: { "Content-Type": "multipart/form-data" } });
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_available: !currentlyAvailable } : p));
  };
  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;
  const pendingCount = orders.filter(o => o.status === "pending").length;
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile?.shop_name || "My Shop"}{!profile?.is_approved && <span className="ml-3 text-sm bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-normal">Pending approval</span>}</h1>
          <p className="text-gray-500 text-sm mt-1">📍 {profile?.area}, {profile?.city}</p>
        </div>
        <Link to="/seller/products/new" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition">+ Add Product</Link>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[{ label: "Total Orders", value: profile?.total_orders || 0, icon: "📦" }, { label: "New Orders", value: pendingCount, icon: "🔔", highlight: pendingCount > 0 }, { label: "Rating", value: `${profile?.rating || 0} ⭐`, icon: "⭐" }].map(stat => (
          <div key={stat.label} className={`bg-white rounded-2xl p-5 border ${(stat as any).highlight ? "border-orange-300" : "border-gray-100"} shadow-sm`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-6">
        {(["orders", "products"] as const).map(t => (<button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition ${tab === t ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"}`}>{t === "orders" ? `Orders${pendingCount > 0 ? ` (${pendingCount} new)` : ""}` : "My Products"}</button>))}
      </div>
      {tab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (<div className="text-center py-16 text-gray-400"><div className="text-4xl mb-3">📭</div><p>No orders yet.</p></div>) : orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div><span className="font-semibold text-gray-900">Order #{order.id}</span><span className={`ml-3 text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span></div>
                <span className="font-bold text-gray-900">AED {(order.total_amount + order.delivery_fee).toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-500 mb-2">👤 {order.buyer?.full_name} · 📍 {order.delivery_area}</div>
              <div className="text-sm text-gray-600 mb-3">{order.items?.map((item: any) => `${item.quantity}x ${item.product?.name}`).join(", ")}</div>
              {NEXT_STATUS[order.status] && (<button onClick={() => advanceOrder(order.id, NEXT_STATUS[order.status])} className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition font-medium">Mark as {NEXT_STATUS[order.status]}</button>)}
            </div>
          ))}
        </div>
      )}
      {tab === "products" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {products.length === 0 && (<div className="col-span-2 text-center py-16 text-gray-400"><div className="text-4xl mb-3">🍳</div><p>No products yet.</p><Link to="/seller/products/new" className="text-orange-500 hover:underline text-sm mt-2 inline-block">Add your first product</Link></div>)}
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-3xl">
                {product.image_url ? <img src={`http://localhost:8000${product.image_url}`} alt={product.name} className="w-full h-full object-cover rounded-xl" /> : product.category?.icon || "🍽️"}
              </div>
              <div className="flex-1 min-w-0"><p className="font-semibold text-gray-900 truncate">{product.name}</p><p className="text-orange-500 font-bold text-sm">AED {product.price}</p></div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${product.is_available ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>{product.is_available ? "Available" : "Hidden"}</span>
                <button onClick={() => toggleProduct(product.id, product.is_available)} className="text-xs text-gray-500 hover:text-orange-500 transition">{product.is_available ? "Hide" : "Show"}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
'''

for path, content in files.items():
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ {path}")

print("\nAll files written successfully!")
