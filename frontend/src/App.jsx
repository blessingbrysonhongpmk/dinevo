import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/table" element={<TableEntry />} />
              <Route path="/table/:tableCode" element={<TableEntry />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/food/:id" element={<FoodDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<CheckoutPayment />} />
              <Route path="/order/:id" element={<OrderTracking />} />
              <Route path="/order/:id/confirmation" element={<OrderTracking viewMode="confirmation" />} />
              <Route path="/order/:id/tracking" element={<OrderTracking viewMode="tracking" />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/staff" element={<AdminPanel />} />
              <Route path="/kitchen" element={<AdminPanel />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

