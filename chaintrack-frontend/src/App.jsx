import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, Toolbar } from '@mui/material';
import { AuthProvider } from '@contexts/AuthContext';
import { Web3Provider } from '@contexts/Web3Context';
import { NotificationProvider } from '@contexts/NotificationContext';
import { useAuth } from '@hooks/useAuth';

// Components
import Header from '@components/common/Header';
import Sidebar from '@components/common/Sidebar';
import Notification from '@components/common/Notification';
import Loading from '@components/common/Loading';

// Auth
import Login from '@components/auth/Login';
import Register from '@components/auth/Register';

// Dashboard
import Dashboard from '@components/dashboard/Dashboard';

// Products
import ProductList from '@components/products/ProductList';
import ProductDetails from '@components/products/ProductDetails';
import CreateProduct from '@components/products/CreateProduct';
import QRScanner from '@components/products/QRScanner';

// Shipments
import ShipmentList from '@components/shipments/ShipmentList';
import ShipmentTracking from '@components/shipments/ShipmentTracking';
import CreateShipment from '@components/shipments/CreateShipment';

// Analytics
import Analytics from '@components/analytics/Analytics';

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#0ea5e9',
    },
    secondary: {
      main: '#8b5cf6',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main Layout Component
const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Header onMenuClick={handleDrawerToggle} />
      <Sidebar open={mobileOpen} onClose={handleDrawerToggle} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Web3Provider>
            <NotificationProvider>
              <Notification />
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/dashboard" />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Products */}
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ProductList />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/products/create"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <CreateProduct />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/products/:id"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ProductDetails />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Shipments */}
                <Route
                  path="/shipments"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ShipmentList />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/shipments/create"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <CreateShipment />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/shipments/:id"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ShipmentTracking />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Other Routes */}
                <Route
                  path="/scan"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <QRScanner />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Analytics />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </NotificationProvider>
          </Web3Provider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;