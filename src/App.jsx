import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import OneClickOrderModal from './components/OneClickOrderModal';
import MobileBottomNav from './components/MobileBottomNav';
import HomePage from './pages/HomePage';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';

// Code-split secondary pages on demand for ultra-lightweight initial home load
const AllProductsPage = lazy(() => import('./pages/AllProductsPage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));

// Code-split heavy admin suite completely separate from customer storefront
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminSecurityPage = lazy(() => import('./pages/admin/AdminSecurityPage'));

function PageFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppContent({ searchQuery, setSearchQuery, activeCategory, setActiveCategory }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/security" element={<AdminSecurityPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
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
          <Suspense fallback={<PageFallback />}>
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
          </Suspense>
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
