import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CartPage from './pages/CartPage';
import ShopPage from './pages/ShopPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import WishlistPage from './pages/WishlistPage';
import AboutPage from './pages/AboutPage';
import FAQPage from './pages/FAQPage';
import ReturnPolicyPage from './pages/ReturnPolicyPage';
import TrackOrderPage from './pages/TrackOrderPage';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/categories" element={<ShopPage />} />
        <Route path="/deals" element={<ShopPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/profile" element={<UserDashboard />} />
        <Route path="/orders" element={<UserDashboard />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        <Route path="/support/faq" element={<FAQPage />} />
        <Route path="/support/returns" element={<ReturnPolicyPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <WhatsAppButton />
    </Router>
  );
}

export default App;
