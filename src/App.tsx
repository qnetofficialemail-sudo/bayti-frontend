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

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
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
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/shop/:id" element={<SellerProfilePage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
