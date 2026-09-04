import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { LoginPage, RegisterPage } from "./pages/Auth";
import ProductDetail from "./pages/ProductDetail";
import SellerDashboard from "./pages/SellerDashboard";
import SellerSetup from "./pages/SellerSetup";
import AddProduct from "./pages/AddProduct";
import Orders from "./pages/Orders";
import AdminPanel from "./pages/AdminPanel";
import SellerProfilePage from "./pages/SellerProfilePage";
import EditProduct from "./pages/EditProduct";
import EditShop from "./pages/EditShop";
import Landing from "./pages/Landing";
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

function HomeRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user?.role === "seller") return <Navigate to="/seller/dashboard" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user?.role === "buyer") return <Navigate to="/marketplace" replace />;
  return <Landing />;
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/marketplace" element={<><Navbar /><Home /></>} />
              <Route path="/login" element={<><Navbar /><LoginPage /></>} />
              <Route path="/register" element={<><Navbar /><RegisterPage /></>} />
              <Route path="/product/:id" element={<><Navbar /><ProductDetail /></>} />
              <Route path="/orders" element={<><Navbar /><Orders /></>} />
              <Route path="/seller/dashboard" element={<><Navbar /><SellerDashboard /></>} />
              <Route path="/seller/setup" element={<><Navbar /><SellerSetup /></>} />
              <Route path="/seller/products/new" element={<><Navbar /><AddProduct /></>} />
              <Route path="/admin" element={<><Navbar /><AdminPanel /></>} />
              <Route path="/seller/products/:id/edit" element={<><Navbar /><EditProduct /></>} />
              <Route path="/seller/shop/edit" element={<><Navbar /><EditShop /></>} />
              <Route path="/shop/:id" element={<><Navbar /><SellerProfilePage /></>} />
            </Routes>
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
