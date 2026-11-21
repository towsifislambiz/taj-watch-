import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import OneClickOrderModal from './components/OneClickOrderModal';
import MobileBottomNav from './components/MobileBottomNav';
import HomePage from './pages/HomePage';
import AllProductsPage from './pages/AllProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminSecurityPage from './pages/admin/AdminSecurityPage';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';

function AppContent({ searchQuery, setSearchQuery, activeCategory, setActiveCategory }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/security" element={<AdminSecurityPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-brand-gold selection:text-black flex flex-col justify-between overflow-x-hidden">
      {/* Top Navigation & Brand Header */}
      <div className="w-full">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <Navbar activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

        {/* Main Routing Stage - safe bottom padding on mobile for sticky bottom navigation */}
        <main className="flex-grow pb-20 md:pb-0 overflow-x-hidden">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              }
            />
            <Route
              path="/products"
              element={
                <AllProductsPage
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              }
            />
            <Route
              path="/products/:category"
              element={
                <AllProductsPage
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              }
            />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success/:id" element={<OrderSuccessPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <CartDrawer />
      <OneClickOrderModal />

      {/* Mobile Sticky Navigation Pill (Only on mobile < md) */}
      <MobileBottomNav />

      {/* Global Brand Footer (Kept Black) */}
      <Footer />
    </div>
  );
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <Router>
      <OrderProvider>
        <CartProvider>
          <AppContent
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        </CartProvider>
      </OrderProvider>
    </Router>
  );
}