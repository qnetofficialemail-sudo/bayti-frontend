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
import CategoriesPage from "./pages/CategoriesPage";
import Landing from "./pages/Landing";
import SellerApplyPage from "./pages/SellerApplyPage";
import SellerRegisterPage from "./pages/SellerRegisterPage";
import NotFound from "./pages/NotFound";
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
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-orange-500 focus:text-gray-900 focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium">Skip to main content</a>
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/marketplace" element={<><Navbar /><main id="main-content"><Home /></main></>} />
              <Route path="/login" element={<><Navbar /><main id="main-content"><LoginPage /></main></>} />
              <Route path="/register" element={<><Navbar /><main id="main-content"><RegisterPage /></main></>} />
              <Route path="/product/:id" element={<><Navbar /><main id="main-content"><ProductDetail /></main></>} />
              <Route path="/orders" element={<><Navbar /><main id="main-content"><Orders /></main></>} />
              <Route path="/seller/dashboard" element={<><Navbar /><main id="main-content"><SellerDashboard /></main></>} />
              <Route path="/seller/setup" element={<><Navbar /><main id="main-content"><SellerSetup /></main></>} />
              <Route path="/seller/products/new" element={<><Navbar /><main id="main-content"><AddProduct /></main></>} />
              <Route path="/admin" element={<><Navbar /><main id="main-content"><AdminPanel /></main></>} />
              <Route path="/seller/products/:id/edit" element={<><Navbar /><main id="main-content"><EditProduct /></main></>} />
              <Route path="/seller/shop/edit" element={<><Navbar /><main id="main-content"><EditShop /></main></>} />
              <Route path="/categories" element={<><Navbar /><main id="main-content"><CategoriesPage /></main></>} />
              <Route path="/shop/:id" element={<><Navbar /><main id="main-content"><SellerProfilePage /></main></>} />
              <Route path="/seller-apply" element={<><Navbar /><main id="main-content"><SellerApplyPage /></main></>} />
              <Route path="/seller-register" element={<><Navbar /><main id="main-content"><SellerRegisterPage /></main></>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
