import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GoogleMapsSimple from './pages/GoogleMapsSimple';
import GoogleMapsScraper from './pages/GoogleMapsScraper';
import TestPage from './pages/TestPage';
import Leads from './pages/Leads';
import Funil from './pages/Funil';
import Kanban from './pages/Kanban';
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import SecurityPolicy from './pages/SecurityPolicy';
import Checkout from './pages/Checkout';
import CheckoutSimple from './pages/CheckoutSimple';
import VerifyEmail from './pages/VerifyEmail';
import GlobalStyles from './styles/GlobalStyles';

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalStyles />
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/security" element={<SecurityPolicy />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout-debug" element={<CheckoutSimple />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/app" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/google-places" 
              element={
                <ProtectedRoute>
                  <GoogleMapsSimple />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/google-maps-scraper" 
              element={
                <ProtectedRoute>
                  <GoogleMapsScraper />
                </ProtectedRoute>
              } 
            />
            <Route path="/test-victor" element={<TestPage />} />
            <Route 
              path="/leads" 
              element={
                <ProtectedRoute>
                  <Leads />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/funil" 
              element={
                <ProtectedRoute>
                  <Funil />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/kanban" 
              element={
                <ProtectedRoute>
                  <Kanban />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;