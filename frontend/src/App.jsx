import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import TableEntry from './pages/TableEntry';
import Menu from './pages/Menu';
import FoodDetails from './pages/FoodDetails';
import Cart from './pages/Cart';
import CheckoutPayment from './pages/CheckoutPayment';
import OrderTracking from './pages/OrderTracking';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import UserStandalonePage from './pages/UserStandalonePage';
import DemoPrototype from './pages/DemoPrototype';

import api from './api/axios';

// Protected Route Component for Admin Access
function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem('dinevo_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function MainLayout() {
  const location = useLocation();
  const isFullscreenView = location.pathname.startsWith('/demo') || location.pathname.startsWith('/user') || location.pathname.startsWith('/login');

  React.useEffect(() => {
    api.get('/health').then((res) => {
      if (res.data && res.data.lanIp) {
        sessionStorage.setItem('dinevo_lan_ip', res.data.lanIp);
      }
    }).catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isFullscreenView && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/demo" element={<DemoPrototype />} />
          <Route path="/user" element={<UserStandalonePage />} />
          <Route path="/table" element={<TableEntry />} />
          <Route path="/table/:tableCode" element={<TableEntry />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/food/:id" element={<FoodDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<CheckoutPayment />} />
          <Route path="/order/:id" element={<OrderTracking />} />
          <Route path="/order/:id/confirmation" element={<OrderTracking viewMode="confirmation" />} />
          <Route path="/order/:id/tracking" element={<OrderTracking viewMode="tracking" />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminPanel />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedAdminRoute>
                <AdminPanel />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/kitchen"
            element={
              <ProtectedAdminRoute>
                <AdminPanel />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </main>
      {!isFullscreenView && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </CartProvider>
  );
}
